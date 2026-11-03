import test from 'node:test';
import assert from 'node:assert/strict';
import { readDist } from './helpers.mjs';

const header = async () => (await readDist('index.html')).match(/<header class="site-header[\s\S]*?<\/header>/)?.[0] ?? '';

test('header has one main nav listing every section', async () => {
  const html = await header();
  assert.equal((html.match(/<nav[^>]*aria-label="Main"/g) ?? []).length, 1);
  ['/technical/', '/writings/', '/projects/', '/oss/', '/speaking/', '/about/'].forEach((href) => assert.match(html, new RegExp(`href="${href}"`)));
});

test('a menu button controls the nav on small screens', async () => {
  const html = await header();
  const id = html.match(/<nav[^>]*id="([^"]+)"/)?.[1];
  assert.ok(id, 'nav needs an id for the button to control');
  assert.match(html, new RegExp(`<button[^>]*aria-controls="${id}"[^>]*aria-expanded="false"[^>]*>`));
  assert.match(html, /<button[^>]*data-menu-toggle[^>]*>[\s\S]*?Menu[\s\S]*?<\/button>/);
});
