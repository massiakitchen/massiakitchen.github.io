import { mkdirSync, writeFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { captureAll, preparePage, SCROLL_POINTS, WIDTHS, settle } from './capture';
import { PORTS } from './ports';

const BASELINE = process.env.BASELINE_URL ?? `http://127.0.0.1:${PORTS.baseline}/`;
const CANDIDATE = process.env.CANDIDATE_URL ?? `http://127.0.0.1:${PORTS.next}/`;
const MAX_DIFF_RATIO = 0.005;

for (const width of WIDTHS) {
  test(`parity at ${width}px`, async ({ browser }) => {
    const ctxOpts = { viewport: { width, height: width > 600 ? 900 : 844 }, deviceScaleFactor: 1, locale: 'ar-EG' };
    const baseCtx = await browser.newContext(ctxOpts);
    const candCtx = await browser.newContext(ctxOpts);
    const basePage = await baseCtx.newPage();
    const candPage = await candCtx.newPage();
    const baseLog = await preparePage(basePage);
    const candLog = await preparePage(candPage);

    const base = await captureAll(basePage, BASELINE);
    const cand = await captureAll(candPage, CANDIDATE);

    mkdirSync('.parity/report', { recursive: true });
    const failures: string[] = [];
    base.forEach((buf, i) => {
      const a = PNG.sync.read(buf);
      const b = PNG.sync.read(cand[i]);
      const name = `${width}-${SCROLL_POINTS[i]}`;
      if (a.width !== b.width || a.height !== b.height) {
        failures.push(`${name}: size ${a.width}x${a.height} vs ${b.width}x${b.height}`);
        return;
      }
      const diff = new PNG({ width: a.width, height: a.height });
      const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
      const ratio = n / (a.width * a.height);
      writeFileSync(`.parity/report/${name}-baseline.png`, buf);
      writeFileSync(`.parity/report/${name}-candidate.png`, cand[i]);
      writeFileSync(`.parity/report/${name}-diff.png`, PNG.sync.write(diff));
      if (ratio > MAX_DIFF_RATIO) failures.push(`${name}: ${(ratio * 100).toFixed(2)}% pixels differ`);
    });

    expect(candLog.errors, 'candidate JS errors').toEqual([]);
    expect(candLog.missing, 'candidate 404s').toEqual([]);
    expect(baseLog.errors, 'baseline JS errors').toEqual([]);
    expect(failures, 'pixel parity').toEqual([]);
    const icons = await candPage.evaluate(() => document.querySelectorAll('svg.lucide').length);
    expect(icons, 'lucide icons rendered').toBeGreaterThan(0);
    await baseCtx.close();
    await candCtx.close();
  });
}

// Static legal pages: only the top and bottom of the page are compared.
// Unlike the homepage they have no preloader, so there is no `body.loaded`
// class to wait for — just wait for `load` and settle.
const LEGAL_PAGES = [
  { route: 'privacy', baselineFile: 'privacy.html' },
  { route: 'terms', baselineFile: 'terms.html' },
] as const;
const LEGAL_SCROLL_POINTS = [0, 1] as const;

async function captureLegal(page: Page, url: string): Promise<Buffer[]> {
  await page.goto(url, { waitUntil: 'load' });
  await settle(page, 2500);
  // Wait until the page is fully interactive: #year is set by main.js, which
  // runs after React hydration and the legacy entry boot, so a non-empty year
  // means hydration/style-hoisting has settled (baseline sets it at parse).
  await page.waitForFunction(() => ((document.getElementById('year')?.textContent ?? '').length > 0), null, {
    timeout: 20000,
  });
  // Avoid font-swap races: every visible pixel on these pages is text.
  await page.evaluate(() => document.fonts.ready);
  const shots: Buffer[] = [];
  for (const point of LEGAL_SCROLL_POINTS) {
    await page.evaluate((p) => {
      const max = document.documentElement.scrollHeight - innerHeight;
      window.scrollTo({ top: Math.round(max * p), behavior: 'instant' as ScrollBehavior });
    }, point);
    await settle(page);
    shots.push(await page.screenshot({ animations: 'disabled', caret: 'hide' }));
  }
  return shots;
}

for (const { route, baselineFile } of LEGAL_PAGES) {
  for (const width of WIDTHS) {
    test(`parity ${route} at ${width}px`, async ({ browser }) => {
      const ctxOpts = { viewport: { width, height: width > 600 ? 900 : 844 }, deviceScaleFactor: 1, locale: 'ar-EG' };
      const baseCtx = await browser.newContext(ctxOpts);
      const candCtx = await browser.newContext(ctxOpts);
      const basePage = await baseCtx.newPage();
      const candPage = await candCtx.newPage();
      const baseLog = await preparePage(basePage);
      const candLog = await preparePage(candPage);

      const base = await captureLegal(basePage, `${BASELINE}${baselineFile}`);
      const cand = await captureLegal(candPage, `${CANDIDATE}${route}`);

      mkdirSync('.parity/report', { recursive: true });
      const failures: string[] = [];
      base.forEach((buf, i) => {
        const a = PNG.sync.read(buf);
        const b = PNG.sync.read(cand[i]);
        const name = `legal-${route}-${width}-${LEGAL_SCROLL_POINTS[i]}`;
        if (a.width !== b.width || a.height !== b.height) {
          failures.push(`${name}: size ${a.width}x${a.height} vs ${b.width}x${b.height}`);
          return;
        }
        const diff = new PNG({ width: a.width, height: a.height });
        const n = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 });
        const ratio = n / (a.width * a.height);
        writeFileSync(`.parity/report/${name}-baseline.png`, buf);
        writeFileSync(`.parity/report/${name}-candidate.png`, cand[i]);
        writeFileSync(`.parity/report/${name}-diff.png`, PNG.sync.write(diff));
        if (ratio > MAX_DIFF_RATIO) failures.push(`${name}: ${(ratio * 100).toFixed(2)}% pixels differ`);
      });

      expect(candLog.errors, 'candidate JS errors').toEqual([]);
      expect(candLog.missing, 'candidate 404s').toEqual([]);
      expect(baseLog.errors, 'baseline JS errors').toEqual([]);
      expect(failures, 'pixel parity').toEqual([]);
      await baseCtx.close();
      await candCtx.close();
    });
  }
}
