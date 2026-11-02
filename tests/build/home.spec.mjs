import test from 'node:test';
import assert from 'node:assert/strict';
import { readDist, listFiles, DIST, cssOf } from './helpers.mjs';
import { join } from 'node:path';

const countMatches = (html, pattern) => (html.match(pattern) ?? []).length;

const publishedCount = async () => {
  const files = await listFiles();
  const isPostPage = (section) => (file) =>
    file.startsWith(join(DIST, section)) && file.endsWith('/index.html') && file !== join(DIST, section, 'index.html');
  return ['technical', 'writings', 'speaking'].reduce(
    (total, section) => total + files.filter(isPostPage(section)).length,
    0,
  );
};

test('home hero introduces Ashish by name', async () => {
  const html = await readDist('index.html');
  assert.match(html, /<h1[^>]*id="hero-name"[^>]*>Ashish<br[^>]*>Vaghela<\/h1>/);
});

test('greeting has a no-JavaScript fallback', async () => {
  const html = await readDist('index.html');
  assert.match(html, /id="greeting"[^>]*>Hi, I(&#39;|')m</);
});

test('necklace shows one light for every published piece', async () => {
  const html = await readDist('index.html');
  assert.equal(countMatches(html, /<li class="light /g), await publishedCount());
});

test('necklace caption states how many pieces are published', async () => {
  const html = await readDist('index.html');
  assert.match(html, new RegExp(`${await publishedCount()} so far\\.`));
});

test('necklace lights stay out of the keyboard tab order', async () => {
  const html = await readDist('index.html');
  const lightLinks = html.match(/<li class="light [^"]*"[^>]*>\s*<a [^>]*>/g) ?? [];
  assert.ok(lightLinks.length > 0);
  lightLinks.forEach((link) => assert.match(link, /tabindex="-1"/));
});

test('home separates technical posts from personal writing', async () => {
  const html = await readDist('index.html');
  assert.match(html, /From the workbench/);
  assert.match(html, /From the notebook/);
  assert.match(html, /href="\/technical\/"/);
  assert.match(html, /href="\/writings\/"/);
});

test('talk lights and their legend key have their own colour', async () => {
  const html = await readDist('index.html');
  const css = await cssOf(html);
  assert.match(css, /\.light(\[[^\]]*\])?\.talk[^{]*:before[^{]*\{[^}]*background:\s*var\(--light-talk\)/);
  assert.match(css, /\.key(\[[^\]]*\])?\.talk[^{]*\{[^}]*background:\s*var\(--light-talk\)/);
  assert.match(css, /--light-talk:\s*#[0-9a-f]{6}/i);
});
