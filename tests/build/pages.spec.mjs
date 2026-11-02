import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { DIST, readDist } from './helpers.mjs';

const OLD_SITE_CLASSES = /class="[^"]*\b(post-card|post-item|hstack|vstack|collection-header|section-eyebrow|stagger-item|badge|button|text-light|post-content|resource-link|timeline-card)\b/;

const OWNED_PAGES = [
  'speaking/index.html',
  'about/index.html',
  'now/index.html',
  'links/index.html',
  'sponsors/index.html',
  '404.html',
  'redirect/index.html',
];

const talkSlugs = async () => (await readdir(join(DIST, 'speaking'), { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

test('speaking lists every talk with a link to its page', async () => {
  const html = await readDist('speaking/index.html');
  const slugs = await talkSlugs();
  assert.ok(slugs.length > 0);
  slugs.forEach((slug) => assert.match(html, new RegExp(`href="/speaking/${slug}/"`)));
});

test('speaking shows the event each talk was given at', async () => {
  const html = await readDist('speaking/index.html');
  assert.match(html, /Java User Group Gujarat Meetup/);
});

test('speaking lists topics taken from the talk tags', async () => {
  const html = await readDist('speaking/index.html');
  assert.match(html, /Topics I talk about/);
  assert.match(html, /<li[^>]*>Java<\/li>/);
  assert.match(html, /<li[^>]*>JFR<\/li>/);
});

test('speaking has an invite-me mailto with a prefilled subject', async () => {
  const html = await readDist('speaking/index.html');
  assert.match(html, /<a[^>]+href="mailto:[^"?]+@[^"?]+\?subject=[^"]+"[^>]*>\s*Invite me to speak/);
});

test('speaking offers a short and a long bio, each copyable', async () => {
  const html = await readDist('speaking/index.html');
  assert.match(html, /Short bio/);
  assert.match(html, /Long bio/);
  assert.equal((html.match(/data-copy-bio/g) ?? []).length >= 2, true);
  assert.match(html, /Ashish Vaghela is a software engineer/);
});

test('speaking shows a headshot with explicit dimensions', async () => {
  const html = await readDist('speaking/index.html');
  assert.match(html, /<img[^>]+src="\/avatar\.jpg"[^>]+width="\d+"[^>]+height="\d+"/);
});

test('a talk page embeds the slides and links to its resources', async () => {
  const html = await readDist('speaking/jugaad-vs-jfr/index.html');
  assert.match(html, /<iframe[^>]+src="https:\/\/docs\.google\.com\/presentation\/[^"]+pubembed/);
  assert.match(html, /href="https:\/\/github\.com\/Ashish-CodeJourney\/jugaad-vs-jfr\.git"/);
  assert.match(html, /Java User Group Gujarat Meetup/);
  assert.match(html, /Registration closed/);
});

test('old talks urls redirect to speaking', async () => {
  const index = await readDist('talks/index.html');
  assert.match(index, /url=\/speaking\/?"/);
  const talk = await readDist('talks/jugaad-vs-jfr/index.html');
  assert.match(talk, /url=\/speaking\/jugaad-vs-jfr\/?"/);
});

test('now renders the now page content', async () => {
  const html = await readDist('now/index.html');
  assert.match(html, /<h1[^>]*>Now<\/h1>/);
  assert.match(html, /What I(&#39;|’|')m doing right now/);
});

test('links shows a QR code and every link', async () => {
  const html = await readDist('links/index.html');
  assert.match(html, /<svg[^>]*class="[^"]*qr/);
  ['linkedin.com/in/ashish-codejourney', 'github.com/Ashish-CodeJourney', 'dev.to/Ashish-CodeJourney'].forEach((url) => assert.match(html, new RegExp(url)));
});

test('sponsors lists each sponsorship with a link to its page', async () => {
  const html = await readDist('sponsors/index.html');
  assert.match(html, /href="\/sponsors\/the-linux-foundation\/"/);
  const detail = await readDist('sponsors/the-linux-foundation/index.html');
  assert.match(detail, /<h1[^>]*>The Linux Foundation<\/h1>/);
  assert.match(detail, /href="\/sponsors\/"/);
});

test('404 offers a way home and the optimised illustration', async () => {
  const html = await readDist('404.html');
  assert.match(html, /href="\/"/);
  assert.match(html, /<img[^>]+src="\/_astro\/404-illustration[^"]+\.webp"/);
});

test('the leaving-the-site page uses the new fonts and no old stylesheet', async () => {
  const html = await readDist('redirect/index.html');
  assert.doesNotMatch(html, /oat\.min\.css|fonts\.googleapis/);
  assert.match(html, /Stay on this site|Go now/);
});

test('pages I own use none of the old site classes', async () => {
  const pages = [...OWNED_PAGES, ...(await talkSlugs()).map((slug) => `speaking/${slug}/index.html`), 'sponsors/the-linux-foundation/index.html'];
  const offenders = (await Promise.all(pages.map(async (page) => (OLD_SITE_CLASSES.test(await readDist(page)) ? page : null)))).filter(Boolean);
  assert.deepEqual(offenders, []);
});
