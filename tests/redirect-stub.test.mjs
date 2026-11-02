import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const TARGET = 'https://ashishvaghela.in';
const page = (name) => readFile(new URL(`../github-pages/${name}`, import.meta.url), 'utf8');

const inlineScriptOf = (html) => {
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(match, 'redirect page must contain an inline script');
  return match[1];
};

const visit = async ({ pathname = '/', search = '', hash = '' }) => {
  const replaced = [];
  const link = { href: '' };
  const location = { pathname, search, hash, replace: (url) => replaced.push(url) };
  const document = { getElementById: () => link };
  runInNewContext(inlineScriptOf(await page('404.html')), { location, document });
  return { replaced, link };
};

test('github pages serves the same redirect page for the home page and every other address', async () => {
  assert.equal(await page('index.html'), await page('404.html'));
});

test('visitor is sent to the same path on the new domain', async () => {
  const { replaced } = await visit({ pathname: '/technical/my-post/' });
  assert.deepEqual(replaced, [`${TARGET}/technical/my-post/`]);
});

test('query string and fragment survive the redirect', async () => {
  const { replaced } = await visit({ pathname: '/writings/', search: '?tag=life', hash: '#end' });
  assert.deepEqual(replaced, [`${TARGET}/writings/?tag=life#end`]);
});

test('the visible link also points at the matching page while the redirect happens', async () => {
  const { link } = await visit({ pathname: '/oss/' });
  assert.equal(link.href, `${TARGET}/oss/`);
});

test('visitors without JavaScript still reach the new home page', async () => {
  const html = await page('404.html');
  assert.match(html, /<noscript><meta http-equiv="refresh" content="0; url=https:\/\/ashishvaghela\.in\/"><\/noscript>/);
  assert.match(html, /<a id="new-home" href="https:\/\/ashishvaghela\.in\/">ashishvaghela\.in<\/a>/);
});

test('search engines are told the page moved and not to index the old address', async () => {
  const html = await page('404.html');
  assert.match(html, /<link rel="canonical" href="https:\/\/ashishvaghela\.in\/">/);
  assert.match(html, /<meta name="robots" content="noindex">/);
});

test('the page stays tiny and self-contained', async () => {
  const html = await page('404.html');
  assert.ok(Buffer.byteLength(html) < 3072, `page is ${Buffer.byteLength(html)} bytes`);
  assert.doesNotMatch(html, /<link rel="stylesheet"|<script src=|@import|https?:\/\/fonts\./);
});
