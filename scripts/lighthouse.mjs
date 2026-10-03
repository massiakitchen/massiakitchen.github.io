// Runs Lighthouse (performance only, mobile) for a URL and saves the JSON report.
//
// Usage: node scripts/lighthouse.mjs <url> <name>
// Output: .parity/lh-<name>.json (prints the performance score)
//
// Uses the system Chromium (/usr/bin/chromium) headless so no Chrome download
// is needed. Requires the `lighthouse` devDependency (or network for npx).
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';

const [url, name] = process.argv.slice(2);
if (!url || !name) {
  console.error('usage: node scripts/lighthouse.mjs <url> <name>');
  process.exit(2);
}

mkdirSync('.parity', { recursive: true });
const out = `.parity/lh-${name}.json`;

execFileSync(
  'npx',
  [
    'lighthouse',
    url,
    '--only-categories=performance',
    '--form-factor=mobile',
    '--chrome-path=/usr/bin/chromium',
    '--chrome-flags=--headless=new --no-sandbox',
    '--output=json',
    `--output-path=${out}`,
    '--quiet',
  ],
  { stdio: 'inherit' },
);

const report = JSON.parse(readFileSync(out, 'utf8'));
console.log(`performance score: ${report.categories.performance.score}`);
