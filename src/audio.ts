/** OWNER: audio+storage+settings. Web Audio chiptune sfx. Off by default; no audio files. */
let enabled = false;
let ctx: AudioContext | null = null;

try { enabled = localStorage.getItem('mb-sound') === '1'; } catch { /* ignore */ }

function getCtx(): AudioContext | null {
  if (!enabled) return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
  return ctx;
}

export function setEnabled(on: boolean): void {
  enabled = on;
  try { localStorage.setItem('mb-sound', on ? '1' : '0'); } catch { /* ignore */ }
  // Called from a user gesture (toggle click): create/resume context now to satisfy autoplay policy.
  if (on) getCtx();
}
export function isEnabled(): boolean { return enabled; }

type Wave = OscillatorType;
function tone(c: AudioContext, freq: number, start: number, dur: number, wave: Wave, vol: number, slideTo?: number): void {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = wave;
  const t = c.currentTime + start;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}
function noise(c: AudioContext, start: number, dur: number, vol: number, hp = 2000): void {
  const n = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, n, c.sampleRate);
  const d = buf.getChannelData(0);
  // crunchy: hold each random value for a few samples
  let v = 0;
  for (let i = 0; i < n; i++) { if (i % 6 === 0) v = Math.random() * 2 - 1; d[i] = v * (1 - i / n); }
  const s = c.createBufferSource();
  s.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'highpass'; f.frequency.value = hp;
  const g = c.createGain();
  g.gain.value = vol;
  s.connect(f).connect(g).connect(c.destination);
  s.start(c.currentTime + start);
}

/** Cheerful rising arpeggio. */
export function lidOpen(): void {
  const c = getCtx(); if (!c) return;
  [392, 523.25, 659.25, 783.99].forEach((f, i) => tone(c, f, i * 0.07, 0.14, 'square', 0.06));
  tone(c, 130, 0, 0.18, 'triangle', 0.1, 220);
}
/** Twinkly high pings. */
export function sparkle(): void {
  const c = getCtx(); if (!c) return;
  [1318.5, 1760, 2093, 1568].forEach((f, i) => tone(c, f, i * 0.05, 0.1, 'triangle', 0.05));
}
/** Paper rustle. */
export function rustle(): void {
  const c = getCtx(); if (!c) return;
  noise(c, 0, 0.12, 0.12, 3000);
  noise(c, 0.09, 0.15, 0.09, 2200);
}
/** Soft thud. */
export function thud(): void {
  const c = getCtx(); if (!c) return;
  tone(c, 140, 0, 0.16, 'sine', 0.25, 50);
  noise(c, 0, 0.04, 0.05, 800);
}
