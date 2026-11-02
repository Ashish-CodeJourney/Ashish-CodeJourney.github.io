import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseOssFile,
  featuredProjects,
  listedRepos,
  notableProjects,
  formatStars,
  starsLabel,
  firstSentence,
  contributingLede,
} from '../src/utils/featured.js';

const SUMMARY = 'I own the documentation and fix bugs in the code.';

const listing = ({ repo = 'christianhujer/aceunit', name, url, description, role = 'Core contributor', summary = SUMMARY } = {}) => ({
  repo,
  name,
  url,
  description,
  role,
  summary,
});

const ossFile = ({ ownProjects = [listing({ repo: 'Ashish-CodeJourney/satteri-plugins', role: 'Creator and maintainer' })], contributions = [listing()] } = {}) => ({
  ownProjects,
  contributions,
});

const repoDetails = ({ name = 'christianhujer/aceunit', description = 'A comfortable C unit test framework.' } = {}) => ({
  repo: name,
  url: `https://github.com/${name}`,
  description,
  language: 'C',
  stars: 51,
  topics: [],
  pushedAt: '2026-10-01',
  fork: false,
  archived: false,
});

const project = ({
  key = 'christianhujer/aceunit',
  owner = 'christianhujer',
  name = 'aceunit',
  url = 'https://github.com/christianhujer/aceunit',
  description = 'A comfortable C unit test framework.',
  role = 'Core contributor',
  summary = SUMMARY,
} = {}) => ({ key, owner, name, url, description, role, summary });

const onlyContribution = (overrides) => parseOssFile(ossFile({ ownProjects: [], contributions: [listing(overrides)] })).contributions;

test('parseOssFile reads my own projects and my contributions in file order', () => {
  const file = parseOssFile(
    ossFile({ contributions: [listing(), listing({ repo: '', name: 'ReqCover', url: 'https://reqcover.dev' })] }),
  );

  assert.deepEqual(file.ownProjects.map((entry) => entry.repo), ['Ashish-CodeJourney/satteri-plugins']);
  assert.deepEqual(file.contributions.map((entry) => entry.repo ?? entry.name), ['christianhujer/aceunit', 'ReqCover']);
});

test('parseOssFile treats blank text fields as missing', () => {
  const [entry] = onlyContribution({ repo: '', name: 'ReqCover', url: ' ', summary: '' });

  assert.deepEqual(entry, { name: 'ReqCover', role: 'Core contributor' });
});

test('parseOssFile treats a missing list as empty', () => {
  assert.deepEqual(parseOssFile({ contributions: [listing()] }).ownProjects, []);
});

test('parseOssFile gives empty lists when there is no file', () => {
  assert.deepEqual(parseOssFile(undefined), { ownProjects: [], contributions: [], notable: [] });
});

test('parseOssFile rejects an entry with neither a repository nor a name', () => {
  assert.throws(() => parseOssFile(ossFile({ contributions: [listing({ repo: '', name: '' })] })), /content\/oss\.json/);
});

test('parseOssFile rejects an entry without a role', () => {
  assert.throws(() => parseOssFile({ contributions: [{ repo: 'a/b' }] }), /content\/oss\.json/);
});

test('listedRepos gives every GitHub repository named in the file, once each', () => {
  const file = parseOssFile(
    ossFile({ contributions: [listing(), listing({ repo: '', name: 'ReqCover' }), listing({ repo: 'Ashish-CodeJourney/satteri-plugins' })] }),
  );

  assert.deepEqual(listedRepos(file), ['Ashish-CodeJourney/satteri-plugins', 'christianhujer/aceunit']);
});

test('featuredProjects describes a repository from its GitHub details with my role and summary', () => {
  assert.deepEqual(featuredProjects({ entries: onlyContribution(), repos: [repoDetails()] }), [project()]);
});

test('featuredProjects prefers the name, url and description written in the file', () => {
  const entries = onlyContribution({ name: 'AceUnit', url: 'https://aceunit.org', description: 'Unit testing for embedded C.' });

  assert.deepEqual(featuredProjects({ entries, repos: [repoDetails()] }), [
    project({ owner: null, name: 'AceUnit', url: 'https://aceunit.org', description: 'Unit testing for embedded C.' }),
  ]);
});

test('featuredProjects matches repository details regardless of letter case', () => {
  const [result] = featuredProjects({ entries: onlyContribution({ repo: 'ChristianHujer/AceUnit' }), repos: [repoDetails()] });

  assert.equal(result.description, 'A comfortable C unit test framework.');
});

test('featuredProjects still lists a repository whose details are missing, linking to it on GitHub', () => {
  const entries = onlyContribution({ repo: 'felixicaza/satteri-plugins', role: 'Contributor', summary: '' });

  assert.deepEqual(featuredProjects({ entries, repos: [] }), [
    project({
      key: 'felixicaza/satteri-plugins',
      owner: 'felixicaza',
      name: 'satteri-plugins',
      url: 'https://github.com/felixicaza/satteri-plugins',
      description: null,
      role: 'Contributor',
      summary: null,
    }),
  ]);
});

test('featuredProjects lists a project without a repository by its name, unlinked when there is no url', () => {
  const entries = onlyContribution({ repo: '', name: 'ReqCover', url: '' });

  assert.deepEqual(featuredProjects({ entries, repos: [] }), [
    project({ key: 'ReqCover', owner: null, name: 'ReqCover', url: null, description: null }),
  ]);
});

test('featuredProjects keeps the file order', () => {
  const entries = parseOssFile(ossFile({ contributions: [listing({ repo: 'z/last' }), listing({ repo: 'a/first' })] })).contributions;

  assert.deepEqual(featuredProjects({ entries, repos: [] }).map((item) => item.key), ['z/last', 'a/first']);
});

const notable = ({ name = 'WireMock', repo = 'wiremock/wiremock', url = 'https://wiremock.org', description, showStars } = {}) => ({
  name,
  repo,
  url,
  description,
  showStars,
});

const notableFile = (entries) => parseOssFile({ ...ossFile(), notable: entries });

test('parseOssFile reads the notable projects in file order', () => {
  const file = notableFile([notable(), notable({ name: 'Zod', repo: 'colinhacks/zod', url: 'https://zod.dev' })]);

  assert.deepEqual(file.notable, [
    { name: 'WireMock', repo: 'wiremock/wiremock', url: 'https://wiremock.org' },
    { name: 'Zod', repo: 'colinhacks/zod', url: 'https://zod.dev' },
  ]);
});

test('parseOssFile needs a name and a repository for every notable project', () => {
  assert.throws(() => notableFile([notable({ name: '' })]), /content\/oss\.json/);
  assert.throws(() => notableFile([notable({ repo: '' })]), /content\/oss\.json/);
});

test('parseOssFile treats missing notable projects as none', () => {
  assert.deepEqual(parseOssFile(ossFile()).notable, []);
});

test('listedRepos includes the notable repositories', () => {
  const file = notableFile([notable()]);

  assert.deepEqual(listedRepos(file), ['Ashish-CodeJourney/satteri-plugins', 'christianhujer/aceunit', 'wiremock/wiremock']);
});

test('notableProjects names and links each project with the first sentence of its GitHub description and its stars', () => {
  const repos = [{ ...repoDetails({ name: 'mdn/content', description: 'The official source for MDN content. Home to 14,000 pages.' }), stars: 11120 }];
  const file = notableFile([notable({ name: 'MDN Web Docs', repo: 'mdn/content', url: 'https://developer.mozilla.org' })]);

  assert.deepEqual(notableProjects({ entries: file.notable, repos }), [
    {
      key: 'mdn/content',
      name: 'MDN Web Docs',
      url: 'https://developer.mozilla.org',
      description: 'The official source for MDN content.',
      stars: 11120,
    },
  ]);
});

test('notableProjects prefers a description written in the file', () => {
  const file = notableFile([notable({ repo: 'akash-network/website', description: 'Decentralised cloud compute marketplace.' })]);

  const [result] = notableProjects({ entries: file.notable, repos: [repoDetails({ name: 'akash-network/website' })] });

  assert.equal(result.description, 'Decentralised cloud compute marketplace.');
});

test('notableProjects still lists a project whose details are missing', () => {
  const file = notableFile([notable({ url: '' })]);

  assert.deepEqual(notableProjects({ entries: file.notable, repos: [] }), [
    { key: 'wiremock/wiremock', name: 'WireMock', url: 'https://github.com/wiremock/wiremock', description: null, stars: null },
  ]);
});

test('notableProjects keeps the file order', () => {
  const file = notableFile([notable({ repo: 'z/last' }), notable({ repo: 'a/first' })]);

  assert.deepEqual(notableProjects({ entries: file.notable, repos: [] }).map((item) => item.key), ['z/last', 'a/first']);
});

test('firstSentence keeps only the first sentence', () => {
  assert.equal(firstSentence('The official source. Home to 14,000 pages! More.'), 'The official source.');
  assert.equal(firstSentence('Is it fast? Yes.'), 'Is it fast?');
});

test('firstSentence ends a sentence that has no closing punctuation with a full stop', () => {
  assert.equal(firstSentence('A tool for mocking HTTP services'), 'A tool for mocking HTTP services.');
  assert.equal(firstSentence('Repo for the Akash Network Website. '), 'Repo for the Akash Network Website.');
});

test('firstSentence keeps text that is a single sentence', () => {
  assert.equal(firstSentence('Used in e.g. embedded software. More.'), 'Used in e.g. embedded software.');
  assert.equal(firstSentence('  Trimmed.  '), 'Trimmed.');
});

test('formatStars writes counts under a thousand as they are', () => {
  assert.equal(formatStars(0), '0');
  assert.equal(formatStars(999), '999');
});

test('formatStars shortens thousands to one decimal place', () => {
  assert.equal(formatStars(11120), '11.1k');
  assert.equal(formatStars(1000), '1k');
  assert.equal(formatStars(2960), '3k');
});

test('formatStars shortens millions, including counts that round up to a million', () => {
  assert.equal(formatStars(1_250_000), '1.3m');
  assert.equal(formatStars(999_960), '1m');
});

test('starsLabel names the star count', () => {
  assert.equal(starsLabel(11120), '11.1k stars');
  assert.equal(starsLabel(1), '1 star');
});

test('contributingLede counts the core projects in words and mentions the well-known ones', () => {
  assert.equal(
    contributingLede({ core: 2, notable: 5 }),
    'I contribute to open source regularly: as a core contributor to two projects, and with changes merged into some well-known ones.',
  );
});

test('contributingLede uses words up to nine and digits after', () => {
  assert.match(contributingLede({ core: 1, notable: 1 }), /core contributor to one project,/);
  assert.match(contributingLede({ core: 9, notable: 1 }), /core contributor to nine projects,/);
  assert.match(contributingLede({ core: 10, notable: 1 }), /core contributor to 10 projects,/);
});

test('contributingLede mentions only what there is', () => {
  assert.equal(contributingLede({ core: 2, notable: 0 }), 'I contribute to open source regularly, as a core contributor to two projects.');
  assert.equal(
    contributingLede({ core: 0, notable: 3 }),
    'I contribute to open source regularly, with changes merged into some well-known projects.',
  );
  assert.equal(contributingLede({ core: 0, notable: 0 }), null);
});

test('notableProjects hides stars when the file says the repo count would mislead', () => {
  const file = notableFile([notable({ repo: 'akash-network/website', showStars: false })]);

  const [result] = notableProjects({ entries: file.notable, repos: [{ ...repoDetails({ name: 'akash-network/website' }), stars: 158 }] });

  assert.equal(result.stars, null);
});
