import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ─── Paths ────────────────────────────────────────────────────────────────────

const ROOT       = path.dirname(fileURLToPath(import.meta.url));
const CONTENT    = path.join(ROOT, 'content');
const DIST       = path.join(ROOT, 'dist');
const LAYOUT     = path.join(ROOT, '_layout.html');
const CONFIG     = path.join(ROOT, 'config.json');   // was config.json + eval()

// ─── Config ───────────────────────────────────────────────────────────────────

function loadConfig(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const cfg = JSON.parse(raw);                       // safe — no eval()

  const required = ['title', 'author', 'description'];
  for (const key of required) {
    if (!cfg.site?.[key]) throw new Error(`config.json missing site.${key}`);
  }
  return cfg;
}

// ─── Filesystem helpers ───────────────────────────────────────────────────────

function readFile(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${filePath}`);
  return fs.readFileSync(filePath, 'utf-8');
}

function writeFile(relPath, html) {
  const fullPath = path.join(DIST, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, html, 'utf-8');
}

function copyDir(src, dest) {
  if (fs.existsSync(src)) fs.cpSync(src, dest, { recursive: true });
}

function resetDist() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
}

// ─── Frontmatter parser ───────────────────────────────────────────────────────

function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: text.trim() };

  const meta = {};
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;

    const key = line.slice(0, colon).trim();
    let val   = line.slice(colon + 1).trim();

    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
    } else {
      val = val.replace(/^['"]|['"]$/g, '');
    }
    meta[key] = val;
  }

  return { meta, body: match[2].trim() };
}

// ─── Markdown renderer ────────────────────────────────────────────────────────

const BLOCK_RULES = [
  [/^### (.+)$/gm,                         '\n\n<h3>$1</h3>\n\n'],
  [/^## (.+)$/gm,                          '\n\n<h2>$1</h2>\n\n'],
  [/^# (.+)$/gm,                           '\n\n<h1>$1</h1>\n\n'],
  [/^\\> (.+)$/gm,                         '\n\n<blockquote>$1</blockquote>\n\n'],
  [/^---$/gm,                              '\n\n<hr>\n\n'],
];

const INLINE_RULES = [
  [/\*\*(.+?)\*\*/g,                       '<strong>$1</strong>'],
  [/\*([^*]+)\*/g,                         '<em>$1</em>'],
  [/!\[([^\]]+)\]\(([^)]+)\)/g,           '<img src="$2" alt="$1">'],
  [/\[([^\]]+)\]\(([^)]+)\)/g,            '<a href="$2" target="_blank" rel="noopener">$1</a>'],
];

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function renderCodeBlock(_, lang, code) {
  return `\n\n<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>\n\n`;
}

function renderInlineCode(_, code) {
  return `<code>${escapeHtml(code)}</code>`;
}

function wrapListItems(html) {
  return html
      .replace(/^\s*[-*]\s+(.+)/gm, '<li>$1</li>')
      .replace(/((<li>.+<\/li>\n?)+)/g, '\n\n<ul>\n$1\n</ul>\n\n');
}

function wrapParagraphs(html) {
  return html.split(/\n\n+/).map(p => {
    p = p.trim();
    if (!p || p.startsWith('<')) return p;
    return `<p>${p}</p>`;
  }).join('\n');
}

function substituteTemplateVars(md, config) {
  return md.replace(/\{\{email\}\}/g, config.site.email ?? '');
}

function parseMarkdown(md, config) {
  let html = substituteTemplateVars(md, config).replace(/\r\n/g, '\n');

  html = html.replace(/^```(\w*)\n([\s\S]*?)\n```/gim, renderCodeBlock);

  for (const [pattern, replacement] of BLOCK_RULES) {
    html = html.replace(pattern, replacement);
  }

  html = html.replace(/`([^`]+)`/g, renderInlineCode);

  for (const [pattern, replacement] of INLINE_RULES) {
    html = html.replace(pattern, replacement);
  }

  html = wrapListItems(html);
  html = wrapParagraphs(html);

  return html;
}

// ─── Template renderer ────────────────────────────────────────────────────────

const PLACEHOLDER = {
  TITLE:   '{{TITLE}}',
  CONTENT: '{{CONTENT}}',
  PAGES:   '{{__PAGES_SCRIPT__}}',
};

function applyLayout(layout, { title, content, pagesScript, siteTitle }) {
  const pageTitle = title === siteTitle ? title : `${title} — ${siteTitle}`;
  return layout
      .replace(PLACEHOLDER.TITLE,   pageTitle)
      .replace(PLACEHOLDER.CONTENT, content)
      .replace(PLACEHOLDER.PAGES,   pagesScript ?? '');
}

// ─── Component renderers ──────────────────────────────────────────────────────

function renderTags(tags) {
  if (!Array.isArray(tags) || !tags.length) return '';
  return tags.map(t => `<span class="badge secondary" style="font-size:0.75rem;">${t}</span>`).join('');
}

function renderSocialLinks(socials = {}) {
  return Object.entries(socials)
      .filter(([, url]) => url)
      .map(([platform, url]) =>
          `<a href="${url}" target="_blank" rel="noopener" class="social-pill">${platform}</a>`
      ).join('');
}

function renderPostCard(post, slugPrefix) {
  const slug = post.filename.replace('.md', '');
  const { title = '', date = '', description = '', banner = '', tags } = post.meta;

  const bannerHTML = banner
      ? `<img src="${banner}" alt="${title}" style="width:100%;height:180px;object-fit:cover;border-radius:8px;margin-bottom:0.75rem;border:1px solid var(--border);">`
      : '';

  return `
    <div class="post-item stagger-item">
      <a href="#${slugPrefix}/${slug}/">
        ${bannerHTML}
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:1rem;">
          <h3>${title}</h3>
          <span class="text-light" style="font-size:var(--text-7);white-space:nowrap;flex-shrink:0;">${date}</span>
        </div>
        ${description ? `<p class="text-light" style="font-size:var(--text-7);margin:0.3rem 0 0;">${description}</p>` : ''}
        ${Array.isArray(tags) && tags.length ? `<div style="margin-top:0.5rem;display:flex;gap:0.4rem;flex-wrap:wrap;">${renderTags(tags)}</div>` : ''}
      </a>
    </div>`;
}

function renderPostList(posts, slugPrefix) {
  if (!posts.length) return '<p class="text-light">Nothing here yet.</p>';
  return `<div>${posts.map(p => renderPostCard(p, slugPrefix)).join('')}</div>`;
}

// ─── Page builders ────────────────────────────────────────────────────────────

function buildHomePage(homeContent, recentWritings, config) {
  const socials = renderSocialLinks(config.site.socials);

  const recentWritingsHTML = recentWritings.length ? `
    <section class="mt-8">
      <div class="section-header">
        <h2 style="font-size:1.35rem;">Recent writings</h2>
        <a href="#/writings/" class="button outline" style="font-size:0.8rem;padding:0.3rem 0.85rem;">All writings →</a>
      </div>
      ${renderPostList(recentWritings, '/writings')}
    </section>` : '';

  return `
    <section class="hero text-center stagger-item">
      <img src="assets/avatar.jpg" alt="${config.site.author}" class="hero-avatar" width="100" height="100">
      <p class="hero-desc">${config.site.description}</p>
      <nav class="hstack gap-2 justify-center" aria-label="Social links">${socials}</nav>
    </section>
    <section class="home-content post-content stagger-item" style="margin-top:0.5rem;">
      ${homeContent}
    </section>
    ${recentWritingsHTML}`;
}

function buildPostListPage(posts, slugPrefix, { eyebrow, title, subtitle }) {
  return `
    <header style="margin-bottom:2.5rem;" class="stagger-item">
      <p class="section-eyebrow">${eyebrow}</p>
      <h1>${title}</h1>
      <p class="text-light" style="margin-top:0.4rem;font-size:var(--text-6);">${subtitle}</p>
    </header>
    <div class="stagger-item">${renderPostList(posts, slugPrefix)}</div>`;
}

function buildPostPage(post, backHref, backLabel) {
  const { title = '', date = '', banner = '', tags } = post.meta;

  const bannerHTML = banner
      ? `<img src="${banner}" alt="${title}" class="banner-img">`
      : '';

  return `
    <article>
      <header class="post-header stagger-item">
        <a href="${backHref}" class="back-link">← ${backLabel}</a>
        ${bannerHTML}
        <h1>${title}</h1>
        <div class="post-meta">
          ${date ? `<span class="badge primary">${date}</span>` : ''}
          ${renderTags(tags)}
        </div>
      </header>
      <div class="post-content stagger-item">${post.content}</div>
    </article>`;
}

function buildNowPage(content) {
  return `
    <article>
      <header style="margin-bottom:2.5rem;" class="stagger-item">
        <p class="section-eyebrow">Present</p>
        <h1>Now</h1>
        <p class="text-light" style="margin-top:0.4rem;font-size:var(--text-6);">What I'm focused on at this moment.</p>
      </header>
      <div class="post-content stagger-item">${content}</div>
    </article>`;
}

// ─── Content loader ───────────────────────────────────────────────────────────

function loadPosts(dir, config) {
  const dirPath = path.join(CONTENT, dir);
  if (!fs.existsSync(dirPath)) return [];

  return fs.readdirSync(dirPath)
      .filter(f => f.endsWith('.md') && f !== '_template.md')
      .map(filename => {
        const { meta, body } = parseFrontmatter(readFile(path.join(dirPath, filename)));
        return { filename, meta, content: parseMarkdown(body, config) };
      })
      .sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date));
}

// ─── Main build ───────────────────────────────────────────────────────────────

function build() {
  const config  = loadConfig(CONFIG);
  const layout  = readFile(LAYOUT);
  const pages   = {};

  const render = (title, content, pagesScript) =>
      applyLayout(layout, { title, content, pagesScript, siteTitle: config.site.title });

  const registerPage = (route, title, content) => {
    pages[route] = { html: content, title };
  };

  resetDist();

  const writingPosts   = loadPosts('writings',  config);
  const technicalPosts = loadPosts('technical', config);

  // Home
  const homeBody    = parseFrontmatter(readFile(path.join(CONTENT, 'home.md'))).body;
  const homeContent = parseMarkdown(homeBody, config);
  const homeHTML    = buildHomePage(homeContent, writingPosts.slice(0, 3), config);
  registerPage('/', config.site.title, homeHTML);

  // Writings index
  const writingsHTML = buildPostListPage(writingPosts, '/writings', {
    eyebrow:  'Essays',
    title:    'Writings',
    subtitle: 'Personal thoughts, stories, and reflections.',
  });
  registerPage('/writings/', 'Writings', writingsHTML);

  // Writing posts
  for (const post of writingPosts) {
    const html = buildPostPage(post, '#/writings/', 'Writings');
    const slug = post.filename.replace('.md', '');
    registerPage(`/writings/${slug}/`, post.meta.title, html);
  }

  // Technical index
  const technicalHTML = buildPostListPage(technicalPosts, '/technical', {
    eyebrow:  'Engineering',
    title:    'Technical',
    subtitle: 'Deep dives on code, systems, and craft.',
  });
  registerPage('/technical/', 'Technical', technicalHTML);

  // Technical posts
  for (const post of technicalPosts) {
    const html = buildPostPage(post, '#/technical/', 'Technical');
    const slug = post.filename.replace('.md', '');
    registerPage(`/technical/${slug}/`, post.meta.title, html);
  }

  // Now page
  const nowBody    = parseFrontmatter(readFile(path.join(CONTENT, 'now.md'))).body;
  const nowContent = parseMarkdown(nowBody, config);
  const nowHTML    = buildNowPage(nowContent);
  registerPage('/now/', 'Now', nowHTML);

  // Inject SPA page map into index.html
  const pagesScript = `<script>window.__PAGES = ${JSON.stringify(pages)};</script>`;
  writeFile('index.html', render(config.site.title, homeHTML, pagesScript));

  // Write fallback HTML pages for SEO / direct navigation
  writeFile('writings/index.html', render('Writings', writingsHTML));
  for (const post of writingPosts) {
    const slug = post.filename.replace('.md', '');
    writeFile(`writings/${slug}/index.html`, render(post.meta.title, pages[`/writings/${slug}/`].html));
  }

  writeFile('technical/index.html', render('Technical', technicalHTML));
  for (const post of technicalPosts) {
    const slug = post.filename.replace('.md', '');
    writeFile(`technical/${slug}/index.html`, render(post.meta.title, pages[`/technical/${slug}/`].html));
  }

  writeFile('now/index.html', render('Now', nowHTML));

  // Static assets
  copyDir(path.join(ROOT, 'assets'), path.join(DIST, 'assets'));
  for (const f of ['styles.css', 'app.js', '404.html']) {
    const src = path.join(ROOT, f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(DIST, f));
  }

  console.log(`Built ${Object.keys(pages).length} routes → dist/`);
}

build();