/**
 * Personal Website — App Logic
 * Vanilla JS, no dependencies.
 */

const DOM = {
  mobileNav: document.getElementById('mobile-nav'),
  mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
  themeToggle: document.getElementById('theme-toggle'),
  mobileThemeSwitch: document.getElementById('mobile-theme-switch'),
  mobileThemeLabel: document.getElementById('mobile-theme-label')
};

// ─── Mobile Menu ───────────────────────────────────────────────
function setupMobileMenu() {
  const mq = window.matchMedia('(max-width: 640px)');

  function syncToggle(e) {
    if(DOM.mobileMenuToggle) DOM.mobileMenuToggle.style.display = e.matches ? 'inline-flex' : 'none';
    if (!e.matches && DOM.mobileNav) DOM.mobileNav.classList.add('hidden');
  }

  syncToggle(mq);
  mq.addEventListener('change', syncToggle);

  if(DOM.mobileMenuToggle) {
    DOM.mobileMenuToggle.addEventListener('click', () => {
      DOM.mobileNav.classList.toggle('hidden');
    });
  }
  if(DOM.mobileNav) {
    DOM.mobileNav.addEventListener('click', e => {
      if (e.target.tagName === 'A') DOM.mobileNav.classList.add('hidden');
    });
  }
}

// ─── Theme ─────────────────────────────────────────────────────
function setupTheme() {
  const getPreferred = () => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
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

  if (DOM.themeToggle) {
    DOM.themeToggle.addEventListener('click', () => {
      const current = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  if (DOM.mobileThemeSwitch) {
    DOM.mobileThemeSwitch.addEventListener('change', e => {
      setTheme(e.target.checked ? 'dark' : 'light');
    });
  }
}

function init() {
  setupTheme();
  setupMobileMenu();
}

init();