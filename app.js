/**
 * Personal Website — App Logic
 * Vanilla JS, no dependencies.
 */

const DOM = {
  app: document.getElementById('app'),
  desktopNav: document.getElementById('desktop-nav'),
  mobileNav: document.getElementById('mobile-nav'),
  mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
  themeToggle: document.getElementById('theme-toggle'),
  mobileThemeSwitch: document.getElementById('mobile-theme-switch'),
  mobileThemeLabel: document.getElementById('mobile-theme-label'),
  currentYear: document.getElementById('current-year'),
  siteTitle: document.title
};

// ─── Init ──────────────────────────────────────────────────────
function init() {
  DOM.currentYear.textContent = new Date().getFullYear();
  setupNavigation();
  setupTheme();
  setupMobileMenu();
  setupSocialRedirects();
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

// ─── Social Redirects ──────────────────────────────────────────
function setupSocialRedirects() {
  const hash = window.location.hash || '';
  const url = getSocialRedirect(hash);
  if (url) window.location.href = url;
}

function getSocialRedirect(hash) {
  const path = hash.replace('#/', '').toLowerCase();
  const socials = CONFIG.site.socials || {};
  for (const [platform, url] of Object.entries(socials)) {
    if (path === platform.toLowerCase() && url) return url;
  }
  return null;
}

window.addEventListener('hashchange', () => {
  const url = getSocialRedirect(window.location.hash || '');
  if (url) window.location.href = url;
});

// ─── Navigation ────────────────────────────────────────────────
function setupNavigation() {
  const linksHtml = Object.values(CONFIG.pages)
      .filter(p => p.enabled)
      .map(p => `<a href="${p.path}" class="nav-link" data-path="${p.path}">${p.label}</a>`)
      .join('');

  DOM.desktopNav.innerHTML = linksHtml;

  const mobileWrapper = DOM.mobileNav.querySelector('.mobile-theme-wrapper');
  DOM.mobileNav.innerHTML = linksHtml;
  if (mobileWrapper) DOM.mobileNav.appendChild(mobileWrapper);
}

function updateActiveNav(hash) {
  const basePath = hash === '' || hash === '#/' ? '#/' : '#' + hash.split('/')[1];
  document.querySelectorAll('.nav-link').forEach(link => {
    const match = link.dataset.path === basePath ||
        (basePath.startsWith(link.dataset.path) && link.dataset.path !== '#/');
    link.classList.toggle('active', match);
  });
}

// ─── Mobile Menu ───────────────────────────────────────────────
function setupMobileMenu() {
  const mq = window.matchMedia('(max-width: 640px)');

  function syncToggle(e) {
    DOM.mobileMenuToggle.style.display = e.matches ? 'inline-flex' : 'none';
    if (!e.matches) DOM.mobileNav.classList.add('hidden');
  }

  syncToggle(mq);
  mq.addEventListener('change', syncToggle);

  DOM.mobileMenuToggle.addEventListener('click', () => {
    DOM.mobileNav.classList.toggle('hidden');
  });
  DOM.mobileNav.addEventListener('click', e => {
    if (e.target.tagName === 'A') DOM.mobileNav.classList.add('hidden');
  });
}

// ─── Theme ─────────────────────────────────────────────────────
function setupTheme() {
  const getPreferred = () => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    if (CONFIG.theme !== 'system') return CONFIG.theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const setTheme = theme => {
    if (theme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
      if (DOM.mobileThemeSwitch) DOM.mobileThemeSwitch.checked = true;
      if (DOM.mobileThemeLabel) DOM.mobileThemeLabel.textContent = 'Dark mode';
    } else {
      document.body.removeAttribute('data-theme');
      if (DOM.mobileThemeSwitch) DOM.mobileThemeSwitch.checked = false;
      if (DOM.mobileThemeLabel) DOM.mobileThemeLabel.textContent = 'Light mode';
    }
    localStorage.setItem('theme', theme);
  };

  setTheme(getPreferred());

  DOM.themeToggle.addEventListener('click', () => {
    const current = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  if (DOM.mobileThemeSwitch) {
    DOM.mobileThemeSwitch.addEventListener('change', e => {
      setTheme(e.target.checked ? 'dark' : 'light');
    });
  }
}

// ─── Markdown Parser ───────────────────────────────────────────
function parseMarkdown(md) {
  if (CONFIG.site.email) md = md.replace(/\{\{email\}\}/g, CONFIG.site.email);

  let html = md.replace(/\r\n/g, '\n');

  html = html
      .replace(/^### (.*$)/gim, '\n\n<h3>$1</h3>\n\n')
      .replace(/^## (.*$)/gim, '\n\n<h2>$1</h2>\n\n')
      .replace(/^# (.*$)/gim, '\n\n<h1>$1</h1>\n\n')
      .replace(/^\> (.*$)/gim, '\n\n<blockquote>$1</blockquote>\n\n')
      .replace(/^---$/gim, '\n\n<hr>\n\n')
      .replace(/^```(\w*)\n([\s\S]*?)\n```/gim, (_, lang, code) => {
        const esc = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        return `\n\n<pre><code class="language-${lang}">${esc}</code></pre>\n\n`;
      });

  html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, (_, code) => {
        const esc = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        return `<code>${esc}</code>`;
      })
      .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  html = html.replace(/^\s*[-*]\s+(.*)/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>(?:\n<li>.*<\/li>)*)/g, '\n\n<ul>\n$1\n</ul>\n\n');

  return html.split(/\n\n+/).map(p => {
    p = p.trim();
    if (!p || p.startsWith('<')) return p;
    return `<p>${p}</p>`;
  }).join('\n');
}

// ─── Frontmatter ───────────────────────────────────────────────
function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: text };

  const meta = {};
  match[1].split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx > -1) {
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      if (val.startsWith('[') && val.endsWith(']')) {
        val = val.slice(1, -1).split(',').map(s => {
          s = s.trim();
          return (s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))
              ? s.slice(1, -1) : s;
        });
      } else {
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
          val = val.slice(1, -1);
      }
      meta[key] = val;
    }
  });

  return { meta, content: match[2].trim() };
}

// ─── Content Loading ───────────────────────────────────────────
const contentCache = new Map();
let manifestCache = null;

async function fetchContent(path) {
  if (contentCache.has(path)) return contentCache.get(path);
  try {
    const res = await fetch(`content/${path}`);
    if (!res.ok) throw new Error(`Failed: ${path}`);
    const text = await res.text();
    contentCache.set(path, text);
    return text;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function fetchManifest() {
  if (manifestCache) return manifestCache;
  try {
    const res = await fetch('content/index.json');
    if (!res.ok) throw new Error('Failed to fetch manifest');
    manifestCache = await res.json();
    return manifestCache;
  } catch (err) {
    console.error(err);
    return { technical: [], writings: [], talks: [], sponsors: [] };
  }
}

// ─── View Helpers ──────────────────────────────────────────────
function setView(html, title) {
  document.title = title ? `${title} — ${CONFIG.site.title}` : CONFIG.site.title;
  DOM.app.className = 'site-content';
  void DOM.app.offsetWidth;
  DOM.app.className = 'site-content view-enter';
  DOM.app.innerHTML = html;
  applyStagger();
}

function applyStagger() {
  document.querySelectorAll('.stagger-item').forEach((el, i) => {
    el.style.animationDelay = `${i * 0.06}s`;
  });
}

function renderLoading() {
  DOM.app.innerHTML = `<div class="loading-state"><div class="spinner"></div></div>`;
}

function renderError() {
  setView(`
    <div class="error-container">
      <div class="error-code">404</div>
      <h2 class="error-title">Page not found</h2>
      <p class="error-text">This path doesn't exist yet, or something went wrong.</p>
      <a href="#/" class="button primary mt-4">Back home</a>
    </div>
  `, 'Not Found');
}

// ─── Tag rendering ──────────────────────────────────────────────
function renderTags(tags) {
  if (!Array.isArray(tags) || !tags.length) return '';
  return tags.map(t => `<span class="badge secondary">${t}</span>`).join('');
}

// ─── Home ───────────────────────────────────────────────────────
async function renderHome() {
  renderLoading();
  const raw = await fetchContent('home.md');
  if (!raw) return renderError();

  const { content } = parseFrontmatter(raw);
  const htmlContent = parseMarkdown(content);

  const manifest = await fetchManifest();
  const writings = (manifest.writings || [])
      .sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date))
      .slice(0, 3);

  const socials = Object.entries(CONFIG.site.socials || {})
      .filter(([_, url]) => url)
      .map(([platform, url]) => `
      <a href="${url}" target="_blank" rel="noopener" class="social-pill">
        ${platform}
      </a>
    `).join('');

  const writingsSection = writings.length > 0 ? `
    <section class="mt-8">
      <div class="section-header">
        <h2 style="font-size:1.35rem;">Recent writings</h2>
        <a href="#/writings" class="button outline" style="font-size:0.8rem; padding:0.3rem 0.85rem;">All writings →</a>
      </div>
      <div>
        ${writings.map(post => `
          <div class="post-item stagger-item">
            <a href="#/writings/${post.filename.replace('.md', '')}">
              <div style="display:flex; justify-content:space-between; align-items:baseline; gap:1rem;">
                <h3>${post.meta.title}</h3>
                <span class="text-sm muted" style="white-space:nowrap; flex-shrink:0;">${post.meta.date || ''}</span>
              </div>
              ${post.meta.description ? `<p class="text-sm muted" style="margin:0.25rem 0 0;">${post.meta.description}</p>` : ''}
            </a>
          </div>
        `).join('')}
      </div>
    </section>
  ` : '';

  const html = `
    <section class="hero text-center vstack align-center">
      <img src="${CONFIG.site.avatar}" alt="${CONFIG.site.author}" class="avatar" width="88" height="88">
      <h1 class="hero-name">${CONFIG.site.title}</h1>
      <p class="hero-desc">${CONFIG.site.description}</p>
      <nav class="social-links hstack gap-2 justify-center" aria-label="Social links">
        ${socials}
      </nav>
    </section>

    <section class="home-content post-content stagger-item" style="margin-top: 0.5rem;">
      ${htmlContent}
    </section>

    ${writingsSection}
  `;

  setView(html, 'Home');
}

// ─── Post list renderer ─────────────────────────────────────────
function renderPostList(posts, sectionHref, slugPrefix) {
  if (!posts.length) return '<p class="muted">Nothing here yet.</p>';
  return `<div>` + posts.map(post => `
    <div class="post-item stagger-item">
      <a href="${slugPrefix}/${post.filename.replace('.md', '')}">
        ${post.meta.banner ? `<img src="${post.meta.banner}" alt="${post.meta.title}" style="width:100%; height:180px; object-fit:cover; border-radius:8px; margin-bottom:0.75rem; border:1px solid var(--border);">` : ''}
        <div style="display:flex; justify-content:space-between; align-items:baseline; gap:1rem;">
          <h3>${post.meta.title}</h3>
          <span class="text-sm muted" style="white-space:nowrap; flex-shrink:0;">${post.meta.date || ''}</span>
        </div>
        ${post.meta.description ? `<p class="text-sm muted" style="margin:0.3rem 0 0;">${post.meta.description}</p>` : ''}
        ${Array.isArray(post.meta.tags) && post.meta.tags.length ? `<div style="margin-top:0.5rem; display:flex; gap:0.4rem; flex-wrap:wrap;">${renderTags(post.meta.tags)}</div>` : ''}
      </a>
    </div>
  `).join('') + `</div>`;
}



// ─── Technical ─────────────────────────────────────────────────
async function renderTechnical() {
  renderLoading();
  if (!CONFIG.pages.technical?.enabled) return renderError();

  const manifest = await fetchManifest();
  const posts = (manifest.technical || []).sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date));

  const html = `
    <header style="margin-bottom:2.5rem;">
      <p class="section-eyebrow">Engineering</p>
      <h1>Technical</h1>
      <p class="muted" style="margin-top:0.4rem; font-size:0.95rem;">Deep dives on code, systems, and craft.</p>
    </header>
    ${renderPostList(posts, '#/technical', '#/technical')}
  `;
  setView(html, 'Technical');
}

// ─── Technical post ────────────────────────────────────────────
async function renderTechnicalPost(slug) {
  renderLoading();
  const raw = await fetchContent(`technical/${slug}.md`);
  if (!raw) return renderError();

  const { meta, content } = parseFrontmatter(raw);
  const html = `
    <article>
      <header class="post-header">
        <a href="#/technical" class="back-link">← Technical</a>
        ${meta.banner ? `<img src="${meta.banner}" alt="${meta.title}" class="banner-img">` : ''}
        <h1>${meta.title}</h1>
        <div class="post-meta">
          ${meta.date ? `<span class="badge primary">${meta.date}</span>` : ''}
          ${renderTags(meta.tags)}
        </div>
      </header>
      <div class="post-content">${parseMarkdown(content)}</div>
    </article>
  `;
  setView(html, meta.title);
}

// ─── Writings ──────────────────────────────────────────────────
async function renderWritings() {
  renderLoading();
  if (!CONFIG.pages.writings?.enabled) return renderError();

  const manifest = await fetchManifest();
  const posts = (manifest.writings || []).sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date));

  const html = `
    <header style="margin-bottom:2.5rem;">
      <p class="section-eyebrow">Essays</p>
      <h1>Writings</h1>
      <p class="muted" style="margin-top:0.4rem; font-size:0.95rem;">Personal thoughts, stories, and reflections.</p>
    </header>
    ${renderPostList(posts, '#/writings', '#/writings')}
  `;
  setView(html, 'Writings');
}

// ─── Writing post ──────────────────────────────────────────────
async function renderWritingPost(slug) {
  renderLoading();
  const raw = await fetchContent(`writings/${slug}.md`);
  if (!raw) return renderError();

  const { meta, content } = parseFrontmatter(raw);
  const html = `
    <article>
      <header class="post-header">
        <a href="#/writings" class="back-link">← Writings</a>
        ${meta.banner ? `<img src="${meta.banner}" alt="${meta.title}" class="banner-img">` : ''}
        <h1>${meta.title}</h1>
        <div class="post-meta">
          ${meta.date ? `<span class="badge primary">${meta.date}</span>` : ''}
          ${renderTags(meta.tags)}
        </div>
      </header>
      <div class="post-content">${parseMarkdown(content)}</div>
    </article>
  `;
  setView(html, meta.title);
}

// ─── Talks ─────────────────────────────────────────────────────
async function renderTalks() {
  renderLoading();
  if (!CONFIG.pages.talks?.enabled) return renderError();

  const manifest = await fetchManifest();
  const talks = (manifest.talks || [])
      .map(t => ({ ...t, content: parseMarkdown(t.content || '') }))
      .sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date));

  const html = `
    <header style="margin-bottom:2.5rem;">
      <p class="section-eyebrow">Speaking</p>
      <h1>Talks</h1>
      <p class="muted" style="margin-top:0.4rem; font-size:0.95rem;">Conferences and meetups I've spoken at.</p>
    </header>
    <div style="display:flex; flex-direction:column; gap:1rem;">
      ${talks.length === 0 ? '<p class="muted">No talks yet.</p>' : talks.map(talk => `
        <div class="talk-card stagger-item">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; margin-bottom:0.75rem;">
            <div>
              <span class="badge secondary" style="margin-bottom:0.5rem;">${talk.meta.event || ''}</span>
              <h3 style="margin-top:0.5rem;">${talk.meta.title}</h3>
            </div>
            <span class="text-sm muted" style="white-space:nowrap; flex-shrink:0;">${talk.meta.date || ''}</span>
          </div>
          ${talk.meta.location ? `<p class="text-sm muted" style="margin-bottom:0.75rem;">📍 ${talk.meta.location}</p>` : ''}
          <div class="post-content text-sm" style="font-size:0.9rem; margin-bottom:1rem;">${talk.content}</div>
          <div style="display:flex; gap:0.5rem;">
            ${talk.meta.slides ? `<a href="${talk.meta.slides}" target="_blank" class="button secondary">Slides</a>` : ''}
            ${talk.meta.video ? `<a href="${talk.meta.video}" target="_blank" class="button secondary">Video</a>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
  setView(html, 'Talks');
}

// ─── Sponsors ──────────────────────────────────────────────────
async function renderSponsors() {
  renderLoading();
  if (!CONFIG.pages.sponsors?.enabled) return renderError();

  const manifest = await fetchManifest();
  const sponsors = (manifest.sponsors || []).map(s => ({
    ...s, content: parseMarkdown(s.content || '')
  }));

  const html = `
    <header style="margin-bottom:2.5rem; text-align:center;">
      <p class="section-eyebrow">Supporters</p>
      <h1>Sponsors</h1>
      <p class="muted" style="margin-top:0.4rem; font-size:0.95rem;">People and companies backing this work.</p>
    </header>
    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap:1rem;">
      ${sponsors.length === 0
      ? '<p class="muted text-center" style="grid-column:1/-1;">Be the first to sponsor.</p>'
      : sponsors.map(s => `
          <div class="sponsor-card stagger-item">
            ${s.meta.logo
          ? `<img src="${s.meta.logo}" alt="${s.meta.name}" style="max-height:60px; margin-bottom:1rem;">`
          : `<div style="width:60px;height:60px;border-radius:50%;background:var(--muted);display:flex;align-items:center;justify-content:center;font-family:var(--font-serif);font-size:1.5rem;color:var(--muted-fg);margin:0 auto 1rem;">${(s.meta.name||'?')[0]}</div>`}
            <h4 style="font-size:1rem;">${s.meta.name}</h4>
            <span class="badge secondary" style="margin-top:0.4rem;">${s.meta.tier || ''}</span>
            ${s.meta.url ? `<a href="${s.meta.url}" target="_blank" class="text-sm muted" style="display:block; margin-top:0.75rem;">Visit →</a>` : ''}
          </div>
        `).join('')}
    </div>
  `;
  setView(html, 'Sponsors');
}

// ─── Now ────────────────────────────────────────────────────────
async function renderNow() {
  renderLoading();
  if (!CONFIG.pages.now?.enabled) return renderError();

  const raw = await fetchContent('now.md');
  if (!raw) return renderError();

  const { content } = parseFrontmatter(raw);
  const html = `
    <article>
      <header style="margin-bottom:2.5rem;">
        <p class="section-eyebrow">Present</p>
        <h1>Now</h1>
        <p class="muted" style="margin-top:0.4rem; font-size:0.95rem;">What I'm focused on at this moment.</p>
      </header>
      <div class="post-content">${parseMarkdown(content)}</div>
    </article>
  `;
  setView(html, 'Now');
}

// ─── Router ────────────────────────────────────────────────────
function handleRoute() {
  const hash = window.location.hash || '#/';

  if (getSocialRedirect(hash)) { window.location.href = getSocialRedirect(hash); return; }

  updateActiveNav(hash);

  if (hash === '#/') renderHome();

  else if (hash === '#/technical') renderTechnical();
  else if (hash.startsWith('#/technical/')) renderTechnicalPost(hash.replace('#/technical/', ''));
  else if (hash === '#/writings') renderWritings();
  else if (hash.startsWith('#/writings/')) renderWritingPost(hash.replace('#/writings/', ''));
  else if (hash === '#/talks') renderTalks();
  else if (hash === '#/sponsors') renderSponsors();
  else if (hash === '#/now') renderNow();
  else renderError();
}

init();