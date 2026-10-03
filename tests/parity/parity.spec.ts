import { mkdirSync, writeFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { captureAll, preparePage, SCROLL_POINTS, WIDTHS } from './capture';
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
