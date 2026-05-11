const THEME_STORAGE_KEY = 'theme';
const LIGHT_THEME = 'light';
const DARK_THEME = 'dark';

function resolveTheme({ storedTheme, prefersDark }) {
  if (storedTheme === LIGHT_THEME || storedTheme === DARK_THEME) {
    return storedTheme;
  }

  return prefersDark ? DARK_THEME : LIGHT_THEME;
}

function applyTheme(root, theme) {
  root.classList.toggle('dark', theme === DARK_THEME);
  root.style.colorScheme = theme;
}

export default {
  THEME_STORAGE_KEY,
  LIGHT_THEME,
  DARK_THEME,
  resolveTheme,
  applyTheme,
};
