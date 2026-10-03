import { renderToStaticMarkup } from 'react-dom/server';
import { describe, test } from 'vitest';
import Section from '@/components/sections/Scrollytelling';
import { schema } from '@/lib/content/sections/scrollytelling';
import content from '@/content/sections/scrollytelling.json';
import { expectSameHtml } from '../dom-equal';

describe('scrollytelling section', () => {
  test('renders exactly the legacy markup', () => {
    expectSameHtml(renderToStaticMarkup(<Section fields={schema.parse(content)} />), 'scrollytelling');
  });
});
