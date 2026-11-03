# Make it a 10

Review (2026-11-03) scored the site 7.5/10: strong engineering, weak hiring signal.
Goal: a visitor (recruiter, CTO, event organiser) knows within one screen who Ashish is,
what roles he wants, where he is, and can share any page with a proper preview.

## Decisions (from user, 2026-11-03)
- Availability: open to full-time remote roles: software engineering, developer advocacy, open source. Not "backend only".
- Location shown as "India · IST" (no city in hero/About intro).
- Email stays gmail.
- About must not claim Kubernetes experience (existing spec).

## Increments (each: failing build spec → code → green)
1. Hero states role, the roles he's open to, and India · IST, with résumé + email CTA.
2. Header nav includes Projects.
3. About intro leads with role/location/availability instead of "somewhere on Earth"; résumé links shown once.
4. Experience: Nelkinda shown as one role with ChatNCharge nested as a client project.
5. Every page has an `og:image` PNG generated at build time (title + section), and the file exists in dist.
6. Security headers: HSTS + Content-Security-Policy.
7. llms.txt heading uses full name and role.
8. dev.to excerpts never end mid-sentence with "...".
9. Remove duplicate résumé PDF (`public/Ashish_Vaghela_Resume.pdf`, unreferenced).

## Requires user input (cannot be invented)
- ~~Experience numbers~~: ChatNCharge 1,000+ users added. No numbers for the Greycell query speed-up.
- ~~Aether case study~~: written from the repo's README, ADRs and BENCHMARKS.md.
- ~~Fresh `/now`~~: updated 2026-11-03.
- No talk recording or photos yet; no new JVM posts yet.
- Newsletter decision (still deferred).

## Progress log

### 2026-11-03
- 1–2 Hero: role line, availability + "India · IST" (from `content/site.json` `availability`/`location`), résumé + email CTAs. Projects added to header nav.
- 3 About: intro says "working remotely from India"; availability card in sidebar; résumé links shown once.
- 4 Experience: `projects[]` on experience entries (schema); ChatNCharge nested under Nelkinda.
- 5 Share previews: `src/integrations/og-images.mjs` renders a 1200×630 PNG per page after build (satori → sharp, Bricolage .woff from `@fontsource/bricolage-grotesque`). Card text from `src/utils/og.js` (unit-tested). Per-page banner overrides removed: they emitted relative, invalid `og:image` URLs.
- 6 Security: `src/integrations/security-headers.mjs` appends HSTS + CSP to `dist/_headers`; script hashes computed from built HTML (`src/utils/csp.js`).
- 7 llms.txt: full name, role, location, availability, contact.
- 8 dev.to summaries: auto-cut excerpts (ending `...`) replaced by whole sentences from the body, ≤ 200 chars.
- 9 Old `/Ashish_Vaghela_Resume.pdf` removed; 301 via `public/_redirects`.
- **Learnings:**
  - satori lays out with content-box: padding adds to width/height, so give the root `width: INNER, height: HEIGHT - 2·PAD`.
  - satori can't read woff2 and has no emoji font: use `.woff` and strip emoji from card text.
  - Astro's ClientRouter inserts `<script type="module" src="data:application/javascript,">` whenever a page has inline module scripts, which CSP blocks. Vite also inlines tiny fonts as `data:`. `vite.build.assetsInlineLimit: 0` makes both external, leaving 2 inline-script hashes.
  - Shiki writes ~3,900 `style=""` attributes, so `style-src` needs `'unsafe-inline'`. Script hashes can't go in a meta CSP if we also want `frame-ancestors`, so the CSP is a header.
- 10 ChatNCharge bullet says 1,000+ users. `/now` covers the Diwali break, learning the wider tech ecosystem, and DevFest Mumbai on 5 Dec. Aether page rewritten as a case study (request flow, results incl. missed targets, decisions, non-goals, gaps). Projects get `urlLabel` (default "Visit the live site"); Aether uses "Read the documentation" because it has no public deployment.
