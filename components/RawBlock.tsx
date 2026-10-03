import { createElement } from 'react';
import { attrsToProps } from '@/lib/legacy/attrs';
import type { LegacyBlock } from '@/lib/legacy/parse';

// Renders one top-level legacy element with its exact attributes and inner HTML.
export function RawBlock({ block }: { block: LegacyBlock }) {
  return createElement(block.tag, { ...attrsToProps(block.attrs), dangerouslySetInnerHTML: { __html: block.html } });
}
