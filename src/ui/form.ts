/** OWNER: audio+storage+settings (UI helpers). Add-memory form. */
import type { Memory, MemoryType } from '../types';
import { fileToDataUrl } from '../storage';
import { injectCss } from './ui-css';

const TYPES: { t: MemoryType; label: string; e: string }[] = [
  { t: 'photo', label: 'PHOTO', e: '📷' },
  { t: 'note', label: 'NOTE', e: '💌' },
  { t: 'ticket', label: 'TICKET', e: '🎟️' },
  { t: 'flower', label: 'FLOWER', e: '🌸' },
];

/** Draw an image onto a tiny grid so it previews as chunky pixel art. */
async function pixelPreview(dataUrl: string, canvas: HTMLCanvasElement, grid = 36): Promise<void> {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  canvas.width = grid; canvas.height = grid;
  const g = canvas.getContext('2d')!;
  g.imageSmoothingEnabled = true;
  const s = Math.min(img.width, img.height);
  g.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, grid, grid);
}

/** Opens modal form; resolves with new memory or null if cancelled. Must call storage.fileToDataUrl for photos. */
export function openAddForm(root: HTMLElement): Promise<Memory | null> {
  injectCss();
  return new Promise(resolve => {
    let type: MemoryType = 'photo';
    let photo: string | undefined;
    const today = new Date().toISOString().slice(0, 10);
    const ov = document.createElement('div');
    ov.className = 'mb-ov';
    ov.innerHTML = `
      <form data-testid="form" class="mb-card" role="dialog" aria-label="Add a memory" novalidate>
        <h2>✿ new memory ✿</h2>
        <div class="mb-types">${TYPES.map(x => `<button type="button" class="mb-type" data-t="${x.t}" aria-pressed="${x.t === type}"><span class="e">${x.e}</span>${x.label}</button>`).join('')}</div>
        <div data-f="photo"><label class="mb-file">📷 pick a photo<input type="file" accept="image/*"></label><canvas class="mb-prev" hidden></canvas></div>
        <label for="mb-cap">CAPTION</label><input id="mb-cap" type="text" maxlength="40" placeholder="what's this?">
        <label for="mb-date">DATE</label><input id="mb-date" type="date" value="${today}">
        <div data-f="note" hidden><label for="mb-text">YOUR NOTE</label><textarea id="mb-text" maxlength="200" placeholder="write something sweet…"></textarea></div>
        <div data-f="ticket" hidden><label for="mb-seat">SEAT</label><input id="mb-seat" type="text" maxlength="24" placeholder="ROW 4 · SEAT 12"></div>
        <div class="mb-err" role="alert"></div>
        <div class="mb-row"><button type="button" class="mb-btn" data-a="cancel">CANCEL</button><button type="submit" data-testid="submit" class="mb-btn go">TUCK IN ♥</button></div>
      </form>`;
    root.appendChild(ov);
    const q = <T extends Element>(s: string) => ov.querySelector<T>(s)!;
    const err = q<HTMLElement>('.mb-err');
    const finish = (m: Memory | null) => { document.removeEventListener('keydown', onKey); ov.remove(); resolve(m); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') finish(null); };
    document.addEventListener('keydown', onKey);

    const sync = () => {
      ov.querySelectorAll<HTMLElement>('.mb-type').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.t === type)));
      ov.querySelectorAll<HTMLElement>('[data-f]').forEach(d => { d.hidden = d.dataset.f !== type; });
    };
    ov.querySelectorAll<HTMLElement>('.mb-type').forEach(b => b.addEventListener('click', () => { type = b.dataset.t as MemoryType; err.textContent = ''; sync(); }));
    q('[data-a=cancel]').addEventListener('click', () => finish(null));
    ov.addEventListener('pointerdown', e => { if (e.target === ov) finish(null); });

    const fileIn = q<HTMLInputElement>('input[type=file]');
    const prev = q<HTMLCanvasElement>('.mb-prev');
    fileIn.addEventListener('change', async () => {
      const f = fileIn.files?.[0];
      if (!f) return;
      try {
        photo = await fileToDataUrl(f);
        await pixelPreview(photo, prev);
        prev.hidden = false;
        err.textContent = '';
      } catch { photo = undefined; err.textContent = "couldn't read that picture :("; }
    });

    q<HTMLFormElement>('form').addEventListener('submit', e => {
      e.preventDefault();
      const caption = q<HTMLInputElement>('#mb-cap').value.trim();
      const date = q<HTMLInputElement>('#mb-date').value || today;
      const text = q<HTMLTextAreaElement>('#mb-text').value.trim();
      const seat = q<HTMLInputElement>('#mb-seat').value.trim();
      if (type === 'photo' && !photo) { err.textContent = 'pick a photo first ♥'; return; }
      if (type === 'note' && !text) { err.textContent = 'write a little note ♥'; return; }
      const m: Memory = {
        id: crypto.randomUUID?.() ?? `m-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type, caption: caption || (type === 'flower' ? 'a pretty flower' : type === 'ticket' ? 'a good night' : 'a sweet memory'),
        date, createdAt: Date.now(),
      };
      if (type === 'photo') m.photo = photo;
      if (type === 'note') m.text = text;
      if (type === 'ticket') m.seat = seat || 'ROW 1 · SEAT 1';
      finish(m);
    });
    setTimeout(() => q<HTMLElement>('.mb-type').focus(), 0);
  });
}
