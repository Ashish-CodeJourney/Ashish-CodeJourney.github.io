import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readDist } from './helpers.mjs';

const resume = JSON.parse(await readFile(new URL('../../content/resume.json', import.meta.url), 'utf8'));
const ofKind = (kind) => resume.filter((entry) => entry.kind === kind);
const escaped = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "(?:'|&#39;|’)").replace(/&/g, '(?:&|&amp;)');
const about = () => readDist('about/index.html');

test('about no longer explains how the site is built', async () => {
  assert.doesNotMatch(await about(), /What is this site\?/);
});

test('about opens with the personal intro', async () => {
  const html = await about();
  assert.match(html, /<h1[^>]*>Hi, I(&#39;|’|')m Ashish/);
  assert.match(html, /street cats/);
});

test('about shows the professional summary', async () => {
  const html = await about();
  const [summary] = ofKind('summary');
  assert.match(html, /<h2[^>]*id="work"[^>]*>Work<\/h2>/);
  assert.doesNotMatch(html, /What I do/);
  assert.doesNotMatch(html, /class="headline"/);
  summary.text.forEach((paragraph) => assert.match(html, new RegExp(escaped(paragraph.slice(0, 60)))));
});

test('about lists every role with its company, period and highlights', async () => {
  const html = await about();
  ofKind('experience').forEach((job) => {
    assert.match(html, new RegExp(escaped(job.role)));
    assert.match(html, new RegExp(escaped(job.company)));
    job.highlights.forEach((line) => assert.match(html, new RegExp(escaped(line.slice(0, 50)))));
  });
  assert.match(html, /Sep 2024 to present/);
  assert.match(html, /Jan 2024 to Jul 2024/);
});

test('roles appear newest first', async () => {
  const html = await about();
  const positions = ['>Software Crafter, ChatNCharge<', '>Software Crafter<', '>Full Stack Developer Intern<'].map((name) => html.indexOf(name));
  assert.ok(positions.every((position) => position > -1));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
});

test('about lists skills by group and education', async () => {
  const html = await about();
  ofKind('skills').forEach(({ group, items }) => {
    assert.match(html, new RegExp(escaped(group)));
    items.forEach((item) => assert.match(html, new RegExp(escaped(item))));
  });
  ofKind('education').forEach(({ degree, school }) => {
    assert.match(html, new RegExp(escaped(degree)));
    assert.match(html, new RegExp(escaped(school)));
  });
});

test('about points to open source work', async () => {
  assert.match(await about(), /href="\/oss\/"/);
});

test('résumé can be opened in the browser or downloaded as the real PDF, with its size shown', async () => {
  const html = await about();
  assert.match(html, /<a[^>]+href="\/resume"[^>]*>View résumé</);
  assert.match(html, /<a[^>]+href="\/Ashish_Vaghela_Software_Engineer\.pdf"[^>]+download[^>]*>Download PDF</);
  assert.match(html, /PDF, \d+ KB/);
  assert.doesNotMatch(html, /href="\/resume"[^>]*download/);
});

test('about never publishes a phone number', async () => {
  assert.doesNotMatch(await about(), /\+91|95104/);
});

test('about introduces me as a software engineer and claims no Kubernetes experience', async () => {
  const html = await about();
  assert.match(html, /I(&#39;|')m a software engineer/);
  assert.doesNotMatch(html, /Kubernetes|Release and automation engineer/i);
});
