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

