import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { readDist, htmlFiles } from './helpers.mjs';

const PROFILE = 'https://github.com/Ashish-CodeJourney';

const PROJECTS_CONTENT = new URL('../../content/projects/', import.meta.url);

const matchesOf = (html, pattern) => [...html.matchAll(pattern)].map((match) => match[1]);

const FEATURED = new URL('../../content/oss.json', import.meta.url);

const TALKS_CONTENT = new URL('../../content/talks/', import.meta.url);

const COMMUNITY_CONTENT = new URL('../../content/community/', import.meta.url);

const ossHtml = async () => (await readDist('oss/index.html')).split('<main')[1] ?? '';

const sectionOf = (html, id) => {
  const match = html.match(new RegExp(`<section[^>]*aria-labelledby="${id}"[^>]*>([\\s\\S]*?)</section>`));
  assert.ok(match, `expected a section labelled by #${id}`);
  return match[1];
};

const rowsOf = (section, attribute) => matchesOf(section, new RegExp(`<li[^>]*data-${attribute}="([^"]+)"`, 'g'));

const rowHtml = (section, attribute, key) => {
  const match = section.match(new RegExp(`<li[^>]*data-${attribute}="${key}"[^>]*>([\\s\\S]*?)</li>`));
  assert.ok(match, `expected a row for ${key}`);
  return match[1];
};

const ossFile = async () => JSON.parse(await readFile(FEATURED, 'utf8'));

const keyOf = (entry) => entry.repo || entry.name;

const contentFiles = async (dir) =>
  (await readdir(dir)).filter((name) => name.endsWith('.md') && !name.startsWith('_'));

const frontmatterValue = (text, key) => text.match(new RegExp(`^${key}: "([^"]*)"`, 'm'))?.[1];

const escapeHtml = (text) => text.replaceAll('&', '&amp;').replaceAll("'", '&#39;').replaceAll('"', '&quot;');

const projectPages = async () =>
  (await htmlFiles()).filter((file) => /\/projects\/[^/]+\/index\.html$/.test(file));

const projectPageHtml = async () => Promise.all((await projectPages()).map((file) => readFile(file, 'utf8')));

test('open source page links to the GitHub profile', async () => {
  const html = await readDist('oss/index.html');
  assert.match(html, new RegExp(`href="${PROFILE}"`));
});

test('open source page shows my projects, then projects I contribute to, then community', async () => {
  const headings = matchesOf(await ossHtml(), /<h2[^>]*>([^<]+)<\/h2>/g);

  assert.deepEqual(headings.slice(0, 3), ['My projects', 'Projects I contribute to', 'Community']);
});

test('open source page shows no pull request information', async () => {
  const main = (await ossHtml()).split('</main>')[0];

  assert.doesNotMatch(main, /github\.com\/[^"/]+\/[^"/]+\/pull\/\d+/);
  assert.doesNotMatch(main, /pull requests?|merged into \d|\d+ merged/i);
});

const assertListed = (section, entries) => {
  assert.deepEqual(rowsOf(section, 'project'), entries.map(keyOf));
  entries.forEach((entry) => {
    const row = rowHtml(section, 'project', keyOf(entry));
    assert.ok(row.includes(escapeHtml(entry.role)), `${keyOf(entry)} should show the role ${entry.role}`);
    if (entry.summary) assert.ok(row.includes(escapeHtml(entry.summary)), `${keyOf(entry)} should show its summary`);
    if (entry.description) assert.ok(row.includes(escapeHtml(entry.description)), `${keyOf(entry)} should show its description`);
    if (entry.url) assert.ok(row.includes(`href="${entry.url}"`), `${keyOf(entry)} should link to ${entry.url}`);
    if (!entry.url && entry.repo) assert.match(row, /href="(https:\/\/github\.com\/|\/projects\/)/);
    if (!entry.url && !entry.repo) assert.doesNotMatch(row, /<a /);
  });
};

test('open source page lists my own projects from the file, with my role and summary', async () => {
  const section = sectionOf(await ossHtml(), 'my-projects');
  const { ownProjects = [] } = await ossFile();

  assert.ok(ownProjects.length > 0);
  assertListed(section, ownProjects);
  assert.match(section, new RegExp(`href="${PROFILE}\\?tab=repositories"`));
});

test('open source page lists the projects I contribute to from the file, in order, with my role', async () => {
  const section = sectionOf(await ossHtml(), 'contributing');
  const { contributions = [] } = await ossFile();

  assert.ok(contributions.length > 0);
  assertListed(section, contributions);
});

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

test('open source page says how many projects I am a core contributor to', async () => {
  const section = sectionOf(await ossHtml(), 'contributing');
  const { contributions = [] } = await ossFile();
  const count = NUMBER_WORDS[contributions.length] ?? String(contributions.length);

  assert.match(section, new RegExp(`as a core contributor to ${count} projects?`));
});

test('open source page lists the well-known projects I have contributed to, in file order, with their stars', async () => {
  const section = sectionOf(await ossHtml(), 'contributing');
  const { notable = [] } = await ossFile();

  assert.ok(notable.length > 0);
  assert.match(section, /<h3[^>]*>I(&#39;|')ve also contributed to these projects, and more<\/h3>/);
  assert.match(section, /href="https:\/\/github\.com\/Ashish-CodeJourney"[^>]*>More on my GitHub profile</);
  assert.deepEqual(rowsOf(section, 'notable'), notable.map((entry) => entry.repo));
  notable.forEach((entry) => {
    const row = rowHtml(section, 'notable', entry.repo);
    assert.ok(row.includes(escapeHtml(entry.name)), `${entry.repo} should show its name`);
    if (entry.url) assert.ok(row.includes(`href="${entry.url}"`), `${entry.repo} should link to ${entry.url}`);
    if (entry.description) assert.ok(row.includes(escapeHtml(entry.description)), `${entry.repo} should show its description`);
    if (entry.showStars === false) assert.doesNotMatch(row, /stars?</);
    else assert.match(row, /\d+(\.\d)?[km]? stars?</);
  });
});

test('open source page leaves out the trivial contributions', async () => {
  const main = (await ossHtml()).split('</main>')[0];

  ['first-contributions', 'readme-typing-svg'].forEach((name) => assert.ok(!main.includes(name), `${name} should not be listed`));
});

test('open source page opens by describing what is on it, without project counts', async () => {
  const html = await ossHtml();
  assert.match(html, /Things I build in the open, projects I help maintain, and the developer communities I(&#39;|')m part of\./);
  assert.doesNotMatch(html, /I maintain \d+ projects?/);
});

test('open source page lists every community entry, undated ones first and without a date', async () => {
  const section = sectionOf(await ossHtml(), 'community');
  const entries = await Promise.all(
    (await contentFiles(COMMUNITY_CONTENT)).map(async (name) => readFile(new URL(name, COMMUNITY_CONTENT), 'utf8')),
  );
  const rows = section.split('<li').slice(1);
  const listed = entries.filter((text) => !/^note: true$/m.test(text));
  const undated = listed.filter((text) => !frontmatterValue(text, 'date'));

  listed.forEach((text) => assert.ok(section.includes(escapeHtml(frontmatterValue(text, 'organisation'))), text));
  rows.slice(0, undated.length).forEach((row) => assert.doesNotMatch(row, /<time/));
});

test('projects index links every project page as a row', async () => {
  const html = await readDist('projects/index.html');
  const pages = await projectPages();
  const linked = matchesOf(html, /href="(\/projects\/[^"]+\/)"/g);

  assert.ok(pages.length > 0);
  assert.equal(new Set(linked).size, pages.length);
  assert.match(html, /class="rows/);
});

test('project pages show the status and a dated header', async () => {
  const contents = await projectPageHtml();

  assert.ok(contents.length > 0);
  contents.forEach((html) => {
    assert.match(html, /<h1[^>]*>/);
    assert.match(html, /<time datetime="\d{4}-\d{2}-\d{2}"/);
    assert.match(html, /(Active|Maintenance|Archived)/);
  });
});

test('project pages link to the live site and source given in their frontmatter', async () => {
  const sources = await readdir(PROJECTS_CONTENT);
  const projects = await Promise.all(
    sources
      .filter((name) => name.endsWith('.md') && !name.startsWith('_'))
      .map(async (name) => ({
        page: `projects/${name.replace(/\.md$/, '')}/index.html`,
        frontmatter: await readFile(new URL(name, PROJECTS_CONTENT), 'utf8'),
      })),
  );

  assert.ok(projects.length > 0);
  await Promise.all(
    projects.map(async ({ page, frontmatter }) => {
      const html = await readDist(page);
      const links = matchesOf(frontmatter, /^(?:url|github): "([^"]+)"/gm);
      links.forEach((link) => assert.ok(html.includes(`href="${link}"`), `${page} should link to ${link}`));
    }),
  );
});

test('project banner images reserve their space to avoid layout shift', async () => {
  const images = (await projectPageHtml()).flatMap((html) => html.match(/<img [^>]*class="[^"]*banner[^"]*"[^>]*>/g) ?? []);

  assert.ok(images.length > 0, 'expected at least one project banner');
  images.forEach((img) => {
    assert.match(img, /width="\d+"/);
    assert.match(img, /height="\d+"/);
  });
});

test('open source and project pages avoid arrow links and dot-separated meta strings', async () => {
  const pages = ['oss/index.html', 'projects/index.html'];
  const htmls = await Promise.all(pages.map(readDist));

  htmls.forEach((html) => {
    const main = html.split('<main')[1] ?? '';
    assert.doesNotMatch(main, /→|&rarr;/);
    assert.doesNotMatch(main, / · /);
  });
});

test('community starts with WeDoTDD, described, linking to its website', async () => {
  const section = sectionOf(await ossHtml(), 'community');
  const [first] = section.split('<li').slice(1);
  assert.match(first, /href="https:\/\/wedotdd\.com"[^>]*>WeDoTDD</);
  assert.match(first, /test-driven development/);
});

test('community shows core team roles in my words', async () => {
  const section = sectionOf(await ossHtml(), 'community');
  const rows = section.split('<li').slice(1);
  const rowFor = (name) => rows.find((row) => row.includes(name));
  assert.match(rowFor('Open Source Weekend'), /Core team member/);
  assert.match(rowFor('Ahmedabad Developer Club'), /Core team member in Ahmedabad/);
  assert.doesNotMatch(section, /Organiser/);
});

test('communities I also volunteer with are named one by one under the rows, with what I do for them', async () => {
  const section = sectionOf(await ossHtml(), 'community');
  const rows = section.match(/<ol[\s\S]*?<\/ol>/)?.[0] ?? '';
  const also = section.match(/<div class="also"[\s\S]*?<\/div>\s*<\/div>/)?.[0] ?? '';
  const names = matchesOf(also, /<li[^>]*>([^<]+)<\/li>/g);
  assert.match(also, /<h3[^>]*>Also part of<\/h3>/);
  assert.deepEqual(names.slice(0, 3), ['GDG', 'Java User Group', 'The Hackers Meetup']);
  assert.match(also, /volunteer to help [^<]*run their meetups and events/);
  assert.doesNotMatch(rows, /The Hackers Meetup/);
});

test('Ahmedabad Developer Club links to its website and says what I do there', async () => {
  const section = sectionOf(await ossHtml(), 'community');
  const row = section.split('<li').slice(1).find((item) => item.includes('Ahmedabad Developer Club')) ?? '';
  assert.match(row, /<a href="https:\/\/ahmedabaddeveloperclub\.in\/"[^>]*>Ahmedabad Developer Club<\/a>/);
  assert.match(row, /<p class="quiet"[^>]*>[^<]+<\/p>/);
});

test('community lists no talks, since they have their own page', async () => {
  const section = sectionOf(await ossHtml(), 'community');
  assert.doesNotMatch(section, /Speaker|\/speaking\//);
});

test('a project link says where it goes: Aether links to its docs, not a live site', async () => {
  const html = await readDist('projects/aether-gateway/index.html');
  assert.match(html, /<a href="https:\/\/ashish-codejourney\.github\.io\/aether-gateway\/"[^>]*>Read the documentation<\/a>/);
  assert.doesNotMatch(html, /Visit the live site/);
});
