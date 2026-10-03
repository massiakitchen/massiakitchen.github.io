import { RawBlock } from '@/components/RawBlock';
import { legacyDocument } from '@/lib/legacy/parse';
import type { Fields } from '@/lib/content/sections/contact';

export default function Contact(_props: { fields: Fields }) {
  return <RawBlock block={legacyDocument().blocks.find((b) => b.key === 'contact')!} />;
}
