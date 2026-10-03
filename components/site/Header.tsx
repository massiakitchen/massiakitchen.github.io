import { RawBlock } from '@/components/RawBlock';
import { legacyDocument } from '@/lib/legacy/parse';

// Task 3 stub: renders the legacy header verbatim. Task 4 replaces with a real component.
export default function Header() {
  const { blocks } = legacyDocument();
  const block = blocks.find((b) => b.key === 'site-header') ?? blocks.find((b) => b.tag === 'header')!;
  return <RawBlock block={block} />;
}
