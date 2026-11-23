/**
 * OWNER: sprites/art. Every function returns a Sprite {svg,w,h}: rect-per-pixel SVG with
 * shape-rendering="crispEdges". Native size is small; the UI scales by whole numbers with
 * image-rendering: pixelated. Keep these signatures stable.
 */
export type { Sprite } from './grid';
export { boxBody, boxMouth, lidFrames, heart, heartSmall, sparklePx, icon } from './box';
export { roomWall, roomFloor, roomWindow, cloud, fairyLights, windowLight, dustMote, rug } from './room';
export { memoryFrame, frameLayout, frameSize } from './frames';
export type { Rect, FrameLayout } from './frames';
export { seedPhoto, seedPhotoNames } from './photos';
export { flower } from './flower';
export { pixelatePhoto, pixelateDataURL } from './filter';
export type { PixelateOptions } from './filter';
