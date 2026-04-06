const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const contentDir = path.join(rootDir, 'content');
const layoutStr = fs.readFileSync(path.join(rootDir, '_layout.html'), 'utf-8');

// Parse config securely
const configRaw = fs.readFileSync(path.join(rootDir, 'config.js'), 'utf-8');
const siteConfig = eval(configRaw + '; CONFIG');
const CONFIG = siteConfig;

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

  return { meta, content: content.trim() };
}

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

function renderTags(tags) {
  if (!Array.isArray(tags) || !tags.length) return '';
  return tags.map(t => `<span class="badge secondary" style="font-size:0.75rem;">${t}</span>`).join('');
}

function renderLayout(title, contentHTML) {
  return layoutStr
    .replace('{{TITLE}}', title === CONFIG.site.title ? title : `${title} — ${CONFIG.site.title}`)
    .replace('{{CONTENT}}', contentHTML);
}

function writePage(outPath, html) {
  const fullPath = path.join(rootDir, outPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, html, 'utf-8');
}

function renderPostList(posts, slugPrefix) {
  if (!posts.length) return '<p class="muted">Nothing here yet.</p>';
  return `<div>` + posts.map(post => `
    <div class="post-item stagger-item">
      <a href="${slugPrefix}/${post.filename.replace('.md', '')}/">
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

function processDirectory(dir) {
  const dirPath = path.join(contentDir, dir);
  if (!fs.existsSync(dirPath)) return [];

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md') && f !== '_template.md');
  const items = [];

  for (const filename of files) {
    const raw = fs.readFileSync(path.join(dirPath, filename), 'utf-8');
    const { meta, content } = parseFrontmatter(raw);
    items.push({ filename, meta, content: parseMarkdown(content) });
  }
  return items.sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date));
}

function buildIndex() {
  console.log('Cleaning up old generated files...');
  fs.rmSync(path.join(rootDir, 'technical'), { recursive: true, force: true });
  fs.rmSync(path.join(rootDir, 'writings'), { recursive: true, force: true });
  fs.rmSync(path.join(rootDir, 'now'), { recursive: true, force: true });
  try { fs.unlinkSync(path.join(rootDir, 'index.html')); } catch(e) {}

  const technicalPosts = processDirectory('technical');
  const writingPosts = processDirectory('writings');
  
  // 1. Home Page
  const homeRaw = fs.readFileSync(path.join(contentDir, 'home.md'), 'utf-8');
  const homeContent = parseMarkdown(parseFrontmatter(homeRaw).content);
  
  const socials = Object.entries(CONFIG.site.socials || {})
      .filter(([_, url]) => url)
      .map(([platform, url]) => `
      <a href="${url}" target="_blank" rel="noopener" class="social-pill">
        ${platform}
      </a>
    `).join('');

  const recentWritings = writingPosts.slice(0, 3);
  let recentWritingsHTML = '';
  if (recentWritings.length > 0) {
    recentWritingsHTML = `
      <section class="mt-8">
        <div class="section-header">
          <h2 style="font-size:1.35rem;">Recent writings</h2>
          <a href="/writings/" class="button outline" style="font-size:0.8rem; padding:0.3rem 0.85rem;">All writings →</a>
        </div>
        ${renderPostList(recentWritings, '/writings')}
      </section>
    `;
  }

  const homeHTML = `
    <section class="hero text-center vstack align-center">
      <img src="${CONFIG.site.avatar}" alt="${CONFIG.site.author}" class="avatar" width="88" height="88">
      <h1 class="hero-name">${CONFIG.site.title}</h1>
      <p class="hero-desc">${CONFIG.site.description}</p>
      <nav class="social-links hstack gap-2 justify-center" aria-label="Social links">
        ${socials}
      </nav>
    </section>
    
    <section class="home-content post-content stagger-item" style="margin-top: 0.5rem;">
      ${homeContent}
    </section>
    
    ${recentWritingsHTML}
  `;
  writePage('index.html', renderLayout(CONFIG.site.title, homeHTML));

  // 2. Writings Index
  const writingsIndexHTML = `
    <header style="margin-bottom:2.5rem;">
      <p class="section-eyebrow">Essays</p>
      <h1>Writings</h1>
      <p class="muted" style="margin-top:0.4rem; font-size:0.95rem;">Personal thoughts, stories, and reflections.</p>
    </header>
    ${renderPostList(writingPosts, '/writings')}
  `;
  writePage('writings/index.html', renderLayout('Writings', writingsIndexHTML));

  // 3. Writing Posts
  for (const post of writingPosts) {
    const postHTML = `
      <article>
        <header class="post-header">
          <a href="/writings/" class="back-link">← Writings</a>
          ${post.meta.banner ? `<img src="${post.meta.banner}" alt="${post.meta.title}" class="banner-img">` : ''}
          <h1>${post.meta.title}</h1>
          <div class="post-meta">
            ${post.meta.date ? `<span class="badge primary">${post.meta.date}</span>` : ''}
            ${renderTags(post.meta.tags)}
          </div>
        </header>
        <div class="post-content">${post.content}</div>
      </article>
    `;
    writePage(`writings/${post.filename.replace('.md', '')}/index.html`, renderLayout(post.meta.title, postHTML));
  }

  // 4. Technical Index
  const technicalIndexHTML = `
    <header style="margin-bottom:2.5rem;">
      <p class="section-eyebrow">Engineering</p>
      <h1>Technical</h1>
      <p class="muted" style="margin-top:0.4rem; font-size:0.95rem;">Deep dives on code, systems, and craft.</p>
    </header>
    ${renderPostList(technicalPosts, '/technical')}
  `;
  writePage('technical/index.html', renderLayout('Technical', technicalIndexHTML));

  // 5. Technical Posts
  for (const post of technicalPosts) {
    const postHTML = `
      <article>
        <header class="post-header">
          <a href="/technical/" class="back-link">← Technical</a>
          ${post.meta.banner ? `<img src="${post.meta.banner}" alt="${post.meta.title}" class="banner-img">` : ''}
          <h1>${post.meta.title}</h1>
          <div class="post-meta">
            ${post.meta.date ? `<span class="badge primary">${post.meta.date}</span>` : ''}
            ${renderTags(post.meta.tags)}
          </div>
        </header>
        <div class="post-content">${post.content}</div>
      </article>
    `;
    writePage(`technical/${post.filename.replace('.md', '')}/index.html`, renderLayout(post.meta.title, postHTML));
  }

  // 6. Now Page
  const nowRaw = fs.readFileSync(path.join(contentDir, 'now.md'), 'utf-8');
  const nowContent = parseMarkdown(parseFrontmatter(nowRaw).content);
  const nowHTML = `
    <article>
      <header style="margin-bottom:2.5rem;">
        <p class="section-eyebrow">Present</p>
        <h1>Now</h1>
        <p class="muted" style="margin-top:0.4rem; font-size:0.95rem;">What I'm focused on at this moment.</p>
      </header>
      <div class="post-content">${nowContent}</div>
    </article>
  `;
  writePage('now/index.html', renderLayout('Now', nowHTML));

  console.log('Successfully built static site files to root directory.');
}

buildIndex();
