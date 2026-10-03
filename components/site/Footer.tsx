import { RawBlock } from '@/components/RawBlock';
import { legacyDocument } from '@/lib/legacy/parse';

// Task 3 stub: renders the legacy footer verbatim. Task 4 replaces with a real component.
export default function Footer() {
  const { blocks } = legacyDocument();
  const block = blocks.find((b) => b.key === 'site-footer') ?? blocks.find((b) => b.tag === 'footer')!;
  return <RawBlock block={block} />;
}
