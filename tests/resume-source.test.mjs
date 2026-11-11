import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = () => readFile(new URL('../resume/developer-advocate.html', import.meta.url), 'utf8');

test('public developer advocate résumé never publishes a phone number', async () => {
  assert.doesNotMatch(await source(), /\+91|95104/);
});

test('developer advocate résumé points to the current domain, not the old github.io site', async () => {
  const html = await source();
  assert.match(html, /https:\/\/ashishvaghela\.in/);
  assert.doesNotMatch(html, /ashish-codejourney\.github\.io(?!\/(aether-gateway|MindGuard))/);
});

test('developer advocate résumé leads with the developer advocate role', async () => {
  assert.match(await source(), /<p class="role">Developer Advocate/);
});
