/** OWNER: lead. Close-up viewer: FLIP from the scattered card to center, next/prev, esc / click outside. */
import type { Memory } from '../types';
import { frameSize } from '../sprites';

export interface ViewerDeps {
  getList(): Memory[];
  getEl(id: string): HTMLElement | null;
  build(m: Memory, u: number): HTMLElement;
  fmtDate(iso: string): string;
  onNav(): void;
  onOpen(): void;
}

export function createViewer(root: HTMLElement, d: ViewerDeps) {
  const ov = document.createElement('div');
  ov.className = 'viewer'; ov.hidden = true;
  ov.innerHTML = `<button class="vnav prev" aria-label="previous">‹</button><div class="vslot"></div><button class="vnav next" aria-label="next">›</button><div class="vlabel"></div>`;
  root.appendChild(ov);
  const slot = ov.querySelector<HTMLElement>('.vslot')!, label = ov.querySelector<HTMLElement>('.vlabel')!;
  let idx = -1, cur: HTMLElement | null = null, busy = false;

  const unit = (m: Memory) => {
    const sz = frameSize(m.type);
    const u = Math.floor(Math.min((window.innerWidth * 0.78) / sz.w, (window.innerHeight * 0.62) / sz.h, 10));
    return Math.max(2, u % 2 && u > 3 ? u - 1 : u);
  };
  const mk = (m: Memory) => {
    const c = d.build(m, unit(m));
    c.classList.add('big');
    if (m.type === 'note') fitNote(c);
    return c;
  };
  function fitNote(c: HTMLElement) {
    const t = c.querySelector<HTMLElement>('.notetext'); if (!t) return;
    const u = parseFloat(c.style.getPropertyValue('--u'));
    queueMicrotask(() => {
      let fs = 5 * u;
      t.style.fontSize = fs + 'px';
      while (t.scrollHeight > t.clientHeight + 1 && fs > 2.6 * u) { fs -= 0.25 * u; t.style.fontSize = fs + 'px'; t.style.lineHeight = '1.15'; }
    });
  }
  function setLabel(m: Memory) {
    label.innerHTML = '';
    const mkSpan = (c: string, t: string) => { const s = document.createElement('span'); s.className = c; s.textContent = t; label.appendChild(s); };
    if (m.type === 'photo') mkSpan('ld', d.fmtDate(m.date));
    else { mkSpan('lc', m.caption); mkSpan('ld', d.fmtDate(m.date)); }
  }
  function rectOf(e: HTMLElement) { return e.getBoundingClientRect(); }

  function open(id: string) {
    const list = d.getList(); idx = list.findIndex(m => m.id === id); if (idx < 0) return;
    const m = list[idx], src = d.getEl(id);
    ov.hidden = false; ov.classList.add('on'); root.classList.add('viewing');
    cur = mk(m); slot.replaceChildren(cur); setLabel(m);
    d.onOpen();
    if (src) {
      const a = rectOf(src), b = rectOf(cur);
      const sc = a.width / b.width;
      cur.animate([
        { transform: `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px,${a.top + a.height / 2 - (b.top + b.height / 2)}px) scale(${sc})` },
        { transform: 'translate(0,-14px) scale(1.04)', offset: 0.7 },
        { transform: 'translate(0,0) scale(1)' },
      ], { duration: 380, easing: 'cubic-bezier(.3,.9,.4,1)' });
      src.style.opacity = '0';
    }
  }
  function close() {
    if (idx < 0 || !cur) return;
    const list = d.getList(), m = list[idx], src = m ? d.getEl(m.id) : null;
    const c = cur; cur = null; idx = -1;
    ov.classList.remove('on');
    const done = () => { root.classList.remove('viewing'); ov.hidden = true; slot.replaceChildren(); if (src) src.style.opacity = ''; };
    if (src) {
      const a = rectOf(src), b = rectOf(c);
      c.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px,${a.top + a.height / 2 - (b.top + b.height / 2)}px) scale(${a.width / b.width})` }], { duration: 260, easing: 'ease-in', fill: 'forwards' }).finished.then(done, done);
    } else done();
  }
  async function go(dir: number) {
    const list = d.getList(); if (idx < 0 || busy || list.length < 2) return;
    busy = true;
    const old = cur!, oldSrc = d.getEl(list[idx].id);
    idx = (idx + dir + list.length) % list.length;
    const m = list[idx], src = d.getEl(m.id);
    d.onNav();
    const nu = mk(m);
    const x = dir * window.innerWidth * 0.5;
    old.animate([{ transform: 'translateX(0)', opacity: 1 }, { transform: `translateX(${-x}px)`, opacity: 0 }], { duration: 220, easing: 'ease-in', fill: 'forwards' });
    slot.appendChild(nu);
    nu.animate([{ transform: `translateX(${x}px)`, opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }], { duration: 260, easing: 'cubic-bezier(.3,.9,.4,1.1)' });
    if (oldSrc) oldSrc.style.opacity = '';
    if (src) src.style.opacity = '0';
    setLabel(m);
    await new Promise(r => setTimeout(r, 270));
    old.remove(); cur = nu; busy = false;
  }

  ov.addEventListener('pointerdown', e => { if (e.target === ov || e.target === slot) startX = e.clientX; else if (cur?.contains(e.target as Node)) startX = e.clientX; });
  let startX = 0;
  ov.addEventListener('pointerup', e => {
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 50) { void go(dx < 0 ? 1 : -1); return; }
    const t = e.target as HTMLElement;
    if (!t.closest('.card') && !t.closest('.vnav') && !t.closest('.vlabel')) close();
  });
  ov.querySelector('.prev')!.addEventListener('click', () => { void go(-1); });
  ov.querySelector('.next')!.addEventListener('click', () => { void go(1); });
  document.addEventListener('keydown', e => {
    if (idx < 0) return;
    if (e.key === 'ArrowRight') void go(1); else if (e.key === 'ArrowLeft') void go(-1);
  });
  return { open, close, isOpen: () => idx >= 0 };
}
