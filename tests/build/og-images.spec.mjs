import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DIST, htmlFiles } from './helpers.mjs';

const SITE = 'https://ashishvaghela.in';

const pages = async () => {
  const files = await htmlFiles();
  const all = await Promise.all(files.map(async (file) => ({ file, html: await readFile(file, 'utf8') })));
  return all.filter(({ html }) => !/http-equiv="refresh"|name="robots" content="noindex"/.test(html));
};

const metaContent = (html, attr, name) =>
  html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]+)"`))?.[1];

const pngSize = (buffer) => ({ width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) });

test('every page has a share preview image, for Open Graph and X', async () => {
  (await pages()).forEach(({ file, html }) => {
    const image = metaContent(html, 'property', 'og:image');
    assert.ok(image?.startsWith(`${SITE}/og/`), `${file} has no og:image`);
    assert.equal(metaContent(html, 'name', 'twitter:image'), image, `${file} twitter:image`);
    assert.ok(metaContent(html, 'property', 'og:image:alt'), `${file} has no og:image:alt`);
  });
});

test('every preview image exists as a 1200×630 PNG', async () => {
  const images = new Set((await pages()).map(({ html }) => metaContent(html, 'property', 'og:image')));
  await Promise.all(
    [...images].map(async (url) => {
      const buffer = await readFile(join(DIST, new URL(url).pathname));
      assert.equal(buffer.subarray(1, 4).toString(), 'PNG', `${url} is not a PNG`);
      assert.deepEqual(pngSize(buffer), { width: 1200, height: 630 }, url);
    }),
  );
});

test('posts get their own preview, not a shared one', async () => {
  const all = await pages();
  const imageOf = (path) => metaContent(all.find(({ file }) => file === join(DIST, path)).html, 'property', 'og:image');
  assert.notEqual(imageOf('index.html'), imageOf('about/index.html'));
});
