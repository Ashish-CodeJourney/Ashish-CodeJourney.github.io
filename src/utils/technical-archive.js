const newestFirst = (a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title);

const yearOf = (post) => post.date.slice(0, 4);

export const groupByYear = (posts) =>
  [...posts].sort(newestFirst).reduce((groups, post) => {
    const last = groups.at(-1);
    return last?.year === yearOf(post)
      ? [...groups.slice(0, -1), { ...last, posts: [...last.posts, post] }]
      : [...groups, { year: yearOf(post), posts: [post] }];
  }, []);

const countTags = (posts) =>
  posts
    .flatMap((post) => [...new Set(post.tags.map((tag) => tag.toLowerCase()))])
    .reduce((counts, tag) => ({ ...counts, [tag]: (counts[tag] ?? 0) + 1 }), {});

export const tagCounts = ({ posts, min }) =>
  Object.entries(countTags(posts))
    .map(([tag, count]) => ({ tag, count }))
    .filter(({ count }) => count >= min)
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

const toEntry = ({ depth, slug, text }) => ({ depth, slug, text, children: [] });

export const nestHeadings = (headings) =>
  headings
    .filter(({ depth }) => depth === 2 || depth === 3)
    .reduce((toc, heading) => {
      const parent = toc.at(-1);
      return heading.depth === 3 && parent
        ? [...toc.slice(0, -1), { ...parent, children: [...parent.children, toEntry(heading)] }]
        : [...toc, toEntry(heading)];
    }, []);

export const neighbours = ({ posts, id }) => {
  const sorted = [...posts].sort(newestFirst);
  const index = sorted.findIndex((post) => post.id === id);
  if (index === -1) return { older: undefined, newer: undefined };
  return { older: sorted[index + 1], newer: index > 0 ? sorted[index - 1] : undefined };
};
