import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readDist, htmlFiles, cssOf } from './helpers.mjs';

const svgsWith = (html, className) => html.match(new RegExp(`<svg[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>[\\s\\S]*?</svg>`, 'g')) ?? [];

test('home hero ends in a mountain ridgeline with a moon and a sitting cat', async () => {
  const html = await readDist('index.html');
  const hero = html.match(/<section class="hero[\s\S]*?<\/section>/)?.[0] ?? '';
  const [scene] = svgsWith(hero, 'ridgeline');
  assert.ok(scene, 'expected a ridgeline in the hero');
  assert.ok((scene.match(/class="ridge /g) ?? []).length >= 3, 'expected at least three mountain layers');
  assert.match(scene, /class="moon"/);
  assert.match(scene, /class="cat"/);
  assert.match(scene, /class="cat-tail"/);
});

test('every page footer has mountains and the cat', async () => {
  const files = await htmlFiles();
  const pages = await Promise.all(files.map(async (file) => [file, await readFile(file, 'utf8')]));
  const withFooter = pages.filter(([, html]) => html.includes('class="site-footer'));
  assert.ok(withFooter.length > 10);
  withFooter.forEach(([file, html]) => {
    const footer = html.match(/<footer class="site-footer[\s\S]*?<\/footer>/)?.[0] ?? '';
    const [scene] = svgsWith(footer, 'ridgeline');
    assert.ok(scene, `${file} footer should have mountains`);
    assert.match(scene, /class="cat"/, `${file} footer should have the cat`);
  });
});

test('scenery is decorative and hidden from assistive technology', async () => {
  const html = await readDist('index.html');
  svgsWith(html, 'ridgeline').forEach((svg) => {
    assert.match(svg, /aria-hidden="true"/);
    assert.doesNotMatch(svg, /<a\b|tabindex/);
  });
});

test('scenery uses theme tokens, not raw colours', async () => {
  const html = await readDist('index.html');
  svgsWith(html, 'ridgeline').forEach((svg) => assert.doesNotMatch(svg, /fill="#|stroke="#/));
});


test('light theme is a day scene with a sun, dark theme a night scene with a moon', async () => {
  const css = await cssOf(await readDist('index.html'));
  const day = css.match(/:root\s*\{[^}]*\}/)?.[0] ?? '';
  const night = css.match(/html\.dark\s*\{[^}]*\}/)?.[0] ?? '';
  assert.match(day, /--celestial:\s*#f5a524/i, 'day should have an amber sun');
  assert.match(night, /--celestial:\s*#e4ecef/i, 'night should have a pale moon');
  assert.match(day, /--sky:\s*#[0-9a-f]{6}/i);
  assert.match(night, /--sky:\s*#071621/i);
});

test('the hero and scenery paint with the day/night sky tokens', async () => {
  const css = await cssOf(await readDist('index.html'));
  assert.match(css, /\.hero[^{]*\{[^}]*background:\s*var\(--sky\)/);
  assert.match(css, /\.moon[^{]*\{[^}]*fill:\s*var\(--celestial\)/);
});
