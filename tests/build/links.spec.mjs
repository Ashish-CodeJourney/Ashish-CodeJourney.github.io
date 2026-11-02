import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { readDist } from './helpers.mjs';

const site = JSON.parse(await readFile(new URL('../../content/site.json', import.meta.url), 'utf8'));
const links = () => readDist('links/index.html');
const sectionOf = (html, id) => html.match(new RegExp(`<section[^>]*aria-labelledby="${id}"[^>]*>([\\s\\S]*?)</section>`))?.[1] ?? '';

const frontmatterOf = async (dir) =>
  Promise.all(
    (await readdir(new URL(`../../content/${dir}/`, import.meta.url)))
      .filter((name) => name.endsWith('.md') && !name.startsWith('_'))
      .map(async (name) => {
        const text = await readFile(new URL(`../../content/${dir}/${name}`, import.meta.url), 'utf8');
        return { slug: name.replace(/\.md$/, ''), date: text.match(/^date: "([^"]+)"/m)?.[1] ?? '' };
      }),
  );
const newest = (items) => items.toSorted((a, b) => b.date.localeCompare(a.date))[0];

test('links page introduces me with my photo and name', async () => {
  const html = await links();
  assert.match(html, /<img[^>]+src="\/avatar\.jpg"[^>]+width="\d+"[^>]+height="\d+"/);
  assert.match(html, /<h1[^>]*>Ashish Vaghela<\/h1>/);
});

test('latest section links to the newest writing and the latest talk', async () => {
  const section = sectionOf(await links(), 'latest');
  assert.match(section, new RegExp(`href="/writings/${newest(await frontmatterOf('writings')).slug}/"`));
  assert.match(section, new RegExp(`href="/speaking/${newest(await frontmatterOf('talks')).slug}/"`));
  assert.match(section, /href="\/technical\/[^"]+\/"/);
});

test('find me lists every profile except a link back to this website', async () => {
  const section = sectionOf(await links(), 'find-me');
  const profiles = site.links.filter((link) => link.icon !== 'website');
  profiles.forEach(({ url, label }) => assert.ok(section.includes(`href="${url}"`), `${label} should be linked`));
  assert.doesNotMatch(section, /github\.io"/);
  assert.equal((section.match(/<svg[^>]*class="[^"]*brand/g) ?? []).length, profiles.length);
});

test('work with me offers email, résumé and a speaking invite', async () => {
  const section = sectionOf(await links(), 'work-with-me');
  assert.match(section, new RegExp(`href="mailto:${site.email}"`));
  assert.match(section, /href="\/resume"/);
  assert.match(section, /href="mailto:[^"]+\?subject=/);
});

test('QR code can be shown full screen and the page can be shared', async () => {
  const html = await links();
  assert.match(html, /<button[^>]*data-qr-open[^>]*>Show my QR code<\/button>/);
  assert.match(html, /<dialog[^>]*class="[^"]*qr-dialog[\s\S]*?<svg[^>]*class="qr/);
  assert.match(html, /<button[^>]*data-share[^>]*>/);
});
