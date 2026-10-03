import { describe, expect, test } from 'vitest';
import { normalizeHtml } from './dom-equal';

describe('normalizeHtml', () => {
  test('ignores whitespace, comments, attribute order, style spacing', () => {
    expect(normalizeHtml('<div  class="a"   id="x" style="color: red;"><!-- c -->\n  <p>نص   عربي</p></div>'))
      .toBe(normalizeHtml('<div id="x" class="a" style="color:red"><p>نص عربي</p></div>'));
  });
  test('detects a changed class or text', () => {
    expect(normalizeHtml('<p class="a">x</p>')).not.toBe(normalizeHtml('<p class="b">x</p>'));
    expect(normalizeHtml('<p>x</p>')).not.toBe(normalizeHtml('<p>y</p>'));
  });
  test('decodes entities so &amp; and & compare equal', () => {
    expect(normalizeHtml('<p>A &amp; B&nbsp;C</p>')).toBe(normalizeHtml('<p>A & B C</p>'));
  });
});
