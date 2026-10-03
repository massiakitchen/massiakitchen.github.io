import { renderToStaticMarkup } from 'react-dom/server';
import { describe, test } from 'vitest';
import Section from '@/components/sections/Materials';
import { schema } from '@/lib/content/sections/materials';
import content from '@/content/sections/materials.json';
import { expectSameHtml } from '../dom-equal';

describe('materials section', () => {
  test('renders exactly the legacy markup', () => {
    expectSameHtml(renderToStaticMarkup(<Section fields={schema.parse(content)} />), 'materials');
  });
});
