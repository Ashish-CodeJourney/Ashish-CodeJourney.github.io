# Design system — "Queen's Necklace"

Source of truth for the from-scratch redesign. Every page agent reads this first.

## Concept

Marine Drive at night: a dark sea, a curved promenade, and a string of sodium-vapour
streetlights (the "Queen's Necklace"). On this site **every published piece is one light
on that necklace** — the journey is literally visible. That hero is the one bold thing;
everything else is quiet, typographic and disciplined.

Two voices, one city:
- **Technical** = "the workbench": Bricolage Grotesque body, code-forward, crisp.
- **Writings** = "the notebook": Newsreader serif body, slower, wider leading, narrower measure.

### Review against generic defaults (what we avoided and why)
- The old site was cream `#FAF8F5` + clay `#C2956C` + serif display — the #1 generated-site
  look. Replaced with a sea-fog / night-sea palette taken from Marine Drive.
- No near-black + acid-green "terminal" theme (cliché, and the user rejected terminal gimmicks).
- No card grid with identical radii/shadows. Lists are rows separated by a 1px line.
- No ALL-CAPS eyebrows, no mono micro-labels, no `→` on links, no `A · B · C` meta strings,
  no fade-up on every section. One orchestrated moment only: the necklace lights up on load.

## Colour tokens (`src/styles/tokens.css`)

| Token | Light ("monsoon morning") | Dark ("Marine Drive night") | Use |
|---|---|---|---|
| `--bg` | `#EDF1F2` | `#0B1C26` | page |
| `--surface` | `#F8FAFA` | `#10283A` | code blocks, inputs, raised areas |
| `--ink` | `#0F212C` | `#E4ECEF` | text |
| `--ink-2` | `#4A5A63` | `#93A6B0` | secondary text, dates |
| `--line` | `#C9D3D7` | `#23404F` | 1px rules, borders |
| `--lamp` | `#8F5400` | `#FFB547` | links, focus, accent text (AA on `--bg`) |
| `--lamp-glow` | `#F5A524` | `#FFB547` | necklace lights, decorative only |
| `--night` | `#0B1C26` | `#071621` | hero band (always night, both themes) |
| `--night-ink` | `#E4ECEF` | `#E4ECEF` | text on hero band |

### Day / night scenery
Light theme = **day** (pale sky, blue-haze ridges, amber sun); dark theme = **night** (night sky, moonlit ridges, pale moon).
Tokens: `--sky`, `--sky-ink`, `--sky-ink-2`, `--sky-line`, `--sky-accent`, `--celestial` (sun/moon), `--cat`, `--footer-band`.
`src/components/Ridgeline.astro` draws three ridges, the sun/moon and a sitting cat silhouette (tail sways; off under reduced motion). Used at the bottom of the home hero and the top of every footer. Paths are static (generated once), inline SVG, no images.

Theme switch: `html.dark` class (existing `src/utils/theme.js`). Always use tokens, never raw hex in components.

## Type

| Family | Package | Role |
|---|---|---|
| Bricolage Grotesque (wght) | `@fontsource-variable/bricolage-grotesque/wght.css` | UI, headings, display, technical body |
| Newsreader (wght + italic) | `@fontsource-variable/newsreader/wght.css` (+ `wght-italic.css`) | writings body + writing titles |
| JetBrains Mono (wght) | `@fontsource-variable/jetbrains-mono/wght.css` | code only — import it **only** in the technical post layout |

CSS vars: `--font-ui`, `--font-serif`, `--font-code`.

Scale (ratio 1.25, base 17px) — `--step--1` … `--step-5`, plus `--display` (clamp). Use the steps, don't invent sizes.
- Body: `--step-0`, line-height 1.6 (sans) / 1.75 (serif).
- Headings: Bricolage 650, tracking `-0.02em`; display 800, tracking `-0.04em`, line-height 0.92.
- Sentence case everywhere. Bold/italic only for meaning, never to "accent" one headline word.

## Layout

- `--wrap: 72rem` page container, `--measure-tech: 42rem`, `--measure-serif: 36rem`.
- Left-aligned. No centred body text except the 404.
- Spacing tokens `--space-1` … `--space-9` (0.25rem → 8rem, roughly ×1.5).
- Radius: `--radius: 4px` for controls/code only. Lists have no radius, no shadow.
- Lists of posts = rows: date column (`--ink-2`, tabular nums) + title + optional one-line summary; separated by `1px solid var(--line)`.
- Header: name left, nav right; on mobile nav becomes a horizontally scrollable row (no hamburger JS).
- Theme toggle lives in the header (not floating).

## Motion
- Necklace lights fade in left→right once on page load (≤ 900 ms total). Nothing else animates on load.
- Hover/focus: colour change only. `prefers-reduced-motion: reduce` → no animation at all.
- Visible focus ring everywhere: `outline: 2px solid var(--lamp); outline-offset: 3px`.

## Voice
Plain, first person, short. Name things by what readers get ("All technical posts", not "View archive").

## Shared building blocks (already built — reuse, don't fork)
- `src/layouts/BaseLayout.astro` — shell, fonts, theme, SEO, header/footer. Props: `title`, `description`, `ogImage`, `voice?: 'tech' | 'notebook'` (sets `data-voice` on `<main>`).
- `src/styles/base.css` — reset, tokens import, typography, `.wrap`, `.rows` list pattern, `.prose` (generic markdown), focus styles.
- `src/components/Header.astro`, `Footer.astro`, `ThemeToggle.astro`.
- `src/components/PostRows.astro` — the row list (`items: {href,title,date,summary?}[]`, `voice`).
- `src/utils/date.ts` — `formatDate`, `readingTime`.

Page-specific styles go in the page/component `<style>` block (Astro-scoped), not in `base.css`.
