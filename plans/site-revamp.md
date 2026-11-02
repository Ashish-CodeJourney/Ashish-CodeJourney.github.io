# Site Revamp — ashishvaghela.in

Status: **Phase 0 implemented on branch `feat/phase-0-domain-hosting` — awaiting Cloudflare setup + commit approval**
Date: 2026-11-02

## Goal

Turn the current minimal blog into a personal site that:

1. Positions Ashish as **software engineer → developer advocate** (credibility, talks, teaching).
2. Shows **open-source work as living proof** (not just a link to GitHub).
3. Keeps **technical posts and personal writing as two distinct worlds**, each with its own identity.
4. Is **fun and memorable** enough that visitors explore and come back.
5. Is **lightning fast** — performance is a feature, not an afterthought.

Non-goals: CMS, accounts/logins, heavy JS frameworks, newsletter (deferred — revisit later).

## Decisions (2026-11-02)

| Topic | Decision |
|---|---|
| Visual direction | **Terminal × Notebook** identity + **bento-grid** homepage |
| Hosting | **Cloudflare Pages** (static build + tiny Workers for reactions/counters). Already on Cloudflare Analytics; global edge CDN; free tier. |
| Hero video | **Removed.** Replace with typographic hero + small optimized avatar |
| Newsletter | **Not now.** Keep RSS prominent. Design leaves a slot for it later |
| Fun features | **As many as genuinely retain visitors** — original ones, no terminal easter egg (too common) |
| Technical vs personal | **Separate sections**, separate visual moods, separate feeds. No merged blog |

## Where we are today

| Area | Current state | Action |
|---|---|---|
| Stack | Astro 7 SSG, oat.ink CSS, View Transitions, dark mode, RSS, sitemap, `llms.txt` | Keep |
| Content | Private `content/` submodule (writings, technical + dev.to, talks, projects, sponsors, now) | Keep structure, extend schemas |
| Home | Hero video + avatar + blurb + 2 writings | Rebuild |
| Nav | 6 flat links incl. Sponsors | Restructure |
| Domain | `site` = `ashish-codejourney.github.io`, no CNAME | Migrate to `ashishvaghela.in` |
| Fonts | 5 Google font families | Cut to 3, self-hosted, subset |

## Design direction

**Two moods, one identity.**

- **Technical (`/technical`)** — "the workbench": crisp sans + JetBrains Mono accents, grid lines, code-forward cards, tag chips, difficulty/series badges.
- **Personal (`/writings`)** — "the notebook": warm serif, paper tone, generous whitespace, hand-drawn-style dividers, slower pace.
- **Shared thread** — one accent colour, the street cat 🐾 and chai ☕ as the personality motif, same header/footer.
- Section switch is felt via View Transitions (palette + type morph when moving between worlds).

Fonts (self-hosted via `@fontsource`, latin subset, `font-display: swap`, preload only the body face):
- Serif for writings (e.g. Source Serif 4 or Fraunces — one, not both)
- Sans for UI/technical (e.g. DM Sans / Inter)
- JetBrains Mono for code

## Performance budget (hard limits, enforced in CI)

| Metric | Budget |
|---|---|
| LCP (mobile, 4G) | < 1.2 s |
| CLS | < 0.05 |
| INP | < 100 ms |
| JS on initial load (home) | < 15 KB gzip; all fun features lazy (`client:idle` / `client:visible` / on interaction) |
| CSS | < 30 KB gzip, critical CSS inlined |
| Fonts | ≤ 3 files preloaded / total < 100 KB |
| Images | `astro:assets` → AVIF/WebP, explicit sizes, lazy below fold |
| Third-party | Only Cloudflare Analytics; giscus loads only on click |
| Lighthouse | ≥ 98 Performance, 100 A11y / Best Practices / SEO |

Also: drop `oat.min.css` if the new design system replaces it (measure first), prefetch links on hover (Astro `prefetch`), Speculation Rules for likely next page.

## Fun & retention features (original, privacy-friendly)

All progress stored in `localStorage` — no accounts, no tracking. Each is an isolated island, lazy-loaded, and the site works fully without it.

1. **Street Cat Hunt 🐾** — 9 hidden cats scattered across pages (in a footer, a code block, a post margin, the 404…). Find one → small toast + it joins your collection. Uses the existing Oneko character. Drives exploration of old content.
2. **Visitor Passport (`/passport`)** — a stamp book: posts read (stamped when you reach 80% scroll), cats found, sections visited, "night owl" (read after midnight), "chai break" (read 3 posts in one visit). Shows "You've read 4/12 technical posts" → nudges completion.
3. **Chai Reactions ☕ 🐾 💡** — one-tap reactions at the end of each post with live counts (Cloudflare Worker + D1/KV, rate-limited, no login). Social proof + engagement signal for you.
4. **Time-aware greeting & palette** — hero line and accent shift with visitor's local time ("Morning chai ☕", "Late-night debugging? Same."). Zero JS (inline tiny script) — personality on every visit.
5. **"Surprise me" dice 🎲** — random post from chosen world (technical / personal). Low effort, high rediscovery.
6. **Continue reading** — home bento tile remembers the post you left half-read ("You were 60% through *X* — pick up?"). Strong return hook.
7. **Highlight → share card** — select text in a post, share quote to X/LinkedIn with a pre-built OG card link. Spreads content, brings new visitors.
8. **Open Source Constellation (`/oss`)** — orgs you've contributed to rendered as a star map; each star = repo, brightness = PR count, click → PR list. Informational *and* playful. Built at build time from GitHub GraphQL (snapshot fallback).
9. **Reading ambience (personal writings only)** — optional toggle: soft rain / sea waves (Marine Drive nod). Audio fetched only on click.
10. **Series trails** — technical posts grouped into series with a visual progress trail ("Part 2 of 5") + "next up" card.
11. **Guestbook (`/guestbook`)** — giscus on GitHub Discussions; loads on click. Visitors leave notes, you reply → reason to return.

## Insights dashboard (private)

Own first-party analytics on the same Worker + D1 used for reactions. Privacy-first: no cookies, no IP stored, no fingerprinting → no consent banner needed.

- **Collect** (`POST /api/hit`, `navigator.sendBeacon`, ~1 KB script, after load): path, section (technical/writings/…), referrer host, country (from `CF-IPCountry` header), device class, UTM source, `read` event at 80% scroll, reaction events, cat-hunt/passport events.
- **Unique visitors** without cookies: daily-rotating salted hash of (IP + UA), salt discarded after 24h (Plausible-style).
- **Store**: raw events table + nightly rollup into `daily_stats` (Cron Trigger) to keep D1 row reads under free limits.
- **Dashboard** at `/dashboard`, protected by **Cloudflare Access** (free, email OTP login — only Ashish):
  - Visitors & pageviews (today / 7d / 30d / all-time, trend chart)
  - Top posts — views, **read-through rate** (reads ÷ views), avg. reactions
  - Technical vs Writings split
  - Referrers (dev.to, LinkedIn, X, Google, HN…), UTM campaigns
  - Countries, devices
  - Fun-feature engagement (cats found, passports started)
  - Realtime-ish: visitors in last 30 min
- **Public**: per-post view count + reaction counts shown on posts (optional, toggle).
- Keep Cloudflare Web Analytics alongside for Core Web Vitals (real-user LCP/INP/CLS).

Explicitly rejected: interactive terminal easter egg (common), Spotify now-playing (needs OAuth + server, low value), live presence counters (cost/complexity).

## Information architecture

```
/                  Home — hero + bento (latest technical, latest writing, OSS stats,
                   next talk, now, continue-reading, cat-hunt progress)
/technical         Technical posts — series, tags, search (Pagefind)
  /technical/<slug>
/writings          Personal writing — notebook style, by year/mood
  /writings/<slug>
/oss               Open Source Constellation + contribution list
/projects          Projects (existing, restyled)
/speaking          Talks + speaker kit (bio short/long, headshots, topics, invite CTA)
                   /talks/* → redirect
/about             Story, timeline (career + OSS milestones), /uses section
/now               Upgraded: reading / learning / building cards, last-updated
/passport          Visitor passport (stamps, cats)
/guestbook         giscus guestbook
footer: /links, /sponsors, RSS (technical + writings feeds separately), socials
```

Primary nav: **Technical · Writings · Open Source · Speaking · About** + ⌘K palette (search posts, toggle theme, copy email, surprise me).

## Phased delivery

One PR per phase; site deployable after each. TDD for all logic (fetchers, mappers, stamp/passport rules, reaction API, greeting-by-time, series ordering) via `node --test`; UI verified in browser via `agent-browser`.

| Phase | Scope | Skills |
|---|---|---|
| 0 | Hosting + domain: Cloudflare Pages project, `ashishvaghela.in` DNS, `site` URL update, redirects from github.io, CI deploy. **Remove hero video.** Set perf budget check in CI (Lighthouse CI) | `seo`, `performance` |
| 1 | Design system: tokens (colour, type, spacing, motion), two moods, font self-hosting; storyboard mocks for Home, Technical list/post, Writings list/post, OSS, Passport | `impeccable`, `frontend-design`, `storyboard`, `find-gaps` |
| 2 | Home (hero + bento, static tiles first) + new nav + footer | `impeccable`, `accessibility` |
| 3 | Technical & Writings sections restyled; separate RSS feeds; Pagefind search; post UX (TOC, progress bar, copy-code, heading anchors, OG images via Satori) | `tdd`, `performance` |
| 4 | `/oss` Constellation (GitHub GraphQL + snapshot) | `tdd`, `typescript-strict`, `functional` |
| 5 | `/about` + `/uses`, `/speaking` kit, `/now` upgrade, `/talks` redirects | `impeccable` |
| 6 | Retention layer 1 (client-only): time-aware greeting, surprise me, continue reading, series trails, ⌘K palette | `tdd`, `accessibility` |
| 7 | Retention layer 2: Street Cat Hunt + Passport | `tdd` |
| 8 | Retention layer 3 (edge): Chai Reactions Worker + D1, highlight→share, guestbook, reading ambience | `tdd`, `api-design`, `best-practices` |
| 8b | Insights: `/api/hit` collector, rollup cron, `/dashboard` behind Cloudflare Access, public view counts | `tdd`, `api-design`, `dataviz` |
| 9 | Final audit: CWV, SEO, a11y, budgets green | `web-quality-audit`, `core-web-vitals`, `seo`, `accessibility` |

## Success criteria
- Perf budget above met on Home, a technical post, and a writing.
- Visitor can name role + see OSS proof within first viewport.
- Every post ends with ≥ 1 next step (series next / related / surprise me / reactions).
- All fun features degrade gracefully with JS disabled and respect `prefers-reduced-motion`.
- Old URLs (`/talks/*`, `ashish-codejourney.github.io/*`) resolve to new locations.
- Build never fails when dev.to or GitHub API is unreachable (snapshot fallback).

## Progress log

### Phase 0 (2026-11-02)
- Site URL → `https://ashishvaghela.in` (single source: `astro.config.mjs`; `SITE.url` derived)
- Hero video + 6.4 MB 404 video removed; 404 illustration 800 KB → 24 KB WebP via `astro:assets`
- Google Fonts → self-hosted `@fontsource-variable` (same families, no visual change)
- `robots.txt` generated from `site`; `public/_headers` (immutable `/_astro/*`, security headers)
- Deploy: Cloudflare Pages via wrangler-action; github.io → redirect stub preserving path/query/hash
- CI: `make test-build` (dist spec) + `make lighthouse` (LHCI ratchet budgets)
- Baseline (Lighthouse mobile, simulated): home & writings perf ~90, LCP ~2.9 s; technical post perf ~70, LCP ~10 s
- **Learnings:** text LCP is gated by web-font bytes (~265 KB across 5 families) → Phase 1 font consolidation is the main LCP lever. Technical post LCP is unoptimized dev.to remote images (~1.2 MB) → Phase 3 must proxy/resize them. Inlining CSS gave no measurable gain while fonts dominate.

### Redesign from scratch (2026-11-02)
User feedback: Phase 0 "looks same" → rebuild every page from scratch now, multi-agent.
- Design system "Queen's Necklace" → `plans/design-system.md` (Marine Drive night palette, Bricolage Grotesque + Newsreader, rows not cards)
- Foundation (lead): tokens/base CSS, BaseLayout, Header, Footer, ThemeToggle, PostRows, home with necklace hero (`src/utils/necklace.js`, `src/utils/greeting.js`, TDD)
- Parallel agents: technical section · writings section · /oss + projects · speaking/about/now/links/sponsors/404/redirect
- oat.min.css and global.css retired once all pages migrate

## Requires user action
- Cloudflare account access + add `ashishvaghela.in` zone (change nameservers at registrar).
- GitHub token (read-only, public data) as CI secret for `/oss`.
- Headshots + bio text for `/speaking`; story/timeline facts for `/about`.

## Deferred
- Newsletter (Buttondown/Substack) — slot reserved in post footer + home bento.
