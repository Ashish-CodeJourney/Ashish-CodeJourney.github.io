import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPeriod, byNewestStart } from '../src/utils/resume.js';

const job = (overrides = {}) => ({ role: 'Software Crafter', start: '2024-09', ...overrides });

test('an ongoing role reads from its start month to present', () => {
  assert.equal(formatPeriod(job({ start: '2024-09' })), 'Sep 2024 to present');
});

test('a finished role reads from start month to end month', () => {
  assert.equal(formatPeriod(job({ start: '2024-01', end: '2024-07' })), 'Jan 2024 to Jul 2024');
});

test('year-only periods read as years', () => {
  assert.equal(formatPeriod(job({ start: '2022', end: '2024' })), '2022 to 2024');
});

test('roles are listed newest first, ongoing roles before finished ones that started later', () => {
  const ordered = [
    job({ role: 'Intern', start: '2024-01', end: '2024-07' }),
    job({ role: 'Client project', start: '2024-11' }),
    job({ role: 'Crafter', start: '2024-09' }),
  ].toSorted(byNewestStart);
  assert.deepEqual(ordered.map(({ role }) => role), ['Client project', 'Crafter', 'Intern']);
});

test('file sizes read in whole kilobytes', async () => {
  const { formatFileSize } = await import('../src/utils/resume.js');
  assert.equal(formatFileSize(128186), '125 KB');
  assert.equal(formatFileSize(900), '1 KB');
});

test('file sizes over a megabyte read in megabytes with one decimal', async () => {
  const { formatFileSize } = await import('../src/utils/resume.js');
  assert.equal(formatFileSize(1572864), '1.5 MB');
});
