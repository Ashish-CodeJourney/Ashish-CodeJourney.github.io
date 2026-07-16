import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../site.config';
import { toSlug } from '../utils/slug';

export async function GET(context) {
  const writings = await getCollection('writings');
  const technical = await getCollection('technical');

  const posts = [...writings, ...technical].sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/${post.collection}/${toSlug(post.id)}/`,
    })),
  });
}
