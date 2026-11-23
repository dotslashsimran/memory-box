import { C, T } from '../palette';
import { Grid, Sprite } from './grid';

type Scene = (g: Grid) => void;
const W = 32;

function sky(g: Grid, h = 20, top: string = T.sky, bot: string = C.cream) {
  g.rect(0, 0, W, h, top);
  g.dither(0, h - 6, W, 6, bot, 0);
  g.rect(0, h - 3, W, 3, bot);
}
function cloudBlob(g: Grid, x: number, y: number) {
  g.rect(x + 2, y + 1, 8, 2, C.cream); g.rect(x + 4, y, 4, 2, C.cream); g.rect(x, y + 2, 12, 1, C.cream);
  g.hline(x + 1, y + 3, 10, T.creamShade);
}
function face(g: Grid, x: number, y: number, blush = true) {
  g.px(x, y, C.cocoa); g.px(x + 4, y, C.cocoa);
  g.px(x + 2, y + 2, C.cocoa);
  if (blush) { g.px(x - 1, y + 2, C.milk); g.px(x + 5, y + 2, C.milk); }
}

const scenes: Record<string, Scene> = {
  picnic(g) {
    sky(g, 14);
    g.disc(25, 6, 3, C.butter);
    cloudBlob(g, 3, 3);
    g.rect(0, 14, W, 18, C.sage);
    g.ellipse(8, 14, 14, 3, C.sage);
    g.dither(0, 14, W, 2, T.sageDeep, 0);
    // tree
    g.rect(26, 9, 2, 6, T.woodDark); g.disc(27, 7, 4, T.sageDeep); g.px(25, 6, C.sage); g.px(26, 5, C.sage);
    g.px(29, 8, C.milk);
    // blanket with checks
    for (let y = 0; y < 8; y++) for (let x = 0; x < 22; x++) {
      const px = 5 + x + Math.floor((7 - y) / 4), py = 21 + y;
      g.px(px, py, ((x >> 1) + (y >> 1)) % 2 ? C.cream : C.milk);
    }
    g.hline(5, 28, 24, T.milkDeep);
    // basket
    g.box(10, 17, 8, 7, T.wood, C.cocoa, false); g.hline(11, 20, 6, T.woodDeep);
    g.hline(11, 16, 6, C.cocoa); g.px(10, 17, C.cocoa);
    // strawberries & cake slice
    g.px(20, 24, C.rose); g.px(21, 24, C.rose); g.px(20, 25, C.rose); g.px(21, 25, C.rose); g.px(20, 23, C.sage);
    g.px(23, 25, C.rose); g.px(24, 25, C.rose); g.px(23, 26, C.rose);
    g.art(12, 25, ['XXX', 'XXX'], { X: C.butter });
    g.px(13, 24, C.rose);
    // butterflies
    g.px(15, 11, C.butter); g.px(17, 11, C.butter); g.px(16, 12, C.cocoa);
  },
  cat(g) {
    g.rect(0, 0, W, W, T.milkLight);
    for (let x = 0; x < W; x += 8) g.vline(x, 0, 24, C.cream);
    g.rect(0, 24, W, 8, T.wood); g.hline(0, 24, W, T.woodDeep);
    // cushion
    g.ellipse(16, 27, 12, 4, C.sage); g.hline(6, 28, 20, T.sageDeep); g.ellipse(16, 26, 11, 3, C.sage);
    // body
    g.ellipse(16, 22, 8, 6, C.butter); g.hline(10, 26, 12, T.butterDeep);
    // tail
    g.art(23, 20, ['.XX', 'XXX', 'XX.', 'X..'], { X: C.butter }); g.px(25, 20, T.butterDeep);
    // head
    g.ellipse(16, 13, 8, 6, C.butter);
    g.art(8, 5, ['X..X', 'XX.XX'.slice(0, 4), 'XXXX'], { X: C.butter });
    g.art(8, 6, ['.XX', 'XXX'], { X: C.butter }); g.art(21, 6, ['XX.', 'XXX'], { X: C.butter });
    g.px(10, 7, C.milk); g.px(21, 7, C.milk); g.px(11, 8, C.milk);
    g.hline(12, 9, 2, T.butterDeep); g.hline(18, 9, 2, T.butterDeep); g.hline(15, 8, 2, T.butterDeep);
    // face: sleepy closed eyes
    g.hline(11, 13, 3, C.cocoa); g.hline(18, 13, 3, C.cocoa);
    g.px(10, 14, C.milk); g.px(11, 14, C.milk); g.px(21, 14, C.milk); g.px(20, 14, C.milk);
    g.px(15, 14, C.rose); g.px(16, 14, C.rose);
    g.px(15, 15, C.cocoa); g.px(16, 15, C.cocoa); g.px(14, 16, C.cocoa); g.px(17, 16, C.cocoa);
    // whiskers
    g.hline(5, 14, 3, C.cocoa); g.hline(24, 14, 3, C.cocoa);
    // paws
    g.rect(11, 25, 3, 2, C.cream); g.rect(18, 25, 3, 2, C.cream);
    g.px(25, 4, C.rose); g.px(26, 3, C.milk); g.px(24, 3, C.milk);  // heart bit
  },
  beach(g) {
    sky(g, 12, T.sky, C.cream);
    g.disc(24, 6, 3, C.butter);
    cloudBlob(g, 2, 3);
    g.rect(0, 12, W, 7, T.sageDeep); g.dither(0, 12, W, 2, C.sage, 0);
    for (let x = 2; x < W; x += 7) { g.hline(x, 14, 3, C.cream); g.hline(x + 3, 16, 3, C.sage); }
    g.rect(0, 19, W, 13, C.butter);
    g.dither(0, 19, W, 2, C.cream, 0); g.hline(0, 19, W, C.cream);
    g.dither(0, 24, W, 8, T.butterDeep, 1);
    // umbrella
    g.vline(10, 14, 12, C.cocoa);
    g.art(4, 11, ['..XXXXXX..', '.XXXXXXXX.', 'XXXXXXXXXX'], { X: C.milk });
    for (const x of [6, 10, 14]) g.vline(x - 1 + (x === 6 ? 0 : 0), 11, 3, x === 10 ? C.cream : C.rose);
    g.vline(7, 11, 3, C.rose); g.vline(11, 11, 3, C.rose);
    g.hline(4, 13, 10, null); g.art(4, 13, ['XX.XX.XX.X'], { X: C.rose });
    // towel
    g.rect(14, 24, 11, 5, C.cream); g.vline(17, 24, 5, C.milk); g.vline(21, 24, 5, C.milk);
    // sandcastle
    g.rect(26, 24, 5, 4, T.butterDeep); g.px(26, 23, T.butterDeep); g.px(28, 23, T.butterDeep); g.px(30, 23, T.butterDeep); g.px(28, 22, C.rose);
    // shell
    g.px(6, 28, C.milk); g.px(7, 28, C.milk); g.px(6, 29, T.milkDeep);
  },
  cake(g) {
    g.rect(0, 0, W, W, T.milkLight);
    g.dither(0, 0, W, 14, C.cream, 0);
    // bunting
    for (let x = 1; x < W; x += 5) { g.art(x, 1, ['XXX', '.X.'], { X: [C.butter, C.sage, C.rose][(x / 5 | 0) % 3] }); }
    g.hline(0, 0, W, C.cocoa);
    g.rect(0, 27, W, 5, T.wood); g.hline(0, 27, W, T.woodDeep);
    // plate
    g.ellipse(16, 27, 12, 2, C.cream); g.hline(6, 28, 20, T.creamShade);
    // cake layers
    g.box(7, 17, 18, 9, C.cream, C.cocoa, false); g.hline(8, 21, 16, C.milk); g.hline(8, 22, 16, C.milk);
    g.rect(8, 18, 16, 3, C.milk);
    // frosting drips
    g.rect(8, 17, 16, 2, C.rose);
    for (const x of [9, 13, 18, 22]) { g.vline(x, 19, 2, C.rose); g.px(x, 21, C.rose); }
    // berries
    for (const x of [10, 16, 21]) { g.px(x, 15, C.rose); g.px(x + 1, 15, C.rose); g.px(x, 16, C.rose); g.px(x + 1, 16, T.roseDark); g.px(x, 14, C.sage); }
    // candles
    for (const x of [12, 19]) { g.vline(x, 11, 4, C.butter); g.px(x, 10, T.butterDeep); g.px(x, 9, C.rose); g.px(x, 8, C.butter); g.px(x - 1, 9, T.butterLight); }
    g.px(12, 12, C.milk); g.px(19, 12, C.milk);
    g.px(6, 20, C.cocoa);
  },
  sunset(g) {
    g.rect(0, 0, W, 8, C.milk);
    g.rect(0, 8, W, 6, T.milkLight); g.dither(0, 6, W, 4, T.milkLight, 0);
    g.rect(0, 14, W, 6, C.cream); g.dither(0, 12, W, 4, C.cream, 1);
    g.rect(0, 20, W, 12, T.sageDeep);
    g.disc(16, 19, 6, C.butter); g.disc(16, 19, 4, T.butterLight);
    g.rect(0, 20, W, 12, T.sageDeep);
    g.ellipse(6, 22, 12, 3, C.sage); g.ellipse(27, 23, 11, 3, C.sage);
    g.rect(0, 22, W, 10, C.sage); g.ellipse(8, 22, 12, 2, C.sage);
    g.dither(0, 26, W, 6, T.sageDeep, 0);
    // reflection / path
    g.rect(14, 23, 4, 9, C.butter); g.rect(15, 26, 2, 6, T.butterLight);
    // birds
    for (const [x, y] of [[6, 5], [10, 8], [24, 4]]) { g.px(x, y, C.cocoa); g.px(x + 1, y + 1, C.cocoa); g.px(x + 2, y, C.cocoa); }
    cloudBlob(g, 18, 9);
    // tiny trees
    for (const x of [3, 26]) { g.vline(x, 24, 4, C.cocoa); g.disc(x, 22, 2, T.sageDeep); }
  },
  bunny(g) {
    g.rect(0, 0, W, W, T.sky);
    g.rect(0, 0, W, 6, T.skyDeep);
    g.rect(0, 18, W, 14, C.sage); g.dither(0, 18, W, 3, T.sageDeep, 0);
    // flowers
    for (const [x, y, c] of [[4, 22, C.milk], [26, 21, C.butter], [8, 28, C.butter], [27, 27, C.milk], [2, 27, C.cream]] as [number, number, string][]) {
      g.px(x, y, c); g.px(x - 1, y, c); g.px(x + 1, y, c); g.px(x, y - 1, c); g.px(x, y + 1, c); g.px(x, y, C.rose);
    }
    // ears
    g.ellipse(12, 7, 2, 6, C.cream); g.ellipse(20, 7, 2, 6, C.cream);
    g.ellipse(12, 8, 1, 4, C.milk); g.ellipse(20, 8, 1, 4, C.milk);
    g.px(11, 6, T.milkLight);
    // body & head
    g.ellipse(16, 24, 7, 5, C.cream); g.hline(10, 28, 12, T.creamShade);
    g.ellipse(16, 16, 7, 5, C.cream);
    g.hline(10, 20, 12, null); g.ellipse(16, 18, 6, 3, C.cream);
    // face
    g.px(13, 15, C.cocoa); g.px(19, 15, C.cocoa); g.px(13, 14, T.cocoaLight); g.px(19, 14, T.cocoaLight);
    g.px(15, 17, C.rose); g.px(16, 17, C.rose); g.px(15, 18, C.cocoa); g.px(17, 18, C.cocoa); g.px(16, 19, C.cocoa);
    g.px(11, 17, C.milk); g.px(12, 17, C.milk); g.px(20, 17, C.milk); g.px(21, 17, C.milk);
    // paws holding a carrot
    g.art(18, 21, ['.XX', 'XXXX', '.XXX', '..X'], { X: C.butter }); g.px(20, 20, C.sage); g.px(21, 20, C.sage);
    g.rect(14, 23, 2, 2, C.cream);
    // tail
    g.disc(24, 26, 2, C.cream);
  },
  balloons(g) {
    sky(g, 24, T.sky, C.cream);
    cloudBlob(g, 18, 3); cloudBlob(g, 1, 12);
    g.rect(0, 26, W, 6, C.sage); g.ellipse(10, 26, 14, 3, C.sage); g.dither(0, 28, W, 4, T.sageDeep, 0);
    const bl: [number, number, string][] = [[9, 12, C.milk], [16, 8, C.butter], [23, 13, C.rose]];
    for (const [x, y, c] of bl) {
      g.ellipse(x, y, 4, 5, c); g.px(x - 2, y - 3, C.cream); g.px(x - 2, y - 2, C.cream);
      g.px(x - 1, y + 5, c); g.px(x, y + 5, c); g.px(x + 1, y + 5, c);
      g.hline(x - 3, y + 3, 7, c === C.rose ? T.roseDark : c === C.milk ? T.milkDeep : T.butterDeep);
      g.ellipse(x, y + 4, 3, 1, c);
      g.line(x, y + 6, 15, 28, C.cocoa);
    }
    // little kid
    g.disc(15, 25, 2, C.cream); g.rect(14, 27, 3, 4, C.milk); face(g, 13, 24, false);
  },
  night(g) {
    g.rect(0, 0, W, W, C.cocoa);
    g.dither(0, 14, W, 8, T.cocoaLight, 0);
    g.rect(0, 22, W, 10, T.cocoaLight); g.dither(0, 22, W, 3, C.cocoa, 0);
    // moon
    g.disc(23, 8, 5, C.cream); g.disc(26, 7, 4, C.cocoa); g.px(21, 7, T.creamShade);
    // stars
    for (const [x, y] of [[4, 4], [11, 9], [16, 3], [6, 15], [29, 16], [20, 14], [2, 10]]) g.px(x, y, C.butter);
    for (const [x, y] of [[9, 3], [14, 12]]) { g.px(x, y, C.butter); g.px(x - 1, y, T.butterDeep); g.px(x + 1, y, T.butterDeep); g.px(x, y - 1, T.butterDeep); g.px(x, y + 1, T.butterDeep); }
    // cozy house
    g.rect(7, 19, 14, 10, T.roseDark); g.art(5, 15, ['....XX....', '..XXXXXX..', 'XXXXXXXXXX'.slice(0, 10)], { X: C.rose });
    g.art(6, 16, ['...XXXXXX...', '.XXXXXXXXXX.', 'XXXXXXXXXXXX'], { X: C.rose });
    g.rect(9, 21, 4, 4, C.butter); g.hline(9, 23, 4, null); g.vline(11, 21, 4, T.butterDeep);
    g.rect(15, 21, 3, 8, C.cocoa); g.rect(16, 24, 1, 1, C.butter);
    g.px(17, 13, C.cream); g.px(17, 11, C.cream); g.px(18, 12, C.cream);
    // ground & tree
    g.rect(0, 29, W, 3, T.sageDeep); g.dither(0, 29, W, 1, C.cocoa, 0);
    g.vline(27, 24, 6, C.cocoa); g.disc(27, 21, 3, C.sage);
    g.px(26, 20, C.cream);
    // fireflies
    g.px(24, 26, C.butter); g.px(3, 24, C.butter); g.px(30, 27, C.butter);
  },
  icecream(g) {
    g.rect(0, 0, W, W, C.sage); g.dither(0, 0, W, W, T.sageLight, 0);
    g.rect(0, 0, W, W, C.sage); g.dither(0, 0, W, W, T.sageLight, 0);
    for (let y = 0; y < W; y += 8) for (let x = (y / 8) % 2 ? 0 : 4; x < W; x += 8) { g.px(x, y, C.cream); }
    // cone
    for (let j = 0; j < 12; j++) { const w = 12 - j; g.hline(10 + Math.floor((12 - w) / 2) + 0, 18 + j, w, (j % 3 === 0) ? T.woodDeep : T.wood); }
    for (let j = 0; j < 12; j++) { g.px(10 + Math.floor(j / 2), 18 + j, C.cocoa); g.px(21 - Math.floor(j / 2), 18 + j, C.cocoa); }
    g.hline(10, 18, 12, C.cocoa);
    for (let j = 0; j < 11; j++) { const w = 12 - 2 * Math.floor(j / 2) - 2; g.hline(11 + Math.floor(j / 2), 19 + j, Math.max(0, 10 - 2 * Math.floor(j / 2)), (j % 3 === 0) ? T.woodDeep : T.wood); }
    // scoops
    g.disc(16, 15, 6, C.milk); g.hline(10, 18, 13, T.milkDeep); g.px(13, 13, C.cream); g.px(13, 12, C.cream); g.px(12, 14, C.cream);
    g.disc(16, 9, 5, C.cream); g.hline(11, 11, 11, T.creamShade); g.px(14, 7, T.butterLight);
    g.frame(10, 18, 13, 1, C.cocoa);
    // cherry
    g.disc(16, 3, 1.5, C.rose); g.px(17, 1, C.cocoa); g.px(16, 2, C.cocoa); g.px(15, 2, T.milkLight);
    // sprinkles
    for (const [x, y, c] of [[12, 15, C.butter], [18, 14, C.sage], [20, 17, C.cream], [15, 17, C.butter], [14, 9, C.rose], [18, 8, C.milk]] as [number, number, string][]) g.px(x, y, c);
    // drip
    g.vline(22, 18, 3, C.milk); g.px(22, 21, C.milk);
  },
  friends(g) {
    g.rect(0, 0, W, W, C.butter); g.dither(0, 0, W, 14, T.butterLight, 0);
    g.rect(0, 26, W, 6, T.butterDeep);
    // hearts floating
    g.art(13, 3, ['X.X', 'XXX', '.X.'], { X: C.rose }); g.art(25, 7, ['X.X', 'XXX', '.X.'], { X: C.milk }); g.art(4, 6, ['X.X', 'XXX', '.X.'], { X: C.milk });
    const girl = (cx: number, hair: string, bow: string, shirt: string) => {
      g.rect(cx - 5, 24, 10, 8, shirt); g.hline(cx - 5, 24, 10, null);
      g.ellipse(cx, 24, 5, 3, shirt);
      g.rect(cx - 1, 20, 3, 3, C.cream);
      g.ellipse(cx, 14, 7, 7, hair);
      g.ellipse(cx, 16, 6, 6, C.cream);
      g.rect(cx - 7, 12, 14, 2, hair); g.hline(cx - 6, 14, 3, hair); g.hline(cx + 4, 14, 3, hair);
      g.rect(cx - 7, 14, 2, 9, hair); g.rect(cx + 6, 14, 2, 9, hair);
      g.px(cx - 3, 17, C.cocoa); g.px(cx - 3, 18, C.cocoa); g.px(cx + 3, 17, C.cocoa); g.px(cx + 3, 18, C.cocoa);
      g.px(cx - 4, 19, C.milk); g.px(cx - 5, 19, C.milk); g.px(cx + 4, 19, C.milk); g.px(cx + 5, 19, C.milk);
      g.px(cx - 1, 20, C.cocoa); g.px(cx, 21, C.cocoa); g.px(cx + 1, 20, C.cocoa);
      g.art(cx + 3, 7, ['XX.XX', 'XXXXX', 'XX.XX'], { X: bow }); g.px(cx + 5, 8, C.cocoa);
    };
    girl(10, C.cocoa, C.rose, C.milk);
    girl(22, T.woodDark, C.sage, C.sage);
    g.px(15, 15, T.milkLight);
  },
};

export const seedPhotoNames = Object.keys(scenes);

/** Build the raw 32x32 grid (cocoa vignette frame inside). */
export function seedPhotoGrid(name: string): Grid {
  const g = new Grid(32, 32, T.sageLight);
  const sc = scenes[name] ?? scenes[seedPhotoNames[0]];
  sc(g);
  return g;
}
export const seedPhoto = (name: string): Sprite => seedPhotoGrid(name).toSprite();
