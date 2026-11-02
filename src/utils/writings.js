const newestFirst = (essays) => [...essays].sort((a, b) => b.date.localeCompare(a.date));

const yearOf = (essay) => essay.date.slice(0, 4);

export const groupByYear = (essays) =>
  newestFirst(essays).reduce((groups, essay) => {
    const year = yearOf(essay);
    const last = groups.at(-1);
    return last?.year === year
      ? [...groups.slice(0, -1), { year, essays: [...last.essays, essay] }]
      : [...groups, { year, essays: [essay] }];
  }, []);

export const neighbours = ({ essays, href }) => {
  const sorted = newestFirst(essays);
  const index = sorted.findIndex((essay) => essay.href === href);
  if (index === -1) return { older: undefined, newer: undefined };
  return { older: sorted[index + 1], newer: index > 0 ? sorted[index - 1] : undefined };
};
