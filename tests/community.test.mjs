import test from 'node:test';
import assert from 'node:assert/strict';
import { monthYear, communityRows, communityNotes, describeWhen, roleLine } from '../src/utils/community.js';

const entry = ({
  title = 'Core team member',
  organisation = 'Open Source Community Ahmedabad',
  role = 'organiser',
  date = '2025-09-01',
  endDate,
  location,
  url,
  description,
  order,
  note,
  communities,
} = {}) => ({ title, organisation, role, date, endDate, location, url, description, order, note, communities });

const undatedEntry = (overrides = {}) => {
  const { date: _date, ...undated } = entry(overrides);
  return undated;
};

const row = ({
  title = 'Core team member',
  role = 'organiser',
  organisation = 'Open Source Community Ahmedabad',
  start = '2025-09-01',
  end = null,
  location = null,
  description = null,
  href = null,
  order = null,
} = {}) => ({ title, role, organisation, start, end, location, description, href, order });

test('monthYear writes a day as its month and year', () => {
  assert.equal(monthYear('2024-06-15'), 'June 2024');
  assert.equal(monthYear('2025-01-01'), 'January 2025');
});

test('communityRows keeps the details of a community entry, linking to its url', () => {
  const [result] = communityRows({
    entries: [
      entry({
        role: 'volunteer',
        endDate: '2026-03-01',
        location: 'Ahmedabad',
        url: 'https://example.org',
        description: 'Ran the registration desk.',
      }),
    ],
  });

  assert.deepEqual(
    result,
    row({
      role: 'volunteer',
      end: '2026-03-01',
      location: 'Ahmedabad',
      description: 'Ran the registration desk.',
      href: 'https://example.org',
    }),
  );
});

test('communityRows lists ongoing roles first, then the rest by when they ended, newest first', () => {
  const rows = communityRows({
    entries: [
      entry({ title: 'Finished long ago', date: '2023-01-01', endDate: '2023-06-01' }),
      entry({ title: 'Ongoing', date: '2024-01-01' }),
      entry({ title: 'Finished recently', date: '2022-01-01', endDate: '2026-10-01' }),
    ],
  });

  assert.deepEqual(rows.map((item) => item.title), ['Ongoing', 'Finished recently', 'Finished long ago']);
});

test('communityRows orders several ongoing roles by when they started, newest first', () => {
  const rows = communityRows({
    entries: [entry({ title: 'Older', date: '2023-01-01' }), entry({ title: 'Newer', date: '2025-01-01' })],
  });

  assert.deepEqual(rows.map((item) => item.title), ['Newer', 'Older']);
});

test('communityRows lists undated roles first, organisers before volunteers, then dated rows', () => {
  const rows = communityRows({
    entries: [
      undatedEntry({ title: 'Volunteer', role: 'volunteer' }),
      entry({ title: 'Ongoing', date: '2024-01-01' }),
      undatedEntry({ title: 'Core team member', role: 'organiser' }),
    ],
  });

  assert.deepEqual(rows.map((item) => item.title), ['Core team member', 'Volunteer', 'Ongoing']);
});

test('communityRows orders undated roles organiser, maintainer, mentor, then volunteer', () => {
  const rows = communityRows({
    entries: [
      undatedEntry({ title: 'D', role: 'volunteer' }),
      undatedEntry({ title: 'C', role: 'mentor' }),
      undatedEntry({ title: 'B', role: 'maintainer' }),
      undatedEntry({ title: 'A', role: 'organiser' }),
    ],
  });

  assert.deepEqual(rows.map((item) => item.role), ['organiser', 'maintainer', 'mentor', 'volunteer']);
});

test('communityRows keeps an undated entry undated', () => {
  const [result] = communityRows({ entries: [undatedEntry()] });

  assert.deepEqual([result.start, result.end], [null, null]);
});

test('communityRows gives an empty list when there is nothing to show', () => {
  assert.deepEqual(communityRows({ entries: [] }), []);
});

test('describeWhen says since when a role is ongoing', () => {
  assert.equal(describeWhen(row({ start: '2025-09-01', end: null })), 'Since September 2025');
});

test('describeWhen gives a month range for a role that has ended', () => {
  assert.equal(describeWhen(row({ start: '2025-09-01', end: '2026-03-01' })), 'September 2025 to March 2026');
});

test('describeWhen names the month for a role that started and ended within it', () => {
  assert.equal(describeWhen(row({ start: '2025-09-01', end: '2025-09-20' })), 'September 2025');
});

test('describeWhen says nothing for an undated role', () => {
  assert.equal(describeWhen(row({ start: null, end: null })), null);
});

test('describeWhen gives the full date for a one-day event', () => {
  assert.equal(describeWhen(row({ start: '2026-09-26', end: '2026-09-26' })), 'September 26, 2026');
});

test('roleLine uses my own words for a community role, and where when there is a location', () => {
  assert.equal(roleLine(row({ title: 'Core team member', role: 'organiser', location: 'Ahmedabad' })), 'Core team member in Ahmedabad');
  assert.equal(roleLine(row({ title: 'Maintainer', role: 'maintainer' })), 'Maintainer');
});

test('roleLine names no role when I left the title empty', () => {
  assert.equal(roleLine(row({ title: '', role: 'volunteer' })), null);
  assert.equal(roleLine(row({ title: ' ', role: 'volunteer', location: 'Ahmedabad' })), 'Ahmedabad');
});

test('communityRows puts entries with an explicit order first, in that order', () => {
  const rows = communityRows({
    entries: [
      undatedEntry({ organisation: 'Ahmedabad Developer Club', role: 'organiser', order: 3 }),
      undatedEntry({ organisation: 'WeDoTDD', role: 'maintainer', order: 1 }),
      undatedEntry({ organisation: 'Local meetups', role: 'volunteer' }),
      undatedEntry({ organisation: 'Open Source Weekend', role: 'organiser', order: 2 }),
    ],
  });
  assert.deepEqual(
    rows.map(({ organisation }) => organisation),
    ['WeDoTDD', 'Open Source Weekend', 'Ahmedabad Developer Club', 'Local meetups'],
  );
});


test('communityRows leaves out entries written as a note', () => {
  const rows = communityRows({ entries: [undatedEntry({ organisation: 'WeDoTDD' }), undatedEntry({ organisation: 'Local meetups', note: true })] });
  assert.deepEqual(rows.map(({ organisation }) => organisation), ['WeDoTDD']);
});

test('communityNotes gives each note its community names and text, in order', () => {
  const notes = communityNotes([
    undatedEntry({ note: true, order: 2, description: 'Second.' }),
    undatedEntry({ organisation: 'A row' }),
    undatedEntry({ note: true, order: 1, description: 'First.', communities: ['GDG', 'JUG'] }),
  ]);
  assert.deepEqual(notes, [
    { communities: ['GDG', 'JUG'], description: 'First.' },
    { communities: [], description: 'Second.' },
  ]);
});

test('communityNotes skips a note with nothing to say', () => {
  assert.deepEqual(communityNotes([undatedEntry({ note: true, description: undefined })]), []);
});
