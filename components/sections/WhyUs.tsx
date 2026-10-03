import { RawBlock } from '@/components/RawBlock';
import { legacyDocument } from '@/lib/legacy/parse';
import type { Fields } from '@/lib/content/sections/why-us';

export default function WhyUs(_props: { fields: Fields }) {
  return <RawBlock block={legacyDocument().blocks.find((b) => b.key === 'why-us')!} />;
}
