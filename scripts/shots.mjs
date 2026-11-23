/**
 * OWNER: QA. Playwright screenshots + e2e check.
 *   npm run shots            -> starts vite, writes shots/{desktop,phone}-*.png, runs e2e
 *   BASE_URL=http://... npm run shots   (use an already-running server)
 *   OUT=dir npm run shots    (screenshot dir, default ./shots)
 *   HEADED=1 for a visible browser.
 * Exit code 1 if any e2e check fails. Selectors are tolerant: prefer data-testid
 * (box, memory, add, form, close, settings), else fall back to roles/text/canvas.
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import path from 'node:path';

const OUT = path.resolve(process.env.OUT || 'shots');
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'phone', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
];
const PORT = 5199;
let BASE = process.env.BASE_URL;
mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

/** Small valid RGB PNG (pink/cream checker) for the photo upload. */
function makePng(w = 48, h = 48) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      const on = ((x >> 3) + (y >> 3)) & 1;
      const o = y * (w * 3 + 1) + 1 + x * 3;
      [raw[o], raw[o + 1], raw[o + 2]] = on ? [0xf7, 0xb6, 0xc8] : [0xff, 0xf4, 0xe6];
    }
  }
  const crcT = [...Array(256)].map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b) => { let c = ~0; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return ~c >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

async function startServer() {
  if (BASE) return null;
  BASE = `http://localhost:${PORT}`;
  const p = spawn('npx', ['vite', '--port', String(PORT), '--strictPort', '--host', 'localhost'], { stdio: ['ignore', 'pipe', 'pipe'] });
  p.stderr.on('data', (d) => process.stderr.write(d));
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(BASE)).ok) return p; } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  p.kill(); throw new Error('vite did not start');
}

const first = async (page, selectors, timeout = 1500) => {
  for (const s of selectors) {
    const loc = page.locator(s).first();
    try { await loc.waitFor({ state: 'visible', timeout }); return loc; } catch {}
  }
  return null;
};

const S = {
  box: ['[data-testid="box"]', '#box', '.box', 'canvas', '#app > *'],
  memory: ['[data-testid="memory"]', '[data-memory-id]', '.memory'],
  add: ['[data-testid="add"]', 'button:has-text("add")', '[aria-label*="add" i]', 'button:has-text("+")'],
  form: ['[data-testid="form"]', 'dialog[open]', 'form', '[role="dialog"]'],
  close: ['[data-testid="close"]', '[aria-label*="close" i]', 'button:has-text("close")'],
};

async function countMemories(page) {
  for (const s of S.memory) { const n = await page.locator(s).count(); if (n) return n; }
  return 0;
}

async function openBox(page) {
  const box = await first(page, S.box);
  if (!box) return false;
  await box.click({ position: undefined }).catch(() => {});
  await page.waitForTimeout(1500); // lid animation
  return true;
}

async function noHScroll(page, label) {
  const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  check(`${label}: no horizontal scroll`, sw <= cw, `scrollWidth=${sw} clientWidth=${cw}`);
}

async function run(browser, vp) {
  const { name, ...opts } = vp;
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, ...opts, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`); });
  page.on('requestfailed', (r) => errors.push(`requestfailed ${r.url()} ${r.failure()?.errorText}`));
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  const shot = (n) => page.screenshot({ path: path.join(OUT, `${name}-${n}.png`) });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  await shot('1-closed');
  await noHScroll(page, `${name} closed`);

  check(`${name}: box opens`, await openBox(page));
  await page.waitForTimeout(800);
  await shot('2-open');
  await noHScroll(page, `${name} open`);

  const mem = await first(page, S.memory);
  check(`${name}: seed memories visible`, !!mem);
  const count = await countMemories(page);
  check(`${name}: >=3 seed memories`, count >= 3, `count=${count}`);
  if (mem) {
    await mem.click().catch(() => {});
    await page.waitForTimeout(1000);
  }
  await shot('3-memory');
  // keyboard: arrow next/prev, then Esc back to the open box
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(500);
  await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(500);
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  check(`${name}: Esc leaves viewer`, !!(await first(page, S.add, 800)), 'add button reachable again');

  const add = await first(page, S.add);
  check(`${name}: add button exists`, !!add);
  if (add) await add.click().catch(() => {});
  await page.waitForTimeout(700);
  const form = await first(page, S.form);
  check(`${name}: form opens`, !!form);
  await shot('4-form');
  await noHScroll(page, `${name} form`);

  // add a photo memory
  const caption = `QA photo ${name} ${Date.now()}`;
  if (form) {
    const file = form.locator('input[type="file"]').first();
    if (await file.count()) await file.setInputFiles({ name: 'qa.png', mimeType: 'image/png', buffer: makePng() });
    const cap = form.locator('input[type="text"], input:not([type]), textarea').first();
    if (await cap.count()) await cap.fill(caption);
    const date = form.locator('input[type="date"]').first();
    if (await date.count()) await date.fill('2026-02-14');
    await page.waitForTimeout(500);
    await shot('4b-form-filled');
    const submit = await first(page, ['[data-testid="submit"]', 'button[type="submit"]', 'button:has-text("save")', 'button:has-text("add")', 'button:has-text("keep")'], 800);
    if (submit) await submit.click(); else await page.keyboard.press('Enter');
    await page.waitForTimeout(1200);
  }

  const before = count;
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await openBox(page);
  const after = await countMemories(page);
  check(`${name}: new memory persists after reload`, after === before + 1, `before=${before} after=${after}`);
  const pageText = await page.evaluate(() => document.body.innerText);
  const stored = await page.evaluate(async () => {
    const dbs = (await indexedDB.databases?.()) ?? [];
    return dbs.length;
  });
  check(`${name}: IndexedDB database exists`, stored > 0, `dbs=${stored}`);
  void pageText;

  // close box
  const close = await first(page, S.close, 800);
  if (close) await close.click(); else await page.keyboard.press('Escape');
  await page.waitForTimeout(1200);
  await shot('5-closed-again');
  await noHScroll(page, `${name} reclosed`);

  check(`${name}: zero console errors`, errors.length === 0, errors.slice(0, 6).join(' | '));
  await ctx.close();
}

const server = await startServer();
const browser = await chromium.launch({ headless: !process.env.HEADED });
try {
  for (const vp of VIEWPORTS) await run(browser, vp);
} catch (e) {
  check('script ran without throwing', false, String(e));
} finally {
  await browser.close();
  server?.kill();
}
writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2));
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed. Screenshots: ${OUT}`);
process.exit(failed ? 1 : 0);
