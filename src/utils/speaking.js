const tally = (counts, tag) => {
  const key = tag.toLowerCase();
  const existing = counts.get(key);
  return new Map(counts).set(key, { name: existing?.name ?? tag, count: (existing?.count ?? 0) + 1 });
};

const byCountThenName = (a, b) => b.count - a.count || a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });

export const topicsFromTalks = (talks) =>
  [
    ...talks
      .flatMap((talk) => talk.tags.map((tag) => tag.trim()))
      .filter((tag) => tag.length > 0)
      .reduce(tally, new Map())
      .values(),
  ]
    .sort(byCountThenName)
    .map((topic) => topic.name);

export const inviteMailto = ({ email, subject }) => `mailto:${email}?subject=${encodeURIComponent(subject)}`;

export const isPastEvent = ({ date, today }) => date < today.toISOString().slice(0, 10);
