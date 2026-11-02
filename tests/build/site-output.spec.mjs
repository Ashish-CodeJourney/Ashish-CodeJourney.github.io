import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { DIST, readDist, listFiles } from './helpers.mjs';
const ORIGIN = 'https://ashishvaghela.in';

test('home page canonical URL points at the custom domain', async () => {
  const html = await readDist('index.html');
  assert.match(html, new RegExp(`<link rel="canonical" href="${ORIGIN}/"`));
});

test('structured data advertises the custom domain', async () => {
  const html = await readDist('index.html');
  assert.match(html, new RegExp(`"url":"${ORIGIN}`));
  assert.doesNotMatch(html, /https:\/\/ashish-codejourney\.github\.io/i);
});

test('robots.txt points crawlers at the custom domain sitemap', async () => {
  const robots = await readDist('robots.txt');
  assert.match(robots, new RegExp(`Sitemap: ${ORIGIN}/sitemap-index.xml`));
});

test('sitemap lists pages on the custom domain', async () => {
  const sitemap = await readDist('sitemap-0.xml');
  assert.match(sitemap, new RegExp(`<loc>${ORIGIN}/</loc>`));
});

test('no page ships a video element', async () => {
  const files = await listFiles(DIST);
  const htmlFiles = files.filter((file) => extname(file) === '.html');
  const pagesWithVideo = (
    await Promise.all(htmlFiles.map(async (file) => ((await readFile(file, 'utf8')).includes('<video') ? file : null)))
  ).filter(Boolean);
  assert.deepEqual(pagesWithVideo, []);
});

test('no video files are published', async () => {
  const files = await listFiles(DIST);
  assert.deepEqual(files.filter((file) => ['.mp4', '.webm', '.mov'].includes(extname(file))), []);
});

test('hashed build assets are served with long-lived immutable caching', async () => {
  const headers = await readDist('_headers');
  assert.match(headers, /^\/_astro\/\*\n\s+Cache-Control: public, max-age=31536000, immutable$/m);
});

test('no page depends on third-party font hosts', async () => {
  const files = await listFiles(DIST);
  const htmlFiles = files.filter((file) => extname(file) === '.html');
  const offenders = (
    await Promise.all(
      htmlFiles.map(async (file) => (/fonts\.(googleapis|gstatic)\.com/.test(await readFile(file, 'utf8')) ? file : null)),
    )
  ).filter(Boolean);
  assert.deepEqual(offenders, []);
});


test('dev.to post images go through the resizing CDN instead of full-size uploads', async () => {
  const files = (await listFiles(DIST)).filter((file) => /\/technical\/[^/]+\/index\.html$/.test(file));
  const hotlinked = (
    await Promise.all(files.map(async (file) => ((await readFile(file, 'utf8')).match(/<img\b[^>]*src="https:\/\/dev-to-uploads[^"]*"/g) ?? []).length))
  ).reduce((sum, count) => sum + count, 0);
  assert.equal(hotlinked, 0);
});
