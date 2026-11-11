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

const hero = async () => (await readDist('index.html')).match(/<section class="hero[\s\S]*?<\/section>/)?.[0] ?? '';

test('hero says what Ashish does, where he works from and which roles he is open to', async () => {
  const html = await hero();
  assert.match(html, /India · IST/);
  assert.match(html, /Open to full-time remote roles/);
  ['software engineering', 'developer advocacy', 'open source'].forEach((role) => assert.match(html, new RegExp(role, 'i')));
  assert.doesNotMatch(html, /backend only/i);
});

test('hero describes the work without tying it to a single technology', async () => {
  const intro = (await hero()).match(/<p class="intro"[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '';
  assert.match(intro, /software engineer/);
  assert.doesNotMatch(intro, /JVM|Java|Kotlin|Spring/);
});

test('hero offers the résumé and an email as next steps', async () => {
  const html = await hero();
  assert.match(html, /<a[^>]+href="\/resume\/developer-advocate"[^>]*>[^<]*résumé/i);
  assert.match(html, /<a[^>]+href="mailto:vaghelaashish111@gmail\.com"/);
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
