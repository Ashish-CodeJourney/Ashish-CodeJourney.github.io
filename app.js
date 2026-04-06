/**
 * Personal Website — SPA Router + App Logic
 * Vanilla JS, no dependencies.
 * 
 * Features:
 * - Hash-based client-side routing
 * - Smooth page transitions (book-flip feel)
 * - Theme toggling (light/dark)
 * - Mobile menu handling
 * - Google Analytics virtual page views
 */

// ─── DOM References ────────────────────────────────────────────
const DOM = {
  routerContent: document.getElementById('router-content'),
  mobileNav: document.getElementById('mobile-nav'),
  mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
  themeToggle: document.getElementById('theme-toggle'),
  mobileThemeSwitch: document.getElementById('mobile-theme-switch'),
  mobileThemeLabel: document.getElementById('mobile-theme-label')
};

// ─── SPA Router ────────────────────────────────────────────────
const Router = {
  // Transition duration in ms — keep in sync with CSS (400ms)
  TRANSITION_DURATION: 400,

  // Track the currently active route to avoid redundant transitions
  _currentRoute: null,

  // Track the transition state to avoid overlapping transitions
  _transitioning: false,

  /**
   * Get the normalized route from the current hash
   */
  getRoute() {
    let hash = window.location.hash.slice(1) || '/';
    // Ensure trailing slash for consistency
    if (hash !== '/' && !hash.endsWith('/')) hash += '/';
    return hash;
  },

  /**
   * Navigate to a route with a smooth page transition
   */
  navigate(route, opts = {}) {
    const skipAnimation = opts.skipAnimation || false;
    const pages = window.__PAGES;

    if (!pages || !DOM.routerContent) return;

    // Normalize route
    if (route !== '/' && !route.endsWith('/')) route += '/';

    // Don't re-navigate to the same page
    if (route === this._currentRoute && !skipAnimation) return;

    const pageData = pages[route];
    if (!pageData) {
      // Route not found — show error in-place
      this._renderContent({
        html: `
          <div class="error-container">
            <span class="error-code">404</span>
            <h2 class="error-title">Page not found</h2>
            <p class="error-text">This page doesn't exist. Maybe it was moved or never written.</p>
            <a href="#/" class="button primary" style="margin-top:1rem;">← Go Home</a>
          </div>
        `,
        title: '404 — Not Found'
      }, route, skipAnimation);
      return;
    }

    this._renderContent(pageData, route, skipAnimation);
  },

  /**
   * Internal: perform the animated content swap
   */
  _renderContent(pageData, route, skipAnimation) {
    if (this._transitioning) return;

    const container = DOM.routerContent;
    const siteContent = document.querySelector('.site-content');

    // First load or explicit skip — just set content immediately
    if (skipAnimation || !this._currentRoute) {
      container.innerHTML = pageData.html;
      container.className = 'page-container page-enter-active';
      this._afterNavigation(route, pageData.title);
      return;
    }

    this._transitioning = true;
    if (siteContent) siteContent.classList.add('transitioning');

    // Determine direction
    const isGoingDeeper = route.split('/').filter(Boolean).length > (this._currentRoute || '').split('/').filter(Boolean).length;
    const exitClass = isGoingDeeper ? 'page-exit-left' : 'page-exit-right';
    const enterClass = isGoingDeeper ? 'page-enter-right' : 'page-enter-left';

    // Phase 1: Exit
    container.classList.remove('page-enter-active', 'page-enter-left', 'page-enter-right');
    container.classList.add(exitClass);

    // Swap content slightly after exit begins
    setTimeout(() => {
      // Phase 2: Swap content
      container.innerHTML = pageData.html;
      container.classList.remove(exitClass);
      container.classList.add(enterClass);

      // Force reflow
      void container.offsetHeight;

      // Phase 3: Enter
      container.classList.remove(enterClass);
      container.classList.add('page-enter-active');

      this._afterNavigation(route, pageData.title);

      setTimeout(() => {
        this._transitioning = false;
        if (siteContent) siteContent.classList.remove('transitioning');
      }, this.TRANSITION_DURATION);
    }, this.TRANSITION_DURATION * 0.7);
  },

  /**
   * Post-navigation housekeeping
   */
  _afterNavigation(route, title) {
    this._currentRoute = route;

    // Update page title
    const siteName = (window.__PAGES && window.__PAGES['/']) ? window.__PAGES['/'].title : 'Ashish';
    document.title = (title && title !== siteName)
      ? `${title} — ${siteName}`
      : siteName;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Update active nav links
    this._updateActiveNav(route);

    // Re-trigger stagger animations for the new content
    this._triggerStaggerAnimations();

    // Track page view in Google Analytics
    if (typeof gtag === 'function') {
      gtag('event', 'page_view', {
        page_path: '/#' + route,
        page_title: title
      });
    }
  },

  /**
   * Highlight the correct nav link
   */
  _updateActiveNav(route) {
    // Desktop nav
    document.querySelectorAll('.desktop-nav .nav-link').forEach(link => {
      const linkRoute = link.getAttribute('href').replace('#', '');
      const isActive = (route === '/' && linkRoute === '/') ||
                       (route !== '/' && linkRoute !== '/' && route.startsWith(linkRoute));
      link.classList.toggle('active', isActive);
    });

    // Mobile nav
    document.querySelectorAll('#mobile-nav .nav-link').forEach(link => {
      const linkRoute = link.getAttribute('href').replace('#', '');
      const isActive = (route === '/' && linkRoute === '/') ||
                       (route !== '/' && linkRoute !== '/' && route.startsWith(linkRoute));
      link.classList.toggle('active', isActive);
    });
  },

  /**
   * Re-trigger stagger animations after content swap
   */
  _triggerStaggerAnimations() {
    const items = DOM.routerContent.querySelectorAll('.stagger-item');
    items.forEach((item, i) => {
      item.style.animationDelay = `${i * 0.06}s`;
    });
  },

  /**
   * Initialize the router
   */
  init() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      this.navigate(this.getRoute());
    });

    // Intercept clicks on hash links for smoother behavior
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#/"]');
      if (!link) return;

      e.preventDefault();
      const href = link.getAttribute('href');
      const route = href.slice(1); // Remove the leading '#'

      // Update hash (which triggers hashchange)
      if (window.location.hash !== href) {
        window.location.hash = href;
      } else {
        // Same hash — force navigate
        this.navigate(route);
      }
    });

    // Initial route
    const initialRoute = this.getRoute();
    if (window.__PAGES && window.__PAGES[initialRoute]) {
      // If we have SPA data and we're on a non-home route, render it
      this.navigate(initialRoute, { skipAnimation: true });
    } else {
      // The server-rendered content is correct (home page or fallback)
      this._currentRoute = initialRoute;
      this._updateActiveNav(initialRoute);
      this._triggerStaggerAnimations();
    }
  }
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

// ─── Init ──────────────────────────────────────────────────────
function init() {
  setupTheme();
  setupMobileMenu();
  Router.init();
}

init();