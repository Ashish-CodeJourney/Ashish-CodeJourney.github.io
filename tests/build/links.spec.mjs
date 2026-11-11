import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readDist } from './helpers.mjs';

const site = JSON.parse(await readFile(new URL('../../content/site.json', import.meta.url), 'utf8'));
const links = () => readDist('links/index.html');

test('links page is a standalone link-in-bio page without the site menu or footer', async () => {
  const html = await links();
  assert.doesNotMatch(html, /class="site-header/);
  assert.doesNotMatch(html, /class="site-footer/);
  assert.match(html, /<a[^>]+href="\/"[^>]*>ashishvaghela\.in<\/a>/);
});

test('links page introduces me with my photo and name', async () => {
  const html = await links();
  assert.match(html, /<img[^>]+src="\/avatar\.jpg"[^>]+width="\d+"[^>]+height="\d+"/);
  assert.match(html, /<h1[^>]*>Ashish Vaghela<\/h1>/);
});

test('every profile, my email and my résumé are links, with no link back to the old site', async () => {
  const html = await links();
  site.links.filter((link) => link.icon !== 'website').forEach(({ url, label }) => assert.ok(html.includes(`href="${url}"`), `${label} should be linked`));
  assert.match(html, new RegExp(`href="mailto:${site.email}"`));
  assert.match(html, /href="\/resume\/developer-advocate"/);
  assert.doesNotMatch(html, /href="https:\/\/ashish-codejourney\.github\.io/);
});

test('one QR code opens this same page', async () => {
  const html = await links();
  assert.equal((html.match(/<svg[^>]*class="qr/g) ?? []).length, 1);
  assert.match(html, /aria-label="QR code that opens ashishvaghela\.in\/links"/);
  assert.match(html, /Scan to open this page/);
});

test('no blog posts, dialogs or share buttons on the link page', async () => {
  const html = await links();
  assert.doesNotMatch(html, /<dialog|data-qr-open|data-share|Latest technical post/);
  assert.doesNotMatch(html, /href="\/(technical|writings|speaking)\/[^"]+\/"/);
});
