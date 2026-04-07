/**
 * Personal Website — SPA Router + App Logic
 * Vanilla JS, minimal dependencies.
 */

// ─── DOM References ────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

const DOM = {
  routerContent: $('#router-content'),
  mobileNav: $('#mobile-nav'),
  mobileMenuToggle: $('#mobile-menu-toggle'),
  themeToggle: $('#theme-toggle'),
  mobileThemeSwitch: $('#mobile-theme-switch'),
  mobileThemeLabel: $('#mobile-theme-label')
};

// ─── SPA Router ────────────────────────────────────────────────
const Router = {
  TRANSITION_DURATION: 300,
  _currentRoute: null,
  _transitioning: false,

  getRoute() {
    let hash = location.hash.slice(1) || '/';
    if (hash !== '/' && !hash.endsWith('/')) hash += '/';
    return hash;
  },

  navigate(route, skipAnimation = false) {
    const pages = window.__PAGES;
    if (!pages || !DOM.routerContent) return;

    if (route !== '/' && !route.endsWith('/')) route += '/';
    if (route === this._currentRoute && !skipAnimation) return;

    const pageData = pages[route] || {
      html: `<div class="error-container">
        <span class="error-code">404</span>
        <h2 class="error-title">Page not found</h2>
        <p class="error-text">This page doesn't exist.</p>
        <a href="#/" class="button">← Go Home</a>
      </div>`,
      title: '404 — Not Found'
    };

    this._render(pageData, route, skipAnimation);
  },

  _render(pageData, route, skipAnimation) {
    if (this._transitioning) return;
    const container = DOM.routerContent;

    if (skipAnimation || !this._currentRoute) {
      container.innerHTML = pageData.html;
      container.className = 'page-container page-enter-active';
      this._afterNav(route, pageData.title);
      return;
    }

    this._transitioning = true;
    container.classList.add('page-exit-left');

    setTimeout(() => {
      container.innerHTML = pageData.html;
      container.classList.remove('page-exit-left');
      container.classList.add('page-enter-active');
      this._afterNav(route, pageData.title);
      this._transitioning = false;
    }, this.TRANSITION_DURATION);
  },

  _afterNav(route, title) {
    this._currentRoute = route;
    const siteName = window.__PAGES?.['/']?.title || 'Ashish';
    document.title = title && title !== siteName ? `${title} — ${siteName}` : siteName;
    scrollTo({ top: 0, behavior: 'instant' });
    this._updateActiveNav(route);
    this._triggerStagger();
    if (typeof gtag === 'function') {
      gtag('event', 'page_view', { page_path: '/#' + route, page_title: title });
    }
  },

  _updateActiveNav(route) {
    $$('.desktop-nav .nav-link, #mobile-nav .nav-link').forEach(link => {
      const linkRoute = link.getAttribute('href').replace('#', '');
      const isActive = (route === '/' && linkRoute === '/') ||
        (route !== '/' && linkRoute !== '/' && route.startsWith(linkRoute));
      link.classList.toggle('active', isActive);
    });
  },

  _triggerStagger() {
    DOM.routerContent.querySelectorAll('.stagger-item').forEach((item, i) => {
      item.style.animationDelay = `${i * 0.05}s`;
    });
  },

  init() {
    addEventListener('hashchange', () => this.navigate(this.getRoute()));

    document.addEventListener('click', e => {
      const link = e.target.closest('a[href^="#/"]');
      if (!link) return;
      e.preventDefault();
      const href = link.getAttribute('href');
      if (location.hash !== href) location.hash = href;
      else this.navigate(href.slice(1));
    });

    const initial = this.getRoute();
    if (window.__PAGES?.[initial]) {
      this.navigate(initial, true);
    } else {
      this._currentRoute = initial;
      this._updateActiveNav(initial);
      this._triggerStagger();
    }
  }
};

// ─── Mobile Menu ───────────────────────────────────────────────
function setupMobileMenu() {
  const mq = matchMedia('(max-width: 640px)');
  const sync = e => {
    if (DOM.mobileMenuToggle) DOM.mobileMenuToggle.style.display = e.matches ? 'inline-flex' : 'none';
    if (!e.matches && DOM.mobileNav) DOM.mobileNav.hidden = true;
  };
  sync(mq);
  mq.addEventListener('change', sync);

  DOM.mobileMenuToggle?.addEventListener('click', () => DOM.mobileNav.hidden = !DOM.mobileNav.hidden);
  DOM.mobileNav?.addEventListener('click', e => { if (e.target.tagName === 'A') DOM.mobileNav.hidden = true; });
}

// ─── Theme ─────────────────────────────────────────────────────
function setupTheme() {
  const html = document.documentElement;
  const getTheme = () => localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  const setTheme = theme => {
    html.classList.toggle('dark', theme === 'dark');
    html.style.colorScheme = theme;
    if (DOM.mobileThemeSwitch) DOM.mobileThemeSwitch.checked = theme === 'dark';
    if (DOM.mobileThemeLabel) DOM.mobileThemeLabel.textContent = theme === 'dark' ? 'Dark mode' : 'Light mode';
    localStorage.setItem('theme', theme);
  };

  setTheme(getTheme());
  DOM.themeToggle?.addEventListener('click', () => setTheme(html.classList.contains('dark') ? 'light' : 'dark'));
  DOM.mobileThemeSwitch?.addEventListener('change', e => setTheme(e.target.checked ? 'dark' : 'light'));
}

// ─── Init ──────────────────────────────────────────────────────
setupTheme();
setupMobileMenu();
Router.init();
