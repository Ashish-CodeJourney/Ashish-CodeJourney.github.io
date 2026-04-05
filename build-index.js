const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, 'content');

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

  return { meta, content: content.trim() };
}

function processDirectory(dir, includeContent = false) {
  const dirPath = path.join(contentDir, dir);
  if (!fs.existsSync(dirPath)) return [];

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md') && f !== '_template.md');
  const items = [];

  for (const filename of files) {
    const raw = fs.readFileSync(path.join(dirPath, filename), 'utf-8');
    const { meta, content } = parseFrontmatter(raw);
    
    const item = { filename, meta };
    if (includeContent) {
      item.content = content;
    }
    items.push(item);
  }
  return items;
}

function buildIndex() {
  const index = {
    blogs: processDirectory('blogs', false),
    talks: processDirectory('talks', true),
    sponsors: processDirectory('sponsors', true)
  };

  fs.writeFileSync(
    path.join(contentDir, 'index.json'),
    JSON.stringify(index, null, 2),
    'utf-8'
  );
  console.log('Successfully built content/index.json');
}

buildIndex();
