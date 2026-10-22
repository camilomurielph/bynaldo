/* =========================================================
   ByNaldo — Landing
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* =====================================================
     1. TEMA CLARO / OSCURO
     ===================================================== */
  const root = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');

  if (!root.getAttribute('data-theme')) {
    root.setAttribute('data-theme', 'light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  /* =====================================================
     2. NAVBAR — borde al scrollear
     ===================================================== */
  const navbar = document.querySelector('.navbar');
  const onScroll = () => {
    if (window.scrollY > 40) navbar.classList.add('is-scrolled');
    else navbar.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* =====================================================
     3. REVEAL ON SCROLL (fotos y videos)
     ===================================================== */
  const revealTargets = document.querySelectorAll('.gallery__item, .reel-card');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const siblings = Array.from(entry.target.parentElement.children);
          const i = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${Math.min(i * 80, 400)}ms`;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px',
    });

    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  /* =====================================================
     4. SMOOTH SCROLL interno
     ===================================================== */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* =====================================================
     5. MENÚ HAMBURGUESA (MÓVIL)
     ===================================================== */
  const burger = document.querySelector('.navbar__burger');
  const mobileMenu = document.querySelector('#mobile-menu');
  const bodyEl = document.body;

  const closeMenu = () => {
    bodyEl.classList.remove('menu-open');
    if (burger) {
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Abrir menú');
    }
    if (mobileMenu) {
      mobileMenu.setAttribute('aria-hidden', 'true');
    }
  };

  const openMenu = () => {
    bodyEl.classList.add('menu-open');
    if (burger) {
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Cerrar menú');
    }
    if (mobileMenu) {
      mobileMenu.setAttribute('aria-hidden', 'false');
    }
  };

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      if (bodyEl.classList.contains('menu-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && bodyEl.classList.contains('menu-open')) {
        closeMenu();
      }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768 && bodyEl.classList.contains('menu-open')) {
          closeMenu();
        }
      }, 100);
    });
  }

  /* =====================================================
     6. PRELOAD THEME — fade-in de imágenes y videos
     ===================================================== */

  /* ---------- 6a. Fotos ---------- */
  document.querySelectorAll('.gallery__item').forEach((item) => {
    const img = item.querySelector('img');
    if (!img) return;

    const markLoaded = () => item.classList.add('is-loaded');

    if (img.complete && img.naturalWidth > 0) {
      markLoaded();
    } else {
      img.addEventListener('load', markLoaded, { once: true });
      img.addEventListener('error', markLoaded, { once: true });
    }
  });

  /* ---------- 6b. Videos (iframes) ---------- */
  document.querySelectorAll('.reel-embed').forEach((embed) => {
    const iframe = embed.querySelector('iframe');
    if (!iframe) return;

    const markLoaded = () => embed.classList.add('is-loaded');

    iframe.addEventListener('load', markLoaded, { once: true });
    setTimeout(markLoaded, 3000);
  });

  /* =====================================================
     7. CARRUSELES MÓVILES — el item más visible se activa
     ===================================================== */
  const setupActiveHighlight = (containerSelector, itemSelector, mediaQuery) => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    let rafId = null;

    const update = () => {
      if (!mediaQuery.matches) return;

      const items = container.querySelectorAll(itemSelector);
      if (!items.length) return;

      const viewportWidth = window.innerWidth;
      let bestItem = null;
      let maxVisibleWidth = 0;

      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const visibleLeft = Math.max(rect.left, 0);
        const visibleRight = Math.min(rect.right, viewportWidth);
        const visibleWidth = Math.max(0, visibleRight - visibleLeft);

        if (visibleWidth > maxVisibleWidth) {
          maxVisibleWidth = visibleWidth;
          bestItem = item;
        }
      });

      items.forEach((item) => {
        item.classList.toggle('is-active', item === bestItem);
      });
    };

    container.addEventListener('scroll', () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        update();
      });
    }, { passive: true });

    container.querySelectorAll('img').forEach((img) => {
      img.addEventListener('load', update, { once: true });
    });

    update();
    setTimeout(update, 500);
    setTimeout(update, 1500);
    window.addEventListener('load', update);

    mediaQuery.addEventListener('change', (e) => {
      if (e.matches) {
        update();
      } else {
        container.querySelectorAll(itemSelector).forEach((item) => {
          item.classList.remove('is-active');
        });
      }
    });

    window.addEventListener('orientationchange', () => {
      setTimeout(update, 200);
    });
  };

  const mobileQuery = window.matchMedia('(max-width: 640px)');
  setupActiveHighlight('.gallery', '.gallery__item', mobileQuery);
  setupActiveHighlight('.reels', '.reel-card', mobileQuery);

  /* =====================================================
     8. LIGHTBOX DE FOTOS
     ===================================================== */
  const lightbox = document.querySelector('#lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('.lightbox__img') : null;
  const lightboxTitle = lightbox ? lightbox.querySelector('.lightbox__title') : null;
  const lightboxYear = lightbox ? lightbox.querySelector('.lightbox__year') : null;
  const lightboxClose = lightbox ? lightbox.querySelector('.lightbox__close') : null;

  let lastFocusedEl = null;

  const openLightbox = (item) => {
    if (!lightbox || !lightboxImg) return;

    const img = item.querySelector('img');
    if (!img) return;

    const spans = item.querySelectorAll('.gallery__caption span');

    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || '';

    if (lightboxTitle) lightboxTitle.textContent = spans[0] ? spans[0].textContent : '';
    if (lightboxYear) lightboxYear.textContent = spans[1] ? spans[1].textContent : '';

    lastFocusedEl = document.activeElement;

    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    bodyEl.classList.add('lightbox-open');

    if (lightboxClose) {
      setTimeout(() => lightboxClose.focus(), 50);
    }
  };

  const closeLightbox = () => {
    if (!lightbox) return;

    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    bodyEl.classList.remove('lightbox-open');

    setTimeout(() => {
      if (lightboxImg) lightboxImg.src = '';
      if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
        lastFocusedEl.focus();
      }
    }, 300);
  };

  if (lightbox) {
    // Abrir desde cualquier foto (click o teclado)
    document.querySelectorAll('.gallery__item').forEach((item) => {
      item.addEventListener('click', () => openLightbox(item));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(item);
        }
      });
    });

    // Cerrar al hacer click en el backdrop (cualquier área que no sea la foto)
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Cerrar con el botón ✕
    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
        closeLightbox();
      }
    });
  }

});
