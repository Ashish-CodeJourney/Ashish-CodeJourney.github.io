import test from 'node:test';
import assert from 'node:assert/strict';
import theme from '../src/utils/theme.js';

const { applyTheme, resolveTheme } = theme;

const createDocumentElement = () => {
  const classes = new Set();

  return {
    classList: {
      toggle(className, force) {
        if (force) {
          classes.add(className);
        } else {
          classes.delete(className);
        }
      },
      contains(className) {
        return classes.has(className);
      },
    },
    style: {},
  };
};

test('resolveTheme prefers stored theme over system preference', () => {
  assert.equal(resolveTheme({ storedTheme: 'light', prefersDark: true }), 'light');
  assert.equal(resolveTheme({ storedTheme: 'dark', prefersDark: false }), 'dark');
});

test('resolveTheme follows system preference when nothing is stored', () => {
  assert.equal(resolveTheme({ storedTheme: null, prefersDark: true }), 'dark');
  assert.equal(resolveTheme({ storedTheme: null, prefersDark: false }), 'light');
});

test('applyTheme explicitly applies both light and dark themes', () => {
  const root = createDocumentElement();

  applyTheme(root, 'dark');
  assert.equal(root.classList.contains('dark'), true);
  assert.equal(root.style.colorScheme, 'dark');

  applyTheme(root, 'light');
  assert.equal(root.classList.contains('dark'), false);
  assert.equal(root.style.colorScheme, 'light');
});


const { initTheme, storeTheme, themeBootstrapScript } = theme;

const fakeBrowser = ({ stored = null, prefersDark = false, storageThrows = false } = {}) => {
  const root = createDocumentElement();
  const listeners = { media: [], document: {} };
  const saved = new Map(stored ? [['theme', stored]] : []);
  const media = { matches: prefersDark, addEventListener: (type, fn) => listeners.media.push(fn) };
  const storage = {
    getItem: (key) => {
      if (storageThrows) throw new Error('blocked');
      return saved.get(key) ?? null;
    },
    setItem: (key, value) => {
      if (storageThrows) throw new Error('blocked');
      saved.set(key, value);
    },
  };
  const win = {
    get localStorage() {
      return storage;
    },
    matchMedia: () => media,
  };
  const doc = {
    documentElement: root,
    addEventListener: (type, fn) => {
      listeners.document[type] = fn;
    },
  };
  const isDark = () => root.classList.contains('dark');
  const deviceChangesTo = (dark) => {
    media.matches = dark;
    listeners.media.forEach((fn) => fn({ matches: dark }));
  };
  return { root, win, doc, saved, isDark, deviceChangesTo, fire: (type) => listeners.document[type]?.() };
};

test('first visit uses the device theme', () => {
  const dark = fakeBrowser({ prefersDark: true });
  initTheme(dark.doc, dark.win);
  assert.equal(dark.isDark(), true);

  const light = fakeBrowser({ prefersDark: false });
  initTheme(light.doc, light.win);
  assert.equal(light.isDark(), false);
});

test('a theme the visitor chose wins over the device theme on later visits', () => {
  const browser = fakeBrowser({ stored: 'light', prefersDark: true });
  initTheme(browser.doc, browser.win);
  assert.equal(browser.isDark(), false);
});

test('until the visitor chooses, the site follows the device when it switches theme', () => {
  const browser = fakeBrowser({ prefersDark: false });
  initTheme(browser.doc, browser.win);
  browser.deviceChangesTo(true);
  assert.equal(browser.isDark(), true);
});

test('once the visitor has chosen, device theme changes are ignored', () => {
  const browser = fakeBrowser({ stored: 'dark', prefersDark: true });
  initTheme(browser.doc, browser.win);
  browser.deviceChangesTo(false);
  assert.equal(browser.isDark(), true);
});

test('the theme is put back after each in-site page navigation swaps the document', () => {
  const browser = fakeBrowser({ stored: 'dark' });
  initTheme(browser.doc, browser.win);
  applyTheme(browser.root, 'light');
  browser.fire('astro:after-swap');
  assert.equal(browser.isDark(), true);
});

test('when storage is blocked the device theme is used and nothing throws', () => {
  const browser = fakeBrowser({ prefersDark: true, storageThrows: true });
  assert.doesNotThrow(() => initTheme(browser.doc, browser.win));
  assert.equal(browser.isDark(), true);
  assert.doesNotThrow(() => storeTheme(browser.win, 'light'));
});

test('choosing a theme saves it on the device', () => {
  const browser = fakeBrowser();
  storeTheme(browser.win, 'dark');
  assert.equal(browser.saved.get('theme'), 'dark');
});

test('the bootstrap script is self-contained, so it can run inline before the page paints', () => {
  const browser = fakeBrowser({ prefersDark: true });
  new Function('document', 'window', themeBootstrapScript)(browser.doc, browser.win);
  assert.equal(browser.isDark(), true);
});
