import { renderToStaticMarkup } from 'react-dom/server';
import { describe, test } from 'vitest';
import Section from '@/components/sections/Works';
import { schema } from '@/lib/content/sections/works';
import content from '@/content/sections/works.json';
import { expectSameHtml } from '../dom-equal';

describe('works section', () => {
  test('renders exactly the legacy markup', () => {
    expectSameHtml(renderToStaticMarkup(<Section fields={schema.parse(content)} />), 'works');
  });
});
