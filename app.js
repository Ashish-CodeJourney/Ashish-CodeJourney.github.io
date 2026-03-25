/**
 * Personal Website App Logic
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

// --- Initialization ---
function init() {
  DOM.currentYear.textContent = new Date().getFullYear();
  setupNavigation();
  setupTheme();
  setupMobileMenu();

  // Router listener
  window.addEventListener('hashchange', handleRoute);
  // Initial route
  handleRoute();
}

// --- Navigation ---
function setupNavigation() {
  const linksHtml = Object.values(CONFIG.pages)
    .filter(page => page.enabled)
    .map(page => `<a href="${page.path}" class="nav-link" data-path="${page.path}">${page.label}</a>`)
    .join('');

  DOM.desktopNav.innerHTML = linksHtml;

  // Mobile nav prepends links before the theme toggle wrapper
  const mobileWrapper = DOM.mobileNav.querySelector('.mobile-theme-wrapper');
  DOM.mobileNav.innerHTML = linksHtml;
  DOM.mobileNav.appendChild(mobileWrapper);
}

function updateActiveNav(hash) {
  // Extract base path (e.g. #/blogs from #/blogs/my-post)
  const basePath = hash === '' || hash === '#/' ? '#/' : '#' + hash.split('/')[1];

  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.dataset.path === basePath || (basePath.startsWith(link.dataset.path) && link.dataset.path !== '#/')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// --- Mobile Menu ---
function setupMobileMenu() {
  DOM.mobileMenuToggle.addEventListener('click', () => {
    DOM.mobileNav.classList.toggle('hidden');
  });

  // Close on link click
  DOM.mobileNav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      DOM.mobileNav.classList.add('hidden');
    }
  });
}

// --- Theme Management ---
function setupTheme() {
  // Determine initial theme
  const getPreferredTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    if (CONFIG.theme !== 'system') return CONFIG.theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const setTheme = (theme) => {
    if (theme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
      if (DOM.mobileThemeSwitch) DOM.mobileThemeSwitch.checked = true;
      if (DOM.mobileThemeLabel) DOM.mobileThemeLabel.textContent = 'Dark Mode';
    } else {
      document.body.removeAttribute('data-theme');
      if (DOM.mobileThemeSwitch) DOM.mobileThemeSwitch.checked = false;
      if (DOM.mobileThemeLabel) DOM.mobileThemeLabel.textContent = 'Light Mode';
    }
    localStorage.setItem('theme', theme);
  };

  setTheme(getPreferredTheme());

  // Toggle listener
  DOM.themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });

  if (DOM.mobileThemeSwitch) {
    DOM.mobileThemeSwitch.addEventListener('change', (e) => {
      setTheme(e.target.checked ? 'dark' : 'light');
    });
  }
}

// --- Markdown Parser (Simple) ---
function parseMarkdown(md) {
  if (CONFIG.site.email) {
    md = md.replace(/\{\{email\}\}/g, CONFIG.site.email);
  }

  let html = md.replace(/\r\n/g, '\n');

  html = html
    .replace(/^### (.*$)/gim, '\n\n<h3>$1</h3>\n\n')
    .replace(/^## (.*$)/gim, '\n\n<h2>$1</h2>\n\n')
    .replace(/^# (.*$)/gim, '\n\n<h1>$1</h1>\n\n')
    .replace(/^\> (.*$)/gim, '\n\n<blockquote>$1</blockquote>\n\n')
    .replace(/^---$/gim, '\n\n<hr>\n\n')
    .replace(/^```(\w*)\n([\s\S]*?)\n```/gim, (match, lang, code) => {
      const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `\n\n<pre><code class="language-${lang}">${escaped}</code></pre>\n\n`;
    });

  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, (match, code) => {
      const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<code>${escaped}</code>`;
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

// --- Frontmatter Parser ---
function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: text };

  const frontmatter = match[1];
  const content = match[2];

  const meta = {};
  frontmatter.split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > -1) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();

      // Handle array `[a, b]`
      if (val.startsWith('[') && val.endsWith(']')) {
        val = val.slice(1, -1).split(',').map(s => {
          s = s.trim();
          if (s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1);
          if (s.startsWith("'") && s.endsWith("'")) return s.slice(1, -1);
          return s;
        });
      } else {
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      }
      meta[key] = val;
    }
  });

  return { meta, content };
}

// --- Content Loading ---
const contentCache = new Map();
let manifestCache = null;

async function fetchContent(path) {
  if (contentCache.has(path)) return contentCache.get(path);
  try {
    const res = await fetch(`content/${path}`);
    if (!res.ok) throw new Error(`Failed to fetch ${path}`);
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
    const res = await fetch(`content/index.json`);
    if (!res.ok) throw new Error("Failed to fetch manifest");
    manifestCache = await res.json();
    return manifestCache;
  } catch (err) {
    console.error(err);
    return { blogs: [], talks: [], sponsors: [] };
  }
}

// --- View Rendering Helpers ---
function setView(html, title) {
  document.title = title ? `${title} | ${CONFIG.site.title}` : CONFIG.site.title;
  // Apply enter animation
  DOM.app.className = 'site-content';
  void DOM.app.offsetWidth; // trigger reflow
  DOM.app.className = 'site-content view-enter';
  DOM.app.innerHTML = html;
}

function renderError() {
  setView(`
    <div class="vstack align-center justify-center p-8 text-center">
      <h2>404 - Not Found</h2>
      <p class="muted">The content you are looking for does not exist.</p>
      <a href="#/" class="button mt-4">Go Home</a>
    </div>
  `, 'Not Found');
}

function renderLoading() {
  DOM.app.innerHTML = `
    <div class="loading-state vstack align-center justify-center p-8">
      <div class="spinner"></div>
    </div>
  `;
}

// --- Route Handlers ---
async function renderHome() {
  renderLoading();
  const raw = await fetchContent('home.md');
  if (!raw) return renderError();

  const { content } = parseFrontmatter(raw);
  const htmlContent = parseMarkdown(content);

  const html = `
    <div class="hero mb-8 text-center vstack align-center justify-center gap-4 py-4">
      <img src="${CONFIG.site.avatar}" alt="${CONFIG.site.author}" class="avatar" width="120" height="120" style="border: 4px solid var(--border); border-radius: 50%;">
      <h1 class="mt-4">${CONFIG.site.title}</h1>
      <p class="text-lg muted" style="max-width: 600px; margin: 0 auto;">${CONFIG.site.description}</p>
      
      <div class="social-links hstack gap-2 mt-4 justify-center" style="flex-wrap: wrap;">
        ${Object.entries(CONFIG.site.socials)
            .filter(([_, url]) => url)
            .map(([platform, url]) => `<a href="${url}" target="_blank" class="button secondary outline" style="text-transform: capitalize;">${platform}</a>`)
            .join('')}
      </div>
    </div>
    
    <div class="home-content content-prose">
      ${htmlContent}
    </div>
  `;

  setView(html, 'Home');
}

async function renderBlogs() {
  renderLoading();
  if (!CONFIG.pages.blogs.enabled) return renderError();

  const manifest = await fetchManifest();
  const blogPromises = (manifest.blogs || []).map(async filename => {
    const raw = await fetchContent(`blogs/${filename}`);
    if (raw) {
      const { meta } = parseFrontmatter(raw);
      return { filename, meta };
    }
    return null;
  });
  
  const resolvedPosts = await Promise.all(blogPromises);
  const posts = resolvedPosts.filter(p => p !== null);

  // Sort by date desc
  posts.sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date));

  const html = `
    <div class="mb-8">
      <h1>Blog</h1>
      <p class="muted">Thoughts, tutorials, and rants.</p>
    </div>
    <div class="vstack gap-4">
      ${posts.length === 0 ? '<p>No posts found.</p>' : posts.map(post => `
        <article class="card p-0" style="transition: transform 0.2s">
          <a href="#/blogs/${post.filename.replace('.md', '')}" class="unstyled-link flex flex-col p-4" style="display:block; padding: 1.5rem;">
            ${post.meta.banner ? `<img src="${post.meta.banner}" alt="${post.meta.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">` : ''}
            <header class="mb-2">
              <h3 style="margin: 0 0 0.5rem 0">${post.meta.title}</h3>
              <div class="hstack gap-2 text-sm muted" style="flex-wrap: wrap;">
                <time class="badge primary">${post.meta.date}</time>
                ${Array.isArray(post.meta.tags) ? post.meta.tags.map(t => `<span class="badge secondary">${t}</span>`).join('') : ''}
              </div>
            </header>
            <p style="margin:0">${post.meta.description || 'Read more...'}</p>
          </a>
        </article>
      `).join('')}
    </div>
  `;
  setView(html, 'Blog');
}

async function renderBlogPost(slug) {
  renderLoading();
  const raw = await fetchContent(`blogs/${slug}.md`);
  if (!raw) return renderError();

  const { meta, content } = parseFrontmatter(raw);
  const htmlContent = parseMarkdown(content);

  const html = `
    <article class="post">
      <header class="mb-8">
        <a href="#/blogs" class="unstyled-link muted text-sm mb-4" style="display:inline-block">← Back to Blog</a>
        ${meta.banner ? `<img src="${meta.banner}" alt="${meta.title}" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 12px; margin-bottom: 1.5rem;">` : ''}
        <h1 class="mt-2" style="margin-bottom: 0.5rem;">${meta.title}</h1>
        <div class="hstack gap-2 mt-4" style="flex-wrap: wrap;">
           <span class="badge primary mb-2">${meta.date}</span>
           ${Array.isArray(meta.tags) ? meta.tags.map(t => `<span class="badge secondary mb-2">${t}</span>`).join('') : ''}
        </div>
      </header>
      <div class="post-content" style="font-size: 1.05rem;">
        ${htmlContent}
      </div>
    </article>
  `;
  setView(html, meta.title);
}

async function renderTalks() {
  renderLoading();
  if (!CONFIG.pages.talks.enabled) return renderError();

  const manifest = await fetchManifest();
  const talkPromises = (manifest.talks || []).map(async filename => {
    const raw = await fetchContent(`talks/${filename}`);
    if (raw) {
      const { meta, content } = parseFrontmatter(raw);
      return { filename, meta, content: parseMarkdown(content) };
    }
    return null;
  });
  const resolvedTalks = await Promise.all(talkPromises);
  const talks = resolvedTalks.filter(p => p !== null);

  talks.sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date));

  const html = `
    <div class="mb-8">
      <h1>Speaking</h1>
      <p class="muted">Conferences and meetups I've spoken at.</p>
    </div>
    <div class="row">
      ${talks.length === 0 ? '<div class="col-12"><p>No talks found.</p></div>' : talks.map(talk => `
        <div class="col-12 col-md-6 mb-4">
          <article class="card h-100 vstack justify-between">
            <div>
              <header class="mb-2">
                <span class="badge primary mb-2">${talk.meta.event}</span>
                <h3 style="margin: 0 0 0.5rem 0">${talk.meta.title}</h3>
                <div class="hstack gap-2 text-sm muted mb-4">
                  <span>🗓 ${talk.meta.date}</span>
                  <span>📍 ${talk.meta.location}</span>
                </div>
              </header>
              <div class="text-sm pb-4">
                ${talk.content}
              </div>
            </div>
            <footer class="mt-auto border-t py-4">
              <div class="hstack gap-2">
                 ${talk.meta.slides ? `<a href="${talk.meta.slides}" target="_blank" class="button secondary small">Slides</a>` : ''}
                 ${talk.meta.video ? `<a href="${talk.meta.video}" target="_blank" class="button secondary small">Video</a>` : ''}
              </div>
            </footer>
          </article>
        </div>
      `).join('')}
    </div>
  `;
  setView(html, 'Talks');
}

async function renderSponsors() {
  renderLoading();
  if (!CONFIG.pages.sponsors.enabled) return renderError();

  const manifest = await fetchManifest();
  const sponsorPromises = (manifest.sponsors || []).map(async filename => {
    const raw = await fetchContent(`sponsors/${filename}`);
    if (raw) {
      const { meta, content } = parseFrontmatter(raw);
      return { filename, meta, content: parseMarkdown(content) };
    }
    return null;
  });
  const resolvedSponsors = await Promise.all(sponsorPromises);
  const sponsors = resolvedSponsors.filter(p => p !== null);

  const html = `
    <div class="mb-8 text-center">
      <h1>Sponsors</h1>
      <p class="muted">Amazing people and companies supporting my work.</p>
    </div>
    <div class="row justify-center">
      ${sponsors.length === 0 ? '<div class="col-12"><p class="text-center">Become a sponsor!</p></div>' : sponsors.map(s => `
        <div class="col-6 col-md-4 mb-4 text-center">
          <div class="card p-4 vstack align-center text-center">
            ${s.meta.logo ? `<img src="${s.meta.logo}" alt="${s.meta.name}" style="max-height: 80px; margin-bottom: 1rem;">` : `<div style="width:80px;height:80px;border-radius:50%;background:var(--accent);margin-bottom:1rem;" class="hstack justify-center text-xl font-bold">${s.meta.name[0]}</div>`}
            <h4>${s.meta.name}</h4>
            <span class="badge secondary mb-2">${s.meta.tier}</span>
            <a href="${s.meta.url}" target="_blank" class="text-sm mt-2">Visit Website</a>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  setView(html, 'Sponsors');
}

async function renderNow() {
  renderLoading();
  if (!CONFIG.pages.now.enabled) return renderError();

  const raw = await fetchContent('now.md');
  if (!raw) return renderError();

  const { content } = parseFrontmatter(raw);
  const htmlContent = parseMarkdown(content);

  const html = `
    <article class="post">
      <div class="post-content">
        ${htmlContent}
      </div>
    </article>
  `;
  setView(html, 'Now');
}


// --- Router ---
function handleRoute() {
  let hash = window.location.hash || '#/';
  updateActiveNav(hash);

  if (hash === '#/') {
    renderHome();
  } else if (hash === '#/blogs') {
    renderBlogs();
  } else if (hash.startsWith('#/blogs/')) {
    const slug = hash.replace('#/blogs/', '');
    renderBlogPost(slug);
  } else if (hash === '#/talks') {
    renderTalks();
  } else if (hash === '#/sponsors') {
    renderSponsors();
  } else if (hash === '#/now') {
    renderNow();
  } else {
    renderError();
  }
}

// Start
init();
