import { renderToStaticMarkup } from 'react-dom/server';
import { describe, test } from 'vitest';
import Section from '@/components/sections/FacebookSlider';
import { schema } from '@/lib/content/sections/facebook-slider';
import content from '@/content/sections/facebook-slider.json';
import { expectSameHtml } from '../dom-equal';

describe('facebook-slider section', () => {
  test('renders exactly the legacy markup', () => {
    expectSameHtml(renderToStaticMarkup(<Section fields={schema.parse(content)} />), 'facebook-slider');
  });
});
