import { C, T } from '../palette';
import { Grid, Sprite } from './grid';

/** Cream wallpaper with tiny strawberry-milk diamonds + wainscot rail/baseboard. 160x90. */
export function roomWall(): Sprite {
  const g = new Grid(160, 90, C.cream);
  // faint stripes
  for (let x = 0; x < 160; x += 16) g.vline(x, 0, 80, T.creamShade);
  // tiny hearts-ish dots
  for (let y = 5; y < 70; y += 12) for (let x = 8; x < 160; x += 16) {
    const o = ((y - 5) / 12) % 2 ? 8 : 0;
    const xx = (x + o) % 160;
    g.px(xx, y, T.milkLight); g.px(xx - 1, y - 1, T.milkLight); g.px(xx + 1, y - 1, T.milkLight); g.px(xx, y + 1, T.milkLight);
    g.px(xx, y, C.milk);
  }
  // chair rail + baseboard
  g.hline(0, 70, 160, C.cocoa);
  g.hline(0, 71, 160, C.cream);
  g.hline(0, 72, 160, T.creamDeep);
  g.rect(0, 73, 160, 11, T.creamShade);
  for (let x = 0; x < 160; x += 20) g.vline(x, 73, 11, T.creamDeep);
  g.hline(0, 84, 160, T.creamDeep);
  g.rect(0, 85, 160, 4, C.cream);
  g.hline(0, 89, 160, C.cocoa);
  g.hline(0, 85, 160, T.creamDeep);
  return g.toSprite();
}

/** Warm wooden floor, 160x30, planks with staggered joints. */
export function roomFloor(): Sprite {
  const g = new Grid(160, 30, T.wood);
  g.rect(0, 0, 160, 30, T.wood);
  const rows = [0, 7, 14, 21, 28];
  rows.forEach((y, r) => {
    g.hline(0, y, 160, T.woodDeep);
    const off = (r * 37) % 53;
    for (let x = -off; x < 160; x += 53) {
      g.vline(x, y + 1, 6, T.woodDeep);
    }
    // grain
    for (let i = 0; i < 6; i++) {
      const gx = (r * 29 + i * 27) % 160;
      g.hline(gx, y + 2 + (i % 3) * 2, 5, T.woodDark);
      g.px(gx + 6, y + 3, T.butterLight);
    }
  });
  g.hline(0, 0, 160, C.cocoa);
  g.hline(0, 1, 160, T.woodDark);
  return g.toSprite();
}

/** Oval pink rug to sit under the box, 72x14. */
export function rug(): Sprite {
  const g = new Grid(72, 14);
  g.ellipse(36, 7, 35, 6, C.cocoa);
  g.ellipse(36, 7, 34, 5, C.milk);
  g.ellipse(36, 7, 29, 4, C.cream);
  g.ellipse(36, 7, 27, 3, T.milkLight);
  for (let x = 12; x < 62; x += 4) g.px(x, 7, C.milk);
  for (let x = 14; x < 60; x += 6) { g.px(x, 5, C.cream); g.px(x + 2, 9, C.cream); }
  g.hline(8, 12, 56, null);
  return g.toSprite();
}

/** Window with deep-rose-free cosy frame, 40x44. glass=false leaves the panes transparent so clouds can sit behind it. */
export function roomWindow(glass = true): Sprite {
  const g = new Grid(40, 44);
  g.box(0, 0, 40, 41, C.cream, C.cocoa);
  g.rect(2, 2, 36, 37, T.creamShade);
  g.rect(3, 3, 34, 35, C.cocoa);
  const panes: [number, number, number, number][] = [[4, 4, 15, 16], [21, 4, 15, 16], [4, 22, 15, 15], [21, 22, 15, 15]];
  for (const [x, y, w, h] of panes) {
    if (glass) {
      g.rect(x, y, w, h, T.sky);
      g.dither(x, y + h - 6, w, 6, T.skyDeep, 0);
      g.rect(x, y + h - 3, w, 3, T.skyDeep);
      g.px(x + 2, y + 2, C.cream); g.px(x + 3, y + 3, C.cream);   // glint
      g.px(x + 4, y + 2, C.cream);
    } else {
      g.rect(x, y, w, h, null);
    }
  }
  // mullions
  g.rect(19, 3, 2, 35, C.cream); g.rect(3, 20, 34, 2, C.cream);
  g.vline(19, 3, 35, T.creamShade); g.hline(3, 21, 34, T.creamShade);
  // sill
  g.box(0, 39, 40, 5, T.wood, C.cocoa);
  g.hline(1, 40, 38, T.butterLight);
  g.rect(1, 42, 38, 1, T.woodDeep);
  // tiny pot on sill
  g.box(4, 35, 7, 5, C.milk, C.cocoa, false);
  g.art(3, 29, ['.X.X.', 'XXXXX', '.XXX.', '..X..', '..X..'], { X: C.sage });
  g.px(5, 29, C.sage); g.px(3, 30, T.sageDeep); g.px(7, 30, T.sageDeep);
  g.hline(5, 35, 5, T.milkDeep);
  return g.toSprite();
}

/** Soft pixel clouds. variant 0..2 → 20/24/28 wide x 8 tall. */
export function cloud(variant = 0): Sprite {
  const w = 20 + (((variant % 3) + 3) % 3) * 4;
  const g = new Grid(w, 8);
  const v = ((variant % 3) + 3) % 3;
  g.ellipse(Math.round(w / 2), 5, Math.round(w / 2) - 1, 2, C.cream);
  g.disc(6, 4, 3, C.cream);
  g.disc(Math.round(w / 2) + (v === 1 ? -1 : 2), 3, 3, C.cream);
  if (v > 0) g.disc(w - 7, 4, 2, C.cream);
  g.hline(2, 7, w - 4, T.creamShade);
  g.hline(1, 6, w - 2, T.creamShade);
  for (let x = 0; x < w; x++) if (g.get(x, 6) === T.creamShade && x % 3 === 0) g.px(x, 6, C.cream);
  g.px(5, 2, T.sageLight);
  return g.toSprite();
}

/** String of fairy lights across the room, 160x16. frame 0/1 twinkle (alternating bulbs glow). */
export function fairyLights(frame = 0): Sprite {
  const g = new Grid(160, 16);
  const cols = [C.milk, C.butter, C.sage, C.rose];
  const swag = 40, sag = 7;
  const wireY = (x: number) => { const t = (x % swag) / swag; return Math.round(1 + sag * 4 * t * (1 - t)); };
  for (let x = 0; x < 160; x++) g.px(x, wireY(x), C.cocoa);
  let i = 0;
  for (let x = 5; x < 160; x += 10, i++) {
    const y = wireY(x) + 1;
    const lit = (i + frame) % 2 === 0;
    const c = cols[i % 4];
    g.px(x, y, C.cocoa);
    g.rect(x - 1, y + 1, 3, 3, C.cocoa);
    g.rect(x - 1, y + 1, 3, 3, c);
    g.px(x, y + 4, c);
    g.px(x - 1, y + 1, null); g.px(x + 1, y + 1, null);
    g.px(x, y + 1, c);
    g.px(x - 1, y + 2, lit ? C.cream : c);
    // outline
    g.px(x - 2, y + 2, C.cocoa); g.px(x + 2, y + 2, C.cocoa); g.px(x - 2, y + 3, C.cocoa); g.px(x + 2, y + 3, C.cocoa);
    g.px(x - 1, y + 4, C.cocoa); g.px(x + 1, y + 4, C.cocoa); g.px(x, y + 5, C.cocoa);
    if (lit) { g.px(x - 3, y + 3, T.butterLight); g.px(x + 3, y + 3, T.butterLight); g.px(x, y + 6, T.butterLight); }
  }
  return g.toSprite();
}

/** Diagonal beam of window light on the wall/floor, 56x84, dithered translucent butter. */
export function windowLight(): Sprite {
  const g = new Grid(56, 84);
  const soft = '#FFE29A33', mid = '#FFE29A4D', core = '#FFF0C666';
  for (let y = 0; y < 84; y++) {
    const x0 = Math.round(y * 0.35), wdt = 30 - Math.round(y * 0.1);
    for (let x = 0; x < wdt; x++) {
      const edge = Math.min(x, wdt - 1 - x);
      const a = edge < 2 ? ((x + y) % 2 === 0 ? soft : null) : edge < 5 ? soft : mid;
      if (a) g.px(x0 + x, y, a);
      if (edge >= 5 && (x + y) % 4 === 0) g.px(x0 + x, y, core);
    }
  }
  // window pane bars in the light
  for (let y = 24; y < 28; y++) for (let x = 0; x < 56; x++) if (g.get(x, y)) g.px(x, y, (x + y) % 2 ? '#FFE29A18' : null);
  return g.toSprite();
}
/** Floating dust mote, 3x3, frames 0..2 (pulse). */
export function dustMote(frame = 0): Sprite {
  const g = new Grid(3, 3);
  const f = ((frame % 3) + 3) % 3;
  g.px(1, 1, f === 1 ? C.cream : C.butter);
  if (f !== 2) { for (const [x, y] of [[0, 1], [2, 1], [1, 0], [1, 2]]) g.px(x, y, '#FFE29A66'); }
  return g.toSprite();
}
