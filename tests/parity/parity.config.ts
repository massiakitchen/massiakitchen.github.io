import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';
import { PORTS } from './ports';

// webServer commands spawn with cwd = this file's directory by default;
// pin them to the project root so the root-relative commands below resolve.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export default defineConfig({
  testDir: '.',
  testMatch: 'parity.spec.ts',
  timeout: 240_000,
  workers: 1,
  reporter: [['list']],
  use: { launchOptions: { executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] } },
  webServer: [
    { command: `node tests/parity/serve-static.mjs .parity/baseline ${PORTS.baseline}`, url: `http://127.0.0.1:${PORTS.baseline}/`, reuseExistingServer: true, cwd: root },
    { command: `node tests/parity/serve-static.mjs .parity/baseline ${PORTS.self}`, url: `http://127.0.0.1:${PORTS.self}/`, reuseExistingServer: true, cwd: root },
    { command: `npm run build && npx next start -p ${PORTS.next}`, url: `http://127.0.0.1:${PORTS.next}/`, reuseExistingServer: true, timeout: 300_000, cwd: root },
  ],
});
