import test from 'node:test';
import assert from 'node:assert/strict';
import { ogImagePath, ogCardFor } from '../src/utils/og.js';

test('home gets its own preview image', () => {
  assert.equal(ogImagePath('/'), '/og/index.png');
});

test('every page maps to one preview image named after its path, with or without a trailing slash', () => {
  assert.equal(ogImagePath('/technical/astro-7-satteri-silent-bugs/'), '/og/technical/astro-7-satteri-silent-bugs.png');
  assert.equal(ogImagePath('/about'), '/og/about.png');
});

test('a post card shows the post title under the section it belongs to', () => {
  assert.deepEqual(ogCardFor({ path: '/technical/x/', title: 'Dot files two years later... | Ashish Vaghela' }), {
    kicker: 'Technical',
    heading: 'Dot files two years later...',
  });
  assert.equal(ogCardFor({ path: '/writings/x/', title: 'The Art of Sitting Still | Ashish Vaghela' }).kicker, 'Writing');
  assert.equal(ogCardFor({ path: '/speaking/x/', title: 'Jugaad | Ashish Vaghela' }).kicker, 'Talk');
  assert.equal(ogCardFor({ path: '/projects/x/', title: 'Aether Gateway | Ashish Vaghela' }).kicker, 'Project');
  assert.equal(ogCardFor({ path: '/sponsors/x/', title: 'The Linux Foundation | Ashish Vaghela' }).kicker, 'Sponsor');
});

test('section index pages use the section name as the heading, with no kicker repeat', () => {
  assert.deepEqual(ogCardFor({ path: '/oss/', title: 'Open source | Ashish Vaghela' }), { kicker: 'Ashish Vaghela', heading: 'Open source' });
});

test('home card leads with the name and role', () => {
  assert.deepEqual(ogCardFor({ path: '/', title: 'Ashish Vaghela, software engineer and open source contributor' }), {
    kicker: 'Software engineer · Open source · Speaker',
    heading: 'Ashish Vaghela',
  });
});

test('HTML entities in titles are decoded for the card', () => {
  assert.equal(
    ogCardFor({ path: '/technical/x/', title: 'Astro 7 won&#39;t tell you &amp; more | Ashish Vaghela' }).heading,
    "Astro 7 won't tell you & more",
  );
});

test('emoji are dropped from card headings, since the card font cannot draw them', () => {
  assert.equal(
    ogCardFor({ path: '/technical/x/', title: 'My Linux Terminal Setup: From Boring to Beautiful 🐧✨ | Ashish Vaghela' }).heading,
    'My Linux Terminal Setup: From Boring to Beautiful',
  );
  assert.equal(ogCardFor({ path: '/technical/x/', title: 'Does TDD Weaken Debugging Skills? 🐞🧪 | Ashish Vaghela' }).heading, 'Does TDD Weaken Debugging Skills?');
  assert.equal(ogCardFor({ path: '/technical/x/', title: 'Tools 🛠️💻 and 🧰 more | Ashish Vaghela' }).heading, 'Tools and more');
});
