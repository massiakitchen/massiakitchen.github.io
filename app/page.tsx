import { RawBlock } from '@/components/RawBlock';
import { legacyDocument } from '@/lib/legacy/parse';

export default function HomePage() {
  const { blocks } = legacyDocument();
  const before = blocks.filter((b) => !b.inMain && blocks.indexOf(b) < blocks.findIndex((x) => x.inMain));
  const main = blocks.filter((b) => b.inMain);
  const after = blocks.filter((b) => !b.inMain && !before.includes(b));
  return (
    <>
      {before.map((b) => <RawBlock key={b.key} block={b} />)}
      <main id="main">{main.map((b) => <RawBlock key={b.key} block={b} />)}</main>
      {after.map((b) => <RawBlock key={b.key} block={b} />)}
    </>
  );
}
