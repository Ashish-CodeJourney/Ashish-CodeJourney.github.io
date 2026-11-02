import { defineCollection } from 'astro:content';
import { file, glob, type Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import devto, { DEVTO_OVERRIDES, DEVTO_USERNAME } from './utils/devto.js';
import devtoSnapshot from './data/devto-snapshot.json';

const { loadDevtoEntries, fetchJsonWithRetry, resizeDevtoImages } = devto;

const postSchema = z.object({
  title: z.string(),
  date: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  banner: z.string().optional(),
});

const withDevtoArticles = (localLoader: Loader): Loader => ({
  name: 'technical-with-devto',
  load: async (context) => {
    await localLoader.load(context);

    const entries = await loadDevtoEntries({
      username: DEVTO_USERNAME,
      fetchJson: (url) => fetchJsonWithRetry(url, { fetch }),
      localEntries: context.store.values(),
      overrides: DEVTO_OVERRIDES,
      snapshot: devtoSnapshot,
      warn: (message) => context.logger.warn(message),
    });

    await Promise.all(
      entries
        .map((entry) => ({ ...entry, body: resizeDevtoImages(entry.body) }))
        .map(async ({ id, data, body }) =>
        context.store.set({
          id,
          data: await context.parseData({ id, data }),
          body,
          digest: context.generateDigest(body),
          rendered: await context.renderMarkdown(body),
        }),
      ),
    );
  },
});

const pageSchema = z.object({
  title: z.string(),
});

const talksSchema = z.object({
  title: z.string(),
  date: z.string(),
  event: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  banner: z.string().optional(),
  slides: z.string().optional(),
  slidesFile: z.string().optional(),
  video: z.string().optional(),
  github: z.string().optional(),
  live: z.string().optional(),
  slideshare: z.string().optional(),
  registration: z.string().optional(),
});

export const collections = {
  technical: defineCollection({
    loader: withDevtoArticles(glob({ pattern: '[^_]*.md', base: './content/technical' })),
    schema: postSchema,
  }),
  writings: defineCollection({
    loader: glob({ pattern: '[^_]*.md', base: './content/writings' }),
    schema: postSchema,
  }),
  pages: defineCollection({
    loader: glob({ pattern: '[^_]*.md', base: './content/pages' }),
    schema: pageSchema,
  }),
  projects: defineCollection({
    loader: glob({ pattern: '[^_]*.md', base: './content/projects' }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      tags: z.array(z.string()).default([]),
      url: z.string().optional(),
      github: z.string().optional(),
      banner: z.string().optional(),
      logo: z.string().optional(),
      status: z.enum(['active', 'archived', 'maintenance']).default('active'),
      date: z.string(),
    }),
  }),
  sponsors: defineCollection({
    loader: glob({ pattern: '[^_]*.md', base: './content/sponsors' }),
    schema: z.object({
      name: z.string(),
      date: z.string(),
      current: z.boolean().default(false),
      description: z.string().optional(),
      url: z.string().optional(),
      logo: z.string().optional(),
      linkedin: z.string().optional(),
      x: z.string().optional(),
    }),
  }),
  talks: defineCollection({
    loader: glob({ pattern: '[^_]*.md', base: './content/talks' }),
    schema: talksSchema,
  }),
  resume: defineCollection({
    loader: file('./content/resume.json'),
    schema: z.discriminatedUnion('kind', [
      z.object({
        kind: z.literal('summary'),
        text: z.array(z.string()).min(1),
      }),
      z.object({
        kind: z.literal('experience'),
        role: z.string(),
        company: z.string(),
        url: z.string().optional(),
        location: z.string(),
        start: z.string(),
        end: z.string().optional(),
        highlights: z.array(z.string()).default([]),
      }),
      z.object({
        kind: z.literal('skills'),
        group: z.string(),
        order: z.number(),
        items: z.array(z.string()).min(1),
      }),
      z.object({
        kind: z.literal('education'),
        degree: z.string(),
        school: z.string(),
        note: z.string().optional(),
        start: z.string(),
        end: z.string().optional(),
      }),
    ]),
  }),
  community: defineCollection({
    loader: glob({ pattern: '[^_]*.md', base: './content/community' }),
    schema: z.object({
      title: z.string(),
      organisation: z.string(),
      role: z.enum(['organiser', 'maintainer', 'volunteer', 'mentor', 'speaker', 'contributor', 'attendee']),
      date: z.string().optional(),
      endDate: z.string().optional(),
      location: z.string().optional(),
      url: z.string().optional(),
      description: z.string().optional(),
      order: z.number().optional(),
      note: z.boolean().optional(),
    }),
  }),
};
