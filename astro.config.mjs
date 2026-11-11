import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import ogImages from './src/integrations/og-images.mjs';
import securityHeaders from './src/integrations/security-headers.mjs';

export default defineConfig({
  site: 'https://ashishvaghela.in',
  trailingSlash: 'ignore',
  redirects: {
    '/resume': '/Ashish_Vaghela_Developer_Advocate.pdf',
    '/resume/developer-advocate': '/Ashish_Vaghela_Developer_Advocate.pdf',
    '/talks': '/speaking',
    '/talks/[slug]': '/speaking/[slug]',
  },
  integrations: [sitemap(), ogImages(), securityHeaders()],
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
    server: {
      watch: {
        ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/content/**', '**/public/**'],
      },
    },
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light-high-contrast',
        dark: 'github-dark',
      },
      wrap: false,
    },
  },
});
