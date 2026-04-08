# Minimal Personal Website

A lightweight, minimal, and blazing-fast personal website. It is built as a highly-optimized Static Site Generator (SSG). Zero dependencies, no heavy frameworks, and perfectly suited for fast deployments to GitHub Pages.

![Static Site](https://img.shields.io/badge/static-site-4caf82?style=flat-oval) [![pages-build-deployment](https://github.com/Ashish-CodeJourney/Ashish-CodeJourney.github.io/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/Ashish-CodeJourney/Ashish-CodeJourney.github.io/actions/workflows/pages/pages-build-deployment) ![Vanilla JS](https://img.shields.io/badge/vanilla-JS-d4a024?style=flat-oval)

## Features

- **Static Site Generator**: Includes a local `build-index.js` script to automatically parse markdown and assemble static `.html` files, guaranteeing the absolute fastest possible page loads with an entirely tiny javascript footprint remaining on the client.
- **Markdown Driven**: All dynamic content (blogs, talks, sponsors, now page) is written beautifully in simple Markdown (`.md`) files.
- **Fully Automated Deployment**: A GitHub Action is configured (in `.github/workflows/deploy.yml`) to automatically build and deploy your site to GitHub Pages whenever you push changes. You never have to manually build HTML files before pushing.
- **Light / Dark Theme System**: Fully native theme toggling with automatic system preference detection and `localStorage` persistence.
- **Highly Configurable**: Manage navigation visibility, social media handles, and base site metadata entirely through a single `config.json` file.
- **Powered by oat.ink**: Uses the minimal [oat.ink](https://oat.ink/) UI library for beautiful, semantic, and responsive base styling.

---

## Workspace Structure

```text
.
├── _layout.html      # The main HTML shell and layout template
├── app.js            # Tiny client-side script for theme toggling and mobile nav
├── build-index.js    # Node.js Static Site Generator
├── config.json         # Site configuration (Title, Socials, Navigation)
├── styles.css        # Custom theme overrides (using HSL colors)
├── assets/           # Static assets (Favicons, images, logos)
└── content/          # The Markdown content directory
    ├── home.md       # Homepage content
    ├── now.md        # Status "Now" page content
    ├── writings/     # Essay and writing posts
    ├── technical/    # Engineering and technical blog posts
    ├── sponsors/     # Sponsor cards
    └── talks/        # Talk logs
```

---

## ✍️ How to Publish New Content

You **ONLY** need to work with Markdown files. The generated `.html` files are fully ignored by git.

1. **Write it:** Create a new markdown (`.md`) file inside `content/technical/` or `content/writings/`.
2. **Add Frontmatter:** Make sure the top of your markdown file has standard metadata:
   ```yaml
   ---
   title: "My Awesome New Post"
   date: "Apr 06, 2026"
   description: "A short summary of what this post is about"
   tags: ["React", "JavaScript"]
   ---
   ```
3. **Write the post:** Start writing your markdown content below the dashes.
4. **Commit and Deploy:** Save the markdown file, `git commit` your changes, and push to GitHub!
5. **Automation:** The magic happens on GitHub. The GitHub Actions workflow will securely pre-build the markdown to HTML on the server, ensuring your site's JavaScript footprint remains impossibly tiny, and instantly deploy your latest content to GitHub Pages in the background.

---

## How to Run & Preview Locally

If you want to preview your content locally before you push it to GitHub:

1. Run the static site generator so it creates the `dist/` folder:
   ```bash
   node build-index.js
   ```
2. Start a local HTTP server targeting that new `dist/` folder. If you have Python installed, you can simply run:
   ```bash
   python3 -m http.server 8080 -d dist
   ```
3. Visit `http://localhost:8080/` in your browser.

*Note: The generated `.html` folders are safely ignored by `.gitignore`, so they won't accidentally be pushed to GitHub.*

---

## Customization Guide

### 1. `config.json` (Site Settings)
Open `config.json` to change your site title, description, avatar, and social media links. You can also toggle entire navigation pages on or off by modifying the `enabled: true/false` flags inside the `pages` object.

### 2. Modifying Site Structure
Open `_layout.html`. This file acts as the primary layout template for every single page built. 

### 3. Modifying Styles
Open `styles.css`. The entire aesthetic of the site is powered by CSS variables (Custom Properties) written in `HSL/HEX` color format. You can drastically alter the entire site's color scheme in seconds simply by altering the variables located at the top of the file. After tweaking styles or layouts, re-run `node build-index.js` locally to see the changes.
