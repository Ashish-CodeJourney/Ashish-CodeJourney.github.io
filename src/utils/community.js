const MONTH_YEAR = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

const FULL_DATE = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export const monthYear = (date) => MONTH_YEAR.format(new Date(`${date.slice(0, 7)}-01T00:00:00Z`));

const fromEntry = (entry) => ({
  title: entry.title,
  role: entry.role,
  organisation: entry.organisation,
  start: entry.date ?? null,
  end: entry.endDate ?? null,
  location: entry.location ?? null,
  description: entry.description ?? null,
  href: entry.url ?? null,
  order: entry.order ?? null,
});

const ONGOING = '9999-12-31';

const ROLE_ORDER = ['organiser', 'maintainer', 'mentor', 'volunteer', 'contributor', 'speaker', 'attendee'];

const undatedFirst = (a, b) => Number(a.start !== null) - Number(b.start !== null);

const byRole = (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role);

const byRecency = (a, b) =>
  (b.end ?? ONGOING).localeCompare(a.end ?? ONGOING) || (b.start ?? '').localeCompare(a.start ?? '');

const explicitOrderFirst = (a, b) => {
  if (a.order === null && b.order === null) return 0;
  if (a.order === null) return 1;
  if (b.order === null) return -1;
  return a.order - b.order;
};

const newestFirst = (a, b) =>
  explicitOrderFirst(a, b) ||
  undatedFirst(a, b) || (a.start === null ? byRole(a, b) : byRecency(a, b)) || a.title.localeCompare(b.title);

const isNote = (entry) => entry.note === true;

export const communityRows = ({ entries }) => entries.filter((entry) => !isNote(entry)).map(fromEntry).toSorted(newestFirst);

export const communityNotes = (entries) =>
  entries
    .filter(isNote)
    .toSorted((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
    .flatMap((entry) => (entry.description ? [{ communities: entry.communities ?? [], description: entry.description }] : []));

export const describeWhen = ({ start, end }) => {
  if (start === null) return null;
  if (end === null) return `Since ${monthYear(start)}`;
  if (start === end) return FULL_DATE.format(new Date(`${start}T00:00:00Z`));
  if (start.slice(0, 7) === end.slice(0, 7)) return monthYear(start);
  return `${monthYear(start)} to ${monthYear(end)}`;
};


export const roleLine = (row) => {
  const words = row.title.trim();
  if (!words) return row.location ?? null;
  return row.location ? `${words} in ${row.location}` : words;
};

