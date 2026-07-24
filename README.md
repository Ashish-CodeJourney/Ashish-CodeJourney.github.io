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
├── content/                   # git submodule → Ashish-CodeJourney/content (private)
│   ├── site.json              # personal details, socials, /links entries
│   ├── assets/                # avatar, hero video — symlinked into public/
│   ├── pages/                 # home.md, now.md
│   ├── technical/             # Engineering blog posts
│   ├── writings/               # Essays and personal writing
│   └── sponsors/              # Sponsor entries
├── src/
│   ├── content.config.ts      # Zod schemas + glob() loaders pointing at content/
│   ├── layouts/
│   │   ├── BaseLayout.astro   # HTML shell, fonts, analytics, theme script
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
│   └── site.config.ts         # Thin wrapper re-exporting content/site.json
├── public/
│   ├── oat.min.css            # oat.ink UI library
│   ├── avatar.jpg             # symlink → content/assets/avatar.jpg
│   └── videos/                # symlinks → content/assets/hero-*
├── astro.config.mjs
└── tsconfig.json
```

Blog posts, pages, sponsors, personal details, and personal images live in a
**separate private repository** ([`Ashish-CodeJourney/content`](https://github.com/Ashish-CodeJourney/content)),
checked out here as a git submodule at `content/`. This repo (the site) only
holds code — layouts, components, styling, and the Astro content-collection
schemas that validate the submodule's markdown.

### First clone

Submodules aren't fetched by a plain `git clone`. Either:

```bash
git clone --recurse-submodules git@github.com:Ashish-CodeJourney/Ashish-CodeJourney.github.io.git
```

or, if already cloned:

```bash
git submodule update --init
```

`content` is private, so cloning it requires access to that repo (CI authenticates via a read-only deploy key — see `.github/workflows/*.yml`).

---

## Publishing Content

New posts/pages/sponsors go in `content/`, not `src/`. `content/` is its own
git repository (checked out at `content/` in this working tree), so publishing
is a two-step push: one to `content`, one to bump this repo's pointer at it.

`make publish` wraps both steps:

1. Create a new `.md` file in `content/technical/` or `content/writings/`
   ```yaml
   ---
   title: "My Post Title"
   date: "2026-05-07"
   description: "Short summary shown in post cards."
   tags: ["TypeScript", "TDD"]
   banner: "https://..."   # optional, external image URL
   ---
   ```
2. Write markdown content below the frontmatter
3. From the site repo root:
   ```bash
   make publish MSG="doc: my new post"
   ```
   This commits + pushes the new file to the `content` repo, then commits +
   pushes the updated submodule pointer here — which triggers the deploy
   workflow.
4. `make content-status` shows pending changes in `content/` and whether the
   pointer here is out of date, without publishing anything.

Personal details, socials, and the `/links` page entries live in
`content/site.json` — edit them the same way (edit in `content/`, then `make publish`).

---

## Local Development

```bash
git submodule update --init   # first time only, see above
npm install
npm run dev        # dev server at localhost:4321
npm run build      # production build → dist/
npm run preview    # preview dist/ locally
```

Or via the Makefile: `make dev`, `make build`, `make preview`, `make check`, `make test` (see `make help`).

---

## Customization

### Site Metadata
Edit `content/site.json` — title, description, author, social links, `/links` entries — then `make publish`. `src/site.config.ts` just re-exports it typed.

### Styles
Edit `src/styles/global.css` — CSS custom properties at the top of the file control the entire color scheme. The file extends `oat.min.css` with layout, component, and animation styles.

### Adding a New Page
Create `src/pages/your-page.astro` and wrap content in `<BaseLayout>`.

### Adding a New Collection
1. Define the schema and a `glob()` loader (pointed at `./content/collection-name`) in `src/content.config.ts`
2. Add the matching directory in `content/collection-name/` (in the `content` repo)
3. Add `src/pages/collection-name/index.astro` using `PostList`
4. Add `src/pages/collection-name/[slug].astro` using `PostLayout`
