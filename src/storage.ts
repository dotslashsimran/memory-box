/** OWNER: audio+storage+settings. IndexedDB persistence. */
import type { Memory } from './types';

/** Returns all memories sorted by createdAt ascending. Seeds samples on first ever load. */
export async function loadMemories(): Promise<Memory[]> { return []; }
export async function saveMemory(_m: Memory): Promise<void> {}
export async function deleteMemory(_id: string): Promise<void> {}
/** Removes only memories with seed === true. */
export async function clearSeedMemories(): Promise<void> {}
/** Downscale an uploaded file to max `maxSide` px and return a JPEG/PNG data URL. */
export async function fileToDataUrl(_f: File, _maxSide = 640): Promise<string> { return ''; }
