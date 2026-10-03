import { renderToStaticMarkup } from 'react-dom/server';
import { describe, test } from 'vitest';
import Section from '@/components/sections/Reviews';
import { schema } from '@/lib/content/sections/reviews';
import content from '@/content/sections/reviews.json';
import { expectSameHtml } from '../dom-equal';

describe('reviews section', () => {
  test('renders exactly the legacy markup', () => {
    expectSameHtml(renderToStaticMarkup(<Section fields={schema.parse(content)} />), 'reviews');
  });
});
