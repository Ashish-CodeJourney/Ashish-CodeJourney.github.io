function resolveTheme({ storedTheme, prefersDark }) {
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return prefersDark ? 'dark' : 'light';
}

function applyTheme(root, theme) {
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

function readStoredTheme(win) {
  try {
    return win.localStorage.getItem('theme');
  } catch {
    return null;
  }
}

function storeTheme(win, theme) {
  try {
    win.localStorage.setItem('theme', theme);
  } catch {
    return;
  }
}

function initTheme(doc, win) {
  const media = win.matchMedia('(prefers-color-scheme: dark)');
  const current = () => resolveTheme({ storedTheme: readStoredTheme(win), prefersDark: media.matches });

  applyTheme(doc.documentElement, current());
  media.addEventListener('change', () => applyTheme(doc.documentElement, current()));
  doc.addEventListener('astro:after-swap', () => applyTheme(doc.documentElement, current()));
}

const themeBootstrapScript = `(() => {\n${[resolveTheme, applyTheme, readStoredTheme, initTheme].join('\n')}\ninitTheme(document, window);\n})();`;

export default {
  resolveTheme,
  applyTheme,
  storeTheme,
  initTheme,
  themeBootstrapScript,
};
