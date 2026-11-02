import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { DIST, readDist } from './helpers.mjs';

const CONTENT = new URL('../../content/writings/', import.meta.url).pathname;

const frontmatterField = (source, field) => source.match(new RegExp(`^${field}:\\s*"?(.*?)"?\\s*$`, 'm'))?.[1];

const loadEssays = async () => {
  const files = (await readdir(CONTENT)).filter((file) => file.endsWith('.md') && !file.startsWith('_'));
  const essays = await Promise.all(
    files.map(async (file) => {
      const source = await readFile(join(CONTENT, file), 'utf8');
      return {
        slug: file.replace(/\.md$/, ''),
        title: frontmatterField(source, 'title'),
        date: frontmatterField(source, 'date'),
      };
    }),
  );
  return essays.sort((a, b) => b.date.localeCompare(a.date));
};

const decode = (html) => html.replaceAll('&#39;', "'").replaceAll('&quot;', '"').replaceAll('&amp;', '&');

const between = (html, startPattern, endTag) => {
  const start = html.search(startPattern);
  if (start === -1) return '';
  const end = html.indexOf(endTag, start);
  return html.slice(start, end === -1 ? undefined : end);
};

const exists = (path) =>
  access(join(DIST, path)).then(
    () => true,
    () => false,
  );

const OLD_CLASSES = /class="[^"]*\b(post-card|stagger-item|badge|post-header|post-content|back-link|eyebrow)\b/;

test('archive lists every essay', async () => {
  const html = decode(await readDist('writings/index.html'));
  const essays = await loadEssays();
  essays.forEach(({ slug, title }) => {
    assert.match(html, new RegExp(`href="/writings/${slug}/"`), `missing link to ${slug}`);
    assert.ok(html.includes(title), `missing title ${title}`);
  });
});

test('archive groups essays under year headings, newest year first', async () => {
  const html = decode(await readDist('writings/index.html'));
  const essays = await loadEssays();
  const years = [...new Set(essays.map(({ date }) => date.slice(0, 4)))];
  const headings = [...html.matchAll(/<h2[^>]*>\s*(\d{4})\s*<\/h2>/g)].map((match) => match[1]);
  assert.deepEqual(headings, years);

  essays.forEach(({ slug, date }) => {
    const section = between(html, new RegExp(`<h2[^>]*>\\s*${date.slice(0, 4)}\\s*</h2>`), '</section>');
    assert.ok(section.includes(`href="/writings/${slug}/"`), `${slug} should sit under ${date.slice(0, 4)}`);
  });
});

test('archive offers a random essay that falls back to the newest one', async () => {
  const html = await readDist('writings/index.html');
  const [newest] = await loadEssays();
  assert.match(html, new RegExp(`<a[^>]*href="/writings/${newest.slug}/"[^>]*data-random[^>]*>Read something at random</a>`));
});

test('archive uses the notebook voice and none of the old site classes', async () => {
  const html = await readDist('writings/index.html');
  assert.match(html, /<main[^>]*data-voice="notebook"/);
  assert.doesNotMatch(html, OLD_CLASSES);
});

test('each essay page shows its title, date and reading time', async () => {
  const essays = await loadEssays();
  await Promise.all(
    essays.map(async ({ slug, title, date }) => {
      const html = decode(await readDist(`writings/${slug}/index.html`));
      assert.match(html, new RegExp(`<h1[^>]*>\\s*${title.replace(/[?.*+()]/g, '\\$&')}\\s*</h1>`), slug);
      assert.match(html, new RegExp(`<time[^>]*datetime="${date}"`), slug);
      assert.match(html, /\d+ min read/, slug);
      assert.match(html, /<main[^>]*data-voice="notebook"/, slug);
      assert.doesNotMatch(html, OLD_CLASSES, slug);
    }),
  );
});

test('each essay page describes itself as a BlogPosting', async () => {
  const essays = await loadEssays();
  await Promise.all(
    essays.map(async ({ slug, title, date }) => {
      const html = await readDist(`writings/${slug}/index.html`);
      const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((match) =>
        JSON.parse(match[1]),
      );
      const posting = blocks.find((block) => block['@type'] === 'BlogPosting');
      assert.ok(posting, `${slug} has no BlogPosting`);
      assert.equal(posting.headline, title);
      assert.equal(posting.datePublished, date);
    }),
  );
});

test('keep reading links to the older and newer essays and to all writings', async () => {
  const essays = await loadEssays();
  await Promise.all(
    essays.map(async ({ slug }, index) => {
      const html = await readDist(`writings/${slug}/index.html`);
      const block = between(html, /<nav[^>]*aria-labelledby="keep-reading"/, '</nav>');
      assert.ok(block.includes('Keep reading'), `${slug} has no keep reading block`);

      const links = [...block.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
      const expected = [essays[index - 1], essays[index + 1]]
        .filter(Boolean)
        .map((neighbour) => `/writings/${neighbour.slug}/`);
      assert.deepEqual(
        links.filter((href) => href !== '/writings/').sort(),
        expected.sort(),
        `${slug} neighbours`,
      );
      assert.ok(links.includes('/writings/'), `${slug} should link to all writings`);

      const resolved = await Promise.all(links.map((href) => exists(`${href}index.html`)));
      assert.ok(resolved.every(Boolean), `${slug} links to a missing page`);
    }),
  );
});

test('banner images reserve their space', async () => {
  const essays = await loadEssays();
  await Promise.all(
    essays.map(async ({ slug }) => {
      const html = await readDist(`writings/${slug}/index.html`);
      const images = between(html, /<article/, '</article>').match(/<img[^>]*>/g) ?? [];
      images
        .filter((img) => img.includes('class="banner'))
        .forEach((img) => {
          assert.match(img, /width="\d+"/);
          assert.match(img, /height="\d+"/);
        });
    }),
  );
});

test('writings feed lists every essay and nothing else', async () => {
  const xml = await readDist('writings/rss.xml');
  const essays = await loadEssays();
  const links = [...xml.matchAll(/<item>.*?<link>([^<]+)<\/link>/gs)].map((match) => new URL(match[1]).pathname);
  assert.deepEqual(links.sort(), essays.map(({ slug }) => `/writings/${slug}/`).sort());
});

test('archive and essays advertise the writings feed', async () => {
  const html = await readDist('writings/index.html');
  assert.match(html, /<link rel="alternate" type="application\/rss\+xml"[^>]*href="\/writings\/rss\.xml"/);
});
