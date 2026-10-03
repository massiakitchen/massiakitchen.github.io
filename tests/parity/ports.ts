import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Optional per-worktree port override (git-ignored) so several worktrees can run parity at once:
// .parity/ports.json = { "next": 3104, "baseline": 4304, "self": 4314 }
const file = join(process.cwd(), '.parity', 'ports.json');
const custom = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};

export const PORTS = {
  next: Number(custom.next ?? 3100),
  baseline: Number(custom.baseline ?? 4300),
  self: Number(custom.self ?? 4301),
};
