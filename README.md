# Minimal Personal Website

A lightweight, minimal, and blazing-fast personal website built entirely with Vanilla HTML, CSS, and JavaScript. Zero dependencies, no heavy frameworks, no build steps, and perfectly suited for fast deployments to GitHub Pages.

![Static Site](https://img.shields.io/badge/static-site-4caf82?style=flat-oval) [![pages-build-deployment](https://github.com/Ashish-CodeJourney/Ashish-CodeJourney.github.io/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/Ashish-CodeJourney/Ashish-CodeJourney.github.io/actions/workflows/pages/pages-build-deployment) ![Vanilla JS](https://img.shields.io/badge/vanilla-JS-d4a024?style=flat-oval)


## Features

- **Minimal Node.js Build Tool**: Includes a tiny `build-index.js` script to automatically parse metadata, keeping the website blazing fast and pure Vanilla JS on the client side.
- **Markdown Driven**: All dynamic content (blogs, talks, sponsors, now page) is written beautifully in simple Markdown (`.md`) files.
- **Custom Markdown Parser**: A built-in, lightweight Vanilla JS parser handles Markdown and YAML-like frontmatter parsing natively.
- **Dynamic SPA Routing**: Hash-based routing (`#/blogs`) guarantees fast navigation without full page reloads, making it extremely straightforward to host on static services like GitHub Pages.
- **Light / Dark Theme System**: Fully native theme toggling with automatic system preference detection and `localStorage` persistence.
- **Highly Configurable**: Manage navigation visibility, social media handles, and base site metadata entirely through a single `config.js` file.
- **Powered by oat.ink**: Uses the minimal [oat.ink](https://oat.ink/) UI library for beautiful, semantic, and responsive base styling.

---

## Workspace Structure

```text
.
├── index.html        # The main HTML shell and layout
├── app.js            # Core Single Page App logic (Router & Parser)
├── config.js         # Site configuration (Title, Socials, Navigation)
├── styles.css        # Custom theme overrides (using HSL colors)
├── assets/           # Static assets (Favicons, images, logos)
└── content/          # The Markdown content directory
    ├── index.json    # JSON manifest that maps your markdown files
    ├── home.md       # Homepage content
    ├── now.md        # Status "Now" page content
    ├── blogs/        # Blog posts (uses _template.md)
    ├── sponsors/     # Sponsor cards (uses _template.md)
    └── talks/        # Talk logs (uses _template.md)
```

### Add a Writing
Same process but in `content/writings/` folder and under `"writings"` array in index.json.

Use the template at `content/writings/_template.md` as reference.

---

## How to Run Locally

Because this Single Page Application relies on JavaScript `fetch()` to dynamically load the Markdown files, you cannot just double-click `index.html` (which uses the `file://` protocol) due to browser CORS security restrictions.

You must run a local HTTP server. If you have Python installed, just run this from the project root:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080/` in your browser.

---

## Customization Guide

### 1. `config.js` (Site Settings)
Open `config.js` to change your site title, description, avatar, and social media links. You can also toggle entire navigation pages on or off by modifying the `enabled: true/false` flags inside the `pages` object.

### 2. Creating New Content
All text content lives inside the `content/` folder.
- **Static Pages**: Just edit `content/home.md` or `content/now.md` directly.
- **Blogs, Talks, & Sponsors**: 
  1. Copy the `_template.md` file found in their respective directories.
  2. Write your Markdown content and populate the Frontmatter (the metadata at the top of the file).
  3. **Crucial**: Run `node build-index.js` to automatically parse your new files and update the `content/index.json` manifest! (If you push to GitHub, a GitHub Action will do this for you automatically).

### 3. Modifying Styles
Open `styles.css`. The entire aesthetic of the site is powered by CSS variables (Custom Properties) written in `HSL` color format. You can drastically alter the entire site's color scheme in seconds simply by altering the `--primary`, `--background`, and `--border` variables located at the top of the file.
