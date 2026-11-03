import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { inlineScriptsOf, contentSecurityPolicy, withSecurityHeaders } from '../src/utils/csp.js';

const sha = (body) => `'sha256-${createHash('sha256').update(body).digest('base64')}'`;
const directive = (policy, name) => policy.split('; ').find((part) => part.startsWith(`${name} `));

test('finds inline scripts but skips external and JSON-LD ones', () => {
  const html = `<script>a()</script><script type="module">b()</script><script src="/x.js"></script><script type="application/ld+json">{}</script>`;
  assert.deepEqual(inlineScriptsOf(html), ['a()', 'b()']);
});

test('scripts run only from this site, Cloudflare analytics, or inline code we shipped', () => {
  const policy = contentSecurityPolicy({ inlineScripts: ['a()', 'a()', 'b()'] });
  assert.equal(directive(policy, 'script-src'), `script-src 'self' https://static.cloudflareinsights.com ${sha('a()')} ${sha('b()')}`);
});

test('policy forbids framing, plugins and base-tag hijacking, and allows the slide embeds', () => {
  const policy = contentSecurityPolicy({ inlineScripts: [] });
  assert.equal(directive(policy, 'default-src'), "default-src 'self'");
  assert.equal(directive(policy, 'frame-ancestors'), "frame-ancestors 'none'");
  assert.equal(directive(policy, 'object-src'), "object-src 'none'");
  assert.equal(directive(policy, 'base-uri'), "base-uri 'self'");
  assert.equal(directive(policy, 'frame-src'), 'frame-src https://docs.google.com');
  assert.equal(directive(policy, 'connect-src'), "connect-src 'self' https://cloudflareinsights.com");
  assert.equal(directive(policy, 'form-action'), "form-action 'self'");
  assert.ok(policy.endsWith('; upgrade-insecure-requests'));
});

test('styles, fonts and images: inline styles stay allowed for code highlighting, fonts are self-hosted, images may come from any https host', () => {
  const policy = contentSecurityPolicy({ inlineScripts: [] });
  assert.equal(directive(policy, 'style-src'), "style-src 'self' 'unsafe-inline'");
  assert.equal(directive(policy, 'font-src'), "font-src 'self'");
  assert.equal(directive(policy, 'img-src'), "img-src 'self' data: https:");
});

test('security headers are added to the site-wide rule and nothing else changes', () => {
  const headers = '/_astro/*\n  Cache-Control: immutable\n\n/*\n  X-Content-Type-Options: nosniff\n';
  const result = withSecurityHeaders(headers, { policy: "default-src 'self'" });
  assert.equal(
    result,
    "/_astro/*\n  Cache-Control: immutable\n\n/*\n  X-Content-Type-Options: nosniff\n  Strict-Transport-Security: max-age=31536000\n  Content-Security-Policy: default-src 'self'\n",
  );
});
