import test from 'node:test';
import assert from 'node:assert/strict';
import github, { GITHUB_USERNAME } from '../src/utils/github.js';

const {
  fetchJsonWithRetry,
  repoApiUrl,
  toRepo,
  linkForOwnRepo,
  normaliseSnapshot,
  loadOssData,
} = github;

const response = (status, body = {}) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

test('GITHUB_USERNAME is the account whose repositories are listed', () => {
  assert.equal(GITHUB_USERNAME, 'Ashish-CodeJourney');
});

test('fetchJsonWithRetry sends GitHub API headers and the token when one is given', async () => {
  const seen = [];
  const fetch = async (_url, init) => {
    seen.push(init.headers);
    return response(200, { ok: true });
  };

  await fetchJsonWithRetry('https://api.github.com/search/issues', { fetch, token: 'secret' });

  assert.equal(seen[0].Accept, 'application/vnd.github+json');
  assert.equal(seen[0].Authorization, 'Bearer secret');
  assert.ok(seen[0]['User-Agent']);
});

test('fetchJsonWithRetry sends no Authorization header without a token', async () => {
  const seen = [];
  const fetch = async (_url, init) => {
    seen.push(init.headers);
    return response(200, {});
  };

  await fetchJsonWithRetry('https://api.github.com/search/issues', { fetch });

  assert.equal('Authorization' in seen[0], false);
});

test('fetchJsonWithRetry retries rate-limited requests with a growing delay until one succeeds', async () => {
  const statuses = [403, 429, 200];
  const sleeps = [];
  const fetch = async () => response(statuses.shift(), { ok: true });

  const result = await fetchJsonWithRetry('https://api.github.com/search/issues', {
    fetch,
    sleep: async (ms) => sleeps.push(ms),
    delayMs: 100,
  });

  assert.deepEqual(result, { ok: true });
  assert.deepEqual(sleeps, [100, 200]);
});

test('fetchJsonWithRetry gives up after the last attempt', async () => {
  const fetch = async () => response(429);

  await assert.rejects(
    fetchJsonWithRetry('https://api.github.com/search/issues', { fetch, sleep: async () => {}, attempts: 2 }),
    /429 from https:\/\/api\.github\.com\/search\/issues/,
  );
});

test('fetchJsonWithRetry throws on other errors without retrying', async () => {
  const requests = [];
  const fetch = async (url) => {
    requests.push(url);
    return response(422);
  };

  await assert.rejects(fetchJsonWithRetry('https://api.github.com/search/issues', { fetch, sleep: async () => {} }), /422/);
  assert.equal(requests.length, 1);
});

const apiRepo = ({
  fullName = 'Ashish-CodeJourney/satteri-plugins',
  description = 'Ports of remark plugins',
  language = 'TypeScript',
  stars = 11,
  topics = ['astro', 'markdown'],
  pushedAt = '2026-10-29T12:23:24Z',
  fork = false,
  archived = false,
} = {}) => ({
  full_name: fullName,
  html_url: `https://github.com/${fullName}`,
  description,
  language,
  stargazers_count: stars,
  topics,
  pushed_at: pushedAt,
  fork,
  archived,
  private: false,
  watchers_count: stars,
});

const repo = ({
  name = 'Ashish-CodeJourney/satteri-plugins',
  description = 'Ports of remark plugins',
  language = 'TypeScript',
  stars = 11,
  topics = ['astro', 'markdown'],
  pushedAt = '2026-10-29',
  fork = false,
  archived = false,
} = {}) => ({
  repo: name,
  url: `https://github.com/${name}`,
  description,
  language,
  stars,
  topics,
  pushedAt,
  fork,
  archived,
});

test('repoApiUrl points at the repository details endpoint', () => {
  assert.equal(repoApiUrl('wiremock/wiremock'), 'https://api.github.com/repos/wiremock/wiremock');
});

test('toRepo keeps the repository details the page shows, with the push day', () => {
  assert.deepEqual(toRepo(apiRepo()), repo());
});

test('toRepo treats missing topics and description as empty', () => {
  const mapped = toRepo({ ...apiRepo({ description: null }), topics: undefined });

  assert.equal(mapped.description, null);
  assert.deepEqual(mapped.topics, []);
});

test('toRepo drops emoji from the description so it reads as plain text', () => {
  assert.equal(toRepo(apiRepo({ description: '🚀✨ Help beginners contribute ' })).description, 'Help beginners contribute');
  assert.equal(toRepo(apiRepo({ description: '⚡️ Typing SVG' })).description, 'Typing SVG');
  assert.equal(toRepo(apiRepo({ description: '📝' })).description, null);
});

test('linkForOwnRepo links to the project page whose github link matches the repository', () => {
  const projects = [
    { href: '/projects/mindguard/', github: 'https://github.com/Ashish-CodeJourney/mindguard.git' },
    { href: '/projects/no-source/' },
  ];

  assert.equal(linkForOwnRepo({ url: 'https://github.com/Ashish-CodeJourney/MindGuard', projects }), '/projects/mindguard/');
});

test('linkForOwnRepo falls back to the repository on GitHub', () => {
  const projects = [{ href: '/projects/other/', github: 'https://github.com/Ashish-CodeJourney/other/' }];

  assert.equal(
    linkForOwnRepo({ url: 'https://github.com/Ashish-CodeJourney/satteri-plugins', projects }),
    'https://github.com/Ashish-CodeJourney/satteri-plugins',
  );
});

test('normaliseSnapshot keeps the repository details of the current snapshot', () => {
  const snapshot = { repos: [repo({ name: 'christianhujer/aceunit' }), repo()] };

  assert.deepEqual(normaliseSnapshot(snapshot), snapshot);
});

test('normaliseSnapshot reads older snapshots as having no repository details', () => {
  assert.deepEqual(normaliseSnapshot([{ repo: 'mdn/content', title: 'Fix a typo' }]), { repos: [] });
  assert.deepEqual(normaliseSnapshot({ ownRepos: [repo()] }), { repos: [] });
});

const githubApi = (details = {}) => {
  const requested = [];
  const fetchJson = async (url) => {
    requested.push(url);
    const name = url.split('/repos/')[1];
    if (!(name in details)) throw new Error(`404 from ${url}`);
    return details[name];
  };
  return { fetchJson, requested };
};

test('loadOssData fetches the details of every listed repository and nothing else', async () => {
  const { fetchJson, requested } = githubApi({
    'christianhujer/aceunit': apiRepo({ fullName: 'christianhujer/aceunit', language: 'C' }),
    'Ashish-CodeJourney/satteri-plugins': apiRepo(),
  });

  const data = await loadOssData({
    fetchJson,
    repos: ['Ashish-CodeJourney/satteri-plugins', 'christianhujer/aceunit'],
    snapshot: { repos: [] },
    warn: () => {},
  });

  assert.deepEqual(data, { repos: [repo(), repo({ name: 'christianhujer/aceunit', language: 'C' })] });
  assert.deepEqual(requested, [
    'https://api.github.com/repos/Ashish-CodeJourney/satteri-plugins',
    'https://api.github.com/repos/christianhujer/aceunit',
  ]);
});

test('loadOssData falls back to the snapshot and warns when a lookup fails', async () => {
  const warnings = [];
  const snapshot = { repos: [repo({ name: 'christianhujer/aceunit' })] };

  const data = await loadOssData({
    fetchJson: githubApi().fetchJson,
    repos: ['christianhujer/aceunit'],
    snapshot,
    warn: (message) => warnings.push(message),
  });

  assert.deepEqual(data, snapshot);
  assert.deepEqual(warnings, ['GitHub repository details skipped: 404 from https://api.github.com/repos/christianhujer/aceunit']);
});

test('loadOssData accepts the old array snapshot', async () => {
  const data = await loadOssData({
    fetchJson: async () => {
      throw new Error('offline');
    },
    repos: ['christianhujer/aceunit'],
    snapshot: [{ repo: 'mdn/content' }],
    warn: () => {},
  });

  assert.deepEqual(data, { repos: [] });
});
