/**
 * Re-applies dependency patches that don't survive a fresh `pnpm install`.
 * Run automatically via the `postinstall` script.
 *
 * Patches applied:
 *   - payload@3.84.1 loadEnv.js → switch default import of @next/env to named
 *     (Next 16 dropped the default export shape Payload's bin/loadEnv expects).
 *     Track: when Payload ships >=3.85 fixing this upstream, delete this script.
 */
const fs = require('node:fs');
const path = require('node:path');

const findFile = (root, target) => {
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) stack.push(full);
      else if (full.endsWith(target)) return full;
    }
  }
  return null;
};

const root = path.join(process.cwd(), 'node_modules', '.pnpm');
const target = path.join('payload', 'dist', 'bin', 'loadEnv.js');
const file = findFile(root, target);
if (!file) {
  // Nothing to do — payload may not be installed (e.g. CI-only env without deps).
  process.exit(0);
}
const src = fs.readFileSync(file, 'utf8');
if (!src.includes("loadEnvConfig } = nextEnvImport")) {
  process.exit(0);
}
const patched = src
  .replace(
    /import nextEnvImport from '@next\/env';/,
    "import { loadEnvConfig } from '@next/env';",
  )
  .replace(/const \{ loadEnvConfig \} = nextEnvImport;\n?/, '');
fs.writeFileSync(file, patched);
process.stdout.write(`[lwc] patched payload loadEnv at ${path.relative(process.cwd(), file)}\n`);
