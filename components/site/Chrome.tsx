import { RawBlock } from '@/components/RawBlock';
import { legacyDocument } from '@/lib/legacy/parse';

function split() {
  const { blocks } = legacyDocument();
  const firstMain = blocks.findIndex((b) => b.inMain);
  return { before: blocks.slice(0, firstMain).filter((b) => !b.inMain), after: blocks.filter((b, i) => i > firstMain && !b.inMain) };
}

// Everything before <main> (preloader, header) — Task 4 replaces with real components.
export function Before() {
  return <>{split().before.map((b) => <RawBlock key={b.key} block={b} />)}</>;
}

// Everything after <main> (footer, WhatsApp button, lightbox, gallery modal, bubble, premium modal).
export function After() {
  return <>{split().after.map((b) => <RawBlock key={b.key} block={b} />)}</>;
}
