import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildRedirectPage } from './lib/redirect-stub.mjs';

const [outDir, targetOrigin] = process.argv.slice(2);

if (!outDir || !targetOrigin) {
  console.error('Usage: node scripts/build-redirect-stub.mjs <out-dir> <https://target-origin>');
  process.exit(2);
}

const html = buildRedirectPage({ targetOrigin });

await mkdir(outDir, { recursive: true });
await Promise.all([
  writeFile(join(outDir, 'index.html'), html),
  writeFile(join(outDir, '404.html'), html),
  writeFile(join(outDir, '.nojekyll'), ''),
]);
