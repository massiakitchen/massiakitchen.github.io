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
