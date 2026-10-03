import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { attrsToProps } from '@/lib/legacy/attrs';
import { headChildren } from '@/lib/legacy/parse';

// Regression guard for the layout head remainder: htmlparser2 types <style> as
// 'style' (not 'tag'), and a tag-only filter once dropped the critical inline CSS
// (.skip-link/.sr-only/h2.gold-title), shifting the whole page in parity screenshots.
describe('head remainder', () => {
  test('keeps the critical inline style block', () => {
    const nodes = headChildren();
    const styles = nodes.filter((n) => n.tag === 'style');
    expect(styles).toHaveLength(1);
    expect(styles[0].html).toContain('.skip-link');
    expect(styles[0].html).toContain('.sr-only');
    expect(styles[0].html).toContain('.section h2.gold-title');
  });

  test('keeps stylesheets, preconnects, icons and noscript in legacy order', () => {
    const nodes = headChildren();
    expect(nodes[0]).toMatchObject({ tag: 'meta', attrs: { charset: 'utf-8' } });
    expect(nodes.filter((n) => n.tag === 'link' && n.attrs.rel === 'stylesheet')).toHaveLength(8);
    expect(nodes.filter((n) => n.tag === 'link' && n.attrs.rel === 'preconnect')).toHaveLength(5);
    expect(nodes.filter((n) => n.tag === 'noscript')).toHaveLength(1);
    const html = renderToStaticMarkup(
      createElement(
        'head',
        null,
        nodes.map((n, i) => {
          const props: Record<string, unknown> = { key: i, ...attrsToProps(n.attrs) };
          if (n.html) props.dangerouslySetInnerHTML = { __html: n.html };
          return createElement(n.tag, props);
        }),
      ),
    );
    expect(html).toContain('<style>');
    expect(html).toContain('.skip-link');
  });
});
