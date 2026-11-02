import test from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { buildRedirectPage } from '../scripts/lib/redirect-stub.mjs';

const TARGET = 'https://ashishvaghela.in';

const inlineScriptOf = (html) => {
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(match, 'redirect page must contain an inline script');
  return match[1];
};

const visit = ({ html, pathname = '/', search = '', hash = '' }) => {
  const replaced = [];
  const location = { pathname, search, hash, replace: (url) => replaced.push(url) };
  runInNewContext(inlineScriptOf(html), { location });
  return replaced;
};

test('visitor is sent to the same path on the new domain', () => {
  const html = buildRedirectPage({ targetOrigin: TARGET });
  assert.deepEqual(visit({ html, pathname: '/technical/my-post/' }), [`${TARGET}/technical/my-post/`]);
});

test('query string and fragment survive the redirect', () => {
  const html = buildRedirectPage({ targetOrigin: TARGET });
  assert.deepEqual(visit({ html, pathname: '/writings/', search: '?tag=life', hash: '#end' }), [
    `${TARGET}/writings/?tag=life#end`,
  ]);
});

test('trailing slash on target origin does not produce a double slash', () => {
  const html = buildRedirectPage({ targetOrigin: `${TARGET}/` });
  assert.deepEqual(visit({ html, pathname: '/now/' }), [`${TARGET}/now/`]);
});

test('visitors without JavaScript still reach the new home page', () => {
  const html = buildRedirectPage({ targetOrigin: TARGET });
  assert.match(html, /<noscript><meta http-equiv="refresh" content="0; url=https:\/\/ashishvaghela\.in\/"><\/noscript>/);
  assert.match(html, /<a href="https:\/\/ashishvaghela\.in\/">ashishvaghela\.in<\/a>/);
});

test('search engines are told the page moved and not to index the stub', () => {
  const html = buildRedirectPage({ targetOrigin: TARGET });
  assert.match(html, /<link rel="canonical" href="https:\/\/ashishvaghela\.in\/">/);
  assert.match(html, /<meta name="robots" content="noindex">/);
});

test('rejects a target that is not an absolute https origin', () => {
  assert.throws(() => buildRedirectPage({ targetOrigin: 'ashishvaghela.in' }));
  assert.throws(() => buildRedirectPage({ targetOrigin: 'http://ashishvaghela.in' }));
});
