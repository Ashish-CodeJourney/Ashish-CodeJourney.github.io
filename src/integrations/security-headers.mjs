import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contentSecurityPolicy, inlineScriptsOf, withSecurityHeaders } from '../utils/csp.js';
import { htmlFilesIn } from './html-files.mjs';

export default function securityHeaders() {
  return {
    name: 'security-headers',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const distDir = fileURLToPath(dir);
        const pages = await Promise.all((await htmlFilesIn(distDir)).map((file) => readFile(file, 'utf8')));
        const policy = contentSecurityPolicy({ inlineScripts: pages.flatMap(inlineScriptsOf) });
        const headersFile = join(distDir, '_headers');
        await writeFile(headersFile, withSecurityHeaders(await readFile(headersFile, 'utf8'), { policy }));
        logger.info('added HSTS and Content-Security-Policy to _headers');
      },
    },
  };
}
