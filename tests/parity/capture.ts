import type { Page } from '@playwright/test';

export const WIDTHS = [1440, 390] as const;
export const SCROLL_POINTS = [0, 0.15, 0.3, 0.5, 0.75, 1] as const;

// Third-party requests that make screenshots nondeterministic or slow.
const BLOCK = [/facebook\.com/, /fbcdn\.net/, /contentsquare\.net/, /googletagmanager\.com/, /google-analytics\.com/];

// Timer-driven carousels whose visible slide depends on wall-clock time, so the
// sequentially-captured baseline and candidate pages can show different slides:
// - `#sliderTrack` + `.slider-indicators`: reviews slider auto-advances every 5s
//   (`startReviewAutoAdvance` in js/main.js). Proved flaky: 1440px @ 0.75 showed a
//   different review card (1.07% pixels differ) on an otherwise identical page.
// - `#fbSliderWrapper` + `#fbDots`: Facebook slider autoplays every 4s
//   (`startAutoplay` in js/main.js) and translates its track the same way.
// Masking only affects parity screenshots (masked boxes render identically on both
// sides); the carousel markup itself stays compared everywhere else and is proven
// exactly by the DOM-equality tests in later tasks.
const MASK = '#sliderTrack, .slider-indicators, #fbSliderWrapper, #fbDots';

export async function preparePage(page: Page) {
  const errors: string[] = [];
  const missing: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && /Hydration/i.test(m.text())) errors.push(m.text()); });
  page.on('response', (r) => { if (r.status() === 404) missing.push(r.url()); });
  await page.route('**/*', (route) =>
    BLOCK.some((re) => re.test(route.request().url())) ? route.abort() : route.continue(),
  );
  return { errors, missing };
}

export async function settle(page: Page, ms = 1500) {
  await page.waitForTimeout(ms);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

/** Loads url, waits for the preloader to finish, returns one PNG per scroll point. */
export async function captureAll(page: Page, url: string): Promise<Buffer[]> {
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => document.body.classList.contains('loaded'), null, { timeout: 15000 });
  await settle(page, 2500);
  const shots: Buffer[] = [];
  for (const point of SCROLL_POINTS) {
    await page.evaluate((p) => {
      const max = document.documentElement.scrollHeight - innerHeight;
      window.scrollTo({ top: Math.round(max * p), behavior: 'instant' as ScrollBehavior });
    }, point);
    await settle(page);
    shots.push(await page.screenshot({ animations: 'disabled', caret: 'hide', mask: [page.locator(MASK)] }));
  }
  return shots;
}
