import { renderToStaticMarkup } from 'react-dom/server';
import { describe, test } from 'vitest';
import Section from '@/components/sections/Contact';
import { schema } from '@/lib/content/sections/contact';
import content from '@/content/sections/contact.json';
import { expectSameHtml } from '../dom-equal';

describe('contact section', () => {
  test('renders exactly the legacy markup', () => {
    expectSameHtml(renderToStaticMarkup(<Section fields={schema.parse(content)} />), 'contact');
  });
});
