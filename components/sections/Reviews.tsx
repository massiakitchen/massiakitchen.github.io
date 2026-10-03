import { RawBlock } from '@/components/RawBlock';
import { legacyDocument } from '@/lib/legacy/parse';
import type { Fields } from '@/lib/content/sections/reviews';

export default function Reviews(_props: { fields: Fields }) {
  return <RawBlock block={legacyDocument().blocks.find((b) => b.key === 'reviews')!} />;
}
