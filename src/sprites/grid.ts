/** Tiny pixel-art drawing engine: a Grid of colour|null cells that serialises to a crisp SVG. */
export interface Sprite { svg: string; w: number; h: number }
export type Col = string | null;

export class Grid {
  d: Col[];
  constructor(public w: number, public h: number, fill: Col = null) {
    this.d = new Array(w * h).fill(fill);
  }
  get(x: number, y: number): Col {
    return x < 0 || y < 0 || x >= this.w || y >= this.h ? null : this.d[y * this.w + x];
  }
  px(x: number, y: number, c: Col): this {
    x = Math.round(x); y = Math.round(y);
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = c;
    return this;
  }
  rect(x: number, y: number, w: number, h: number, c: Col): this {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, c);
    return this;
  }
  hline(x: number, y: number, w: number, c: Col) { return this.rect(x, y, w, 1, c); }
  vline(x: number, y: number, h: number, c: Col) { return this.rect(x, y, 1, h, c); }
  /** 1px frame. */
  frame(x: number, y: number, w: number, h: number, c: Col): this {
    this.hline(x, y, w, c); this.hline(x, y + h - 1, w, c);
    this.vline(x, y, h, c); this.vline(x + w - 1, y, h, c);
    return this;
  }
  /** Filled rect with outline and rounded (clipped) corners. */
  box(x: number, y: number, w: number, h: number, fill: Col, line: Col, round = true): this {
    this.rect(x, y, w, h, line);
    this.rect(x + 1, y + 1, w - 2, h - 2, fill);
    if (round) {
      for (const [cx, cy] of [[x, y], [x + w - 1, y], [x, y + h - 1], [x + w - 1, y + h - 1]]) this.px(cx, cy, null);
    }
    return this;
  }
  disc(cx: number, cy: number, r: number, c: Col): this {
    for (let y = -Math.ceil(r); y <= Math.ceil(r); y++)
      for (let x = -Math.ceil(r); x <= Math.ceil(r); x++)
        if (x * x + y * y <= r * r + r * 0.6) this.px(cx + x, cy + y, c);
    return this;
  }
  ellipse(cx: number, cy: number, rx: number, ry: number, c: Col): this {
    for (let y = -ry; y <= ry; y++)
      for (let x = -rx; x <= rx; x++)
        if ((x * x) / (rx * rx + 0.5) + (y * y) / (ry * ry + 0.5) <= 1) this.px(cx + x, cy + y, c);
    return this;
  }
  line(x0: number, y0: number, x1: number, y1: number, c: Col): this {
    let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.px(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
    return this;
  }
  /** Checkerboard dither of colour c over rect (only where phase matches). */
  dither(x: number, y: number, w: number, h: number, c: Col, phase = 0): this {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if ((i + j + phase) % 2 === 0) this.px(x + i, y + j, c);
    return this;
  }
  /** Paint a text map: each char looked up in legend ('.' / ' ' = skip). */
  art(x: number, y: number, rows: string[], legend: Record<string, Col>): this {
    rows.forEach((row, j) => [...row].forEach((ch, i) => {
      if (ch === '.' || ch === ' ') return;
      const c = legend[ch];
      if (c !== undefined) this.px(x + i, y + j, c);
    }));
    return this;
  }
  /** Draw another grid on top (transparent cells skipped). */
  blit(o: Grid, x = 0, y = 0): this {
    for (let j = 0; j < o.h; j++) for (let i = 0; i < o.w; i++) { const c = o.d[j * o.w + i]; if (c) this.px(x + i, y + j, c); }
    return this;
  }
  /** Add a 1px outline (4-neighbour) around opaque pixels, on transparent cells only. */
  outline(c: string, diag = false): this {
    const add: number[] = [];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.get(x, y)) continue;
      const n = this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1) ||
        (diag && (this.get(x - 1, y - 1) || this.get(x + 1, y - 1) || this.get(x - 1, y + 1) || this.get(x + 1, y + 1)));
      if (n) add.push(y * this.w + x);
    }
    add.forEach(i => (this.d[i] = c));
    return this;
  }
  /** New grid with `p` px of transparent padding around. */
  pad(p: number): Grid { const g = new Grid(this.w + 2 * p, this.h + 2 * p); g.blit(this, p, p); return g; }
  clone(): Grid { const g = new Grid(this.w, this.h); g.d = this.d.slice(); return g; }
  flipX(): Grid { const g = new Grid(this.w, this.h); for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) g.d[y * this.w + x] = this.d[y * this.w + (this.w - 1 - x)]; return g; }

  /** Horizontal runs merged per colour → compact crisp SVG. */
  toSprite(): Sprite {
    const parts: string[] = [];
    for (let y = 0; y < this.h; y++) {
      let x = 0;
      while (x < this.w) {
        const c = this.d[y * this.w + x];
        if (!c) { x++; continue; }
        let e = x + 1;
        while (e < this.w && this.d[y * this.w + e] === c) e++;
        parts.push(`<rect x="${x}" y="${y}" width="${e - x}" height="1" fill="${c}"/>`);
        x = e;
      }
    }
    return {
      w: this.w, h: this.h,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.w} ${this.h}" width="${this.w}" height="${this.h}" shape-rendering="crispEdges">${parts.join('')}</svg>`,
    };
  }
}

/** Tiny 3x5-ish pixel font (lowercase handwriting-ish + digits) for labels baked into sprites. */
export const FONT: Record<string, string[]> = {
  m: ['XXXX.', 'X.X.X', 'X.X.X', 'X.X.X', 'X.X.X'],
  e: ['XXX', 'X.X', 'XXX', 'X..', 'XXX'],
  o: ['XXX', 'X.X', 'X.X', 'X.X', 'XXX'],
  r: ['XXX', 'X.X', 'X..', 'X..', 'X..'],
  i: ['X', 'X', 'X', 'X', 'X'],
  s: ['.XX', 'X..', 'XX.', '..X', 'XX.'],
  n: ['XX.', 'X.X', 'X.X', 'X.X', 'X.X'],
  a: ['XX.', '..X', 'XXX', 'X.X', 'XXX'],
  '0': ['XXX', 'X.X', 'X.X', 'X.X', 'XXX'], '1': ['.X.', 'XX.', '.X.', '.X.', 'XXX'],
  '2': ['XXX', '..X', 'XXX', 'X..', 'XXX'], '3': ['XXX', '..X', 'XXX', '..X', 'XXX'],
  '4': ['X.X', 'X.X', 'XXX', '..X', '..X'], '5': ['XXX', 'X..', 'XXX', '..X', 'XXX'],
  '6': ['XXX', 'X..', 'XXX', 'X.X', 'XXX'], '7': ['XXX', '..X', '.X.', '.X.', '.X.'],
  '8': ['XXX', 'X.X', 'XXX', 'X.X', 'XXX'], '9': ['XXX', 'X.X', 'XXX', '..X', 'XXX'],
  A: ['.X.', 'X.X', 'XXX', 'X.X', 'X.X'], B: ['XX.', 'X.X', 'XX.', 'X.X', 'XX.'],
  C: ['XXX', 'X..', 'X..', 'X..', 'XXX'], D: ['XX.', 'X.X', 'X.X', 'X.X', 'XX.'],
  M: ['X...X', 'XX.XX', 'X.X.X', 'X...X', 'X...X'], I: ['XXX', '.X.', '.X.', '.X.', 'XXX'], T: ['XXX', '.X.', '.X.', '.X.', '.X.'], E: ['XXX', 'X..', 'XX.', 'X..', 'XXX'],
  N: ['XX.', 'X.X', 'X.X', 'X.X', 'X.X'], O: ['XXX', 'X.X', 'X.X', 'X.X', 'XXX'],
  '.': ['.', '.', '.', '.', 'X'], ' ': ['.', '.', '.', '.', '.'],
};
export function textWidth(s: string): number {
  return [...s].reduce((a, ch, i) => a + (FONT[ch]?.[0].length ?? 3) + (i ? 1 : 0), 0);
}
/** Draw text with the tiny font. i-dot is added above 'i' when `dot` (needs 2 free rows above y). */
export function drawText(g: Grid, x: number, y: number, s: string, c: string, dot = false): void {
  let cx = x;
  for (const ch of s) {
    const gl = FONT[ch];
    if (!gl) { cx += 4; continue; }
    g.art(cx, y, gl, { X: c });
    if (dot && ch === 'i') g.px(cx, y - 2, c);
    cx += gl[0].length + 1;
  }
}
export const hash = (s: string): number => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };
