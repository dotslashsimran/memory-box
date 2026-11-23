import { C, T } from '../palette';
import { Grid, Sprite, drawText, textWidth } from './grid';

const HEART = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];

export function heartGrid(fill: string = C.rose, shine: string | null = C.cream): Grid {
  const g = new Grid(7, 6).art(0, 0, HEART, { X: fill });
  if (shine) g.px(1, 1, shine);
  return g;
}
/** Float-up heart particle, 7x6 with cocoa outline → 9x8. */
export const heart = (): Sprite => heartGrid().pad(1).outline(C.cocoa).toSprite();
export const heartSmall = (): Sprite => heartGrid(C.milk, C.cream).pad(1).outline(C.cocoa).toSprite();

const SPARKLE = [
  ['..X..', '..X..', 'XXXXX', '..X..', '..X..'],
  ['.....', '..X..', '.XXX.', '..X..', '.....'],
  ['X...X', '.X.X.', '..X..', '.X.X.', 'X...X'],
  ['.....', '.....', '..X..', '.....', '.....'],
];
/** 4 twinkle frames (0 big plus, 1 small plus, 2 x-shape, 3 dot). 5x5, butter with cream core. */
export const sparklePx = (frame = 0): Sprite => {
  const f = SPARKLE[((frame % 4) + 4) % 4];
  const g = new Grid(5, 5).art(0, 0, f, { X: C.butter });
  if (frame % 4 === 0) g.px(2, 2, C.cream);
  return g.toSprite();
};

/** Open mouth of the box (top view of the inside), 48x8. Place directly above boxBody's top edge when open. */
export function boxMouth(): Sprite {
  const g = new Grid(48, 8);
  g.box(0, 0, 48, 8, T.roseDark, C.cocoa);
  g.rect(2, 1, 44, 2, T.milkDeep);          // back wall
  g.rect(2, 3, 44, 4, T.roseDark);          // shadowed floor
  g.dither(2, 3, 44, 2, C.rose, 0);
  g.rect(21, 1, 6, 6, T.butterDeep);        // ribbon continues inside
  g.dither(21, 3, 6, 4, T.butterLight, 1);
  return g.toSprite();
}

/** Box body (no lid), 48x32. Straight-on front view; lid overlaps the top 2 rows. */
export function boxBody(): Sprite {
  const g = new Grid(48, 32);
  g.box(0, 0, 48, 32, C.milk, C.cocoa);
  // cardboard shading
  g.rect(1, 1, 46, 3, T.milkDeep);                // shadow under lid
  g.rect(1, 29, 46, 2, T.milkDeep);               // base shade
  g.vline(1, 4, 25, T.milkLight);                 // left highlight
  g.vline(46, 4, 25, T.milkDeep);
  for (const [x, y] of [[8, 5], [14, 5], [34, 5], [40, 5], [4, 25], [43, 24], [37, 13], [10, 24]]) g.px(x, y, T.milkLight);
  // ribbon
  g.rect(20, 1, 8, 30, C.cocoa);
  g.rect(21, 1, 6, 30, C.butter);
  g.vline(21, 1, 30, T.butterLight);
  g.vline(26, 1, 30, T.butterDeep);
  g.rect(21, 1, 6, 3, T.butterDeep);
  // heart sticker (die-cut: rose heart, cream border, cocoa edge)
  const st = heartGrid().pad(1).outline(C.cream, true).pad(1).outline(C.cocoa);
  g.blit(st, 5, 6);
  // sparkle dots on right panel
  g.art(33, 7, ['.X.', 'XXX', '.X.'], { X: C.butter });
  g.px(40, 12, C.cream); g.px(37, 10, C.cream);
  g.art(31, 12, ['.X.', 'XXX', '.X.'], { X: T.milkLight });
  // handwritten label (paper tag sitting over the ribbon)
  g.box(5, 17, 38, 12, C.cream, C.cocoa, false);
  g.hline(6, 27, 36, T.creamShade);
  g.px(5, 17, null); g.px(42, 17, null);
  g.px(7, 19, T.creamDeep); g.px(40, 19, T.creamDeep); // tiny tape holes
  const tw = textWidth('memories');
  drawText(g, Math.round(24 - tw / 2), 21, 'memories', C.rose, true);
  return g.toSprite();
}

/** Lid animation, 7 frames, 52x32 each (box is 48 wide: ribbon centres line up at +2).
 *  Place so the canvas' bottom edge sits 2px below boxBody's top (lid skirt overlaps). Hinge (back-top edge) is row 17. */
export function lidFrames(): Sprite[] {
  const angles = [0, 17, 34, 62, 100, 140, 180];
  return angles.map(a => lid(a * Math.PI / 180).toSprite());
}

function bow(g: Grid, cx: number, by: number) {
  // bow ~24 wide, 12 tall, bottom at by
  const top = by - 11;
  const L = ['...XXXXX', '.XXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', '.XXXXXXX', '...XXXXX'];
  const loop = new Grid(8, 7).art(0, 0, L, { X: C.butter });
  loop.px(2, 1, T.butterLight); loop.px(1, 2, T.butterLight); loop.px(2, 2, T.butterLight);
  loop.vline(5, 2, 4, T.butterDeep); loop.vline(4, 3, 2, T.butterDeep); loop.px(2, 5, T.butterDeep);
  g.blit(loop.clone().pad(1).outline(C.cocoa), cx - 11, top);
  g.blit(loop.flipX().pad(1).outline(C.cocoa), cx + 3, top);
  // tails
  g.art(cx - 4, top + 8, ['XX', 'XX', 'X.'], { X: C.butter }); g.art(cx + 2, top + 8, ['XX', 'XX', '.X'], { X: C.butter });
  // knot
  g.box(cx - 2, top + 2, 4, 6, C.butter, C.cocoa, false);
  g.px(cx - 1, top + 3, T.butterLight); g.vline(cx, top + 5, 2, T.butterDeep);
}

function lid(a: number): Grid {
  const W = 52, H = 32, hinge = 17, L = 14, e = 35 * Math.PI / 180, S = 8.5;
  const g = new Grid(W, H);
  const yf = Math.round(hinge + L * Math.sin(e - a));
  const top = a < e - 0.05;                 // outer face visible
  const skirt = a < 125 * Math.PI / 180 ? Math.max(0, Math.round(S * Math.cos(a - e))) : 0;
  const y0 = Math.min(hinge, yf), y1 = Math.max(hinge, yf);
  const ph = Math.max(2, y1 - y0 + 1);
  const rx = 52;
  // panel
  if (top) {
    g.box(0, y0, rx, ph, C.milk, C.cocoa, false);
    g.hline(1, y0 + 1, rx - 2, T.milkLight);
    g.rect(23, y0, 6, ph, C.cocoa); g.rect(24, y0, 4, ph, C.butter);
    g.vline(24, y0 + 1, ph - 2, T.butterLight);
  } else {
    g.box(0, y0, rx, ph, T.milkLight, C.cocoa, false);        // paper lining
    g.dither(2, y0 + 1, rx - 4, ph - 2, C.cream, 0);
    if (ph > 4) { g.rect(23, y0, 6, ph, C.cocoa); g.rect(24, y0, 4, ph, T.butterDeep); }
  }
  g.px(0, y0, null); g.px(rx - 1, y0, null); g.px(0, y0 + ph - 1, null); g.px(rx - 1, y0 + ph - 1, null);
  // skirt hanging off the front edge
  if (skirt > 1) {
    const sy = yf;
    g.box(0, sy, rx, skirt + 1, T.milkDeep, C.cocoa, false);
    g.hline(1, sy + 1, rx - 2, C.milk);
    g.rect(23, sy, 6, skirt + 1, C.cocoa); g.rect(24, sy + 1, 4, skirt - 1 < 1 ? 1 : skirt, C.butter);
    g.vline(24, sy + 1, Math.max(1, skirt - 1), T.butterLight);
  } else if (!top) {
    g.hline(1, y0, rx - 2, C.cocoa);
  }
  if (top) {
    // bow rides on the top surface centre, bottom of knot slightly into panel
    bow(g, 26, Math.round((y0 + y1) / 2) + 3);
  }
  return g;
}

const ICONS: Record<string, string[]> = {
  'speaker-on': ['...X.....', '..XX..X..', 'XXXX...X.', 'XXXX.X.X.', 'XXXX.X.X.', 'XXXX.X.X.', 'XXXX...X.', '..XX..X..', '...X.....'],
  'speaker-off': ['...X.....', '..XX.....', 'XXXX.X.X.', 'XXXX..X..', 'XXXX.X.X.', 'XXXX.....', 'XXXX.....', '..XX.....', '...X.....'],
  plus: ['.........', '...XXX...', '...XXX...', '.XXXXXXX.', '.XXXXXXX.', '.XXXXXXX.', '...XXX...', '...XXX...', '.........'],
  gear: ['....X....', '.X.XXX.X.', '.XXXXXXX.', '..XX.XX..', 'XXX...XXX', '..XX.XX..', '.XXXXXXX.', '.X.XXX.X.', '....X....'],
  x: ['.........', '.XX...XX.', '..XX.XX..', '...XXX...', '....X....', '...XXX...', '..XX.XX..', '.XX...XX.', '.........'],
};
export function icon(name: 'speaker-on' | 'speaker-off' | 'plus' | 'gear' | 'x'): Sprite {
  return new Grid(9, 9).art(0, 0, ICONS[name], { X: C.cocoa }).toSprite();
}
