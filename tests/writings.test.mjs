import test from 'node:test';
import assert from 'node:assert/strict';
import { groupByYear, neighbours } from '../src/utils/writings.js';

const essay = (overrides = {}) => ({
  href: '/writings/sea/',
  title: 'The sea',
  date: '2026-01-01',
  ...overrides,
});

test('no essays means no year groups', () => {
  assert.deepEqual(groupByYear([]), []);
});

test('essays are grouped under their year, newest year first', () => {
  const groups = groupByYear([
    essay({ title: 'Old', date: '2024-03-01' }),
    essay({ title: 'New', date: '2026-07-01' }),
    essay({ title: 'Older this year', date: '2026-02-01' }),
  ]);

  assert.deepEqual(
    groups.map(({ year, essays }) => ({ year, titles: essays.map((item) => item.title) })),
    [
      { year: '2026', titles: ['New', 'Older this year'] },
      { year: '2024', titles: ['Old'] },
    ],
  );
});

test('grouping leaves the given list untouched', () => {
  const essays = Object.freeze([essay({ date: '2024-01-01' }), essay({ date: '2026-01-01' })]);
  groupByYear(essays);
  assert.deepEqual(
    essays.map((item) => item.date),
    ['2024-01-01', '2026-01-01'],
  );
});

const shelf = [
  essay({ href: '/writings/middle/', title: 'Middle', date: '2025-05-05' }),
  essay({ href: '/writings/newest/', title: 'Newest', date: '2026-09-01' }),
  essay({ href: '/writings/oldest/', title: 'Oldest', date: '2024-01-01' }),
];

test('an essay in the middle has an older and a newer neighbour', () => {
  const { older, newer } = neighbours({ essays: shelf, href: '/writings/middle/' });
  assert.equal(older?.title, 'Oldest');
  assert.equal(newer?.title, 'Newest');
});

test('the newest essay has nothing newer', () => {
  const { older, newer } = neighbours({ essays: shelf, href: '/writings/newest/' });
  assert.equal(older?.title, 'Middle');
  assert.equal(newer, undefined);
});

test('the oldest essay has nothing older', () => {
  const { older, newer } = neighbours({ essays: shelf, href: '/writings/oldest/' });
  assert.equal(older, undefined);
  assert.equal(newer?.title, 'Middle');
});

test('an unknown essay has no neighbours', () => {
  assert.deepEqual(neighbours({ essays: shelf, href: '/writings/missing/' }), {
    older: undefined,
    newer: undefined,
  });
});
