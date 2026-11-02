import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../../site.config';
import { toSlug } from '../../utils/slug';

export async function GET(context) {
  const writings = await getCollection('writings');
  const newestFirst = [...writings].sort((a, b) => b.data.date.localeCompare(a.data.date));

  return rss({
    title: `${SITE.author}: writings`,
    description: 'Personal essays from my notebook. Slower, and mostly not about software.',
    site: context.site,
    items: newestFirst.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/writings/${toSlug(post.id)}/`,
    })),
  });
}
