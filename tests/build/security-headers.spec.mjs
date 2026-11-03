import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { readDist, htmlFiles } from './helpers.mjs';

const siteWideRule = async () => (await readDist('_headers')).match(/^\/\*\n(?: {2}.*\n?)*/m)?.[0] ?? '';

test('every page is served with HSTS', async () => {
  assert.match(await siteWideRule(), /^ {2}Strict-Transport-Security: max-age=31536000$/m);
});

test('the Content-Security-Policy allows every inline script the site ships, by hash', async () => {
  const policy = (await siteWideRule()).match(/^ {2}Content-Security-Policy: (.+)$/m)?.[1] ?? '';
  const scriptSrc = policy.split('; ').find((part) => part.startsWith('script-src ')) ?? '';
  assert.ok(scriptSrc, 'no script-src');
  const pages = await Promise.all((await htmlFiles()).map((file) => readFile(file, 'utf8')));
  pages
    .flatMap((html) => [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)])
    .filter(([, attributes]) => !/\bsrc=|ld\+json/.test(attributes))
    .forEach(([, , body]) => {
      const hash = `'sha256-${createHash('sha256').update(body).digest('base64')}'`;
      assert.ok(scriptSrc.includes(hash), `inline script not allowed: ${body.slice(0, 60)}`);
    });
});
