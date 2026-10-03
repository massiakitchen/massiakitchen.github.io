import { describe, expect, test } from 'vitest';
import { attrsToProps } from '@/lib/legacy/attrs';

describe('attrsToProps', () => {
  test('class/for/tabindex/readonly renames', () => {
    expect(attrsToProps({ class: 'a b', for: 'x', tabindex: '0', readonly: '' }))
      .toEqual({ className: 'a b', htmlFor: 'x', tabIndex: '0', readOnly: true });
  });
  test('style string to object incl. custom properties and vendor prefixes', () => {
    expect(attrsToProps({ style: 'display: none; --gap:4px; -webkit-line-clamp: 2;' }))
      .toEqual({ style: { display: 'none', '--gap': '4px', WebkitLineClamp: '2' } });
  });
  test('svg presentation attributes become camelCase, aria/data untouched', () => {
    expect(attrsToProps({ 'stroke-width': '2', 'stroke-linecap': 'round', viewBox: '0 0 16 16', 'aria-hidden': 'true', 'data-x': '1' }))
      .toEqual({ strokeWidth: '2', strokeLinecap: 'round', viewBox: '0 0 16 16', 'aria-hidden': 'true', 'data-x': '1' });
  });
  test('boolean attributes', () => {
    expect(attrsToProps({ hidden: '', defer: '', crossorigin: '' })).toEqual({ hidden: true, defer: true, crossOrigin: '' });
  });
});
