/** OWNER: audio+storage+settings (UI helpers). Add-memory form. */
import type { Memory, MemoryType } from '../types';
import { fileToDataUrl } from '../storage';
import { injectCss } from './ui-css';
import { C } from '../palette';

const PAL: Record<string, string> = { o: C.cocoa, r: C.rose, m: C.milk, b: C.butter, s: C.sage, c: C.cream };
/** Tiny pixel-art icon from a char grid ('.' = empty). */
function pix(rows: string[]): string {
  const rects = rows.flatMap((row, y) => [...row].map((ch, x) => PAL[ch] ? `<rect x="${x}" y="${y}" width="1" height="1" fill="${PAL[ch]}"/>` : '')).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rows[0].length} ${rows.length}" shape-rendering="crispEdges" class="px">${rects}</svg>`;
}
const ICONS: Record<MemoryType, string> = {
  photo: pix([
    '............',
    '...oooo.....',
    '.oooooooooo.',
    '.ommmmmmmbo.',
    '.ommoooommo.',
    '.omoccccomo.',
    '.omoccccomo.',
    '.ommoooommo.',
    '.ommmmmmmmo.',
    '.oooooooooo.',
    '............',
  ]),
  note: pix([
    '............',
    '.oooooooooo.',
    '.occcccccco.',
    '.ocrrrrrrco.',
    '.occcccccco.',
    '.ocrrrrrcco.',
    '.occcccccco.',
    '.ocrrrrrrco.',
    '.occcccccco.',
    '.oooooooooo.',
    '............',
  ]),
  ticket: pix([
    '............',
    '.oooooooooo.',
    'obbbbobbbbbo',
    'obbbbobrrbbo',
    'obbbbobbbbbo',
    'obbbbobrrbbo',
    'obbbbobbbbbo',
    '.oooooooooo.',
    '............',
    '............',
    '............',
  ]),
  flower: pix([
    '....oooo....',
    '...ommmmo...',
    '.ooommmmooo.',
    '.ommmbbmmmo.',
    '.ommmbbmmmo.',
    '.ooommmmooo.',
    '...ommmmo...',
    '....ooso....',
    '..s..os..s..',
    '..sssosss...',
    '....ooso....',
  ]),
};

const TYPES: { t: MemoryType; label: string }[] = [
  { t: 'photo', label: 'PHOTO' },
  { t: 'note', label: 'NOTE' },
  { t: 'ticket', label: 'TICKET' },
  { t: 'flower', label: 'FLOWER' },
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
        <div class="mb-types">${TYPES.map(x => `<button type="button" class="mb-type" data-t="${x.t}" aria-pressed="${x.t === type}"><span class="e">${ICONS[x.t]}</span>${x.label}</button>`).join('')}</div>
        <div data-f="photo"><label class="mb-file">pick a photo<input type="file" accept="image/*"></label><canvas class="mb-prev" hidden></canvas></div>
        <label for="mb-cap">CAPTION</label><input id="mb-cap" type="text" maxlength="40" placeholder="what's this?">
        <label for="mb-date">DATE</label><div class="mb-date"><input id="mb-date" type="date" value="${today}" aria-label="date"><div class="mb-dd" aria-hidden="true"></div></div>
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

    const dateIn = q<HTMLInputElement>('#mb-date');
    const dd = q<HTMLElement>('.mb-dd');
    const MON = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const paintDate = () => {
      const [y, m, d] = (dateIn.value || today).split('-').map(Number);
      const part = (k: string, txt: string) => `<span class="mb-dp"><button type="button" data-k="${k}" data-s="1" tabindex="-1">▲</button><b>${txt}</b><button type="button" data-k="${k}" data-s="-1" tabindex="-1">▼</button></span>`;
      dd.innerHTML = part('m', MON[m - 1]) + part('d', String(d).padStart(2, '0')) + part('y', String(y));
    };
    dd.addEventListener('click', e => {
      const b = (e.target as HTMLElement).closest<HTMLElement>('button[data-k]');
      if (!b) return;
      const [y, m, d] = (dateIn.value || today).split('-').map(Number);
      const st = Number(b.dataset.s);
      const dt = new Date(Date.UTC(y, m - 1, d));
      if (b.dataset.k === 'd') dt.setUTCDate(dt.getUTCDate() + st);
      else if (b.dataset.k === 'm') { const day = dt.getUTCDate(); dt.setUTCDate(1); dt.setUTCMonth(dt.getUTCMonth() + st); dt.setUTCDate(Math.min(day, new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 0)).getUTCDate())); }
      else { const day = dt.getUTCDate(); dt.setUTCDate(1); dt.setUTCFullYear(dt.getUTCFullYear() + st); dt.setUTCDate(Math.min(day, new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 0)).getUTCDate())); }
      dateIn.value = dt.toISOString().slice(0, 10);
      paintDate();
    });
    dateIn.addEventListener('input', paintDate);
    dateIn.addEventListener('change', paintDate);
    paintDate();
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
