# Ashish CodeJourney

Personal website and blog at **[ashishvaghela.in](https://ashishvaghela.in)** — fast, minimal, content-first. Built with Astro 7 and served by Cloudflare Workers static assets.

![Astro](https://img.shields.io/badge/astro-7-BC52EE?style=flat-oval&logo=astro) 
[![Deploy](https://github.com/Ashish-CodeJourney/Ashish-CodeJourney.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/Ashish-CodeJourney/Ashish-CodeJourney.github.io/actions/workflows/deploy.yml)
![TypeScript](https://img.shields.io/badge/typescript-strict-3178C6?style=flat-oval&logo=typescript)

## Features

- **Astro 7 SSG** — static HTML, a few small scripts only where needed (menu, theme, greeting, necklace captions)
- **Design system "Queen's Necklace"** — tokens, type and layout rules in `plans/design-system.md`; no CSS framework, self-hosted fonts
- **Day/night scenery** — light theme is day (sun), dark theme is night (moon); mountain ridgelines and a sitting cat in the home hero and every footer
- **Home necklace** — one light per published piece (technical, writing, talk), hung between two lamp posts; time-aware greeting ("Good evening, I'm")
- **Two voices** — `/technical/` (workbench: year archive, tag filter, contents, copy-code) and `/writings/` (notebook: serif reading pages); separate RSS feeds
- **dev.to sync** — technical posts pulled from dev.to at build time, snapshot fallback, images via dev.to's resizing CDN
- **Open source page** (`/oss/`) — own projects, core contributions, notable projects and community roles, curated in `content/oss.json` and `content/community/`, with GitHub metadata fetched at build time
- **Speaking** (`/speaking/`) — speaker kit with talks, topics, bios and an invite link; `/talks` redirects here
- **About** — personal intro plus résumé (experience, skills, education) from `content/resume.json`
- **Links** (`/links/`) — standalone link-in-bio page made for projecting after a talk: links on the left, one large QR code on the right; QR hidden on phones
- **Responsive menu** — Menu button and panel under 860px; links still wrap without JavaScript
- **Hiring signal up front** — hero and About state role, location and availability (`location`, `availability` in `content/site.json`)
- **Share previews** — every page gets a generated 1200×630 `og:image` card at build time (`src/integrations/og-images.mjs`)
- **Security headers** — HSTS and a hash-based Content-Security-Policy appended to `dist/_headers` at build time (`src/integrations/security-headers.mjs`)
- **Quality gates** — unit tests, build-output specs and Lighthouse budgets in CI

---

## Project Structure

```text
.
├── content/                     # git submodule → Ashish-CodeJourney/content (private)
│   ├── site.json                # personal details, socials, /links entries
│   ├── resume.json              # About page résumé (summary, experience, skills, education)
│   ├── oss.json                 # /oss curation: own projects, contributions, notable projects
│   ├── community/               # community roles shown on /oss (note: true = one-line sentence)
│   ├── assets/                  # avatar, résumé PDF — symlinked into public/
│   ├── pages/                   # home.md (About intro), now.md
│   ├── technical/ writings/     # local posts (most technical posts come from dev.to)
│   ├── talks/ projects/ sponsors/
├── src/
│   ├── content.config.ts        # Zod schemas + loaders (glob, file, dev.to)
│   ├── site.config.ts           # SITE (url derived from astro.config `site`), LINKS, RESUME_PDF
│   ├── styles/                  # tokens.css (colours incl. day/night sky), base.css
│   ├── layouts/                 # BaseLayout (chrome toggle), TechnicalPostLayout, WritingLayout
│   ├── components/              # Header (menu), Footer, Ridgeline (scenery), PostRows, BrandIcon, ...
│   │   ├── home/Necklace.astro  # necklace of lights + lamp posts
│   │   └── oss/                 # rows for /oss
│   ├── pages/                   # index, technical/, writings/, oss, speaking/, about, links, now, projects/, sponsors/, 404
│   ├── utils/                   # pure, unit-tested logic (necklace, greeting, github, featured, community, resume, ...)
│   └── data/                    # devto-snapshot.json, github-snapshot.json (offline fallbacks)
├── github-pages/                # standalone redirect page for ashish-codejourney.github.io only
├── scripts/                     # refresh-devto-snapshot.mjs, refresh-github-snapshot.mjs
├── tests/                       # *.test.mjs unit tests; build/*.spec.mjs check built dist/
├── public/                      # static files, _headers (cache + security headers)
├── plans/                       # site-revamp.md (plan + progress), design-system.md
├── wrangler.jsonc               # Cloudflare Worker serving dist/ + custom domains
├── lighthouserc.json            # Lighthouse CI budgets
└── astro.config.mjs
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
   Cover images are not used: posts show no banner image.
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

## GitHub Integration

`/oss/` is curated in the content repo: `content/oss.json` lists my own projects and the projects I contribute to (role, summary, optional description), and `content/community/*.md` lists community roles (talks are added automatically).
At build time the site fetches GitHub metadata (description, language, stars) for each listed repo (`src/utils/github.js`, validated by `src/utils/featured.js`).
No token is required; if `GITHUB_TOKEN` is set (CI passes the workflow token) it's sent to avoid rate limits.
If GitHub is unreachable the build falls back to `src/data/github-snapshot.json` and logs a warning.
Refresh the snapshot with `npm run github:snapshot` (the file is left untouched if the fetch fails).

dev.to post images are rewritten to dev.to's resizing CDN (`resizeDevtoImages` in `src/utils/devto.js`) so posts never ship full-size uploads.

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

### Quality gates

| Command | What it checks |
|---|---|
| `make test` | Unit tests (`tests/*.test.mjs`) |
| `make test-build` | Built `dist/` output (`tests/build/*.spec.mjs`): custom-domain canonical/sitemap/robots, no video, no third-party fonts, cache headers. Run after `make build` |
| `make lighthouse` | Lighthouse CI budgets from `lighthouserc.json` (perf, LCP, CLS, TBT, JS size, a11y, SEO). Budgets are a ratchet — tighten them as each revamp phase lands, never loosen |

All three run in CI on every PR.

---

## Deployment

- **Production:** `https://ashishvaghela.in` (and `www.`) served by the Cloudflare Worker `ashishvaghela` with static assets from `dist/`, configured in `wrangler.jsonc` (custom domains are attached by the config). Deployed by `.github/workflows/deploy.yml` (`wrangler deploy`) on push to `trunk` and nightly (to pick up new dev.to posts). Manual deploy: `make build && npx wrangler deploy`.
- **Old address:** `ashish-codejourney.github.io` serves only `github-pages/` (a tiny standalone page, kept separate from the site and deployed only to GitHub Pages as `index.html` and `404.html`) that forwards every path, query and hash to the custom domain. Edit both files together; `tests/redirect-stub.test.mjs` checks they match.
- **Site URL** lives in one place: `site` in `astro.config.mjs`. `SITE.url` is derived from it — `url` in `content/site.json` is no longer read.

Required repository secrets: `CONTENT_DEPLOY_KEY`, `CLOUDFLARE_API_TOKEN` ("Edit Cloudflare Workers" template + Zone DNS: Edit on `ashishvaghela.in`), `CLOUDFLARE_ACCOUNT_ID`.

Fonts are self-hosted via `@fontsource-variable/*` packages imported in `BaseLayout.astro` — never link Google Fonts (a build spec enforces this).

---

## Customization

### Site Metadata
Edit `content/site.json` — title, description, author, social links, `/links` entries — then `make publish`. `src/site.config.ts` just re-exports it typed.

### Styles
Colours, type scale and spacing live in `src/styles/tokens.css`; shared base styles in `src/styles/base.css`. Page and component styles are Astro-scoped `<style>` blocks. Read `plans/design-system.md` before changing anything visual.

### Adding a New Page
Create `src/pages/your-page.astro` and wrap content in `<BaseLayout>`.

### Adding a New Collection
1. Define the schema and a `glob()` loader (pointed at `./content/collection-name`) in `src/content.config.ts`
2. Add the matching directory in `content/collection-name/` (in the `content` repo)
3. Add `src/pages/collection-name/index.astro` using `PostRows` (see `src/pages/writings/index.astro`)
4. Add `src/pages/collection-name/[slug].astro` using `WritingLayout` or `TechnicalPostLayout`, or a new layout built on `BaseLayout`
