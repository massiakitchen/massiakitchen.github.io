import { renderToStaticMarkup } from 'react-dom/server';
import { describe, test } from 'vitest';
import Section from '@/components/sections/Branches';
import { schema } from '@/lib/content/sections/branches';
import content from '@/content/sections/branches.json';
import { expectSameHtml } from '../dom-equal';

describe('branches section', () => {
  test('renders exactly the legacy markup', () => {
    expectSameHtml(renderToStaticMarkup(<Section fields={schema.parse(content)} />), 'branches');
  });
});
