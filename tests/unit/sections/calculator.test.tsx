import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import Section from '@/components/sections/Calculator';
import { schema } from '@/lib/content/sections/calculator';
import content from '@/content/sections/calculator.json';
import { expectSameHtml, normalizeHtml, legacyOuterHtml } from '../dom-equal';

function legacyDefaultPrices(): unknown {
  const src = readFileSync(join(process.cwd(), 'public/js/calculator.js'), 'utf8');
  const m = src.match(/const DEFAULT_PRICE_CONFIG = (\{[\s\S]*?\n\});/);
  if (!m) throw new Error('DEFAULT_PRICE_CONFIG not found in public/js/calculator.js');
  return new Function(`return (${m[1]});`)();
}

describe('calculator section', () => {
  test('renders exactly the legacy markup (excluding the price-config script)', () => {
    const html = renderToStaticMarkup(<Section fields={schema.parse(content)} />);
    const stripped = html.replace(/<script[^>]*id="price-config"[^>]*>.*?<\/script>/s, '');
    expect(stripped).toContain('id="calculator"');
    expect(normalizeHtml(stripped)).toBe(normalizeHtml(legacyOuterHtml('calculator')));
    expectSameHtml(stripped, 'calculator');
  });

  test('price-config JSON matches the legacy PRICE_CONFIG defaults', () => {
    const html = renderToStaticMarkup(<Section fields={schema.parse(content)} />);
    const m = html.match(/<script[^>]*id="price-config"[^>]*>(.*?)<\/script>/s);
    expect(m, 'price-config script present').toBeTruthy();
    expect(JSON.parse(m![1])).toEqual(legacyDefaultPrices());
  });
});
