import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import PrivacyPage, { metadata } from '@/app/privacy/page';
import { legacyDocument } from '@/lib/legacy/parse';
import { normalizeHtml } from './dom-equal';

const FILE = 'privacy.html';

// Same outer-HTML reconstruction as legacyOuterHtml, but for privacy.html
// (legacyDocument applies the same SCRIPT_MOVED stripping the layout relies on).
// The legacy inline `#year` script is intentionally not rendered (see NOTE
// in the page): strip it from the legacy side and assert the span survives.
const YEAR_SCRIPT = `<script>document.getElementById('year').textContent = new Date().getFullYear();</script>`;

function legacyBodyHtml(): string {
  return legacyDocument(FILE)
    .blocks.map((b) => {
      const attrs = Object.entries(b.attrs)
        .map(([k, v]) => ` ${k}="${v.replace(/"/g, '&quot;')}"`)
        .join('');
      return `<${b.tag}${attrs}>${b.html}</${b.tag}>`;
    })
    .join('\n');
}

function legacyHead() {
  const $ = load(readFileSync(join(process.cwd(), 'legacy', FILE), 'utf8'));
  return {
    title: $('head title').text(),
    description: $('head meta[name="description"]').attr('content'),
    style: $('head style').html() ?? '',
  };
}

// Non-legacy additions the page needs (see comments in the page): the
// `precedence` attribute that makes <style> hydration-safe, and the hidden
// header shim that keeps the shared legacy scroll handler a no-op.
const SHIM = '<header class="site-header" aria-hidden="true" style="display:none"></header>';

function renderedStyles(): string[] {
  const rendered = renderToStaticMarkup(<PrivacyPage />);
  expect(rendered, 'header shim present').toContain(SHIM);
  return rendered.match(/<style[^>]*>[\s\S]*?<\/style>/g) ?? [];
}

function renderedBody(): string {
  const rendered = renderToStaticMarkup(<PrivacyPage />);
  return rendered
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
    .replace(SHIM, '');
}

describe('privacy page', () => {
  test('body renders exactly the legacy markup', () => {
    const legacy = legacyBodyHtml();
    expect(legacy, 'legacy has the year script').toContain(YEAR_SCRIPT);
    const body = renderedBody();
    expect(body, 'page keeps the year span').toContain('id="year"');
    expect(normalizeHtml(body)).toBe(normalizeHtml(legacy.replace(YEAR_SCRIPT, '')));
  });

  test('page style matches the legacy head style', () => {
    const styles = renderedStyles();
    expect(styles, 'page renders two <style> tags').toHaveLength(2);
    expect(normalizeHtml(styles[0].replace(/<style[^>]*>/, '<style>'))).toBe(
      normalizeHtml(`<style>${legacyHead().style}</style>`),
    );
  });

  test('parity overrides restore the legacy box model', () => {
    const styles = renderedStyles();
    expect(styles, 'page renders two <style> tags').toHaveLength(2);
    const overrides = normalizeHtml(styles[1].replace(/<style[^>]*>/, '<style>'));
    expect(overrides).toContain('box-sizing: content-box');
    expect(overrides).toContain('div.container');
    expect(overrides).toContain('width: auto');
    expect(overrides).toContain('padding: 30px');
  });

  test('metadata matches the legacy head', () => {
    const head = legacyHead();
    expect(metadata.title).toBe(head.title);
    expect(metadata.description).toBe(head.description);
  });
});
