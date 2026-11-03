import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { htmlFiles } from './helpers.mjs';

const chromedPages = async () =>
  (await Promise.all((await htmlFiles()).map(async (file) => ({ file, html: await readFile(file, 'utf8') })))).filter(({ html }) =>
    html.includes('id="theme-toggle"'),
  );

test('every page with a theme toggle sets the theme in a blocking head script, before anything paints', async () => {
  const pages = await chromedPages();
  assert.ok(pages.length > 0);
  pages.forEach(({ file, html }) => {
    const head = html.slice(0, html.indexOf('</head>'));
    const blocking = [...head.matchAll(/<script(?![^>]*\b(?:type="module"|src=|defer|async))[^>]*>([\s\S]*?)<\/script>/g)];
    assert.ok(
      blocking.some(([, body]) => body.includes('initTheme(document, window)')),
      `${file} has no blocking theme script`,
    );
  });
});
