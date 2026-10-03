import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // legacy/*.html is read at build time by lib/legacy/parse.ts
  outputFileTracingIncludes: { '/': ['./legacy/**/*'] },
  async headers() {
    return [{ source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache' }] }];
  },
};

export default nextConfig;
