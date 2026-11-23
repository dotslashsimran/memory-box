/** OWNER: lead. Scene wiring + animations. */
import './style.css';
import { C, T } from './palette';
import type { Memory } from './types';
import { loadMemories, saveMemory, clearSeedMemories } from './storage';
import * as sfx from './audio';
import {
  boxBody, boxMouth, lidFrames, heart, heartSmall, sparklePx, icon, roomWall, roomFloor, roomWindow, cloud,
  fairyLights, windowLight, dustMote, rug, memoryFrame, frameLayout, frameSize, seedPhoto, pixelateDataURL, flower,
} from './sprites';
import type { Sprite } from './sprites';
import { Grid } from './sprites/grid';
import { openAddForm } from './ui/form';
import { mountSettings } from './ui/settings';
import { injectCss } from './ui/ui-css';
import { createViewer } from './ui/viewer';

/* ---------- helpers ---------- */
const uri = (s: Sprite) => `url("data:image/svg+xml,${encodeURIComponent(s.svg)}")`;
const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', parent?: HTMLElement): HTMLElementTagNameMap[K] => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  parent?.appendChild(e);
  return e;
};
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
const hashStr = (s: string) => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };
const rnd = (seed: number) => { let t = seed + 0x6D2B79F5; return () => { t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const fmtDate = (iso: string) => {
  const d = new Date(iso + 'T12:00:00');
  if (isNaN(+d)) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toLowerCase();
};
const pixelCache = new Map<string, string>();
async function userPhoto(m: Memory, grid: number): Promise<string> {
  const k = m.id + ':' + grid;
  let v = pixelCache.get(k);
  if (!v) { v = await pixelateDataURL(m.photo!, { size: grid, aspect: 32 / 29 }); pixelCache.set(k, v); }
  return v;
}

/* ---------- card (shared with viewer) ---------- */
export function buildCard(m: Memory, u: number): HTMLElement {
  const sz = frameSize(m.type), lay = frameLayout(m.type);
  const card = el('div', `card t-${m.type}`);
  card.style.setProperty('--u', String(u));
  card.style.width = `${sz.w * u}px`; card.style.height = `${sz.h * u}px`;
  const fr = el('div', 'frame', card);
  fr.style.backgroundImage = uri(memoryFrame(m));
  const at = (cls: string, r: { x: number; y: number; w: number; h: number }) => {
    const d = el('div', cls, card);
    d.style.left = `${r.x * u}px`; d.style.top = `${r.y * u}px`; d.style.width = `${r.w * u}px`; d.style.height = `${r.h * u}px`;
    return d;
  };
  if (m.type === 'photo' && lay.photo) {
    const p = at('photo', lay.photo);
    if (m.photo?.startsWith('seed:')) p.style.backgroundImage = uri(seedPhoto(m.photo.slice(5)));
    else if (m.photo) {
      const grid = u % 2 === 0 ? 64 : 96;
      userPhoto(m, grid).then(url => { p.style.backgroundImage = `url(${url})`; }).catch(() => { p.style.backgroundColor = C.sage; });
    }
    const cap = at('cap', lay.text); cap.textContent = m.caption;
  } else if (m.type === 'note') {
    const t = at('notetext', lay.text);
    t.textContent = m.text ?? m.caption;
    t.style.setProperty('--lh', String(lay.lineH ?? 6));
  } else if (m.type === 'ticket') {
    const t = at('tix', lay.text);
    t.innerHTML = '';
    el('b', '', t).textContent = m.caption;
    el('i', '', t).textContent = (m.seat ?? '').toLowerCase();
  } else if (m.type === 'flower') {
    const cap = at('cap flowercap', lay.text); cap.textContent = m.caption;
  }
  requestAnimationFrame(() => card.querySelectorAll<HTMLElement>('.cap,.tix b,.tix i').forEach(fitLine));
  return card;
}
/** shrink a single-line label until it fits its box (min ~60%). */
function fitLine(e: HTMLElement) {
  const u = parseFloat(e.closest<HTMLElement>('.card')?.style.getPropertyValue('--u') || '3');
  const cs = getComputedStyle(e);
  let fs = parseFloat(cs.fontSize);
  const min = fs * 0.62;
  if (e.tagName === 'B' || e.classList.contains('flowercap')) return;
  e.style.whiteSpace = 'nowrap';
  while (e.scrollWidth > e.clientWidth + 1 && fs > min) { fs -= u * 0.25; e.style.fontSize = fs + 'px'; }
}

/* ---------- layout ---------- */
interface Lay { W: number; H: number; S: number; U: number; portrait: boolean; boxL: number; boxT: number; slots: [number, number, number][] }
const SLOTS_L: [number, number, number][] = [
  [0.30, 0.37, -6], [0.70, 0.34, 5], [0.17, 0.60, 4], [0.84, 0.60, -5], [0.31, 0.78, -3], [0.70, 0.80, 6], [0.5, 0.2, -2], [0.08, 0.80, 5],
];
const SLOTS_P: [number, number, number][] = [
  [0.24, 0.27, -6], [0.77, 0.24, 5], [0.17, 0.43, 4], [0.84, 0.45, -5], [0.2, 0.76, -4], [0.8, 0.75, 5], [0.5, 0.12, -2], [0.5, 0.835, 3],
];
function computeLayout(): Lay {
  const W = window.innerWidth, H = window.innerHeight;
  const portrait = W / H < 0.85;
  const S = Math.max(3, Math.min(6, Math.floor(Math.min(W * 0.55 / 52, H * (portrait ? 0.3 : 0.38) / 62 * (portrait ? 1.3 : 1)))));
  const U = portrait ? 3 : (W >= 1100 && H >= 760 ? 4 : 3);
  const feetY = H * (portrait ? 0.7 : 0.74);
  return { W, H, S, U, portrait, boxL: Math.round(W / 2 - 26 * S), boxT: Math.round(feetY - 62 * S), slots: portrait ? SLOTS_P : SLOTS_L };
}

/* ---------- scene ---------- */
async function main() {
  injectCss();
  const app = document.getElementById('app')!;
  const stage = el('div', 'stage idle', app);
  let L = computeLayout();

  const wall = el('div', 'wall', stage), floor = el('div', 'floor', stage);
  const lightsA = el('div', 'lights', stage), lightsB = el('div', 'lights b', stage);
  const win = el('div', 'window', stage);
  const sky = el('div', 'sky', win);
  const clouds = [0, 1, 2].map(i => el('div', 'cloud', sky));
  const winImg = el('div', 'winimg', win);
  const beam = el('div', 'beam', stage);
  const motes = Array.from({ length: 7 }, () => el('div', 'mote', stage));
  const rugEl = el('div', 'rug', stage);
  const shadow = el('div', 'bshadow', stage);

  const boxHit = el('button', 'boxhit', stage);
  boxHit.dataset.testid = 'box'; boxHit.setAttribute('aria-label', 'open the memory box');
  const mouthEl = el('div', 'part mouth', stage); mouthEl.hidden = true;
  const bodyEl = el('div', 'part body', stage);
  const lids = lidFrames();
  const lidEl = el('div', 'part lid', stage);
  const lidImgs = lids.map((s, i) => { const d = el('div', 'lidf', lidEl); d.style.backgroundImage = uri(s); d.hidden = i !== 0; return d; });
  mouthEl.style.backgroundImage = uri(boxMouth());
  bodyEl.style.backgroundImage = uri(boxBody());
  rugEl.style.backgroundImage = uri(rug());
  wall.style.backgroundImage = uri(roomWall());
  floor.style.backgroundImage = uri(roomFloor());
  winImg.style.backgroundImage = uri(roomWindow(false));
  beam.style.backgroundImage = uri(windowLight());
  lightsA.style.backgroundImage = uri(fairyLights(0)); lightsB.style.backgroundImage = uri(fairyLights(1));
  clouds.forEach((c, i) => { c.style.backgroundImage = uri(cloud(i)); });
  motes.forEach((m, i) => { m.style.backgroundImage = uri(dustMote(i)); });
  const sh = new Grid(56, 8); sh.ellipse(28, 4, 27, 3, '#5A3E3626'); shadow.style.backgroundImage = uri(sh.toSprite());

  const hint = el('div', 'hint', stage);
  const hh = heart();
  const hhEl = el('div', 'hh', hint);
  hhEl.style.cssText = `background-image:${uri(hh)};width:${hh.w}px;height:${hh.h}px`;
  el('span', '', hint).textContent = 'click me';
  let seen = false; try { seen = localStorage.getItem('mb-seen') === '1'; } catch { /* */ }
  hint.hidden = seen;

  const cardsLayer = el('div', 'cards', stage);
  const fx = el('div', 'fx', stage);

  /* HUD */
  const hud = el('div', 'hud', stage);
  const addBtn = el('button', 'sticker add', hud);
  addBtn.dataset.testid = 'add'; const plus = el('span', 'plus', addBtn); plus.style.backgroundImage = uri(icon('plus'));
  el('span', '', addBtn).textContent = 'add memory';
  const closeBtn = el('button', 'sticker closebox', hud);
  closeBtn.dataset.testid = 'close'; closeBtn.textContent = 'close box'; closeBtn.hidden = true;

  const spk = el('button', 'corner-btn spk', stage);
  spk.setAttribute('aria-label', 'toggle sound');
  const paintSpk = () => { spk.innerHTML = icon(sfx.isEnabled() ? 'speaker-on' : 'speaker-off').svg; };
  paintSpk();
  spk.addEventListener('click', () => { sfx.setEnabled(!sfx.isEnabled()); paintSpk(); if (sfx.isEnabled()) sfx.sparkle(); });

  /* state */
  let mems: Memory[] = await loadMemories();
  const cards = new Map<string, HTMLElement>();
  const slotOf = new Map<string, { x: number; y: number; r: number }>();
  let state: 'closed' | 'opening' | 'open' | 'closing' = 'closed';

  const slotFor = (i: number) => {
    if (i < L.slots.length) { const s = L.slots[i]; return { x: s[0] * L.W, y: s[1] * L.H, r: s[2] }; }
    const r = rnd(i * 7919 + 13);
    const xs = L.portrait ? [0.14, 0.86] : [0.9, 0.55, 0.88, 0.12];
    return { x: xs[i % xs.length] * L.W + (r() - 0.5) * 60, y: (L.portrait ? 0.3 + r() * 0.35 : 0.2 + r() * 0.65) * L.H, r: Math.round((r() - 0.5) * 14) };
  };
  const mouth = () => ({ x: L.boxL + 26 * L.S, y: L.boxT + 26 * L.S });

  function applyLayout() {
    L = computeLayout();
    const { S, W, H } = L;
    const root = stage.style;
    root.setProperty('--S', String(S));
    root.setProperty('--W', `${W}px`); root.setProperty('--H', `${H}px`);
    const wallH = 90 * S, ftop = Math.min(wallH, Math.round(H * 0.62));
    wall.style.cssText += `;height:${ftop}px;background-size:${160 * S}px ${90 * S}px;background-position:left bottom`;
    floor.style.cssText += `;top:${ftop}px;background-size:${160 * S}px ${30 * S}px`;
    for (const l of [lightsA, lightsB]) l.style.cssText += `;height:${16 * S}px;background-size:${160 * S}px ${16 * S}px`;
    const wx = L.portrait ? W * 0.5 - 20 * S + W * 0.18 : W * 0.13 - 20 * S + W * 0.0;
    const wy = Math.round(H * (L.portrait ? 0.1 : 0.12));
    win.style.cssText += `;left:${Math.round(wx)}px;top:${wy}px;width:${40 * S}px;height:${44 * S}px`;
    sky.style.cssText += `;left:${4 * S}px;top:${4 * S}px;width:${32 * S}px;height:${34 * S}px`;
    clouds.forEach((c, i) => { const s = cloud(i); c.style.cssText += `;width:${s.w * S}px;height:${s.h * S}px;top:${(3 + i * 9) * S}px;animation-duration:${50 + i * 17}s;animation-delay:${-i * 19}s;--run:${32 * S + s.w * S}px`; });
    winImg.style.cssText += `;background-size:${40 * S}px ${44 * S}px`;
    beam.style.cssText += `;left:${Math.round(wx + 4 * S)}px;top:${wy + 44 * S}px;width:${56 * S}px;height:${84 * S}px;background-size:${56 * S}px ${84 * S}px`;
    const ms = Math.max(2, S - 2);
    motes.forEach((m, i) => { m.style.cssText += `;width:${3 * ms}px;height:${3 * ms}px;background-size:100% 100%;left:${Math.round(wx + 8 * S + i * 5 * S)}px;top:${wy + 46 * S + ((i * 37) % 40) * S}px;animation-delay:${-i * 1.3}s;animation-duration:${6 + (i % 3)}s`; });
    const bw = 52 * S;
    for (const e of [lidEl, mouthEl, bodyEl]) e.style.cssText += `;width:${bw}px`;
    lidEl.style.cssText += `;left:${L.boxL}px;top:${L.boxT}px;height:${32 * S}px`;
    lidImgs.forEach(d => { d.style.backgroundSize = '100% 100%'; });
    mouthEl.style.cssText += `;left:${L.boxL + 2 * S}px;top:${L.boxT + 22 * S}px;width:${48 * S}px;height:${8 * S}px;background-size:100% 100%`;
    bodyEl.style.cssText += `;left:${L.boxL + 2 * S}px;top:${L.boxT + 30 * S}px;width:${48 * S}px;height:${32 * S}px;background-size:100% 100%`;
    boxHit.style.cssText += `;left:${L.boxL}px;top:${L.boxT + 8 * S}px;width:${bw}px;height:${54 * S}px`;
    const rw = 72 * S;
    rugEl.style.cssText += `;left:${Math.round(W / 2 - rw / 2)}px;top:${L.boxT + 62 * S - 9 * S}px;width:${rw}px;height:${14 * S}px;background-size:100% 100%`;
    shadow.style.cssText += `;left:${L.boxL - 2 * S}px;top:${L.boxT + 62 * S - 5 * S}px;width:${56 * S}px;height:${8 * S}px;background-size:100% 100%`;
    hint.style.cssText += `;left:${Math.round(W / 2)}px;top:${L.boxT + 8 * S - 10 * S}px`;
    hint.style.setProperty('--hs', String(Math.max(2, S - 2)));
    for (const [i, m] of mems.entries()) placeCard(m, i);
  }

  function placeCard(m: Memory, i: number) {
    const c = cards.get(m.id)!;
    const s = slotFor(i);
    slotOf.set(m.id, s);
    const u = L.U, sz = frameSize(m.type);
    if (c.dataset.u !== String(u)) { const n = buildCard(m, u); c.replaceChildren(n); c.style.width = n.style.width; c.style.height = n.style.height; c.style.setProperty('--u', String(u)); c.dataset.u = String(u); }
    c.style.left = `${Math.round(s.x - (sz.w * u) / 2)}px`;
    c.style.top = `${Math.round(s.y - (sz.h * u) / 2)}px`;
    c.style.setProperty('--rot', `${s.r}deg`);
    if (state === 'open') c.style.transform = `rotate(${s.r}deg)`;
  }

  function makeCardEl(m: Memory): HTMLElement {
    const wrap = el('button', 'mem');
    wrap.dataset.testid = 'memory'; wrap.dataset.memoryId = m.id; wrap.dataset.type = m.type;
    wrap.setAttribute('aria-label', `${m.type}: ${m.caption}`);
    cardsLayer.appendChild(wrap);
    cards.set(m.id, wrap);
    wrap.addEventListener('click', () => { if (state === 'open') showViewer(m.id); });
    return wrap;
  }
  const hideCard = (c: HTMLElement) => { const mp = mouth(); const l = parseFloat(c.style.left), t = parseFloat(c.style.top); const w = parseFloat(c.style.width), h = parseFloat(c.style.height); return { dx: mp.x - (l + w / 2), dy: mp.y - (t + h / 2) }; };

  mems.forEach(m => makeCardEl(m));
  applyLayout();
  const setHidden = () => cards.forEach(c => { c.style.visibility = state === 'closed' ? 'hidden' : 'visible'; if (state === 'closed') c.style.transform = ''; });
  setHidden();

  /* --- lid --- */
  const showLid = (i: number) => { lidImgs.forEach((d, k) => { d.hidden = k !== i; }); mouthEl.hidden = i < 2; };
  async function lidAnim(from: number, to: number, ms = 62) {
    const dir = from < to ? 1 : -1;
    for (let i = from; i !== to + dir; i += dir) { showLid(i); await sleep(ms); }
  }

  /* --- particles --- */
  function burst(x: number, y: number, n = 16, spread = 1) {
    const r = rnd(Date.now() & 0xffff);
    for (let i = 0; i < n; i++) {
      const kind = r();
      const spr = kind < 0.55 ? sparklePx(i) : kind < 0.8 ? heartSmall() : heart();
      const sc = kind < 0.55 ? 3 : 2;
      const p = el('div', 'particle', fx);
      p.style.cssText = `left:${x}px;top:${y}px;width:${spr.w * sc}px;height:${spr.h * sc}px;background-image:${uri(spr)}`;
      const a = -Math.PI / 2 + (r() - 0.5) * 2.4, d = (60 + r() * 120) * spread * (L.S / 5 + 0.4);
      const dx = Math.cos(a) * d, dy = Math.sin(a) * d;
      p.animate([
        { transform: 'translate(-50%,-50%) translate(0,0)', opacity: 1 },
        { transform: `translate(-50%,-50%) translate(${Math.round(dx)}px,${Math.round(dy)}px)`, opacity: 1, offset: 0.6 },
        { transform: `translate(-50%,-50%) translate(${Math.round(dx * 1.1)}px,${Math.round(dy + 60)}px)`, opacity: 0 },
      ], { duration: 700 + r() * 500, easing: 'steps(9, end)', fill: 'forwards', delay: r() * 120 }).finished.then(() => p.remove(), () => p.remove());
    }
  }
  const squish = () => {
    for (const e of [bodyEl, mouthEl]) e.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${L.S}px)` }, { transform: 'translateY(0)' }], { duration: 260, easing: 'steps(3)' });
  };

  /* --- opening / closing --- */
  const RISE = 760;
  function riseCard(c: HTMLElement, s: { x: number; y: number; r: number }, delay: number) {
    const { dx, dy } = hideCard(c);
    c.style.visibility = 'visible';
    c.style.zIndex = '2';
    const rot = `rotate(${s.r}deg)`;
    const a = c.animate([
      { transform: `translate(${dx}px,${dy}px) scale(.25) rotate(0deg)`, opacity: 0 },
      { transform: `translate(${dx}px,${dy - 70}px) scale(.7) rotate(${s.r / 2}deg)`, opacity: 1, offset: 0.25 },
      { transform: `translate(${dx * 0.1}px,${dy * 0.1 - 40}px) scale(1.12) ${rot}`, opacity: 1, offset: 0.7 },
      { transform: `translate(0,0) scale(1) ${rot}`, opacity: 1 },
    ], { duration: RISE, delay, easing: 'cubic-bezier(.3,.9,.4,1.2)', fill: 'both' });
    return a.finished.then(() => { c.style.transform = rot; c.style.zIndex = '5'; a.cancel(); });
  }
  async function openBox() {
    if (state !== 'closed') return;
    state = 'opening';
    stage.classList.remove('idle'); stage.classList.add('active');
    closeBtn.hidden = false; hint.hidden = true;
    try { localStorage.setItem('mb-seen', '1'); } catch { /* */ }
    sfx.lidOpen();
    await lidAnim(0, lids.length - 1);
    const mp = mouth();
    burst(mp.x, mp.y, 22);
    sfx.sparkle();
    cards.forEach(c => { c.style.visibility = 'hidden'; });
    mems.forEach(m => placeCard(m, mems.indexOf(m)));
    const ps = mems.map((m, i) => {
      setTimeout(() => sfx.rustle(), 140 * i + 80);
      return riseCard(cards.get(m.id)!, slotOf.get(m.id)!, 140 * i);
    });
    await Promise.all(ps);
    state = 'open';
    setHidden();
    sfx.sparkle();
  }
  async function closeBox() {
    if (state !== 'open') return;
    state = 'closing';
    closeBtn.hidden = true;
    const list = [...mems].reverse();
    const ps = list.map((m, i) => {
      const c = cards.get(m.id)!;
      const { dx, dy } = hideCard(c);
      const s = slotOf.get(m.id)!;
      c.style.zIndex = '2';
      setTimeout(() => sfx.rustle(), 90 * i);
      const a = c.animate([
        { transform: `rotate(${s.r}deg) translate(0,0) scale(1)`, opacity: 1 },
        { transform: `rotate(${s.r / 2}deg) translate(${dx * 0.3}px,${dy * 0.3 - 30}px) scale(.9)`, opacity: 1, offset: 0.4 },
        { transform: `rotate(0deg) translate(${dx}px,${dy}px) scale(.25)`, opacity: 0 },
      ], { duration: 520, delay: 90 * i, easing: 'cubic-bezier(.5,0,.8,.6)', fill: 'both' });
      return a.finished.then(() => { c.style.visibility = 'hidden'; a.cancel(); });
    });
    await Promise.all(ps);
    await lidAnim(lids.length - 1, 0, 55);
    sfx.thud(); squish();
    state = 'closed';
    stage.classList.remove('active'); stage.classList.add('idle');
    setHidden();
  }
  boxHit.addEventListener('click', () => { void openBox(); });
  closeBtn.addEventListener('click', () => { void closeBox(); });

  /* --- add --- */
  async function dropIn(m: Memory) {
    mems.push(m); await saveMemory(m);
    const c = makeCardEl(m);
    const idx = mems.length - 1;
    placeCard(m, idx);
    const s = slotOf.get(m.id)!;
    const { dx, dy } = hideCard(c);
    c.style.visibility = 'visible'; c.style.zIndex = '2';
    const rot = `rotate(${s.r}deg)`;
    // stage 1: drop into the box
    const a = c.animate([
      { transform: `translate(${dx}px,${dy - L.H * 0.5}px) scale(.8) rotate(-12deg)`, opacity: 1 },
      { transform: `translate(${dx}px,${dy}px) scale(.3) rotate(0deg)`, opacity: 0.9 },
    ], { duration: 420, easing: 'cubic-bezier(.5,0,.9,.6)', fill: 'both' });
    await a.finished;
    sfx.thud(); squish();
    await sleep(80);
    burst(mouth().x, mouth().y, 14, 0.8); sfx.sparkle();
    const b = c.animate([
      { transform: `translate(${dx}px,${dy}px) scale(.3) rotate(0deg)`, opacity: 1 },
      { transform: `translate(${dx * 0.3}px,${dy * 0.3 - 80}px) scale(1.2) ${rot}`, opacity: 1, offset: 0.55 },
      { transform: `translate(0,12px) scale(.95) ${rot}`, opacity: 1, offset: 0.8 },
      { transform: `translate(0,0) scale(1) ${rot}`, opacity: 1 },
    ], { duration: 800, easing: 'ease-out', fill: 'both' });
    await b.finished;
    c.style.transform = rot; c.style.zIndex = '5'; a.cancel(); b.cancel();
  }
  async function addFlow() {
    if (state === 'opening' || state === 'closing') return;
    sfx.rustle();
    const m = await openAddForm(stage);
    if (!m) return;
    if (state === 'closed') await openBox();
    await dropIn(m);
  }
  addBtn.addEventListener('click', () => { void addFlow(); });

  /* --- viewer --- */
  const viewer = createViewer(stage, {
    getList: () => mems,
    getEl: id => cards.get(id) ?? null,
    build: buildCard,
    fmtDate,
    onNav: () => sfx.rustle(),
    onOpen: () => sfx.rustle(),
  });
  function showViewer(id: string) { viewer.open(id); }

  /* --- settings --- */
  mountSettings(stage, {
    onClearSamples: async () => {
      await clearSeedMemories();
      const gone = mems.filter(m => m.seed);
      mems = mems.filter(m => !m.seed);
      for (const m of gone) { const c = cards.get(m.id); if (c) { c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'steps(4)' }).finished.then(() => c.remove()); cards.delete(m.id); } }
      mems.forEach((m, i) => placeCard(m, i));
    },
  });

  window.addEventListener('resize', () => { applyLayout(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && viewer.isOpen()) viewer.close(); });
  (window as unknown as { __mb: unknown }).__mb = { get state() { return state; }, count: () => mems.length };
  void T; void flower;
}
main();
