import { renderToStaticMarkup } from 'react-dom/server';
import { describe, test } from 'vitest';
import Section from '@/components/sections/WhyUs';
import { schema } from '@/lib/content/sections/why-us';
import content from '@/content/sections/why-us.json';
import { expectSameHtml } from '../dom-equal';

describe('why-us section', () => {
  test('renders exactly the legacy markup', () => {
    expectSameHtml(renderToStaticMarkup(<Section fields={schema.parse(content)} />), 'why-us');
  });
});
