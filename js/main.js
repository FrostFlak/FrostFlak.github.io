(function () {
  'use strict';

  /* ---------- helpers ---------- */

  function getBase() {
    return window.location.pathname.indexOf('/pages/') !== -1 ? '../' : '';
  }

  function assetUrl(path) {
    return getBase() + String(path).replace(/^\//, '');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function icon(name, className) {
    return '<svg class="' + (className || 'icon') + '" aria-hidden="true"><use href="#' + name + '"></use></svg>';
  }

  function slugify(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function getProjects() {
    var list = Array.isArray(window.FROSTFLAK_PROJECTS) ? window.FROSTFLAK_PROJECTS.slice() : [];
    return list.sort(function (a, b) {
      var da = a.date ? Date.parse(a.date) : 0;
      var db = b.date ? Date.parse(b.date) : 0;
      if (isNaN(da)) da = 0;
      if (isNaN(db)) db = 0;
      return db - da;
    });
  }

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function formatDate(value) {
    if (!value) return '';
    var d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  function reduceMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------- layout (nav + footer) ---------- */

  function renderLayout() {
    var page = document.body.dataset.page || '';
    var homeHref = assetUrl('index.html');
    var projectsHref = assetUrl('pages/projects.html');
    var contactHref = page === 'home' ? '#contact' : assetUrl('index.html') + '#contact';
    var projectsActive = page === 'projects' || page === 'project';

    var navMount = document.getElementById('site-nav');
    if (navMount) {
      navMount.innerHTML =
        '<nav class="navbar" id="navbar" aria-label="Primary">' +
          '<div class="nav-inner">' +
            '<a href="' + homeHref + '" class="nav-logo" aria-label="FrostFlak — home">' +
              '<span class="bracket">&lt;</span><span class="mark">FrostFlak</span><span class="bracket">/&gt;</span>' +
            '</a>' +
            '<div class="nav-right">' +
              '<ul class="nav-links" id="navLinks">' +
                '<li><a href="' + homeHref + '"' + (page === 'home' ? ' class="active"' : '') + '>Home</a></li>' +
                '<li><a href="' + projectsHref + '"' + (projectsActive ? ' class="active"' : '') + '>Projects</a></li>' +
                '<li><a href="' + contactHref + '">Contact</a></li>' +
              '</ul>' +
              '<button class="icon-btn" id="themeToggle" type="button" aria-label="Toggle color theme">' +
                icon('i-moon') +
              '</button>' +
              '<button class="hamburger" id="hamburger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="navLinks">' +
                '<span></span><span></span><span></span>' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</nav>';
    }

    var footerMount = document.getElementById('site-footer');
    if (footerMount) {
      footerMount.innerHTML =
        '<footer class="site-footer">' +
          '<div class="container footer-inner">' +
            '<p>&copy; ' + new Date().getFullYear() + ' FrostFlak — Nicolae Rotari</p>' +
            '<div class="footer-links">' +
              '<a href="' + homeHref + '">Home</a>' +
              '<a href="' + projectsHref + '">Projects</a>' +
              '<a href="' + contactHref + '">Contact</a>' +
            '</div>' +
          '</div>' +
        '</footer>';
    }
  }

  /* ---------- theme ---------- */

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function paintToggle(theme) {
    var toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    toggle.innerHTML = icon(theme === 'light' ? 'i-sun' : 'i-moon');
    toggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try { localStorage.setItem('theme', theme); } catch (e) {}
    paintToggle(theme);
  }

  function initTheme() {
    paintToggle(currentTheme());
    var toggle = document.getElementById('themeToggle');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      applyTheme(currentTheme() === 'light' ? 'dark' : 'light');
    });
  }

  /* ---------- nav ---------- */

  function initNav() {
    var navbar = document.getElementById('navbar');
    var hamburger = document.getElementById('hamburger');
    var navLinks = document.getElementById('navLinks');

    function isMenuOpen() {
      return !!navLinks && navLinks.classList.contains('open');
    }

    function closeMenu() {
      if (!hamburger || !navLinks) return;
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('open');
      document.body.classList.remove('nav-locked');
    }

    function openMenu() {
      if (!hamburger || !navLinks) return;
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      navLinks.classList.add('open');
      document.body.classList.add('nav-locked');
    }

    var lastY = window.scrollY;
    function onScroll() {
      var y = window.scrollY;
      if (navbar) {
        navbar.classList.toggle('scrolled', y > 8);
        if (y > lastY && y > 240 && !isMenuOpen()) {
          navbar.classList.add('hidden');
        } else {
          navbar.classList.remove('hidden');
        }
      }
      lastY = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (hamburger && navLinks) {
      hamburger.addEventListener('click', function () {
        if (isMenuOpen()) closeMenu(); else openMenu();
      });
      navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMenu);
      });
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && isMenuOpen()) closeMenu();
      });
      window.addEventListener('resize', function () {
        if (window.innerWidth > 768 && isMenuOpen()) closeMenu();
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (event) {
        var hash = anchor.getAttribute('href');
        if (!hash || hash.length < 2) return;
        var target = document.querySelector(hash);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ---------- scroll reveal ---------- */

  function initReveal(root) {
    var elements = (root || document).querySelectorAll('.reveal:not(.visible)');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- counters ---------- */

  function animateCounter(el, target, suffix, duration) {
    suffix = suffix || '';
    duration = duration || 1500;
    if (reduceMotion()) {
      el.textContent = target + suffix;
      return;
    }
    var start = performance.now();
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      el.textContent = target + suffix;
    }
    function step(now) {
      if (done) return;
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else finish();
    }
    requestAnimationFrame(step);
    window.setTimeout(finish, duration + 250);
  }

  function initCounters(root) {
    var elements = (root || document).querySelectorAll('[data-count]');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) {
        var target = parseInt(el.dataset.count, 10);
        if (!isNaN(target)) el.textContent = target + (el.dataset.suffix || '');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.dataset.count, 10);
        var suffix = el.dataset.suffix || '';
        if (!isNaN(target)) animateCounter(el, target, suffix);
        observer.unobserve(el);
      });
    }, { threshold: 0.4 });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- projects ---------- */

  function parseDownloads(value) {
    if (value == null || value === '') return null;
    var match = String(value).match(/^(\d+)(\+)?$/);
    if (!match) return null;
    return { number: parseInt(match[1], 10), suffix: match[2] || '' };
  }

  function tagsHtml(tags) {
    return (tags || []).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('');
  }

  function downloadsHtml(value) {
    var parsed = parseDownloads(value);
    if (parsed) {
      return '<span class="project-downloads">' + icon('i-play') +
        '<b data-count="' + parsed.number + '" data-suffix="' + escapeHtml(parsed.suffix) + '">0</b> plays</span>';
    }
    if (value) {
      return '<span class="project-downloads">' + icon('i-play') + '<b>' + escapeHtml(value) + '</b> plays</span>';
    }
    return '';
  }

  function detailHref(project) {
    return assetUrl('pages/project.html#' + encodeURIComponent(project.id));
  }

  function getProjectId() {
    var hash = window.location.hash.replace(/^#/, '');
    if (hash) {
      try { return decodeURIComponent(hash); } catch (e) { return hash; }
    }
    return new URLSearchParams(window.location.search).get('id');
  }

  function dateHtml(project) {
    return project.date
      ? '<span class="project-date">' + icon('i-calendar') + escapeHtml(formatDate(project.date)) + '</span>'
      : '';
  }

  function cardHtml(project, index) {
    var image = assetUrl('data/' + project.image);
    var play = project.playableLink && project.playableLink.trim()
      ? '<a class="project-play" href="' + escapeHtml(project.playableLink) + '" target="_blank" rel="noopener noreferrer">' + icon('i-play') + 'Play</a>'
      : '';
    var badge = project.featured
      ? '<span class="project-badge">' + icon('i-sparkles') + 'Featured</span>'
      : '';

    return '' +
      '<article class="project-card reveal" style="--i:' + index + '">' +
        '<a class="project-cover-link" href="' + detailHref(project) + '" aria-label="Open ' + escapeHtml(project.title) + '"></a>' +
        '<div class="project-media">' +
          '<img src="' + image + '" alt="' + escapeHtml(project.title) + '" loading="lazy" decoding="async">' +
          badge +
          play +
        '</div>' +
        '<div class="project-body">' +
          '<div class="project-tags">' + tagsHtml(project.tags) + '</div>' +
          '<h3 class="project-title">' + escapeHtml(project.title) + '</h3>' +
          '<p class="project-desc">' + escapeHtml(project.tagline || project.description) + '</p>' +
          '<div class="project-foot">' +
            downloadsHtml(project.downloads) +
            dateHtml(project) +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function stateHtml(title, text, iconName) {
    return '<div class="state">' + icon(iconName || 'i-star') +
      '<h3>' + escapeHtml(title) + '</h3><p>' + escapeHtml(text) + '</p></div>';
  }

  function renderFeatured() {
    var mount = document.getElementById('featuredGrid');
    if (!mount) return;

    var projects = getProjects();
    var list = projects.filter(function (project) { return project.featured === true; });

    if (!list.length) {
      mount.innerHTML = stateHtml('No featured projects yet', 'Set "featured": true in data/projects.js to pin a project here.', 'i-gamepad');
      return;
    }

    mount.innerHTML = list.map(function (project, index) { return cardHtml(project, index); }).join('');
    initReveal(mount);
    initCounters(mount);
  }

  function renderProjectCount() {
    var el = document.getElementById('projectCount');
    if (!el || !el.classList.contains('stat-number')) return;
    el.dataset.count = getProjects().length;
    initCounters(el.parentElement || document);
  }

  function renderProjectsPage() {
    var grid = document.getElementById('projectsGrid');
    if (!grid) return;

    var countEl = document.getElementById('projectCount');
    var projects = getProjects();

    if (countEl) {
      countEl.textContent = projects.length + (projects.length === 1 ? ' project' : ' projects');
    }

    if (!projects.length) {
      grid.innerHTML = stateHtml('No projects yet', 'Check back soon.', 'i-gamepad');
      return;
    }

    grid.innerHTML = projects.map(function (project, index) { return cardHtml(project, index); }).join('');
    initReveal(grid);
    initCounters(grid);
  }

  function detailHtml(project) {
    var image = assetUrl('data/' + project.image);
    var parsed = parseDownloads(project.downloads);

    var downloads = project.downloads
      ? (parsed
        ? '<span class="meta-pill">' + icon('i-play') + '<b data-count="' + parsed.number + '" data-suffix="' + escapeHtml(parsed.suffix) + '">0</b> plays</span>'
        : '<span class="meta-pill">' + icon('i-play') + '<b>' + escapeHtml(project.downloads) + '</b> plays</span>')
      : '';

    var role = project.role
      ? '<span class="meta-pill">' + icon('i-briefcase') + '<b>' + escapeHtml(project.role) + '</b></span>'
      : '';

    var date = project.date
      ? '<span class="meta-pill">' + icon('i-calendar') + '<b>' + escapeHtml(formatDate(project.date)) + '</b></span>'
      : '';

    var play = project.playableLink && project.playableLink.trim()
      ? '<a class="btn btn-primary" href="' + escapeHtml(project.playableLink) + '" target="_blank" rel="noopener noreferrer">' + icon('i-play') + 'Play now</a>'
      : '';

    var repo = project.repoLink && project.repoLink.trim()
      ? '<a class="btn btn-ghost" href="' + escapeHtml(project.repoLink) + '" target="_blank" rel="noopener noreferrer">' + icon('i-github') + 'Source</a>'
      : '';

    var highlights = (project.highlights || []).length
      ? '<h2>Highlights</h2><ul class="detail-highlights">' +
          project.highlights.map(function (item) {
            return '<li>' + icon('i-check') + '<span>' + escapeHtml(item) + '</span></li>';
          }).join('') +
        '</ul>'
      : '';

    var screenshots = (project.screenshots || []).filter(Boolean);
    var gallery = screenshots.length
      ? '<h2>Screenshots</h2><div class="gallery">' +
          screenshots.map(function (shot) {
            var src = assetUrl('data/' + shot);
            return '<button class="gallery-item" type="button" data-full="' + src + '">' +
              '<img src="' + src + '" alt="' + escapeHtml(project.title) + ' screenshot" decoding="async">' +
            '</button>';
          }).join('') +
        '</div>'
      : '';

    var main = '<div class="detail-main">' +
      '<h2>Overview</h2>' +
      '<p>' + escapeHtml(project.description || '') + '</p>' +
      highlights +
    '</div>';

    var aside = gallery ? '<aside class="detail-aside">' + gallery + '</aside>' : '';

    return '' +
      '<div class="container">' +
        '<a class="detail-back" href="' + assetUrl('pages/projects.html') + '">' + icon('i-arrow-left') + 'All projects</a>' +
        '<div class="detail-cover"><img src="' + image + '" alt="' + escapeHtml(project.title) + ' cover"></div>' +
        '<div class="detail-head">' +
          '<div>' +
            '<div class="project-tags">' + tagsHtml(project.tags) + '</div>' +
            '<h1>' + escapeHtml(project.title) + '</h1>' +
            '<p class="detail-tagline">' + escapeHtml(project.tagline || '') + '</p>' +
          '</div>' +
          '<div class="detail-actions">' + play + repo + '</div>' +
        '</div>' +
        '<div class="detail-meta">' + role + date + downloads + '</div>' +
        '<div class="detail-content' + (aside ? '' : ' detail-content--single') + '">' +
          main +
          aside +
        '</div>' +
      '</div>';
  }

  function renderProjectDetail() {
    var mount = document.getElementById('projectDetail');
    if (!mount) return;

    var id = getProjectId();
    var projects = getProjects();
    var project = null;

    projects.forEach(function (item) {
      if (item.id === id || slugify(item.title) === id) project = item;
    });

    if (!project) {
      mount.innerHTML = '<div class="container">' + stateHtml(
        'Project not found',
        'The project you are looking for does not exist.',
        'i-star'
      ) + '</div>';
      return;
    }

    document.title = project.title + ' — FrostFlak';
    mount.innerHTML = detailHtml(project);
    initCounters(mount);
  }

  /* ---------- lightbox ---------- */

  function closeLightbox() {
    var box = document.getElementById('lightbox');
    if (!box) return;
    box.classList.remove('open');
    document.body.classList.remove('nav-locked');
  }

  function openLightbox(src, alt) {
    var box = document.getElementById('lightbox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'lightbox';
      box.className = 'lightbox';
      box.innerHTML = '<button class="lightbox-close" type="button" aria-label="Close">&times;</button><img alt="">';
      document.body.appendChild(box);
    }
    var img = box.querySelector('img');
    img.src = src;
    img.alt = alt || '';
    box.classList.add('open');
    document.body.classList.add('nav-locked');
  }

  function initLightbox() {
    document.addEventListener('click', function (event) {
      var item = event.target.closest('.gallery-item');
      if (item) {
        var img = item.querySelector('img');
        openLightbox(item.getAttribute('data-full') || (img && img.src), img && img.alt);
        return;
      }
      if (event.target.closest('.lightbox')) closeLightbox();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeLightbox();
    });
  }

  /* ---------- boot ---------- */

  function boot() {
    document.documentElement.classList.add('js-ready');
    renderLayout();
    initTheme();
    initNav();
    initReveal(document);
    initCounters(document);
    initLightbox();
    renderProjectCount();
    renderFeatured();
    renderProjectsPage();
    renderProjectDetail();
    window.addEventListener('hashchange', function () {
      if (document.getElementById('projectDetail')) renderProjectDetail();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
