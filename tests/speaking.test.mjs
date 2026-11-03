import test from 'node:test';
import assert from 'node:assert/strict';
import { inviteMailto, isPastEvent } from '../src/utils/speaking.js';

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
