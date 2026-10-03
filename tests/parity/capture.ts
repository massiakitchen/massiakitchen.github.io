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
// - `#facebook-slider .fb-slider-container` + `#fbDots`: Facebook slider autoplays
//   every 4s (`startAutoplay` in js/main.js) and translates its track the same way.
// Masking only affects parity screenshots (masked boxes render identically on both
// sides); the carousel markup itself stays compared everywhere else and is proven
// exactly by the DOM-equality tests in later tasks.
//
// IMPORTANT: mask the STATIC viewport (`.fb-slider-container`), never the track
// (`#fbSliderWrapper`). The wrapper is the translated element, so a mask on it
// moves with autoplay and covers a different screen region per page — that
// produced a 23.11% false diff at 1440-0.5. The container has no transform, so
// its mask box is identical on both sides.
const MASK = '#sliderTrack, .slider-indicators, #facebook-slider .fb-slider-container, #fbDots';

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
  // entry.js loads lucide from a CDN; screenshots below assume converted icons,
  // so fail fast here instead of screenshotting an unconverted transient.
  await page.waitForFunction(() => (window as unknown as { lucide?: unknown }).lucide, null, { timeout: 30000 });
  // Freeze timer-driven carousels BEFORE measuring anything: the reviews
  // auto-advance swaps cards of different heights (416 vs 381px), moving every
  // section below it and shifting all scroll fractions; the fb track
  // translates likewise. Both pause on mouseenter, so reset reviews to slide 0
  // (via its own dot, exactly like a visitor click) and freeze both. Without
  // this the two pages advance on independent 5s/4s clocks and land on
  // different slides with different heights (seen: revH 1585 vs 1551).
  await page.evaluate(() => {
    document
      .querySelector('.slider-indicators .indicator')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.querySelector('.reviews-slider')?.dispatchEvent(new Event('mouseenter'));
    document.querySelector('.fb-slider-container')?.dispatchEvent(new Event('mouseenter'));
  });
  await settle(page, 500);
  // Below-the-fold sections use content-visibility: auto (legacy main.css), so they
  // render as ~800px placeholders until scrolled near, then materialize and grow the
  // page — a scrollTo(max) computed before that lands above the true position, and
  // the two pages can land in different places depending on asset timing. Render
  // them up front instead: visually identical for every captured region (those parts
  // are near the viewport, hence fully rendered either way), but scrollHeight is
  // final before the first screenshot, so every scroll fraction lands deterministically.
  await page.evaluate(() => {
    document
      .querySelectorAll('#works, #facebook-slider, #branches, #reviews, #faq, #contact')
      .forEach((el) => ((el as HTMLElement).style.contentVisibility = 'visible'));
  });
  await settle(page);
  const shots: Buffer[] = [];
  for (const point of SCROLL_POINTS) {
    // scrollHeight can shift under us (lazy images resolving, skipped
    // content-visibility sections materializing), so the first scrollTo may
    // land off-target: re-derive the target from the live height and re-scroll
    // until settled, so every fraction lands deterministically.
    for (let attempt = 0; attempt < 4; attempt++) {
      const target = await page.evaluate((p) => {
        const max = document.documentElement.scrollHeight - innerHeight;
        const t = Math.round(max * p);
        window.scrollTo({ top: t, behavior: 'instant' as ScrollBehavior });
        return t;
      }, point);
      await settle(page, 700);
      const stable = await page.evaluate(
        ({ p, t }) => {
          const max = document.documentElement.scrollHeight - innerHeight;
          return Math.round(max * p) === t && Math.abs(window.scrollY - t) <= 1;
        },
        { p: point, t: target },
      );
      if (stable) break;
    }
    // Late resolvers (bottom lazy images) can move the height after
    // the loop above: wait for a stable scrollHeight, re-assert the target
    // derived from it, and screenshot immediately.
    for (let attempt = 0; attempt < 6; attempt++) {
      const settled = await page.evaluate((p) => {
        const h1 = document.documentElement.scrollHeight;
        return new Promise<{ ok: boolean }>((resolve) => {
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              const h2 = document.documentElement.scrollHeight;
              if (h1 !== h2) return resolve({ ok: false });
              const t = Math.round((h2 - innerHeight) * p);
              if (Math.abs(window.scrollY - t) > 1) {
                window.scrollTo({ top: t, behavior: 'instant' as ScrollBehavior });
                return resolve({ ok: false });
              }
              // A lazy image inside the viewport that is still resolving will
              // move layout (or pop in) right after the screenshot.
              const pending = [...document.images].filter((img) => {
                if (img.complete) return false;
                const r = img.getBoundingClientRect();
                return r.bottom > 0 && r.top < innerHeight;
              }).length;
              return resolve({ ok: pending === 0 });
            }),
          );
        });
      }, point);
      if (settled.ok) break;
      await page.waitForTimeout(400);
    }
    shots.push(await page.screenshot({ animations: 'disabled', caret: 'hide', mask: [page.locator(MASK)] }));
  }
  return shots;
}
