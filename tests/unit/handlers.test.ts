import { load } from 'cheerio';
import { describe, expect, test } from 'vitest';
import { convertInlineHandlers } from '@/lib/legacy/handlers';

const conv = (html: string) => {
  const $ = load(html, null, false);
  convertInlineHandlers($);
  return $.html();
};

describe('convertInlineHandlers', () => {
  test('no-arg call', () => {
    expect(conv('<div onclick="closeLightbox()"></div>')).toBe('<div data-action="closeLightbox" data-args="[]"></div>');
  });
  test('string + event args', () => {
    expect(conv(`<figure onclick="openGalleryModal('wood-2', event)"></figure>`))
      .toBe('<figure data-action="openGalleryModal" data-args="[&quot;wood-2&quot;,&quot;$event&quot;]"></figure>');
  });
  test('numeric and division args', () => {
    expect(conv('<b onclick="navigateGallery(-1)"></b>')).toBe('<b data-action="navigateGallery" data-args="[-1]"></b>');
    expect(conv('<b onclick="zoomGalleryImage(1/1.2)"></b>'))
      .toBe(`<b data-action="zoomGalleryImage" data-args="[${1 / 1.2}]"></b>`);
  });
  test('onsubmit with return', () => {
    expect(conv('<form onsubmit="return handleForm(event)"></form>'))
      .toBe('<form data-action="handleForm" data-args="[&quot;$event&quot;]" data-action-event="submit"></form>');
  });
  test('unsupported expression throws so nothing is silently dropped', () => {
    expect(() => conv('<b onclick="a(); b()"></b>')).toThrow(/Unsupported inline handler/);
  });
});
