/**
 * OWNER: sprites/art. Every function returns an SVG *string* (rect-per-pixel, shape-rendering="crispEdges")
 * or an HTMLCanvasElement drawn on a pixel grid. Native size is small; the UI scales by whole numbers
 * with image-rendering: pixelated. Keep these signatures stable.
 */
import { C } from '../palette';
import type { Memory } from '../types';

export interface Sprite { svg: string; w: number; h: number } // w,h in native pixels

const stub = (w: number, h: number, fill: string): Sprite => ({
  w, h, svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" shape-rendering="crispEdges"><rect width="${w}" height="${h}" fill="${fill}"/></svg>`,
});

/** Box body (no lid), ~48x32. */
export const boxBody = (): Sprite => stub(48, 32, C.milk);
/** Lid animation frames, index 0 = closed … last = fully flipped back/open. 6-8 frames, same canvas size as one another. */
export const lidFrames = (): Sprite[] => Array.from({ length: 7 }, () => stub(52, 24, C.rose));
/** Room background layers. */
export const roomWall = (): Sprite => stub(160, 90, C.cream);
export const roomFloor = (): Sprite => stub(160, 30, C.butter);
export const roomWindow = (): Sprite => stub(40, 44, C.sage);
export const cloud = (variant = 0): Sprite => stub(20 + variant * 4, 8, C.cream);
export const fairyLights = (): Sprite => stub(160, 16, C.butter);
export const heart = (): Sprite => stub(7, 6, C.rose);
export const sparklePx = (frame = 0): Sprite => stub(5, 5, C.butter);
/** The memory card sprite for a memory (frame art only; the photo/caption are composed by ui via memoryFace). */
export const memoryFrame = (m: Memory): Sprite => stub(m.type === 'photo' ? 40 : 32, 44, C.cream);
/** Pixel-art placeholder photos used by seed memories: name from `seed:<name>`. */
export const seedPhoto = (_name: string): Sprite => stub(32, 32, C.sage);
export const seedPhotoNames = ['picnic', 'cat', 'beach', 'cake'];
/** Pixel flower for flower cards. */
export const flower = (_variant = 0): Sprite => stub(16, 20, C.sage);
/** Small icons: speaker on/off, plus, gear, close. */
export const icon = (_name: 'speaker-on' | 'speaker-off' | 'plus' | 'gear' | 'x'): Sprite => stub(9, 9, C.cocoa);
