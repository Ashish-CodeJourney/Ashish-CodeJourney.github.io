import test from 'node:test';
import assert from 'node:assert/strict';
import { safeDestination } from '../src/utils/redirect-target.js';

const ALLOWED = ['github.com', 'x.com'];

test('an allowed domain is followed', () => {
  assert.equal(safeDestination({ url: 'https://github.com/Ashish-CodeJourney', allowed: ALLOWED }), 'https://github.com/Ashish-CodeJourney');
});

test('a subdomain of an allowed domain is followed', () => {
  assert.equal(safeDestination({ url: 'https://gist.github.com/a', allowed: ALLOWED }), 'https://gist.github.com/a');
});

test('a domain that only ends with the same letters is sent home', () => {
  assert.equal(safeDestination({ url: 'https://evilgithub.com/', allowed: ALLOWED }), '/');
});

test('an unknown domain is sent home', () => {
  assert.equal(safeDestination({ url: 'https://example.com/', allowed: ALLOWED }), '/');
});

test('a missing or malformed url is sent home', () => {
  assert.equal(safeDestination({ url: null, allowed: ALLOWED }), '/');
  assert.equal(safeDestination({ url: 'not a url', allowed: ALLOWED }), '/');
});

test('non-web schemes are sent home', () => {
  assert.equal(safeDestination({ url: 'javascript://github.com/%0Aalert(1)', allowed: ALLOWED }), '/');
});
