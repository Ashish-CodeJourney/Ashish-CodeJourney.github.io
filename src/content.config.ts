import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const postSchema = z.object({
  title: z.string(),
  date: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  banner: z.string().optional(),
});

const pageSchema = z.object({
  title: z.string(),
});

export const collections = {
  technical: defineCollection({
    loader: glob({ pattern: '[^_]*.md', base: './content/technical' }),
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
};
