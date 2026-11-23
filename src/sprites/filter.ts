/**
 * Light "pixelate + gentle dither + cozy colour grade" for user photos.
 * Designed to keep faces readable: moderately high output res (default 64px on the long side),
 * area-averaged downscale (not nearest) so features survive, low-amplitude ordered dither, and
 * a warm grade pulling shadows to cocoa and highlights to cream so it sits in the palette.
 */
export interface PixelateOptions {
  /** longest output side in native pixels (default 64; UI scales by whole numbers) */
  size?: number;
  /** colour levels per channel (default 7 — soft, not posterised) */
  levels?: number;
  /** ordered-dither strength 0..1 (default 0.3) */
  dither?: number;
  /** warm-grade amount 0..1 (default 0.35) */
  warmth?: number;
  /** crop to this aspect (w/h); default keeps source aspect clamped to 3:4..4:3 */
  aspect?: number;
}
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const COCOA = [0x5A, 0x3E, 0x36], CREAM = [0xFF, 0xF4, 0xE6], MILK = [0xF7, 0xB6, 0xC8];

export function pixelatePhoto(src: CanvasImageSource & { width?: number; height?: number; naturalWidth?: number; naturalHeight?: number; videoWidth?: number; videoHeight?: number }, opts: PixelateOptions = {}): HTMLCanvasElement {
  const size = opts.size ?? 64, levels = Math.max(2, opts.levels ?? 7), dith = opts.dither ?? 0.3, warm = opts.warmth ?? 0.35;
  const sw = (src.naturalWidth ?? src.videoWidth ?? src.width) as number, sh = (src.naturalHeight ?? src.videoHeight ?? src.height) as number;
  const asp = Math.min(4 / 3, Math.max(3 / 4, opts.aspect ?? sw / sh));
  // centre-crop source to aspect
  let cw = sw, ch = sh;
  if (sw / sh > asp) cw = Math.round(sh * asp); else ch = Math.round(sw / asp);
  const cx = Math.round((sw - cw) / 2), cy = Math.round((sh - ch) / 2);
  const ow = asp >= 1 ? size : Math.max(8, Math.round(size * asp)), oh = asp >= 1 ? Math.max(8, Math.round(size / asp)) : size;
  // progressive halving for a clean area-average
  let cur: HTMLCanvasElement = document.createElement('canvas');
  cur.width = cw; cur.height = ch;
  cur.getContext('2d')!.drawImage(src, cx, cy, cw, ch, 0, 0, cw, ch);
  while (cur.width / 2 >= ow * 1 && cur.height / 2 >= oh) {
    const n = document.createElement('canvas');
    n.width = Math.max(ow, Math.floor(cur.width / 2)); n.height = Math.max(oh, Math.floor(cur.height / 2));
    const c = n.getContext('2d')!; c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.drawImage(cur, 0, 0, n.width, n.height);
    cur = n;
  }
  const out = document.createElement('canvas'); out.width = ow; out.height = oh;
  const ctx = out.getContext('2d')!; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#FFF4E6'; ctx.fillRect(0, 0, ow, oh);
  ctx.drawImage(cur, 0, 0, ow, oh);
  const img = ctx.getImageData(0, 0, ow, oh), d = img.data, step = 255 / (levels - 1);
  for (let y = 0; y < oh; y++) for (let x = 0; x < ow; x++) {
    const i = (y * ow + x) * 4;
    let r = d[i], g = d[i + 1], b = d[i + 2];
    // gentle contrast + saturation so faces keep their shape
    const l = 0.3 * r + 0.59 * g + 0.11 * b;
    r = l + (r - l) * 1.12; g = l + (g - l) * 1.12; b = l + (b - l) * 1.12;
    r = (r - 128) * 1.06 + 128; g = (g - 128) * 1.06 + 128; b = (b - 128) * 1.06 + 128;
    // warm grade: map luminance through cocoa→(milk tint)→cream
    const t = Math.min(1, Math.max(0, l / 255));
    const mid = t < 0.5 ? mix(COCOA, MILK, t * 2) : mix(MILK, CREAM, (t - 0.5) * 2);
    r = r * (1 - warm) + mid[0] * warm; g = g * (1 - warm) + mid[1] * warm; b = b * (1 - warm) + mid[2] * warm;
    // ordered dither then quantise
    const th = (BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.47) * step * dith * 2;
    d[i] = q(r + th, step); d[i + 1] = q(g + th, step); d[i + 2] = q(b + th, step); d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return out;
}
const mix = (a: number[], b: number[], t: number) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const q = (v: number, step: number) => Math.max(0, Math.min(255, Math.round(Math.round(v / step) * step)));

/** Convenience: data URL (any image) → pixelated PNG data URL. */
export async function pixelateDataURL(url: string, opts?: PixelateOptions): Promise<string> {
  const img = new Image();
  img.src = url;
  await img.decode();
  return pixelatePhoto(img, opts).toDataURL('image/png');
}
