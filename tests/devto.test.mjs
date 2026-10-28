import test from 'node:test';
import assert from 'node:assert/strict';
import devto from '../src/utils/devto.js';

const { toPostEntry, isPublishedLocally, loadDevtoEntries, fetchJsonWithRetry } = devto;

const USERNAME = 'ashish-codejourney';

const article = (overrides = {}) => ({
  id: 4158532,
  title: 'Dot files two years later...',
  description: 'Shell config after two years',
  published_at: '2026-07-16T12:35:21Z',
  path: `/${USERNAME}/dot-files-two-years-later-2d1o`,
  tag_list: ['dotfiles', 'linux'],
  cover_image: 'https://media.dev.to/banner.png',
  ...overrides,
});

const localPost = (id, title) => ({ id, data: { title } });

const DEVTO_OVERRIDES = { 4158532: 'dot-files-two-years-later' };

test('toPostEntry maps a dev.to article onto the technical post shape', () => {
  assert.deepEqual(toPostEntry(article(), '# Body'), {
    id: 'dot-files-two-years-later-2d1o',
    data: {
      title: 'Dot files two years later...',
      date: '2026-07-16',
      description: 'Shell config after two years',
      tags: ['dotfiles', 'linux'],
    },
    body: '# Body',
  });
});

test('toPostEntry uses the given id so mapped articles keep their existing URL', () => {
  const entry = toPostEntry(article(), 'Body', 'dot-files-two-years-later');

  assert.equal(entry.id, 'dot-files-two-years-later');
});

test('toPostEntry does not carry the dev.to cover image over as a banner', () => {
  const entry = toPostEntry(article({ cover_image: 'https://media.dev.to/banner.png' }), 'Body');

  assert.equal(entry.data.banner, undefined);
});

test('isPublishedLocally treats a title differing only in case and punctuation as published', () => {
  const local = [localPost('astro-7-satteri-silent-bugs', "Astro 7 Renders Your Display Maths as a Code Block, and Won't Tell You")];
  const remote = article({
    title: "Astro 7 renders your display maths as a code block, and won't tell you",
    path: `/${USERNAME}/astro-7-renders-your-display-maths-cp0`,
  });

  assert.equal(isPublishedLocally(remote, local), true);
});

test('isPublishedLocally is false for a dev.to article with no local counterpart', () => {
  const local = [localPost('linux-terminal-setup', 'My Linux Terminal Setup')];

  assert.equal(isPublishedLocally(article(), local), false);
});

test('loadDevtoEntries returns only dev.to articles not already published locally', async () => {
  const brandNew = article({
    id: 5000001,
    title: 'Brand new article',
    path: `/${USERNAME}/brand-new-article-x1y2`,
  });
  const fetchJson = async (url) => {
    if (url.startsWith('https://dev.to/api/articles?')) {
      return [article(), brandNew];
    }
    return { body_markdown: 'Fresh body' };
  };
  const local = [localPost('linux-terminal-setup', 'My Linux Terminal Setup'), localPost('x', 'Brand new article')];

  const entries = await loadDevtoEntries({
    username: USERNAME,
    fetchJson,
    localEntries: local,
    overrides: DEVTO_OVERRIDES,
    snapshot: [],
    warn: () => {},
  });

  assert.deepEqual(
    entries.map((entry) => [entry.id, entry.body]),
    [
      ['dot-files-two-years-later', 'Fresh body'],
    ],
  );
});

test('loadDevtoEntries gives mapped articles their local id and unmapped ones their dev.to slug', async () => {
  const unmapped = article({
    id: 5000001,
    title: 'Brand new article',
    path: `/${USERNAME}/brand-new-article-x1y2`,
  });
  const fetchJson = async (url) =>
    url.startsWith('https://dev.to/api/articles?') ? [article(), unmapped] : { body_markdown: 'Body' };

  const entries = await loadDevtoEntries({
    username: USERNAME,
    fetchJson,
    localEntries: [],
    overrides: DEVTO_OVERRIDES,
    snapshot: [],
    warn: () => {},
  });

  assert.deepEqual(
    entries.map((entry) => entry.id),
    ['dot-files-two-years-later', 'brand-new-article-x1y2'],
  );
});

test('loadDevtoEntries falls back to the snapshot and warns when dev.to is unreachable', async () => {
  const warnings = [];
  const snapshot = [{ id: 'cached-post', data: { title: 'Cached' }, body: 'Old body' }];

  const entries = await loadDevtoEntries({
    username: USERNAME,
    fetchJson: async () => {
      throw new Error('network down');
    },
    localEntries: [],
    overrides: {},
    snapshot,
    warn: (message) => warnings.push(message),
  });

  assert.deepEqual(entries, snapshot);
  assert.deepEqual(warnings, ['dev.to articles skipped: network down']);
});

test('fetchJsonWithRetry retries a rate-limited request until it succeeds', async () => {
  const statuses = [429, 429, 200];
  const requested = [];
  const sleeps = [];
  const fetch = async (url) => {
    requested.push(url);
    const status = statuses.shift();
    return {
      ok: status === 200,
      status,
      json: async () => ({ ok: true }),
    };
  };

  const result = await fetchJsonWithRetry('https://dev.to/api/articles', {
    fetch,
    sleep: async (ms) => sleeps.push(ms),
  });

  assert.deepEqual(result, { ok: true });
  assert.equal(requested.length, 3);
  assert.equal(sleeps.length, 2);
});

test('fetchJsonWithRetry throws on a non-rate-limit error without retrying', async () => {
  const fetch = async () => ({ ok: false, status: 500, json: async () => ({}) });

  await assert.rejects(
    fetchJsonWithRetry('https://dev.to/api/articles', { fetch, sleep: async () => {} }),
    /500 from https:\/\/dev\.to\/api\/articles/,
  );
});
