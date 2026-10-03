import { load } from 'cheerio';
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
    // Script-aware check: the literal string "src/main.js" still appears in a
    // legacy head *comment* (kept verbatim), so match <script> tags, not raw text.
    expect(all).not.toMatch(/<script[^>]*(gsap\.min\.js|lucide\.min\.js|src\/main\.js)/);
  });
  test('seo tags moved to layout are stripped from the verbatim head', () => {
    const $ = load(`<head>${doc.headHtml}</head>`);
    expect($('title').length).toBe(0);
    expect($('script[type="application/ld+json"]').length).toBe(0);
    expect($('meta[property^="og:"]').length).toBe(0);
    expect($('meta[name^="twitter:"]').length).toBe(0);
    expect($('link[rel="canonical"]').length).toBe(0);
    expect($('meta[name="description"]').length).toBe(0);
    // Everything else (stylesheets, preconnects, icons, inline styles) stays verbatim.
    expect($('link[rel="stylesheet"]').length).toBeGreaterThan(0);
  });
  test('lightbox top-level onclick converted', () => {
    const lb = doc.blocks.find((b) => b.key === 'lightbox')!;
    expect(lb.attrs['data-action']).toBe('closeLightbox');
  });
});
