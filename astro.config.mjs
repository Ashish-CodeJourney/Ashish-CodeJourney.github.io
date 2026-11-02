import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://ashishvaghela.in',
  trailingSlash: 'ignore',
  redirects: {
    '/resume': '/Ashish_Vaghela_Software_Engineer.pdf',
    '/talks': '/speaking',
    '/talks/[slug]': '/speaking/[slug]',
  },
  integrations: [sitemap()],
  vite: {
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
