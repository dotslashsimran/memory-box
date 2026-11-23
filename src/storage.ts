/** OWNER: audio+storage+settings. IndexedDB persistence. */
import type { Memory } from './types';

const DB_NAME = 'memory-box';
const STORE = 'memories';
const SEEDED_KEY = 'mb-seeded';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore(STORE, { keyPath: 'id' }); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const r = fn(t.objectStore(STORE));
    t.oncomplete = () => { db.close(); resolve(r ? r.result : undefined); };
    t.onerror = t.onabort = () => { db.close(); reject(t.error); };
  });
}

const seeds = (): Memory[] => {
  const t0 = Date.UTC(2025, 0, 1);
  const s = (i: number, m: Omit<Memory, 'id' | 'seed' | 'createdAt'>): Memory =>
    ({ ...m, id: `seed-${i}`, seed: true, createdAt: t0 + i });
  return [
    s(1, { type: 'photo', caption: 'picnic with the girls', date: '2025-05-17', photo: 'seed:picnic' }),
    s(2, { type: 'note', caption: 'a little note', date: '2025-03-02', text: 'you did great today. so proud of you ♥' }),
    s(3, { type: 'ticket', caption: 'first concert!', date: '2025-07-12', seat: 'ROW 4 · SEAT 12' }),
    s(4, { type: 'flower', caption: 'grandma\'s garden', date: '2025-04-21' }),
    s(5, { type: 'photo', caption: 'cat nap sunday', date: '2025-02-09', photo: 'seed:cat' }),
    s(6, { type: 'ticket', caption: 'movie night', date: '2025-08-30', seat: 'ROW 7 · SEAT 3' }),
    s(7, { type: 'photo', caption: 'beach day', date: '2025-06-28', photo: 'seed:beach' }),
    s(8, { type: 'note', caption: 'recipe for happy', date: '2025-09-14', text: 'cake + friends + deep breaths = happy' }),
  ];
};

/** Returns all memories sorted by createdAt ascending. Seeds samples on first ever load. */
export async function loadMemories(): Promise<Memory[]> {
  try {
    if (!localStorage.getItem(SEEDED_KEY)) {
      const db = await openDb();
      await new Promise<void>((res, rej) => {
        const t = db.transaction(STORE, 'readwrite');
        const st = t.objectStore(STORE);
        for (const m of seeds()) st.put(m);
        t.oncomplete = () => res();
        t.onerror = () => rej(t.error);
      });
      db.close();
      localStorage.setItem(SEEDED_KEY, '1');
    }
    const all = (await tx<Memory[]>('readonly', s => s.getAll())) ?? [];
    return all.sort((a, b) => a.createdAt - b.createdAt);
  } catch (e) {
    console.warn('storage unavailable', e);
    return seeds();
  }
}
export async function saveMemory(m: Memory): Promise<void> { await tx('readwrite', s => { s.put(m); }); }
export async function deleteMemory(id: string): Promise<void> { await tx('readwrite', s => { s.delete(id); }); }
/** Removes only memories with seed === true. */
export async function clearSeedMemories(): Promise<void> {
  const all = (await tx<Memory[]>('readonly', s => s.getAll())) ?? [];
  const ids = all.filter(m => m.seed).map(m => m.id);
  await tx('readwrite', s => { ids.forEach(id => s.delete(id)); });
}

/** Downscale an uploaded file to max `maxSide` px and return a JPEG/PNG data URL. */
export async function fileToDataUrl(f: File, maxSide = 640): Promise<string> {
  const bmp = await createImageBitmap(f);
  const k = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * k)), h = Math.max(1, Math.round(bmp.height * k));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d')!;
  g.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const png = f.type === 'image/png' || f.type === 'image/gif';
  return c.toDataURL(png ? 'image/png' : 'image/jpeg', 0.85);
}
