/** OWNER: audio+storage+settings (UI helpers). Add-memory form. */
import type { Memory } from '../types';
/** Opens modal form; resolves with new memory or null if cancelled. Must call storage.fileToDataUrl for photos. */
export function openAddForm(_root: HTMLElement): Promise<Memory | null> { return Promise.resolve(null); }
