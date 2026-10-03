# Phase 0 — Move the Massia site to Next.js with zero visual change — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve the existing Massia homepage (and privacy/terms) from a Next.js 16 App Router app on Vercel, pixel-identical to today, with every section rendered by a React Server Component from per-section JSON content.

**Architecture:** First build a screenshot-parity harness against a frozen baseline of today's site. Then stand up Next.js rendering the legacy HTML *verbatim* as "raw blocks" (same CSS, same JS, same markup) and prove parity. Then replace raw blocks one section at a time with typed components fed by `content/*.json`, each proven by an exact DOM-equality test against the legacy section. All legacy JavaScript keeps running unchanged; it is loaded after hydration by one module entry that replays `DOMContentLoaded`/`load` for late listeners. Legacy inline `onclick`/`onsubmit` attributes become `data-action` attributes handled by a tiny delegated dispatcher, because React cannot render string event attributes.

**Tech Stack:** next 16.3.8, react 19.3.0, react-dom 19.3.0, zod 4.6.5, typescript 5.9.3, @types/react 19.3.0, @types/node 26.6.4, vitest 5.0.3, @playwright/test 1.63.0 (system Chromium `/usr/bin/chromium`), pixelmatch 7.2.0, pngjs 7.0.0, cheerio 1.2.0. Node 24.

**Spec:** `docs/superpowers/specs/2026-10-03-admin-vercel-design.md` — section 3 (Phase 0) and section 6 (content model).

## Global Constraints

- **No visible change.** Same CSS files (content unmodified), same JS files (logic unmodified), same markup, classes, ids and data-attributes. `<img>` stays `<img>` (no `next/image`); Cairo font via the same Google Fonts `<link>` (no `next/font`).
- Third-party versions unchanged: GSAP 3.12.2 + ScrollTrigger (cdnjs), Lenis 1.0.33 (unpkg), Lucide 0.468.0 (unpkg), Google Analytics `G-VSMD3VS5NK`, Contentsquare `ac861b4839f2e`.
- Parity gate: per screenshot ≤ 0.5% differing pixels vs baseline, widths 1440 and 390, scroll positions 0, 0.15, 0.30, 0.50, 0.75, 1.00; zero JS errors; zero 404s.
- The public site is **not** replaced until the owner approves a Vercel Preview Deployment. No push to `main` without owner approval.
- React must never re-render legacy-managed DOM: the public page contains **no client components** and no React state. Legacy scripts load with `strategy="afterInteractive"` only (after hydration).
- Content lives in `content/sections/<id>.json`, `content/settings.json`, `content/layout.json`; each section's schema in `lib/content/sections/<id>.ts` (zod). One file per section so parallel tasks never edit the same file.
- Production URL stays `https://massiakitchen.github.io` in markup during Phase 0 tasks 1–9 (parity); Task 10 switches canonical URLs to `https://massiakitchen.vercel.app`.

## Review Focus

- A late-loaded legacy script registering `DOMContentLoaded` or `load` after those events fired must still run its handler exactly once → Task 2 `entry.test.ts` "replays late lifecycle listeners once".
- Clicking an element nested inside two `data-action` ancestors must call both handlers in inner→outer order, and stop if a handler calls `event.stopPropagation()` (native inline-handler semantics) → Task 2 `actions.test.ts`.
- `onsubmit="return handleForm(event)"` returning `false` must cancel the submit → Task 2 `actions.test.ts` "submit returning false prevents default".
- Hydration must not wipe legacy DOM mutations (Lucide swaps `<i data-lucide>` for `<svg>`) → Task 2 parity run checks icons render (`svg.lucide` count > 0 after load) and zero console errors containing "Hydration".
- Arabic text, `&nbsp;`, `&amp;` and emoji in content must survive JSON → component → HTML byte-for-byte → every section task's DOM-equality test (normalizer compares decoded text).

---

### Task 1: Baseline snapshot and screenshot-parity harness

**Files:**
- Create: `tests/parity/parity.config.ts`, `tests/parity/capture.ts`, `tests/parity/parity.spec.ts`, `tests/parity/serve-static.mjs`, `scripts/make-baseline.sh`
- Modify: `package.json` (devDependencies + scripts), `.gitignore`

**Interfaces:**
- Produces: `CANDIDATE_URL=<url> npm run parity` (candidate defaults to `http://127.0.0.1:3100/`), baseline served at `http://127.0.0.1:4300` from `.parity/baseline/` (git-ignored), report in `.parity/report/`.

- [ ] **Step 1: Pin the baseline**

```bash
git tag legacy-baseline fbc96f1
```

`scripts/make-baseline.sh`:
```bash
#!/usr/bin/env bash
# Exports the frozen pre-migration site (tag legacy-baseline) to .parity/baseline/
set -euo pipefail
rm -rf .parity/baseline
mkdir -p .parity/baseline
git archive legacy-baseline | tar -x -C .parity/baseline
echo "baseline exported to .parity/baseline"
```

- [ ] **Step 2: Tooling** — add to `package.json` (keep existing fields; Task 2 rewrites the file fully):

```json
"scripts": {
  "baseline": "bash scripts/make-baseline.sh",
  "parity": "playwright test --config tests/parity/parity.config.ts"
},
"devDependencies": {
  "@playwright/test": "1.63.0",
  "pixelmatch": "7.2.0",
  "pngjs": "7.0.0"
}
```

Append to `.gitignore`:
```
.parity/
test-results/
playwright-report/
```

Run: `npm install && npm run baseline`
Expected: `.parity/baseline/index.html` exists.

- [ ] **Step 3: Static server for the baseline** — `tests/parity/serve-static.mjs`

```js
// Minimal static file server (no deps) used to serve the frozen baseline.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? '.parity/baseline');
const port = Number(process.argv[3] ?? 4300);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg', '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml',
};

createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = join(root, normalize(pathname).replace(/^(\.\.[/\\])+/, ''));
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end('not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`serving ${root} on ${port}`));
```

- [ ] **Step 4: Capture helper** — `tests/parity/capture.ts`

```ts
import type { Page } from '@playwright/test';

export const WIDTHS = [1440, 390] as const;
export const SCROLL_POINTS = [0, 0.15, 0.3, 0.5, 0.75, 1] as const;

// Third-party requests that make screenshots nondeterministic or slow.
const BLOCK = [/facebook\.com/, /fbcdn\.net/, /contentsquare\.net/, /googletagmanager\.com/, /google-analytics\.com/];

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
    shots.push(await page.screenshot({ animations: 'disabled', caret: 'hide' }));
  }
  return shots;
}
```

- [ ] **Step 5: Parity test** — `tests/parity/parity.spec.ts`

```ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { captureAll, preparePage, SCROLL_POINTS, WIDTHS } from './capture';

const BASELINE = process.env.BASELINE_URL ?? 'http://127.0.0.1:4300/';
const CANDIDATE = process.env.CANDIDATE_URL ?? 'http://127.0.0.1:3100/';
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
```

- [ ] **Step 6: Config** — `tests/parity/parity.config.ts`

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'parity.spec.ts',
  timeout: 240_000,
  workers: 1,
  reporter: [['list']],
  use: { launchOptions: { executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] } },
  webServer: [
    { command: 'node tests/parity/serve-static.mjs .parity/baseline 4300', url: 'http://127.0.0.1:4300/', reuseExistingServer: true },
    { command: 'node tests/parity/serve-static.mjs .parity/baseline 4301', url: 'http://127.0.0.1:4301/', reuseExistingServer: true },
  ],
});
```

(Port 4301 is a second copy of the baseline used only for the harness self-test below. Task 2 adds the Next.js server on 3100.)

- [ ] **Step 7: Self-test — baseline vs itself must pass (proves determinism)**

Run: `CANDIDATE_URL=http://127.0.0.1:4301/ npm run parity`
Expected: PASS for 1440 and 390. If any shot exceeds 0.5%, the harness is nondeterministic: increase `settle` time or add the offending element (e.g. a carousel with a timer) to a `mask` list passed to `page.screenshot({ mask })` — and document why in `capture.ts`. Do not proceed until the self-test passes 3 runs in a row.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json .gitignore scripts/make-baseline.sh tests/parity
git commit -m "test: screenshot parity harness against frozen legacy baseline"
```

---

### Task 2: Next.js app rendering the legacy page verbatim

Depends on Task 1.

**Files:**
- Move (git mv): `index.html`, `privacy.html`, `terms.html` → `legacy/`; `css/`, `js/`, `images/`, `videos/`, `sounds/`, `manifest.json`, `sw.js`, `robots.txt`, `sitemap.xml` → `public/`
- Delete: `src/main.js`, `vite.config.js`
- Create: `package.json` (rewrite), `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `app/layout.tsx`, `app/page.tsx`, `components/RawBlock.tsx`, `lib/legacy/handlers.ts`, `lib/legacy/attrs.ts`, `lib/legacy/parse.ts`, `public/js/entry.js`, `public/js/actions.js`
- Test: `tests/unit/handlers.test.ts`, `tests/unit/attrs.test.ts`, `tests/unit/actions.test.ts`, `tests/unit/entry.test.ts`
- Modify: `public/sw.js` (precache list), `tests/parity/parity.config.ts` (add Next server)

**Interfaces:**
- Produces:
  - `convertInlineHandlers($: CheerioAPI): void` — rewrites every `on*="fn(args)"` to `data-action="fn" data-args="[...]"` (and `data-action-event="submit"` for `onsubmit`).
  - `attrsToProps(attrs: Record<string,string>): Record<string, unknown>` — HTML attribute map → React props.
  - `legacyDocument(): { headHtml: string; blocks: LegacyBlock[] }` where `LegacyBlock = { key: string; tag: string; attrs: Record<string,string>; html: string; inMain: boolean }`; `key` = element id, or `header`/`footer`/`whatsapp`/`preloader` etc. (see Step 6).
  - `<RawBlock block={LegacyBlock} />`.
  - Runtime: `window.__massiaActions` allow-list in `public/js/actions.js`.

- [ ] **Step 1: Package and config files**

`package.json`:
```json
{
  "name": "massia-kitchen",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev -p 3100",
    "build": "next build",
    "start": "next start -p 3100",
    "test": "vitest run",
    "baseline": "bash scripts/make-baseline.sh",
    "parity": "playwright test --config tests/parity/parity.config.ts"
  },
  "dependencies": {
    "cheerio": "1.2.0",
    "next": "16.3.8",
    "react": "19.3.0",
    "react-dom": "19.3.0",
    "zod": "4.6.5"
  },
  "devDependencies": {
    "@playwright/test": "1.63.0",
    "@types/node": "26.6.4",
    "@types/react": "19.3.0",
    "jsdom": "30.1.1",
    "pixelmatch": "7.2.0",
    "pngjs": "7.0.0",
    "typescript": "5.9.3",
    "vitest": "5.0.3"
  }
}
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "legacy", "public", ".parity", "dist"]
}
```

`next.config.ts`:
```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // legacy/*.html is read at build time by lib/legacy/parse.ts
  outputFileTracingIncludes: { '/': ['./legacy/**/*'] },
  async headers() {
    return [{ source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache' }] }];
  },
};

export default nextConfig;
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  resolve: { alias: { '@': new URL('.', import.meta.url).pathname } },
  test: { include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'] },
});
```

Run: `git mv` the files listed above, delete `src/main.js` and `vite.config.js`, then `npm install`.
Expected: install succeeds.

- [ ] **Step 2: Failing tests for the inline-handler converter** — `tests/unit/handlers.test.ts`

```ts
import { load } from 'cheerio';
import { describe, expect, test } from 'vitest';
import { convertInlineHandlers } from '@/lib/legacy/handlers';

const conv = (html: string) => {
  const $ = load(html, null, false);
  convertInlineHandlers($);
  return $.html();
};

describe('convertInlineHandlers', () => {
  test('no-arg call', () => {
    expect(conv('<div onclick="closeLightbox()"></div>')).toBe('<div data-action="closeLightbox" data-args="[]"></div>');
  });
  test('string + event args', () => {
    expect(conv(`<figure onclick="openGalleryModal('wood-2', event)"></figure>`))
      .toBe('<figure data-action="openGalleryModal" data-args="[&quot;wood-2&quot;,&quot;$event&quot;]"></figure>');
  });
  test('numeric and division args', () => {
    expect(conv('<b onclick="navigateGallery(-1)"></b>')).toBe('<b data-action="navigateGallery" data-args="[-1]"></b>');
    expect(conv('<b onclick="zoomGalleryImage(1/1.2)"></b>'))
      .toBe(`<b data-action="zoomGalleryImage" data-args="[${1 / 1.2}]"></b>`);
  });
  test('onsubmit with return', () => {
    expect(conv('<form onsubmit="return handleForm(event)"></form>'))
      .toBe('<form data-action="handleForm" data-args="[&quot;$event&quot;]" data-action-event="submit"></form>');
  });
  test('unsupported expression throws so nothing is silently dropped', () => {
    expect(() => conv('<b onclick="a(); b()"></b>')).toThrow(/Unsupported inline handler/);
  });
});
```

- [ ] **Step 3: Implement** — `lib/legacy/handlers.ts`

```ts
import type { CheerioAPI } from 'cheerio';

// Legacy markup uses inline handlers like onclick="openGalleryModal('wood-2', event)".
// React cannot render string event attributes, so they become data-action/data-args,
// executed at runtime by public/js/actions.js.
const CALL = /^\s*(return\s+)?([A-Za-z_$][\w$]*)\((.*)\)\s*;?\s*$/s;

function parseArg(raw: string): unknown {
  const s = raw.trim();
  if (s === 'event') return '$event';
  const str = s.match(/^'([^']*)'$|^"([^"]*)"$/);
  if (str) return str[1] ?? str[2];
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  const div = s.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
  if (div) return Number(div[1]) / Number(div[2]);
  throw new Error(`Unsupported inline handler argument: ${s}`);
}

function splitArgs(s: string): string[] {
  if (!s.trim()) return [];
  const out: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let cur = '';
  for (const ch of s) {
    if (quote) { cur += ch; if (ch === quote) quote = null; continue; }
    if (ch === "'" || ch === '"') { quote = ch; cur += ch; continue; }
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur);
  return out;
}

export function convertInlineHandlers($: CheerioAPI): void {
  $('*').each((_, el) => {
    if (el.type !== 'tag') return;
    for (const [name, value] of Object.entries(el.attribs)) {
      if (!/^on[a-z]+$/.test(name)) continue;
      const m = value.match(CALL);
      if (!m) throw new Error(`Unsupported inline handler: ${name}="${value}"`);
      const args = splitArgs(m[3]).map(parseArg);
      delete el.attribs[name];
      el.attribs['data-action'] = m[2];
      el.attribs['data-args'] = JSON.stringify(args);
      if (name !== 'onclick') el.attribs['data-action-event'] = name.slice(2);
    }
  });
}
```

Run: `npx vitest run tests/unit/handlers.test.ts` → Expected: PASS.

- [ ] **Step 4: Failing tests for attribute → props** — `tests/unit/attrs.test.ts`

```ts
import { describe, expect, test } from 'vitest';
import { attrsToProps } from '@/lib/legacy/attrs';

describe('attrsToProps', () => {
  test('class/for/tabindex/readonly renames', () => {
    expect(attrsToProps({ class: 'a b', for: 'x', tabindex: '0', readonly: '' }))
      .toEqual({ className: 'a b', htmlFor: 'x', tabIndex: '0', readOnly: true });
  });
  test('style string to object incl. custom properties and vendor prefixes', () => {
    expect(attrsToProps({ style: 'display: none; --gap:4px; -webkit-line-clamp: 2;' }))
      .toEqual({ style: { display: 'none', '--gap': '4px', WebkitLineClamp: '2' } });
  });
  test('svg presentation attributes become camelCase, aria/data untouched', () => {
    expect(attrsToProps({ 'stroke-width': '2', 'stroke-linecap': 'round', viewBox: '0 0 16 16', 'aria-hidden': 'true', 'data-x': '1' }))
      .toEqual({ strokeWidth: '2', strokeLinecap: 'round', viewBox: '0 0 16 16', 'aria-hidden': 'true', 'data-x': '1' });
  });
  test('boolean attributes', () => {
    expect(attrsToProps({ hidden: '', defer: '', crossorigin: '' })).toEqual({ hidden: true, defer: true, crossOrigin: '' });
  });
});
```

- [ ] **Step 5: Implement** — `lib/legacy/attrs.ts`

```ts
const RENAME: Record<string, string> = {
  class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength',
  crossorigin: 'crossOrigin', srcset: 'srcSet', imagesrcset: 'imageSrcSet', imagesizes: 'imageSizes',
  fetchpriority: 'fetchPriority', autocomplete: 'autoComplete', autoplay: 'autoPlay', playsinline: 'playsInline',
  frameborder: 'frameBorder', allowfullscreen: 'allowFullScreen', referrerpolicy: 'referrerPolicy',
  enctype: 'encType', novalidate: 'noValidate', colspan: 'colSpan', rowspan: 'rowSpan', 'accept-charset': 'acceptCharset',
  'http-equiv': 'httpEquiv', contenteditable: 'contentEditable', spellcheck: 'spellCheck', inputmode: 'inputMode',
  enterkeyhint: 'enterKeyHint', 'xlink:href': 'xlinkHref', 'xml:space': 'xmlSpace',
};
const BOOLEAN = new Set(['hidden', 'defer', 'async', 'disabled', 'checked', 'selected', 'required', 'multiple',
  'readonly', 'autoplay', 'muted', 'loop', 'playsinline', 'controls', 'novalidate', 'allowfullscreen', 'open', 'nomodule']);

function camel(name: string): string {
  return name.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

function styleToObject(style: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const decl of style.split(';')) {
    const i = decl.indexOf(':');
    if (i === -1) continue;
    const prop = decl.slice(0, i).trim();
    const value = decl.slice(i + 1).trim();
    if (!prop) continue;
    if (prop.startsWith('--')) out[prop] = value;
    else if (prop.startsWith('-')) out[camel(prop.slice(1)).replace(/^./, (c) => c.toUpperCase())] = value;
    else out[camel(prop)] = value;
  }
  return out;
}

export function attrsToProps(attrs: Record<string, string>): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(attrs)) {
    if (name === 'style') { props.style = styleToObject(value); continue; }
    if (name.startsWith('data-') || name.startsWith('aria-') || name === 'viewBox') { props[name] = value; continue; }
    const key = RENAME[name] ?? (name.includes('-') ? camel(name) : name);
    props[key] = BOOLEAN.has(name) && value === '' ? true : value;
  }
  return props;
}
```

Run: `npx vitest run tests/unit/attrs.test.ts` → Expected: PASS.

- [ ] **Step 6: Legacy document parser** — `lib/legacy/parse.ts`

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';
import { convertInlineHandlers } from './handlers';

export type LegacyBlock = { key: string; tag: string; attrs: Record<string, string>; html: string; inMain: boolean };

// Scripts that the Next.js layout loads itself (public/js/entry.js and analytics).
const SCRIPT_MOVED = (src: string | undefined, inline: string) =>
  !!src || /lucide\.createIcons|serviceWorker|gtag\(|classList\.add\('js'\)/.test(inline);

let cached: { headHtml: string; blocks: LegacyBlock[] } | null = null;

export function legacyDocument(file = 'index.html') {
  if (cached && file === 'index.html') return cached;
  const $ = load(readFileSync(join(process.cwd(), 'legacy', file), 'utf8'));
  convertInlineHandlers($);

  $('head script, body script').each((_, el) => {
    const $el = $(el);
    if ($el.attr('type') === 'application/ld+json') return;
    if (SCRIPT_MOVED($el.attr('src'), $el.html() ?? '')) $el.remove();
  });

  const blocks: LegacyBlock[] = [];
  const keyOf = (el: any, i: number) => el.attribs.id || el.attribs.class?.split(/\s+/)[0] || `${el.tagName}-${i}`;
  $('body').children().each((i, el) => {
    if (el.type !== 'tag') return;
    if (el.tagName === 'main') {
      $(el).children().each((j, s) => {
        if (s.type !== 'tag') return;
        blocks.push({ key: keyOf(s, j), tag: s.tagName, attrs: { ...s.attribs }, html: $(s).html() ?? '', inMain: true });
      });
      return;
    }
    blocks.push({ key: keyOf(el, i), tag: el.tagName, attrs: { ...el.attribs }, html: $(el).html() ?? '', inMain: false });
  });

  const result = { headHtml: $('head').html() ?? '', blocks };
  if (file === 'index.html') cached = result;
  return result;
}
```

Write `tests/unit/parse.test.ts`:
```ts
import { describe, expect, test } from 'vitest';
import { legacyDocument } from '@/lib/legacy/parse';

describe('legacyDocument', () => {
  const doc = legacyDocument();
  test('main sections in order', () => {
    expect(doc.blocks.filter((b) => b.inMain).map((b) => b.key)).toEqual([
      'scrollytelling', 'materials', 'calculator', 'why-us', 'works', 'facebook-slider', 'branches', 'reviews', 'faq', 'contact',
    ]);
  });
  test('no inline handlers or moved scripts remain', () => {
    const all = doc.headHtml + doc.blocks.map((b) => b.html + JSON.stringify(b.attrs)).join('');
    expect(all).not.toMatch(/\son[a-z]+="/);
    expect(all).not.toMatch(/gsap\.min\.js|lucide\.min\.js|src\/main\.js/);
    expect(all).toMatch(/application\/ld\+json/);
  });
  test('lightbox top-level onclick converted', () => {
    const lb = doc.blocks.find((b) => b.key === 'lightbox')!;
    expect(lb.attrs['data-action']).toBe('closeLightbox');
  });
});
```
Run: `npx vitest run tests/unit/parse.test.ts` → Expected: PASS (fix key names in the test only if the legacy file genuinely differs — print `doc.blocks.map(b=>b.key)` to check).

- [ ] **Step 7: Runtime dispatcher** — `public/js/actions.js` + test

```js
// Runs legacy handlers declared as data-action="fn" data-args='[...]' (converted from inline on* attributes).
// Mirrors native inline-handler semantics: every ancestor handler runs inner -> outer unless propagation stops;
// a handler returning false cancels the default action.
const ALLOWED = new Set([
  'closeGalleryModal', 'closeLightbox', 'closePremiumModal', 'loadMoreGalleryItems', 'navigateGallery',
  'nextReview', 'openGalleryModal', 'prevReview', 'requestDetailedQuote', 'resetGalleryZoom',
  'zoomGalleryImage', 'handleForm',
]);

function dispatch(event, kind) {
  let el = event.target instanceof Element ? event.target : null;
  while (el && el !== document.documentElement) {
    if (el.hasAttribute('data-action') && (el.getAttribute('data-action-event') || 'click') === kind) {
      const name = el.getAttribute('data-action');
      const fn = window[name];
      if (ALLOWED.has(name) && typeof fn === 'function') {
        const args = JSON.parse(el.getAttribute('data-args') || '[]').map((a) => (a === '$event' ? event : a));
        const result = fn.apply(el, args);
        if (result === false) event.preventDefault();
      }
      if (event.cancelBubble) return;
    }
    el = el.parentElement;
  }
}

document.addEventListener('click', (e) => dispatch(e, 'click'));
document.addEventListener('submit', (e) => dispatch(e, 'submit'));
window.__massiaActions = ALLOWED;
```

`tests/unit/actions.test.ts`:
```ts
// @vitest-environment jsdom
import { beforeAll, describe, expect, test, vi } from 'vitest';

beforeAll(async () => {
  await import('../../public/js/actions.js');
});

describe('actions dispatcher', () => {
  test('runs inner then outer handler with args and event', () => {
    const calls: unknown[] = [];
    (window as any).openGalleryModal = (id: string, ev: Event) => calls.push(['open', id, ev.type]);
    (window as any).closeLightbox = () => calls.push(['close']);
    document.body.innerHTML = `<div data-action="closeLightbox" data-args="[]"><b data-action="openGalleryModal" data-args='["w1","$event"]'><i id="t"></i></b></div>`;
    document.getElementById('t')!.click();
    expect(calls).toEqual([['open', 'w1', 'click'], ['close']]);
  });

  test('stopPropagation inside a handler stops outer handlers', () => {
    const outer = vi.fn();
    (window as any).closeLightbox = outer;
    (window as any).openGalleryModal = (_id: string, ev: Event) => ev.stopPropagation();
    document.body.innerHTML = `<div data-action="closeLightbox" data-args="[]"><b id="t" data-action="openGalleryModal" data-args='["w1","$event"]'></b></div>`;
    document.getElementById('t')!.click();
    expect(outer).not.toHaveBeenCalled();
  });

  test('submit returning false prevents default; non-allowed names are ignored', () => {
    (window as any).handleForm = () => false;
    (window as any).evil = vi.fn();
    document.body.innerHTML = `<form id="f" data-action="handleForm" data-args='["$event"]' data-action-event="submit"><button id="b" data-action="evil" data-args="[]">x</button></form>`;
    const ev = new Event('submit', { bubbles: true, cancelable: true });
    document.getElementById('f')!.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    document.getElementById('b')!.click();
    expect((window as any).evil).not.toHaveBeenCalled();
  });
});
```

Run: `npx vitest run tests/unit/actions.test.ts` → Expected: PASS.

- [ ] **Step 8: Script entry with lifecycle replay** — `public/js/entry.js` + test

```js
// Loads the legacy scripts after React hydration, in the original order.
// Legacy code registers DOMContentLoaded/load listeners at import time; those events have already fired
// by now, so late listeners are invoked once, asynchronously, exactly like the browser would have.
const LIBS = [
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js',
  'https://unpkg.com/@studio-freight/lenis@1.0.33/dist/lenis.min.js',
  'https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js',
];

export function installLifecycleReplay(doc = document, win = window) {
  const patch = (target, type, isPast) => {
    const original = target.addEventListener.bind(target);
    target.addEventListener = function (t, listener, options) {
      if (t === type && isPast()) {
        queueMicrotask(() => {
          const ev = new Event(type);
          typeof listener === 'function' ? listener.call(target, ev) : listener.handleEvent(ev);
        });
        return;
      }
      return original(t, listener, options);
    };
  };
  patch(doc, 'DOMContentLoaded', () => doc.readyState !== 'loading');
  patch(win, 'load', () => doc.readyState === 'complete');
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export async function boot() {
  installLifecycleReplay();
  for (const src of LIBS) await loadScript(src);
  await import('/js/actions.js');
  await import('/js/main.js');
  await import('/js/calculator.js');
  await import('/js/form-handler.js');
  await import('/js/scrollytelling.js');
  if (window.lucide) window.lucide.createIcons();
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }
}

if (typeof window !== 'undefined' && !window.__massiaNoBoot) boot();
```

`tests/unit/entry.test.ts`:
```ts
// @vitest-environment jsdom
import { describe, expect, test, vi } from 'vitest';

describe('installLifecycleReplay', () => {
  test('replays late lifecycle listeners once', async () => {
    (window as any).__massiaNoBoot = true;
    const { installLifecycleReplay } = await import('../../public/js/entry.js');
    const doc = { readyState: 'complete', addEventListener: vi.fn() } as any;
    const win = { addEventListener: vi.fn() } as any;
    installLifecycleReplay(doc, win);
    const onReady = vi.fn();
    const onLoad = vi.fn();
    const onClick = vi.fn();
    doc.addEventListener('DOMContentLoaded', onReady);
    win.addEventListener('load', onLoad);
    doc.addEventListener('click', onClick);
    await Promise.resolve();
    expect(onReady).toHaveBeenCalledTimes(1);
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  test('does not replay while still loading', async () => {
    const { installLifecycleReplay } = await import('../../public/js/entry.js');
    const original = vi.fn();
    const doc = { readyState: 'loading', addEventListener: original } as any;
    installLifecycleReplay(doc, { addEventListener: vi.fn() } as any);
    const onReady = vi.fn();
    doc.addEventListener('DOMContentLoaded', onReady);
    await Promise.resolve();
    expect(onReady).not.toHaveBeenCalled();
    expect(original).toHaveBeenCalledWith('DOMContentLoaded', onReady, undefined);
  });
});
```

Run: `npx vitest run tests/unit/entry.test.ts` → Expected: PASS.

Note: legacy `js/*.js` files import each other with relative specifiers (e.g. `import { $ } from './main.js'`); they keep working from `/js/` unchanged.

- [ ] **Step 9: Layout and page** — `components/RawBlock.tsx`, `app/layout.tsx`, `app/page.tsx`

`components/RawBlock.tsx`:
```tsx
import { createElement } from 'react';
import { attrsToProps } from '@/lib/legacy/attrs';
import type { LegacyBlock } from '@/lib/legacy/parse';

// Renders one top-level legacy element with its exact attributes and inner HTML.
export function RawBlock({ block }: { block: LegacyBlock }) {
  return createElement(block.tag, { ...attrsToProps(block.attrs), dangerouslySetInnerHTML: { __html: block.html } });
}
```

`app/layout.tsx`:
```tsx
import Script from 'next/script';
import type { ReactNode } from 'react';
import { legacyDocument } from '@/lib/legacy/parse';

export default function RootLayout({ children }: { children: ReactNode }) {
  const { headHtml } = legacyDocument();
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      {/* The legacy <head> (meta, links, styles, JSON-LD) is reproduced verbatim. */}
      <head dangerouslySetInnerHTML={{ __html: headHtml }} />
      <body>
        {children}
        <Script id="js-class" strategy="beforeInteractive">{`document.documentElement.classList.add('js');`}</Script>
        <Script src="https://t.contentsquare.net/uxa/ac861b4839f2e.js" strategy="afterInteractive" />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-VSMD3VS5NK" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-VSMD3VS5NK');`}</Script>
        <Script type="module" src="/js/entry.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
```

Before writing `gtag-init`, copy the exact body of the legacy inline gtag `<script>` (legacy/index.html lines ~22–28) into it — keep any extra `gtag('config', …)` options it has.

`app/page.tsx`:
```tsx
import { RawBlock } from '@/components/RawBlock';
import { legacyDocument } from '@/lib/legacy/parse';

export default function HomePage() {
  const { blocks } = legacyDocument();
  const before = blocks.filter((b) => !b.inMain && blocks.indexOf(b) < blocks.findIndex((x) => x.inMain));
  const main = blocks.filter((b) => b.inMain);
  const after = blocks.filter((b) => !b.inMain && !before.includes(b));
  return (
    <>
      {before.map((b) => <RawBlock key={b.key} block={b} />)}
      <main id="main">{main.map((b) => <RawBlock key={b.key} block={b} />)}</main>
      {after.map((b) => <RawBlock key={b.key} block={b} />)}
    </>
  );
}
```

If Next.js rejects `<head dangerouslySetInnerHTML>` at build time, instead render the head children: parse `headHtml` with cheerio in `lib/legacy/parse.ts` into `{ tag, attrs, html }[]` and render each with `createElement(tag, { ...attrsToProps(attrs), dangerouslySetInnerHTML: html ? { __html: html } : undefined })` inside a plain `<head>`. Keep whichever builds and passes parity.

- [ ] **Step 10: Service worker precache** — in `public/sw.js`, remove `'/src/main.js'` from `urlsToCache` if present, add `'/js/entry.js'` and `'/js/actions.js'`, and change `CACHE_NAME` to `'almassia-kitchens-v5-next'`.

- [ ] **Step 11: Add the Next server to the parity config** — in `tests/parity/parity.config.ts` `webServer`, add:

```ts
{ command: 'npm run build && npm run start', url: 'http://127.0.0.1:3100/', reuseExistingServer: true, timeout: 300_000 },
```

- [ ] **Step 12: Verify**

Run: `npm test` → all unit tests PASS.
Run: `npm run build` → build succeeds.
Run: `npm run baseline && npm run parity` → PASS at 1440 and 390, no JS errors, no 404s, Lucide icons present.
If a 404 appears for a path like `/images/...`, it means the legacy markup used a relative path (`images/x.webp`) that still resolves to `/images/x.webp` at `/` — check the exact URL in the failure and fix the moved file, not the markup.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: serve legacy page verbatim from Next.js with lifecycle replay and action dispatcher"
```

---

### Task 3: Content scaffolding and DOM-equality test helper

Depends on Task 2.

**Files:**
- Create: `lib/content/types.ts`, `lib/content/load.ts`, `lib/content/sections/<id>.ts` (10 files), `content/layout.json`, `content/settings.json`, `content/sections/<id>.json` (10 files), `components/sections/<Name>.tsx` (10 files), `components/site/Header.tsx`, `components/site/Footer.tsx`, `components/site/Chrome.tsx`, `tests/unit/dom-equal.ts`, `tests/unit/dom-equal.test.ts`
- Modify: `app/page.tsx`

Section ids → component names: `scrollytelling`→`Scrollytelling`, `materials`→`Materials`, `calculator`→`Calculator`, `why-us`→`WhyUs`, `works`→`Works`, `facebook-slider`→`FacebookSlider`, `branches`→`Branches`, `reviews`→`Reviews`, `faq`→`Faq`, `contact`→`Contact`.

**Interfaces:**
- Produces:
  - `SectionId` union of the 10 ids; `loadSite(): SiteContent` where `SiteContent = { settings: Settings; sections: { id: SectionId; visible: boolean; fields: unknown }[] }`.
  - Each `lib/content/sections/<id>.ts` exports `schema` (zod) and `type Fields = z.infer<typeof schema>`.
  - Each `components/sections/<Name>.tsx` default-exports `({ fields }: { fields: Fields }) => JSX`.
  - `components/site/Chrome.tsx` exports `Before()` and `After()` (preloader/header and footer/whatsapp/lightbox/modals respectively).
  - `expectSameHtml(actual: string, legacyKey: string): void` in `tests/unit/dom-equal.ts`.

- [ ] **Step 1: DOM normalizer + helper** — `tests/unit/dom-equal.ts`

```ts
import { load, type CheerioAPI } from 'cheerio';
import { expect } from 'vitest';
import { legacyDocument } from '@/lib/legacy/parse';

const BOOLEAN = new Set(['hidden', 'defer', 'async', 'disabled', 'checked', 'selected', 'required', 'multiple',
  'readonly', 'autoplay', 'muted', 'loop', 'playsinline', 'controls', 'novalidate', 'allowfullscreen', 'open']);

function normStyle(s: string) {
  return s.split(';').map((d) => d.trim()).filter(Boolean)
    .map((d) => { const i = d.indexOf(':'); return `${d.slice(0, i).trim().toLowerCase()}:${d.slice(i + 1).trim()}`; })
    .join(';');
}

/** Canonical form: no comments, collapsed whitespace, sorted attributes, normalized style/boolean attrs. */
export function normalizeHtml(html: string): string {
  const $: CheerioAPI = load(`<root>${html}</root>`, { xml: false }, false);
  $('*').contents().each((_, n) => { if (n.type === 'comment') $(n).remove(); });
  const walk = (node: any): string => {
    if (node.type === 'text') {
      const t = node.data.replace(/\s+/g, ' ');
      return t.trim() === '' ? '' : t.trim();
    }
    if (node.type !== 'tag' && node.type !== 'script' && node.type !== 'style') return '';
    const attrs = Object.entries(node.attribs as Record<string, string>)
      .map(([k, v]) => [k.toLowerCase(), k === 'style' ? normStyle(v) : BOOLEAN.has(k) ? '' : v] as const)
      .filter(([k, v]) => !(k === 'style' && v === ''))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => ` ${k}="${v}"`).join('');
    const kids = (node.children ?? []).map(walk).filter(Boolean).join('');
    return `<${node.name}${attrs}>${kids}</${node.name}>`;
  };
  return ($('root').get(0) as any).children.map(walk).filter(Boolean).join('\n');
}

export function legacyOuterHtml(key: string): string {
  const b = legacyDocument().blocks.find((x) => x.key === key);
  if (!b) throw new Error(`no legacy block "${key}"`);
  const attrs = Object.entries(b.attrs).map(([k, v]) => ` ${k}="${v.replace(/"/g, '&quot;')}"`).join('');
  return `<${b.tag}${attrs}>${b.html}</${b.tag}>`;
}

export function expectSameHtml(actual: string, legacyKey: string) {
  expect(normalizeHtml(actual)).toBe(normalizeHtml(legacyOuterHtml(legacyKey)));
}
```

`tests/unit/dom-equal.test.ts`:
```ts
import { describe, expect, test } from 'vitest';
import { normalizeHtml } from './dom-equal';

describe('normalizeHtml', () => {
  test('ignores whitespace, comments, attribute order, style spacing', () => {
    expect(normalizeHtml('<div  class="a"   id="x" style="color: red;"><!-- c -->\n  <p>نص   عربي</p></div>'))
      .toBe(normalizeHtml('<div id="x" class="a" style="color:red"><p>نص عربي</p></div>'));
  });
  test('detects a changed class or text', () => {
    expect(normalizeHtml('<p class="a">x</p>')).not.toBe(normalizeHtml('<p class="b">x</p>'));
    expect(normalizeHtml('<p>x</p>')).not.toBe(normalizeHtml('<p>y</p>'));
  });
  test('decodes entities so &amp; and & compare equal', () => {
    expect(normalizeHtml('<p>A &amp; B&nbsp;C</p>')).toBe(normalizeHtml('<p>A & B C</p>'));
  });
});
```

Run: `npx vitest run tests/unit/dom-equal.test.ts` → Expected: PASS. (If the `&nbsp;` case fails because `\s` collapses U+00A0, change the text regex to `/[ \t\n\r\f]+/g` so non-breaking spaces are preserved, and re-run.)

- [ ] **Step 2: Content types and loader** — `lib/content/types.ts`

```ts
export const SECTION_IDS = [
  'scrollytelling', 'materials', 'calculator', 'why-us', 'works', 'facebook-slider', 'branches', 'reviews', 'faq', 'contact',
] as const;
export type SectionId = (typeof SECTION_IDS)[number];
```

`lib/content/load.ts`:
```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { SECTION_IDS, type SectionId } from './types';
import * as scrollytelling from './sections/scrollytelling';
import * as materials from './sections/materials';
import * as calculator from './sections/calculator';
import * as whyUs from './sections/why-us';
import * as works from './sections/works';
import * as facebookSlider from './sections/facebook-slider';
import * as branches from './sections/branches';
import * as reviews from './sections/reviews';
import * as faq from './sections/faq';
import * as contact from './sections/contact';

export const SECTION_SCHEMAS = {
  scrollytelling: scrollytelling.schema, materials: materials.schema, calculator: calculator.schema,
  'why-us': whyUs.schema, works: works.schema, 'facebook-slider': facebookSlider.schema, branches: branches.schema,
  reviews: reviews.schema, faq: faq.schema, contact: contact.schema,
} satisfies Record<SectionId, z.ZodType>;

const layoutSchema = z.array(z.object({ id: z.enum(SECTION_IDS), visible: z.boolean() }));

const read = (p: string) => JSON.parse(readFileSync(join(process.cwd(), 'content', p), 'utf8'));

export function loadSite() {
  const layout = layoutSchema.parse(read('layout.json'));
  return {
    settings: read('settings.json') as Record<string, unknown>,
    sections: layout.map(({ id, visible }) => ({
      id, visible, fields: SECTION_SCHEMAS[id].parse(read(`sections/${id}.json`)),
    })),
  };
}
```

`content/layout.json`:
```json
[
  { "id": "scrollytelling", "visible": true },
  { "id": "materials", "visible": true },
  { "id": "calculator", "visible": true },
  { "id": "why-us", "visible": true },
  { "id": "works", "visible": true },
  { "id": "facebook-slider", "visible": true },
  { "id": "branches", "visible": true },
  { "id": "reviews", "visible": true },
  { "id": "faq", "visible": true },
  { "id": "contact", "visible": true }
]
```

`content/settings.json`: `{}` (filled by Task 9).

For **each** of the 10 ids create the starting files below (shown for `materials`; substitute id/name):

`lib/content/sections/materials.ts`
```ts
import { z } from 'zod';
// Starts empty: the section is still rendered from legacy HTML. The conversion task defines the real fields.
export const schema = z.object({}).strict();
export type Fields = z.infer<typeof schema>;
```
`content/sections/materials.json`: `{}`

`components/sections/Materials.tsx`
```tsx
import { RawBlock } from '@/components/RawBlock';
import { legacyDocument } from '@/lib/legacy/parse';
import type { Fields } from '@/lib/content/sections/materials';

export default function Materials(_props: { fields: Fields }) {
  return <RawBlock block={legacyDocument().blocks.find((b) => b.key === 'materials')!} />;
}
```

`components/site/Chrome.tsx`
```tsx
import { RawBlock } from '@/components/RawBlock';
import { legacyDocument } from '@/lib/legacy/parse';

function split() {
  const { blocks } = legacyDocument();
  const firstMain = blocks.findIndex((b) => b.inMain);
  return { before: blocks.slice(0, firstMain).filter((b) => !b.inMain), after: blocks.filter((b, i) => i > firstMain && !b.inMain) };
}

// Everything before <main> (preloader, header) — Task 4 replaces with real components.
export function Before() {
  return <>{split().before.map((b) => <RawBlock key={b.key} block={b} />)}</>;
}

// Everything after <main> (footer, WhatsApp button, lightbox, gallery modal, bubble, premium modal).
export function After() {
  return <>{split().after.map((b) => <RawBlock key={b.key} block={b} />)}</>;
}
```

`app/page.tsx` (replace):
```tsx
import type { ComponentType } from 'react';
import { After, Before } from '@/components/site/Chrome';
import Scrollytelling from '@/components/sections/Scrollytelling';
import Materials from '@/components/sections/Materials';
import Calculator from '@/components/sections/Calculator';
import WhyUs from '@/components/sections/WhyUs';
import Works from '@/components/sections/Works';
import FacebookSlider from '@/components/sections/FacebookSlider';
import Branches from '@/components/sections/Branches';
import Reviews from '@/components/sections/Reviews';
import Faq from '@/components/sections/Faq';
import Contact from '@/components/sections/Contact';
import { loadSite } from '@/lib/content/load';
import type { SectionId } from '@/lib/content/types';

const COMPONENTS: Record<SectionId, ComponentType<{ fields: any }>> = {
  scrollytelling: Scrollytelling, materials: Materials, calculator: Calculator, 'why-us': WhyUs, works: Works,
  'facebook-slider': FacebookSlider, branches: Branches, reviews: Reviews, faq: Faq, contact: Contact,
};

export default function HomePage() {
  const site = loadSite();
  return (
    <>
      <Before />
      <main id="main">
        {site.sections.filter((s) => s.visible).map((s) => {
          const Section = COMPONENTS[s.id];
          return <Section key={s.id} fields={s.fields} />;
        })}
      </main>
      <After />
    </>
  );
}
```

- [ ] **Step 3: Verify nothing changed**

Run: `npm test && npm run build && npm run parity` → all PASS (the page is still made of raw blocks, now routed through components).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: per-section content scaffolding and DOM-equality test helper"
```

---

### Section conversion procedure (used by Tasks 4–9)

Each conversion task turns raw blocks into real components. Follow exactly:

1. Read the legacy markup of the block in `legacy/index.html` (`grep -n 'id="<id>"' legacy/index.html` gives the start line). Inline `on*` handlers are compared in their converted `data-action`/`data-args` form (see `lib/legacy/handlers.ts`).
2. Decide the **fields**: every human-visible text, every image `src`/`alt`, every link `href`, every repeated item (cards, tabs, questions, reviews, branches, gallery items) becomes data. Structure, classes, icons names (`data-lucide`), and decorative markup stay in the component.
3. Write the zod schema in `lib/content/sections/<id>.ts` (replace the empty `z.object({}).strict()`), keep `.strict()` on every object, and fill `content/sections/<id>.json` with the exact current values (copy text verbatim, including punctuation and Arabic digits).
4. Write the component in `components/sections/<Name>.tsx` producing the same elements. JSX rules: `class`→`className`, `for`→`htmlFor`, `style` string→object, SVG attributes camelCase (`stroke-width`→`strokeWidth`), `data-*`/`aria-*` unchanged, converted handlers as `data-action="…" data-args='[...]'` (use `JSON.stringify` for args). Text comes from `fields`; never use `dangerouslySetInnerHTML` in section components.
5. Write `tests/unit/sections/<id>.test.tsx`:

```tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, test } from 'vitest';
import Section from '@/components/sections/<Name>';
import { schema } from '@/lib/content/sections/<id>';
import content from '@/content/sections/<id>.json';
import { expectSameHtml } from '../dom-equal';

describe('<id> section', () => {
  test('renders exactly the legacy markup', () => {
    expectSameHtml(renderToStaticMarkup(<Section fields={schema.parse(content)} />), '<id>');
  });
});
```
6. Run `npx vitest run tests/unit/sections/<id>.test.tsx` until PASS; then `npm test && npm run build && npm run parity` must PASS.
7. Commit with `feat(content): <id> section from content`.

---

### Task 4: Header, footer and page chrome

Depends on Task 3. Can run in parallel with Tasks 5–8 (different files).

**Files:**
- Modify: `components/site/Chrome.tsx`, `content/settings.json`
- Create: `components/site/Header.tsx`, `components/site/Footer.tsx`, `components/site/Overlays.tsx`, `lib/content/settings.ts`, `tests/unit/sections/chrome.test.tsx`

**Interfaces:**
- Produces: `settingsSchema` (zod) in `lib/content/settings.ts` with at least `{ companyName: string, nav: {label,href}[], contact: { phone: string, whatsapp: string, email: string, facebook: string }, footer: {...} }` — exact shape decided from the markup; Task 9 extends it with `seo`.

- [ ] **Step 1:** Apply the conversion procedure to the blocks before `<main>` (preloader, header) and after `<main>` (footer, WhatsApp button, lightbox, gallery modal, material bubble, premium modal). Static overlays with no human-edited text (lightbox, gallery modal shell, premium modal shell, preloader) become plain components with no fields. Header nav labels/links, footer texts/links/phones and the WhatsApp number come from `settings`.
- [ ] **Step 2:** Test — `tests/unit/sections/chrome.test.tsx`: for every legacy key outside `<main>` (list them with `legacyDocument().blocks.filter(b=>!b.inMain).map(b=>b.key)`), render the matching component and call `expectSameHtml(html, key)`. Run → PASS.
- [ ] **Step 3:** `Chrome.tsx` `Before`/`After` render the new components in the original order (no RawBlock left). Run `npm test && npm run build && npm run parity` → PASS.
- [ ] **Step 4:** Commit `feat(content): header, footer and overlays from settings`.

### Task 5: `scrollytelling` and `materials`

Depends on Task 3. Apply the conversion procedure to both sections. `materials` has 5 tabs (`tab-offers`, `tab-aluminum`, `tab-wood`, `tab-dressing`, `tab-bathroom`): model as `tabs: { id, label, active, items: [...] }[]` with the item fields visible in the markup. Commit once per section.

### Task 6: `calculator` and `why-us`

Depends on Task 3. Apply the conversion procedure to both. Additionally for `calculator`:

- [ ] Add `prices` to the calculator schema with exactly the structure of `PRICE_CONFIG` in `public/js/calculator.js` (base/drawer/addon/appliance/installation/cabinet with the same numbers), render it inside the section as:

```tsx
<script type="application/json" id="price-config" dangerouslySetInnerHTML={{ __html: JSON.stringify(fields.prices) }} />
```
(this one `dangerouslySetInnerHTML` is allowed: JSON, not HTML). Exclude `#price-config` from the DOM-equality comparison by removing it from the rendered string before `expectSameHtml` and assert separately that `JSON.parse` of it equals the legacy `PRICE_CONFIG`.

- [ ] In `public/js/calculator.js`, replace `const PRICE_CONFIG = { … };` with:

```js
// Prices come from the page (editable content); fall back to the built-in defaults.
const DEFAULT_PRICE_CONFIG = {
  base: {
    economy: 3000,  // MDF
    standard: 4000, // ألومنيوم
    premium: 5800   // HPL
  },
  drawer: {
    economy: 150,
    standard: 200,
    premium: 250
  },
  addon: {
    counter: 500,  // كونتر جوود وود لكل متر
    led: 200,      // إضاءة LED لكل متر
    handles: 100,  // مقابض بلت إن
    drawers: 300   // أدراج سحاب
  },
  appliance: {
    oven: 3000,
    cooktop: 1500,
    hood: 1200,
    fridge: 8000
  },
  installation: 2000,
  cabinet: {
    wall: 800,
    base: 1200
  }
};
const PRICE_CONFIG = (() => {
  try {
    const el = document.getElementById('price-config');
    return el ? JSON.parse(el.textContent) : DEFAULT_PRICE_CONFIG;
  } catch {
    return DEFAULT_PRICE_CONFIG;
  }
})();
```
Parity must still pass (same numbers).

### Task 7: `works` and `facebook-slider`

Depends on Task 3. Apply the conversion procedure. `works` items: `{ galleryId, category, title, description, cover: {src, alt}, images: string[], video?: string, hidden: boolean }` matching each `<figure>` (the `data-images` JSON attribute is rendered with `JSON.stringify(images)`; compare carefully — legacy uses `", "` separators inside `data-images`, so render the attribute string exactly as legacy: `'[' + images.map((s) => JSON.stringify(s)).join(', ') + ']'`). `facebook-slider` items: the post/reel URLs and titles of the click-to-load facades.

### Task 8: `branches`, `reviews`, `faq`

Depends on Task 3. Apply the conversion procedure. `faq` items `{ category, icon, question, answer, details: { icon, text }[] }`. The FAQPage JSON-LD in `<head>` stays as-is in this task (Task 9 generates it).

### Task 9: `contact` section, SEO settings and generated JSON-LD

Depends on Tasks 3, 4 and 8.

- [ ] Apply the conversion procedure to `contact` (form labels, placeholders, select options, info cards).
- [ ] Extend `settingsSchema` with `seo: { title, description, keywords, ogImage, ogImageWidth, ogImageHeight, url }` and move the corresponding `<head>` tags out of the verbatim head: `app/layout.tsx` renders `<title>`, description, Open Graph, Twitter and canonical from `settings.seo` (values identical to legacy), and the three JSON-LD blocks from `lib/seo/jsonld.ts`:
  - `localBusinessJsonLd(settings)` and `serviceJsonLd(settings)` — same objects as the legacy blocks.
  - `faqJsonLd(faqFields)` — built from the `faq` section items (`question` + first answer paragraph).
- [ ] `lib/legacy/parse.ts`: strip those moved tags from `headHtml` (title, meta description/keywords/og:*/twitter:*, link canonical, all `application/ld+json` scripts).
- [ ] Test `tests/unit/seo.test.ts`: `JSON.parse` of each generated block deep-equals the corresponding legacy JSON-LD block (parse them from `legacy/index.html` with cheerio).
- [ ] `npm test && npm run build && npm run parity` → PASS. Commit.

### Task 10: Remove raw rendering, port privacy/terms, switch URLs, final verification

Depends on Tasks 4–9.

- [ ] `grep -rn "RawBlock" components app` must return nothing except `components/RawBlock.tsx`; delete `components/RawBlock.tsx`. `lib/legacy/parse.ts` is now used only by tests and for the remaining verbatim head parts — keep it, but move remaining head pieces (stylesheet links, preconnects, preloads, icons, manifest, inline `<style>` blocks, `<noscript>`) into explicit JSX in `app/layout.tsx` so runtime no longer reads `legacy/`. Remove `outputFileTracingIncludes` from `next.config.ts`.
- [ ] `app/privacy/page.tsx` and `app/terms/page.tsx`: render `legacy/privacy.html` / `legacy/terms.html` body content as static JSX (same procedure; their own `<head>` titles/descriptions via `export const metadata`). Add parity checks for `/privacy` and `/terms` at 1440 and 390 (scroll 0 and 1 only) to `parity.spec.ts`.
- [ ] Switch production URLs to `https://massiakitchen.vercel.app`: `settings.seo.url`, canonical, `og:url`, `og:image`, `twitter:image`, JSON-LD `url`/`logo`/`image`, `public/sitemap.xml` `<loc>`s, `public/robots.txt` `Sitemap:` line. Add `Disallow: /admin/` to `robots.txt`.
- [ ] Run `npm test && npm run build && npm run parity` → PASS.
- [ ] Record a scroll video of baseline and candidate (Playwright `recordVideo` in a one-off script `scripts/record-scroll.mjs` scrolling top→bottom over 20 s at 390 and 1440 widths) into `.parity/videos/`.
- [ ] Lighthouse (performance, mobile) for baseline and candidate: `npx lighthouse <url> --only-categories=performance --form-factor=mobile --chrome-flags="--headless=new --no-sandbox" --output=json --output-path=.parity/lh-<name>.json`; candidate score must be ≥ baseline − 3.
- [ ] Commit `feat: complete Next.js migration`.

### Task 11: Preview deployment and owner approval (Claude + owner)

- [ ] Push the branch (not `main`) to GitHub; Vercel builds a Preview Deployment automatically. Confirm the project's Framework Preset is detected as Next.js (`vercel inspect <preview-url>`); if the build used "Other", set it to Next.js in Project Settings (owner approval) and redeploy.
- [ ] Run the parity suite against the preview URL: `CANDIDATE_URL=<preview-url> npm run parity`.
- [ ] Send the owner the preview link, the videos and the diff report. **Merge to `main` only after the owner explicitly approves.** After merge, verify production; if anything is wrong, use Vercel Instant Rollback.

## Execution

- Agents: muse `#xhigh` via `tools/muse-run.sh`, max 3 in parallel, each task in its own worktree branched from the integration branch `next-migration` (created from `origin/main` with this plan and the spec committed).
- Order: Task 1 → Task 2 → Task 3 → {Tasks 4, 5, 6} → {Tasks 7, 8} → Task 9 → Task 10 → Task 11.
- Claude reviews each task (diff, `npm test`, `npm run build`, `npm run parity`, parity report images) before merging into `next-migration`.
