// Build-time (next build runs tsc) declarations for untyped imports.
// Runtime behaviour is unaffected: these modules are plain JS served as-is.
declare module 'pngjs';
declare module '*.js';
declare module 'react-dom/server';
