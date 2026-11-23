/** OWNER: audio+storage+settings. Small settings menu (gear) with "clear sample memories" and sound toggle. */
import { icon } from '../sprites';
import { isEnabled, setEnabled, sparkle } from '../audio';
import { injectCss } from './ui-css';

export interface SettingsHooks { onClearSamples(): void | Promise<void>; }

export function mountSettings(root: HTMLElement, hooks: SettingsHooks): void {
  injectCss();
  const gear = document.createElement('button');
  gear.className = 'mb-gear';
  gear.setAttribute('aria-label', 'settings');
  gear.setAttribute('aria-expanded', 'false');
  gear.innerHTML = icon('gear').svg;
  const menu = document.createElement('div');
  menu.className = 'mb-menu';
  menu.hidden = true;
  const sound = document.createElement('button');
  sound.className = 'mb-btn';
  const clear = document.createElement('button');
  clear.className = 'mb-btn';
  const note = document.createElement('div');
  note.className = 'note';
  menu.append(sound, clear, note);
  root.append(gear, menu);

  const paint = () => {
    sound.innerHTML = `${icon(isEnabled() ? 'speaker-on' : 'speaker-off').svg}<span>SOUND: ${isEnabled() ? 'ON' : 'OFF'}</span>`;
    clear.innerHTML = `${icon('x').svg}<span>CLEAR SAMPLES</span>`;
    sound.setAttribute('aria-pressed', String(isEnabled()));
  };
  paint();
  const toggle = (open: boolean) => { if (open) paint(); menu.hidden = !open; gear.setAttribute('aria-expanded', String(open)); note.textContent = ''; };
  gear.addEventListener('click', () => toggle(!!menu.hidden));
  sound.addEventListener('click', () => { setEnabled(!isEnabled()); paint(); if (isEnabled()) sparkle(); });
  clear.addEventListener('click', async () => {
    clear.disabled = true;
    try { await hooks.onClearSamples(); note.textContent = 'samples tidied away ♥'; }
    catch { note.textContent = 'oops, try again'; }
    clear.disabled = false;
  });
  document.addEventListener('pointerdown', e => {
    if (!menu.hidden && !menu.contains(e.target as Node) && !gear.contains(e.target as Node)) toggle(false);
  });
}
