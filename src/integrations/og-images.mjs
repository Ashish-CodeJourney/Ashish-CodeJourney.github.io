import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import sharp from 'sharp';
import { ogCardFor } from '../utils/og.js';
import { htmlFilesIn } from './html-files.mjs';

const require = createRequire(import.meta.url);
const fontFile = (weight) =>
  require.resolve(`@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-${weight}-normal.woff`);

const WIDTH = 1200;
const HEIGHT = 630;
const PAD_X = 80;
const PAD_Y = 64;
const INNER = WIDTH - PAD_X * 2;
const COLOURS = { sky: '#071621', ink: '#e4ecef', muted: '#93a6b0', lamp: '#ffb547', ridge: '#0f2a38' };

const el = (type, style, children) => ({ type, props: { style, children } });

const headingSize = (heading) => (heading.length > 70 ? 56 : heading.length > 40 ? 68 : 84);

const lights = Array.from({ length: 13 }, (_, index) =>
  el('div', {
    width: 14,
    height: 14,
    borderRadius: 7,
    background: COLOURS.lamp,
    opacity: 0.45 + (index % 3) * 0.25,
    marginTop: Math.round(Math.sin((index / 12) * Math.PI) * 26),
  }),
);

const card = ({ kicker, heading, site }) =>
  el(
    'div',
    {
      width: INNER,
      height: HEIGHT - PAD_Y * 2,
      boxSizing: 'content-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: `${PAD_Y}px ${PAD_X}px`,
      background: COLOURS.sky,
      color: COLOURS.ink,
      fontFamily: 'Bricolage Grotesque',
    },
    [
      el('div', { display: 'flex', justifyContent: 'space-between', width: INNER, height: 40 }, lights),
      el('div', { display: 'flex', flexDirection: 'column', width: INNER }, [
        el('div', { color: COLOURS.lamp, fontSize: 32, fontWeight: 700, marginBottom: 20 }, kicker),
        el('div', { fontSize: headingSize(heading), fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em' }, heading),
      ]),
      el('div', { display: 'flex', justifyContent: 'space-between', width: INNER, color: COLOURS.muted, fontSize: 28, fontWeight: 700 }, [
        el('div', {}, 'Ashish Vaghela'),
        el('div', {}, site),
      ]),
    ],
  );

const metaContent = (html, attr, name) => html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]+)"`))?.[1];

export default function ogImages() {
  return {
    name: 'og-images',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const distDir = fileURLToPath(dir);
        const fonts = await Promise.all(
          [700, 800].map(async (weight) => ({ name: 'Bricolage Grotesque', weight, style: 'normal', data: await readFile(fontFile(weight)) })),
        );
        const pages = await Promise.all(
          (await htmlFilesIn(distDir)).map(async (file) => {
            const html = await readFile(file, 'utf8');
            return { html, image: metaContent(html, 'property', 'og:image') };
          }),
        );
        const wanted = pages.filter(({ image }) => image?.includes('/og/'));

        await Promise.all(
          wanted.map(async ({ html, image }) => {
            const url = new URL(image);
            const path = metaContent(html, 'property', 'og:url');
            const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
            const svg = await satori(card({ ...ogCardFor({ path: new URL(path).pathname, title }), site: url.host }), {
              width: WIDTH,
              height: HEIGHT,
              fonts,
            });
            const target = join(distDir, url.pathname);
            await mkdir(dirname(target), { recursive: true });
            await writeFile(target, await sharp(Buffer.from(svg)).png().toBuffer());
          }),
        );
        logger.info(`generated ${wanted.length} share preview images`);
      },
    },
  };
}
