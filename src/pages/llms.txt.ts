import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE } from '../site.config';
import { toSlug } from '../utils/slug';

const section = (
  title: string,
  posts: CollectionEntry<'writings' | 'technical'>[],
  basePath: string
): string => {
  const sorted = [...posts].sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
  const lines = sorted.map(
    (post) => `- [${post.data.title}](${SITE.url}${basePath}${toSlug(post.id)}/): ${post.data.description ?? ''}`
  );
  return `## ${title}\n\n${lines.join('\n')}`;
};

export const GET: APIRoute = async () => {
  const writings = await getCollection('writings');
  const technical = await getCollection('technical');

  const body = [
    `# ${SITE.title}`,
    '',
    `> ${SITE.description}`,
    '',
    section('Technical', technical, '/technical/'),
    '',
    section('Writings', writings, '/writings/'),
    '',
    `## Feeds`,
    '',
    `- [RSS feed](${SITE.url}/rss.xml)`,
    `- [Sitemap](${SITE.url}/sitemap-index.xml)`,
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
