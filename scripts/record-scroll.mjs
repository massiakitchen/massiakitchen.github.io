// Records a smooth top-to-bottom scroll video of a URL at 1440px and 390px widths.
//
// Usage: node scripts/record-scroll.mjs <url> <name>
// Output: .parity/videos/<name>-1440.webm, .parity/videos/<name>-390.webm
//
// The page is loaded, the preloader is awaited (body.loaded, same signal the
// parity harness uses), then the page scrolls top -> bottom over 20 s while
// Playwright records video.
import { mkdirSync, rmSync } from 'node:fs';
import { chromium } from '@playwright/test';

const [url, name] = process.argv.slice(2);
if (!url || !name) {
  console.error('usage: node scripts/record-scroll.mjs <url> <name>');
  process.exit(2);
}

const WIDTHS = [1440, 390];
const HEIGHTS = { 1440: 900, 390: 844 };
const SCROLL_MS = 20_000;

mkdirSync('.parity/videos', { recursive: true });

for (const width of WIDTHS) {
  const height = HEIGHTS[width];
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    recordVideo: { dir: '.parity/videos', size: { width, height } },
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => document.body.classList.contains('loaded'), null, {
    timeout: 30_000,
  });
  await page.waitForTimeout(2500);
  const video = page.video();
  await page.evaluate(
    (ms) =>
      new Promise((resolve) => {
        window.scrollTo(0, 0);
        const max = () => document.documentElement.scrollHeight - window.innerHeight;
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / ms, 1);
          window.scrollTo(0, Math.round(max() * t));
          if (t < 1) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      }),
    SCROLL_MS,
  );
  await page.waitForTimeout(500);
  await context.close();
  const out = `.parity/videos/${name}-${width}.webm`;
  await video.saveAs(out);
  rmSync(await video.path(), { force: true });
  await browser.close();
  console.log(`saved ${out}`);
}
