// Build-time (next build runs tsc) shorthand declaration for the untyped
// react-dom/server import used by Task 6 section tests. @types/react-dom is
// not installed (Task 2 package set); vitest does not need it. Runtime
// behaviour is unaffected. Other section tasks (7-9) hit the same gap and
// should reuse this file or add @types/react-dom at integration time.
declare module 'react-dom/server';
