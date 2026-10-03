import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';
import { convertInlineHandlers } from './handlers';

export type LegacyBlock = { key: string; tag: string; attrs: Record<string, string>; html: string; inMain: boolean };
export type HeadChild = { tag: string; attrs: Record<string, string>; html: string };

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
    if (SCRIPT_MOVED($el.attr('src'), $el.html() ?? '')) $el.remove();
  });

  // Task 9: SEO tags moved to app/layout.tsx (rendered from settings + lib/seo/jsonld).
  $('head title').remove();
  $('head meta[name="description"], head meta[name="keywords"]').remove();
  $('head meta[property^="og:"], head meta[name^="twitter:"]').remove();
  $('head link[rel="canonical"]').remove();
  $('head script[type="application/ld+json"]').remove();

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

// Remaining <head> children after SEO stripping, in document order (comments dropped).
// Rendered explicitly by app/layout.tsx alongside the settings-driven SEO tags.
export function headChildren(): HeadChild[] {
  const { headHtml } = legacyDocument();
  const $ = load(`<head>${headHtml}</head>`);
  const out: HeadChild[] = [];
  $('head')
    .children()
    .each((_, el) => {
      // NOTE: htmlparser2 types <style>/<script> as 'style'/'script', not 'tag'.
      if (el.type !== 'tag' && el.type !== 'script' && el.type !== 'style') return;
      out.push({ tag: el.tagName, attrs: { ...el.attribs }, html: $(el).html() ?? '' });
    });
  return out;
}
