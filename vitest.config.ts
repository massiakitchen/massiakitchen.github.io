import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Note: no `esbuild.jsx` override — vite's default JSX handling ('automatic')
  // already applies; the override's type no longer exists in vitest 5.0.3.
  resolve: { alias: { '@': new URL('.', import.meta.url).pathname } },
  test: { include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'] },
});
