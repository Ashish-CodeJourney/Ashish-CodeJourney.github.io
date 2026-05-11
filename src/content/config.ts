import { defineCollection, z } from 'astro:content';

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
  technical: defineCollection({ type: 'content', schema: postSchema }),
  writings: defineCollection({ type: 'content', schema: postSchema }),
  pages: defineCollection({ type: 'content', schema: pageSchema }),
  sponsors: defineCollection({
    type: 'content',
    schema: z.object({
      name: z.string(),
      url: z.string().optional(),
      logo: z.string().optional(),
      linkedin: z.string().optional(),
      x: z.string().optional(),
    }),
  }),
};
