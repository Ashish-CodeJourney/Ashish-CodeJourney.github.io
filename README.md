# Ashish CodeJourney

Personal website and blog — fast, minimal, content-first. Built with Astro 7 and deployed to GitHub Pages.

![Astro](https://img.shields.io/badge/astro-7-BC52EE?style=flat-oval&logo=astro) 
[![Deploy to GitHub Pages](https://github.com/Ashish-CodeJourney/Ashish-CodeJourney.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/Ashish-CodeJourney/Ashish-CodeJourney.github.io/actions/workflows/deploy.yml)
![TypeScript](https://img.shields.io/badge/typescript-strict-3178C6?style=flat-oval&logo=typescript)

## Features

- **Astro 7 SSG** — zero JS by default, only what's needed ships to the browser
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
│   ├── technical/             # Local-only technical posts (the rest come from dev.to)
│   ├── writings/              # Essays and personal writing
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
│   ├── data/
│   │   └── devto-snapshot.json # Last good dev.to fetch, used when dev.to is unreachable
│   ├── utils/
│   │   ├── date.ts            # formatDate, readingTime
│   │   ├── devto.js           # dev.to fetch, mapping, dedupe, retry (see dev.to Integration)
│   │   ├── devto.d.ts         # Types for devto.js
│   │   └── slug.ts            # toSlug — strips .md extension from entry IDs
│   └── site.config.ts         # Thin wrapper re-exporting content/site.json
├── scripts/
│   └── refresh-devto-snapshot.mjs  # Rewrites src/data/devto-snapshot.json
├── tests/                     # node --test suites (theme, dev.to)
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

New pages, writings, projects, talks and sponsors go in `content/`, not `src/`.
`content/` is its own git repository (checked out at `content/` in this working
tree), so publishing is a two-step push: one to `content`, one to bump this
repo's pointer at it.

**Technical posts are not written here.** Publish them on dev.to. The site
pulls them in at build time (see [dev.to Integration](#devto-integration)).
Only `content/technical/` files that have no dev.to copy belong in the content
repo.

To publish a writing or other local entry:

1. Create a new `.md` file in `content/writings/` (or the relevant collection)
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

## dev.to Integration

The `technical` collection is built from two sources:

- **dev.to** (primary): every published article on the account is fetched from
  the public API at build time (`https://dev.to/api/articles`).
- **Local files** in `content/technical/`: used for posts with no dev.to copy.

How it works (`src/content.config.ts` → `src/utils/devto.js`):

1. The local glob loader runs first, which also clears entries it didn't load.
2. Articles are fetched as a list, then each body is fetched one at a time,
   retrying on HTTP 429 with backoff.
3. An article is skipped if its title (ignoring case and punctuation) matches a
   local post.
4. Articles in `DEVTO_OVERRIDES` keep the slug they had before the migration,
   so existing `/technical/<slug>/` URLs still work. Other articles use their
   dev.to slug.
5. If dev.to can't be reached, the build uses `src/data/devto-snapshot.json`
   and logs `dev.to articles skipped: …`. The build does not fail.

**Changing the account:** edit `DEVTO_USERNAME` in `src/utils/devto.js`. The
username is not read from an environment variable. `DEVTO_OVERRIDES` and the
snapshot belong to the current account, so change them too.

**Adding an override:** when a migrated post should keep an old URL, add
`<dev.to article id>: '<old slug>'` to `DEVTO_OVERRIDES`, then run
`npm run devto:snapshot`.

**Refreshing the snapshot:** run `npm run devto:snapshot` (or `make devto-snapshot`).
It writes `src/data/devto-snapshot.json` only if every request succeeds, and
exits non-zero otherwise. Commit the result. The snapshot is used only when
dev.to is unreachable, so a stale snapshot is safe, just out of date.

**Schedule:** `.github/workflows/deploy.yml` also runs daily at 03:00 UTC, so
new dev.to articles appear without a push. The schedule only runs on the
default branch.

**Tests:** `npm test` runs `tests/devto.test.mjs`, which covers mapping, dedupe,
overrides, retry and the snapshot fallback. Those tests inject `fetch`, so they
don't need network access.

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
