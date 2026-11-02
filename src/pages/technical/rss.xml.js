import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../../site.config';
import { toSlug } from '../../utils/slug';

export async function GET(context) {
  const posts = [...(await getCollection('technical'))].sort((a, b) => b.data.date.localeCompare(a.data.date));

  return rss({
    title: `${SITE.author}: technical posts`,
    description: 'Technical posts on Java, tooling, testing, and the things I break along the way.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: new Date(post.data.date),
      link: `/technical/${toSlug(post.id)}/`,
      categories: post.data.tags,
    })),
  });
}
