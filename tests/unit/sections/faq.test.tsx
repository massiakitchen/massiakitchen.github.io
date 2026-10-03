import { renderToStaticMarkup } from 'react-dom/server';
import { describe, test } from 'vitest';
import Section from '@/components/sections/Faq';
import { schema } from '@/lib/content/sections/faq';
import content from '@/content/sections/faq.json';
import { expectSameHtml } from '../dom-equal';

describe('faq section', () => {
  test('renders exactly the legacy markup', () => {
    expectSameHtml(renderToStaticMarkup(<Section fields={schema.parse(content)} />), 'faq');
  });
});
