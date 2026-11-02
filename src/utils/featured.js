import { z } from 'astro/zod';

const SOURCE = 'content/oss.json';

const optionalText = z
  .string()
  .optional()
  .transform((value) => (value?.trim() ? value.trim() : undefined));

const entrySchema = z
  .object({
    repo: optionalText,
    name: optionalText,
    url: optionalText,
    description: optionalText,
    role: z.string().trim().min(1),
    summary: optionalText,
  })
  .refine((entry) => entry.repo || entry.name, { message: 'needs a repo or a name' });

const notableSchema = z.object({
  name: z.string().trim().min(1),
  repo: z.string().trim().min(1),
  url: optionalText,
  description: optionalText,
  showStars: z.boolean().optional(),
});

const fileSchema = z.object({
  ownProjects: z.array(entrySchema).default([]),
  contributions: z.array(entrySchema).default([]),
  notable: z.array(notableSchema).default([]),
});

const withoutMissing = (entry) => Object.fromEntries(Object.entries(entry).filter(([, value]) => value !== undefined));

export const parseOssFile = (raw) => {
  if (raw === undefined) return { ownProjects: [], contributions: [], notable: [] };
  const result = fileSchema.safeParse(raw);
  if (!result.success) throw new Error(`${SOURCE} is invalid: ${result.error.message}`);
  return {
    ownProjects: result.data.ownProjects.map(withoutMissing),
    contributions: result.data.contributions.map(withoutMissing),
    notable: result.data.notable.map(withoutMissing),
  };
};

export const listedRepos = ({ ownProjects, contributions, notable }) => [
  ...new Set([...ownProjects, ...contributions, ...notable].flatMap((entry) => (entry.repo ? [entry.repo] : []))),
];

const detailsFor = (repos, name) => repos.find((repo) => repo.repo.toLowerCase() === name.toLowerCase());

const fromRepo = (entry, repos) => {
  const [owner, name] = entry.repo.split('/');
  const details = detailsFor(repos, entry.repo);
  return {
    key: entry.repo,
    owner: entry.name ? null : owner,
    name: entry.name ?? name,
    url: entry.url ?? details?.url ?? `https://github.com/${entry.repo}`,
    description: entry.description ?? details?.description ?? null,
    role: entry.role,
    summary: entry.summary ?? null,
  };
};

const fromName = (entry) => ({
  key: entry.name,
  owner: null,
  name: entry.name,
  url: entry.url ?? null,
  description: entry.description ?? null,
  role: entry.role,
  summary: entry.summary ?? null,
});

export const featuredProjects = ({ entries, repos }) =>
  entries.map((entry) => (entry.repo ? fromRepo(entry, repos) : fromName(entry)));

const withFullStop = (sentence) => (/[.!?]$/.test(sentence) ? sentence : `${sentence}.`);

export const firstSentence = (text) => withFullStop(text.trim().split(/(?<=[.!?])\s+(?=[A-Z])/)[0]);

const shorten = (count, size, suffix) => `${Number((count / size).toFixed(1))}${suffix}`;

export const formatStars = (count) => {
  if (count >= 999_950) return shorten(count, 1_000_000, 'm');
  if (count >= 1000) return shorten(count, 1000, 'k');
  return String(count);
};

export const starsLabel = (count) => `${formatStars(count)} star${count === 1 ? '' : 's'}`;

export const notableProjects = ({ entries, repos }) =>
  entries.map((entry) => {
    const details = detailsFor(repos, entry.repo);
    const description = entry.description ?? details?.description;
    return {
      key: entry.repo,
      name: entry.name,
      url: entry.url ?? details?.url ?? `https://github.com/${entry.repo}`,
      description: description ? firstSentence(description) : null,
      stars: entry.showStars === false ? null : (details?.stars ?? null),
    };
  });

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

const countOf = (count, word) => `${NUMBER_WORDS[count] ?? count} ${word}${count === 1 ? '' : 's'}`;

export const contributingLede = ({ core, notable }) => {
  const asCore = `as a core contributor to ${countOf(core, 'project')}`;
  if (core > 0 && notable > 0) {
    return `I contribute to open source regularly: ${asCore}, and with changes merged into some well-known ones.`;
  }
  if (core > 0) return `I contribute to open source regularly, ${asCore}.`;
  if (notable > 0) return 'I contribute to open source regularly, with changes merged into some well-known projects.';
  return null;
};
