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
