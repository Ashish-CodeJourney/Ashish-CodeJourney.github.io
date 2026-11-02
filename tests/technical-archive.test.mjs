import test from 'node:test';
import assert from 'node:assert/strict';
import { groupByYear, tagCounts, nestHeadings, neighbours } from '../src/utils/technical-archive.js';

const post = (overrides = {}) => ({ id: 'a-post', title: 'A post', date: '2026-01-01', tags: [], ...overrides });

const heading = (depth, text) => ({ depth, text, slug: text.toLowerCase().replace(/\s+/g, '-') });

test('no posts means no years', () => {
  assert.deepEqual(groupByYear([]), []);
});

test('posts are grouped under their year, newest year first', () => {
  const years = groupByYear([
    post({ id: 'old', date: '2024-06-20' }),
    post({ id: 'new', date: '2026-08-04' }),
    post({ id: 'mid', date: '2025-11-24' }),
  ]);

  assert.deepEqual(years.map((group) => group.year), ['2026', '2025', '2024']);
});

test('within a year the newest post comes first', () => {
  const [year] = groupByYear([
    post({ id: 'june', date: '2024-06-20' }),
    post({ id: 'august', date: '2024-08-09' }),
    post({ id: 'july', date: '2024-07-16' }),
  ]);

  assert.deepEqual(year.posts.map((p) => p.id), ['august', 'july', 'june']);
});

test('grouping does not reorder the posts it was given', () => {
  const posts = [post({ id: 'a', date: '2024-01-01' }), post({ id: 'b', date: '2026-01-01' })];
  groupByYear(posts);
  assert.deepEqual(posts.map((p) => p.id), ['a', 'b']);
});

test('tags are counted across posts, most used first', () => {
  const counts = tagCounts({
    posts: [
      post({ tags: ['linux', 'dotfiles'] }),
      post({ tags: ['linux'] }),
      post({ tags: ['linux', 'dotfiles', 'zsh'] }),
    ],
    min: 1,
  });

  assert.deepEqual(counts, [
    { tag: 'linux', count: 3 },
    { tag: 'dotfiles', count: 2 },
    { tag: 'zsh', count: 1 },
  ]);
});

test('tags with the same count are listed alphabetically', () => {
  const counts = tagCounts({ posts: [post({ tags: ['webdev', 'astro'] })], min: 1 });
  assert.deepEqual(counts.map((c) => c.tag), ['astro', 'webdev']);
});

test('tags used fewer times than the minimum are left out', () => {
  const counts = tagCounts({
    posts: [post({ tags: ['linux', 'zsh'] }), post({ tags: ['linux'] })],
    min: 2,
  });

  assert.deepEqual(counts, [{ tag: 'linux', count: 2 }]);
});

test('tags are counted case-insensitively', () => {
  const counts = tagCounts({ posts: [post({ tags: ['Linux'] }), post({ tags: ['linux'] })], min: 1 });
  assert.deepEqual(counts, [{ tag: 'linux', count: 2 }]);
});

test('table of contents nests subsections under their section', () => {
  const toc = nestHeadings([
    heading(2, 'Setup'),
    heading(3, 'Install'),
    heading(3, 'Configure'),
    heading(2, 'Results'),
  ]);

  assert.deepEqual(
    toc.map((item) => [item.text, item.children.map((child) => child.text)]),
    [
      ['Setup', ['Install', 'Configure']],
      ['Results', []],
    ],
  );
});

test('table of contents keeps the heading anchor', () => {
  const [item] = nestHeadings([{ depth: 2, text: 'Why bother?', slug: 'why-bother' }]);
  assert.equal(item.slug, 'why-bother');
});

test('table of contents skips headings deeper than h3 and the title', () => {
  const toc = nestHeadings([heading(1, 'Title'), heading(2, 'Setup'), heading(4, 'Detail')]);
  assert.deepEqual(toc.map((item) => [item.text, item.children.length]), [['Setup', 0]]);
});

test('subsections before any section are listed as sections', () => {
  const toc = nestHeadings([heading(3, 'Intro'), heading(2, 'Setup')]);
  assert.deepEqual(toc.map((item) => item.text), ['Intro', 'Setup']);
});

test('the oldest post has a newer neighbour but no older one', () => {
  const posts = [post({ id: 'new', date: '2026-01-01' }), post({ id: 'old', date: '2024-01-01' })];
  const { older, newer } = neighbours({ posts, id: 'old' });
  assert.equal(older, undefined);
  assert.equal(newer?.id, 'new');
});

test('a middle post links to the posts either side of it by date', () => {
  const posts = [
    post({ id: 'old', date: '2024-01-01' }),
    post({ id: 'new', date: '2026-01-01' }),
    post({ id: 'mid', date: '2025-01-01' }),
  ];
  const { older, newer } = neighbours({ posts, id: 'mid' });
  assert.equal(older?.id, 'old');
  assert.equal(newer?.id, 'new');
});

test('the newest post has an older neighbour but no newer one', () => {
  const posts = [post({ id: 'new', date: '2026-01-01' }), post({ id: 'old', date: '2024-01-01' })];
  const { older, newer } = neighbours({ posts, id: 'new' });
  assert.equal(older?.id, 'old');
  assert.equal(newer, undefined);
});
