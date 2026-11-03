import { createHash } from 'node:crypto';

const SCRIPT = /<script([^>]*)>([\s\S]*?)<\/script>/g;

const isInline = (attributes) => !/\bsrc=/.test(attributes) && !/application\/ld\+json/.test(attributes);

export const inlineScriptsOf = (html) =>
  [...html.matchAll(SCRIPT)].filter(([, attributes]) => isInline(attributes)).map(([, , body]) => body);

const hashOf = (body) => `'sha256-${createHash('sha256').update(body).digest('base64')}'`;

export const contentSecurityPolicy = ({ inlineScripts }) =>
  [
    "default-src 'self'",
    ["script-src 'self' https://static.cloudflareinsights.com", ...new Set(inlineScripts.map(hashOf))].join(' '),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://cloudflareinsights.com",
    'frame-src https://docs.google.com',
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ');

export const withSecurityHeaders = (headers, { policy }) =>
  headers.replace(
    /(^\/\*\n(?: {2}.*\n)*)/m,
    `$1  Strict-Transport-Security: max-age=31536000\n  Content-Security-Policy: ${policy}\n`,
  );
