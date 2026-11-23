import { C, T } from '../palette';
import type { Memory, MemoryType } from '../types';
import { Grid, Sprite, drawText, hash, textWidth } from './grid';
import { flowerGrid } from './flower';

export interface Rect { x: number; y: number; w: number; h: number }
export interface FrameLayout {
  /** where the photo goes (photo cards only) */
  photo?: Rect;
  /** caption / body text area */
  text: Rect;
  /** suggested text line pitch in native px (note ruling is drawn at this pitch; first baseline = text.y+lineH-1) */
  lineH?: number;
}
export const frameSize = (t: MemoryType): { w: number; h: number } => ({ w: t === 'photo' ? 40 : 32, h: 44 });
export function frameLayout(t: MemoryType): FrameLayout {
  switch (t) {
    case 'photo': return { photo: { x: 4, y: 5, w: 32, h: 29 }, text: { x: 4, y: 35, w: 32, h: 7 } };
    case 'note': return { text: { x: 7, y: 11, w: 22, h: 28 }, lineH: 6 };
    case 'ticket': return { text: { x: 4, y: 11, w: 24, h: 21 } };
    case 'flower': return { text: { x: 4, y: 32, w: 24, h: 8 } };
  }
}

function polaroid(): Grid {
  const g = new Grid(40, 44);
  g.box(0, 0, 40, 44, C.cream, C.cocoa);
  g.hline(1, 42, 38, T.creamShade); g.vline(38, 1, 41, T.creamShade);
  g.rect(3, 4, 34, 31, T.creamDeep);
  g.rect(4, 5, 32, 29, T.sageLight);                 // fallback tint under the photo
  // butter washi tape holding it up
  g.rect(13, 0, 14, 5, C.cocoa);
  g.rect(14, 1, 12, 3, C.butter);
  for (let i = 0; i < 12; i += 3) { g.px(14 + i, 1, T.butterDeep); g.px(15 + i, 2, T.butterDeep); g.px(16 + i, 3, T.butterDeep); }
  g.px(13, 0, null); g.px(26, 0, null);
  return g;
}

function note(): Grid {
  const g = new Grid(32, 44);
  g.box(0, 0, 32, 44, C.cream, C.cocoa);
  for (let y = 16; y < 41; y += 6) g.hline(2, y, 28, T.milkLight);
  g.vline(5, 1, 42, C.milk);
  g.hline(1, 21, 30, T.creamShade); g.hline(1, 22, 30, T.creamDeep); g.hline(1, 23, 30, T.creamShade); // fold
  // dog-eared bottom-right corner
  for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) {
    const s2 = i + j, x = 25 + i, y = 37 + j;
    if (s2 > 7) g.px(x, y, null);
    else if (s2 === 7) g.px(x, y, C.cocoa);
    else if (s2 >= 4) g.px(x, y, T.creamDeep);
  }
  // pink washi tape across the top-left corner
  const tape = new Grid(14, 6, C.milk);
  for (let j = 0; j < 6; j++) for (let i = 0; i < 14; i++) if ((i + j) % 4 === 0) tape.px(i, j, C.rose);
  for (let j = 0; j < 6; j += 2) { tape.px(0, j, null); tape.px(13, j + 1, null); }
  tape.hline(0, 0, 14, T.milkLight);
  g.blit(tape, 9, 2);
  g.hline(9, 8, 14, T.milkDeep);
  return g;
}

function ticket(m: Memory | null): Grid {
  const g = new Grid(32, 44);
  g.rect(0, 0, 32, 44, C.cocoa);
  g.rect(1, 1, 30, 42, C.butter);
  g.vline(1, 9, 33, T.butterLight);
  // header
  g.rect(1, 1, 30, 8, C.rose);
  g.hline(1, 8, 30, T.roseDark);
  drawText(g, 4, 2, 'ADMIT', C.cream);
  for (let x = 3; x < 29; x += 2) g.px(x, 10, T.butterDeep);
  // perforation with side notches
  const py = 33;
  for (let x = 4; x < 28; x += 3) g.px(x, py, C.cocoa);
  for (let j = -2; j <= 2; j++) { const d = 3 - Math.abs(j); for (let i = 0; i < d; i++) { g.px(i, py + j, null); g.px(31 - i, py + j, null); } }
  g.vline(3, py - 2, 5, null); g.vline(28, py - 2, 5, null);
  // fake seat number on the stub
  const n = 1 + ((m ? hash(m.id) : 7) % 48);
  const label = 'NO.' + String(n).padStart(2, '0');
  drawText(g, Math.round(16 - textWidth(label) / 2), 36, label, C.cocoa);
  // torn bottom edge
  const tear = [0, 1, 0, 2, 1, 0, 1, 2, 3, 1, 0, 2, 1, 0, 1, 3, 2, 0, 1, 2, 0, 1, 3, 1, 0, 2, 1, 0, 1, 2, 1, 0];
  for (let x = 0; x < 32; x++) {
    const top = 43 - tear[x];
    for (let y = top + 1; y < 44; y++) g.px(x, y, null);
    g.px(x, top, C.cocoa);
  }
  g.px(0, 0, null); g.px(31, 0, null);
  return g;
}

function flowerCard(m: Memory | null): Grid {
  const g = new Grid(32, 44);
  g.box(0, 0, 32, 44, C.sage, C.cocoa);
  g.rect(3, 3, 26, 26, C.cocoa);
  g.rect(4, 4, 24, 24, C.cream);
  for (const [x, y] of [[6, 6], [24, 9], [7, 24], [23, 25], [6, 14], [25, 18]]) g.px(x, y, T.creamDeep);
  for (const [x, y] of [[2, 2], [24, 2], [2, 26], [24, 26]]) { g.rect(x, y, 6, 3, C.butter); g.hline(x, y, 6, T.butterLight); g.hline(x, y + 2, 6, T.butterDeep); }
  g.blit(flowerGrid(m ? hash(m.id) % 3 : 0), 8, 7);
  g.rect(3, 31, 26, 10, C.cocoa);
  g.rect(4, 32, 24, 8, C.cream);
  g.hline(4, 39, 24, T.creamShade);
  g.px(3, 42, T.sageDeep);
  g.hline(1, 42, 30, T.sageDeep);
  return g;
}

/** Frame art for a memory (photo/caption/text are composed by the UI inside frameLayout(m.type)). */
export function memoryFrame(m: Memory): Sprite {
  switch (m.type) {
    case 'photo': return polaroid().toSprite();
    case 'note': return note().toSprite();
    case 'ticket': return ticket(m).toSprite();
    case 'flower': return flowerCard(m).toSprite();
  }
}
