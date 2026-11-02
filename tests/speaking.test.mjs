import test from 'node:test';
import assert from 'node:assert/strict';
import { topicsFromTalks, inviteMailto, isPastEvent } from '../src/utils/speaking.js';

const talk = (tags) => ({ tags });

test('no talks means no topics', () => {
  assert.deepEqual(topicsFromTalks([]), []);
});

test('topics come from talk tags, most talked about first, then alphabetical', () => {
  const topics = topicsFromTalks([talk(['JVM', 'Java']), talk(['Java', 'Testing']), talk(['Kubernetes'])]);
  assert.deepEqual(topics, ['Java', 'JVM', 'Kubernetes', 'Testing']);
});

test('the same tag written in different cases counts as one topic, keeping its first spelling', () => {
  assert.deepEqual(topicsFromTalks([talk(['Java']), talk(['java', 'JFR'])]), ['Java', 'JFR']);
});

test('blank tags are ignored', () => {
  assert.deepEqual(topicsFromTalks([talk(['', '  ', 'Java'])]), ['Java']);
});

test('the invite link opens an email to me with a ready subject line', () => {
  const href = inviteMailto({ email: 'me@example.com', subject: 'Speaking invitation: your event' });
  assert.equal(href, 'mailto:me@example.com?subject=Speaking%20invitation%3A%20your%20event');
});

test('an event dated before today is past', () => {
  assert.equal(isPastEvent({ date: '2026-09-26', today: new Date('2026-11-02T10:00:00Z') }), true);
});

test('an event today or later is not past', () => {
  assert.equal(isPastEvent({ date: '2026-11-02', today: new Date('2026-11-02T10:00:00Z') }), false);
  assert.equal(isPastEvent({ date: '2027-01-10', today: new Date('2026-11-02T10:00:00Z') }), false);
});
