import test from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { readDist, listFiles, DIST } from './helpers.mjs';

const POST = 'technical/astro-7-satteri-silent-bugs/index.html';
const OLD_SITE_CLASSES = ['post-card', 'badge', 'stagger-item', 'eyebrow', 'post-header', 'back-link'];

const all = (html, pattern) => [...html.matchAll(pattern)];

const postSlugs = async () => {
  const files = await listFiles();
  const root = join(DIST, 'technical');
  return files
    .filter((file) => file.startsWith(`${root}/`) && file.endsWith('/index.html') && file !== join(root, 'index.html'))
    .map((file) => file.slice(root.length + 1, -'/index.html'.length));
};

const linkedAssets = async (html, extension) => {
  const paths = all(html, new RegExp(`(?:href|src)="(/_astro/[^"]+\\.${extension})"`, 'g')).map((m) => m[1]);
  const contents = await Promise.all(paths.map((path) => readDist(path.slice(1))));
  return [...contents, ...all(html, extension === 'css' ? /<style[^>]*>([\s\S]*?)<\/style>/g : /<script[^>]*>([\s\S]*?)<\/script>/g).map((m) => m[1])].join('\n');
};

const ids = (html) => new Set(all(html, /<h[23][^>]*\sid="([^"]+)"/g).map((m) => m[1]));

test('archive lists every technical post exactly once', async () => {
  const html = await readDist('technical/index.html');
  const slugs = await postSlugs();
  assert.ok(slugs.length > 0);
  slugs.forEach((slug) => {
    assert.equal(all(html, new RegExp(`href="/technical/${slug}/"`, 'g')).length, 1, slug);
  });
});

test('archive groups posts under year headings, newest year first', async () => {
  const html = await readDist('technical/index.html');
  const years = all(html, /<h2[^>]*>(\d{4})<\/h2>/g).map((m) => m[1]);
  assert.ok(years.length >= 2);
  assert.deepEqual(years, [...years].sort().reverse());
  assert.equal(new Set(years).size, years.length);
});

test('archive has a plain one-line description under the heading', async () => {
  const html = await readDist('technical/index.html');
  assert.match(html, /<header class="page-head[^"]*"[^>]*>\s*<h1[^>]*>Technical<\/h1>\s*<p[^>]*>[^<]+<\/p>/);
});

test('archive offers tag filters with a post count for each tag', async () => {
  const html = await readDist('technical/index.html');
  const buttons = all(html, /<button[^>]*data-tag="([^"]*)"[^>]*>([\s\S]*?)<\/button>/g);
  assert.ok(buttons.length >= 2);
  const [first, ...tags] = buttons;
  assert.equal(first[1], '');
  assert.match(first[0], /aria-pressed="true"/);
  tags.forEach(([button, tag, label]) => {
    assert.match(button, /aria-pressed="false"/);
    const count = Number(label.match(/class="count"[^>]*>(\d+)</)?.[1]);
    const tagged = all(html, new RegExp(`data-tags="[^"]*\\b${tag}\\b[^"]*"`, 'g')).length;
    assert.equal(count, tagged, tag);
  });
});

test('archive shows every post without JavaScript', async () => {
  const html = await readDist('technical/index.html');
  assert.doesNotMatch(html, /<li[^>]*data-tags[^>]*hidden/);
});

test('technical pages use none of the old site classes', async () => {
  const pages = await Promise.all(['technical/index.html', POST].map(readDist));
  pages.forEach((html) => {
    OLD_SITE_CLASSES.forEach((name) => assert.doesNotMatch(html, new RegExp(`class="[^"]*\\b${name}\\b`), name));
  });
});

test('post page shows the title, date and reading time', async () => {
  const html = await readDist(POST);
  assert.match(html, /<h1[^>]*>[^<]*Astro 7[^<]*<\/h1>/);
  assert.match(html, /<time datetime="2026-08-04"[^>]*>August 4, 2026<\/time>/);
  assert.match(html, /\d+ min read/);
});

test('post page lists its tags', async () => {
  const html = await readDist(POST);
  ['astro', 'markdown', 'javascript', 'webdev'].forEach((tag) => assert.match(html, new RegExp(`>${tag}<`)));
});

test('table of contents links to every section heading in the post', async () => {
  const html = await readDist(POST);
  const toc = html.match(/<nav[^>]*aria-label="On this page"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? '';
  const targets = all(toc, /href="#([^"]+)"/g).map((m) => m[1]);
  assert.ok(targets.length > 0);
  assert.deepEqual(new Set(targets), ids(html.replace(toc, '')));
});

test('table of contents is collapsible on small screens', async () => {
  const html = await readDist(POST);
  assert.match(html, /<details[^>]*>\s*<summary[^>]*>On this page<\/summary>/);
});

test('code blocks get a copy button with an accessible label', async () => {
  const html = await readDist(POST);
  assert.match(html, /<pre[^>]*class="astro-code/);
  const scripts = await linkedAssets(html, 'js');
  assert.match(scripts, /Copy code/);
  assert.match(scripts, /Copied/);
});

test('code font is loaded on technical posts only', async () => {
  const fontFace = /@font-face\s*\{[^}]*JetBrains Mono Variable/;
  assert.match(await linkedAssets(await readDist(POST), 'css'), fontFace);
  assert.doesNotMatch(await linkedAssets(await readDist('index.html'), 'css'), fontFace);
  assert.doesNotMatch(await linkedAssets(await readDist('technical/index.html'), 'css'), fontFace);
});

test('post page links to the older and newer posts by date', async () => {
  const html = await readDist('technical/oracle-cloud-free-vps-from-india/index.html');
  assert.match(html, /<a[^>]*href="\/technical\/dot-files-two-years-later\/"[^>]*rel="prev"/);
  assert.match(html, /<a[^>]*href="\/technical\/astro-7-satteri-silent-bugs\/"[^>]*rel="next"/);
});

test('the newest post has no newer link', async () => {
  const slugs = await postSlugs();
  const pages = await Promise.all(slugs.map((slug) => readDist(`technical/${slug}/index.html`)));
  assert.equal(pages.filter((html) => !/rel="next"/.test(html)).length, 1);
  assert.equal(pages.filter((html) => !/rel="prev"/.test(html)).length, 1);
});

test('post page links back to all technical posts', async () => {
  const html = await readDist(POST);
  assert.match(html, /<a[^>]*href="\/technical\/"[^>]*>All technical posts<\/a>/);
});

test('post page describes itself as a blog post for search engines', async () => {
  const html = await readDist(POST);
  const schemas = all(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g).map((m) => JSON.parse(m[1]));
  const posting = schemas.find((schema) => schema['@type'] === 'BlogPosting');
  assert.ok(posting);
  assert.match(posting.headline, /Astro 7/);
  assert.equal(posting.datePublished, '2026-08-04');
  assert.equal(posting.mainEntityOfPage, 'https://ashishvaghela.in/technical/astro-7-satteri-silent-bugs/');
});

test('posts imported from dev.to show no banner image', async () => {
  const html = await readDist(POST);
  const beforeTitle = html.slice(html.indexOf('<article'), html.indexOf('<h1'));
  assert.ok(beforeTitle.length > 0);
  assert.doesNotMatch(beforeTitle, /<img/);
  assert.match(html, /<meta property="og:image" content="https:\/\/ashishvaghela\.in\/og\/technical\//);
});

test('technical feed contains every technical post and nothing else', async () => {
  const xml = await readDist('technical/rss.xml');
  const links = all(xml, /<link>([^<]+)<\/link>/g).map((m) => m[1]).slice(1);
  const slugs = await postSlugs();
  assert.equal(links.length, slugs.length);
  links.forEach((link) => assert.match(link, /\/technical\/[^/]+\/$/));
});

test('technical pages advertise the technical feed', async () => {
  const html = await readDist('technical/index.html');
  assert.match(html, /<link rel="alternate" type="application\/rss\+xml"[^>]*href="\/technical\/rss\.xml"/);
});

test('no post summary on the technical index is cut off mid-sentence', async () => {
  const html = await readDist('technical/index.html');
  const summaries = [...html.matchAll(/<span class="summary"[^>]*>([^<]*)<\/span>/g)].map(([, text]) => text.trim());
  assert.ok(summaries.length > 0);
  summaries.forEach((summary) => assert.doesNotMatch(summary, /\.\.\.$/, summary));
});
