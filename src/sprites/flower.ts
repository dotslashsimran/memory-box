import { C, T } from '../palette';
import { Grid, Sprite } from './grid';

/** 16x20 pixel flower grid (cocoa outlined). variant 0 milk blossom, 1 butter daisy, 2 rose tulip. */
export function flowerGrid(variant = 0): Grid {
  const g = new Grid(16, 20);
  g.vline(8, 9, 11, T.sageDeep);
  g.art(9, 13, ['.XX', 'XXX', 'XX.'], { X: C.sage });
  g.art(4, 15, ['XX.', 'XXX', '.XX'], { X: C.sage });
  const v = ((variant % 3) + 3) % 3;
  if (v === 0) {
    for (const [x, y] of [[8, 2], [8, 8], [4, 5], [12, 5], [8, 5]]) g.disc(x, y, 2, C.milk);
    for (const [x, y] of [[5, 3], [11, 3], [5, 7], [11, 7]]) g.disc(x, y, 1, C.milk);
    g.rect(7, 4, 3, 3, C.butter); g.px(8, 5, T.butterDeep);
    g.px(7, 1, T.milkLight); g.px(3, 4, T.milkLight); g.px(5, 3, T.milkLight);
  } else if (v === 1) {
    for (let i = 0; i < 8; i++) { const t = i * Math.PI / 4; g.disc(8 + Math.cos(t) * 4, 5 + Math.sin(t) * 4, 1.2, C.cream); }
    g.disc(8, 5, 2.2, C.butter); g.px(8, 5, T.butterDeep); g.px(7, 4, T.butterLight);
  } else {
    g.art(4, 1, ['X..XX..X', 'XX.XX.XX', 'XXXXXXXX', 'XXXXXXXX', '.XXXXXX.', '..XXXX..'], { X: C.rose });
    g.vline(8, 2, 6, T.roseDark); g.px(5, 3, C.milk); g.px(5, 4, C.milk);
  }
  const og = g.clone().pad(1).outline(C.cocoa);
  const out = new Grid(16, 20);
  for (let y = 0; y < 20; y++) for (let x = 0; x < 16; x++) out.px(x, y, og.get(x + 1, y + 1));
  return out;
}
/** Pixel flower for flower cards, 16x20. */
export const flower = (variant = 0): Sprite => flowerGrid(variant).toSprite();
