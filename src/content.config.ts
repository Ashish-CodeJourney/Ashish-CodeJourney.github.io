import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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
