# Ashish CodeJourney

Personal website and blog — fast, minimal, content-first. Built with Astro 5 and deployed to GitHub Pages.

![Astro](https://img.shields.io/badge/astro-5-BC52EE?style=flat-oval&logo=astro) 
[![Deploy to GitHub Pages](https://github.com/Ashish-CodeJourney/Ashish-CodeJourney.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/Ashish-CodeJourney/Ashish-CodeJourney.github.io/actions/workflows/deploy.yml)
![TypeScript](https://img.shields.io/badge/typescript-strict-3178C6?style=flat-oval&logo=typescript)

## Features

- **Astro 5 SSG** — zero JS by default, only what's needed ships to the browser
- **Content Collections** — type-safe Zod schemas for all markdown frontmatter
- **View Transitions** — smooth page navigation via Astro's `ClientRouter`
- **Dual-theme code highlighting** — Shiki with `github-light` / `github-dark` themes
- **Light / Dark mode** — system preference detection, `localStorage` persistence, no flash
- **Reading time** — auto-calculated from post body word count
- **Sitemap** — generated automatically via `@astrojs/sitemap`
- **Powered by oat.ink** — minimal CSS framework for base styling

---

## Project Structure

```text
.
├── src/
│   ├── content/
│   │   ├── config.ts          # Zod schemas for all collections
│   │   ├── pages/             # home.md, now.md
│   │   ├── technical/         # Engineering blog posts
│   │   └── writings/          # Essays and personal writing
│   ├── layouts/
│   │   ├── BaseLayout.astro   # HTML shell, fonts, GA, theme script
│   │   └── PostLayout.astro   # Shared post page template
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── PostCard.astro
│   │   ├── PostList.astro
│   │   ├── SocialLinks.astro
│   │   └── ThemeToggle.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── now.astro
│   │   ├── technical/[slug].astro
│   │   └── writings/[slug].astro
│   ├── styles/global.css      # Theme overrides, layout, component styles
│   ├── utils/
│   │   ├── date.ts            # formatDate, readingTime
│   │   └── slug.ts            # toSlug — strips .md extension from entry IDs
│   └── site.config.ts         # Single source of truth for site metadata
├── public/
│   ├── oat.min.css            # oat.ink UI library
│   └── avatar.jpg
├── astro.config.mjs
└── tsconfig.json
```

---

## Publishing Content

Only touch markdown files inside `src/content/`.

1. Create a new `.md` file in `src/content/technical/` or `src/content/writings/`
2. Add frontmatter:
   ```yaml
   ---
   title: "My Post Title"
   date: "2026-05-07"
   description: "Short summary shown in post cards."
   tags: ["TypeScript", "TDD"]
   banner: "/images/my-banner.jpg"   # optional
   ---
   ```
3. Write markdown content below the frontmatter
4. Commit and push — GitHub Actions builds and deploys automatically

---

## Local Development

```bash
npm install
npm run dev        # dev server at localhost:4321
npm run build      # production build → dist/
npm run preview    # preview dist/ locally
```

---

## Customization

### Site Metadata
Edit `src/site.config.ts` — title, description, author, social links, GA ID.

### Styles
Edit `src/styles/global.css` — CSS custom properties at the top of the file control the entire color scheme. The file extends `oat.min.css` with layout, component, and animation styles.

### Adding a New Page
Create `src/pages/your-page.astro` and wrap content in `<BaseLayout>`.

### Adding a New Collection
1. Define schema in `src/content/config.ts`
2. Add `src/pages/collection-name/index.astro` using `PostList`
3. Add `src/pages/collection-name/[slug].astro` using `PostLayout`
