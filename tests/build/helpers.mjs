import { readFile, readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';

export const DIST = process.env.DIST_DIR ?? new URL('../../dist/', import.meta.url).pathname;

export const readDist = (path) => readFile(join(DIST, path), 'utf8');

export const listFiles = async (dir = DIST) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory() ? listFiles(join(dir, entry.name)) : Promise.resolve([join(dir, entry.name)]),
    ),
  );
  return nested.flat();
};

export const htmlFiles = async () => (await listFiles()).filter((file) => extname(file) === '.html');

export const cssOf = async (html) => {
  const inline = (html.match(/<style[^>]*>[\s\S]*?<\/style>/g) ?? []).join('\n');
  const linked = await Promise.all(
    (html.match(/href="\/_astro\/[^"]+\.css"/g) ?? []).map((attr) => readDist(attr.slice(7, -1))),
  );
  return [inline, ...linked].join('\n');
};
