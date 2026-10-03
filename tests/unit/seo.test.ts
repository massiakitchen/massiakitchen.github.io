import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';
import { describe, expect, test } from 'vitest';
import { settingsSchema } from '@/lib/content/settings';
import { schema as faqSchema } from '@/lib/content/sections/faq';
import { faqJsonLd, localBusinessJsonLd, serviceJsonLd } from '@/lib/seo/jsonld';
import settingsContent from '@/content/settings.json';
import faqContent from '@/content/sections/faq.json';

function legacyJsonLd(): Array<Record<string, any>> {
  const html = readFileSync(join(process.cwd(), 'legacy', 'index.html'), 'utf8');
  const $ = load(html);
  return $('script[type="application/ld+json"]')
    .toArray()
    .map((el) => JSON.parse($(el).html() ?? ''));
}

describe('seo json-ld', () => {
  test('generated blocks deep-equal the legacy blocks', () => {
    const settings = settingsSchema.parse(settingsContent);
    // Production URLs moved to massiakitchen.vercel.app (Task 10) while the
    // frozen legacy file keeps the old host: compare host-agnostically.
    const legacy = legacyJsonLd().map((b) =>
      JSON.parse(
        JSON.stringify(b).replaceAll(
          'https://massiakitchen.github.io',
          settings.seo.url.replace(/\/+$/, ''),
        ),
      ),
    );
    expect(legacy).toHaveLength(3);
    const faq = faqSchema.parse(faqContent);
    expect(localBusinessJsonLd(settings)).toEqual(legacy.find((b) => b['@type'] === 'LocalBusiness'));
    expect(serviceJsonLd(settings)).toEqual(legacy.find((b) => b['@type'] === 'Service'));
    expect(faqJsonLd(faq)).toEqual(legacy.find((b) => b['@type'] === 'FAQPage'));
  });
});
