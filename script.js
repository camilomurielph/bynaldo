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
    document.querySelectorAll('.gallery__item').forEach((item) => {
      item.addEventListener('click', () => openLightbox(item));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(item);
        }
      });
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
        closeLightbox();
      }
    });
  }

  /* =====================================================
     9. CARRUSEL DE VIDEOS — 3 visibles + flechas + loop
        Solo desktop (> 640px). En móvil queda como antes.
     ===================================================== */
  const reelsEl = document.querySelector('.reels');
  const prevBtn = document.querySelector('.reels-arrow--prev');
  const nextBtn = document.querySelector('.reels-arrow--next');
  const desktopQuery = window.matchMedia('(min-width: 641px)');

  if (reelsEl) {

    /* ---------- Helpers ---------- */
    const getStep = () => {
      const card = reelsEl.querySelector('.reel-card');
      if (!card) return 300;
      const gap = parseFloat(getComputedStyle(reelsEl).columnGap)
               || parseFloat(getComputedStyle(reelsEl).gap)
               || 20;
      return card.offsetWidth + gap;
    };

    const instantScrollTo = (left) => {
      const prevSnap = reelsEl.style.scrollSnapType;
      const prevBehavior = reelsEl.style.scrollBehavior;
      reelsEl.style.scrollSnapType = 'none';
      reelsEl.style.scrollBehavior = 'auto';
      reelsEl.scrollLeft = left;
      // Forzar reflow para que el navegador aplique el cambio
      void reelsEl.offsetWidth;
      reelsEl.style.scrollSnapType = prevSnap;
      reelsEl.style.scrollBehavior = prevBehavior;
    };

    /* ---------- Clones para el loop ---------- */
    const originals = Array.from(reelsEl.querySelectorAll('.reel-card:not(.is-clone)'));
    const N = originals.length;
    const M = 3; // clones a cada lado (coincide con las cards visibles)

    const cloneCard = (source) => {
      const c = source.cloneNode(true);
      c.classList.add('is-clone');
      c.setAttribute('aria-hidden', 'true');
      c.removeAttribute('tabindex');
      c.querySelectorAll('[tabindex], a, button, iframe, [role="button"]').forEach((el) => {
        el.setAttribute('tabindex', '-1');
      });
      return c;
    };

    if (N > M) {
      // Clones al inicio: los últimos M originales (en orden)
      const startFrag = document.createDocumentFragment();
      for (let i = N - M; i < N; i++) {
        startFrag.appendChild(cloneCard(originals[i]));
      }
      reelsEl.insertBefore(startFrag, reelsEl.firstChild);

      // Clones al final: los primeros M originales (en orden)
      const endFrag = document.createDocumentFragment();
      for (let i = 0; i < M; i++) {
        endFrag.appendChild(cloneCard(originals[i]));
      }
      reelsEl.appendChild(endFrag);
    }

    /* ---------- Scroll inicial (solo desktop) ---------- */
    const setInitialScroll = () => {
      if (desktopQuery.matches) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            instantScrollTo(M * getStep());
          });
        });
      } else {
        reelsEl.scrollLeft = 0;
      }
    };
    setInitialScroll();

    /* ---------- Drag-scroll con mouse ---------- */
    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;
    let movedDistance = 0;

    reelsEl.addEventListener('mousedown', (e) => {
      if (e.target.closest('iframe')) return;
      if (e.button !== 0) return;

      isDown = true;
      startX = e.pageX;
      startScrollLeft = reelsEl.scrollLeft;
      movedDistance = 0;
      reelsEl.classList.add('is-dragging');
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const delta = e.pageX - startX;
      movedDistance = Math.abs(delta);
      reelsEl.scrollLeft = startScrollLeft - delta * 1.2;
    });

    document.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;

      const step = getStep();
      const targetLeft = Math.round(reelsEl.scrollLeft / step) * step;
      reelsEl.scrollTo({ left: targetLeft, behavior: 'smooth' });

      setTimeout(() => {
        reelsEl.classList.remove('is-dragging');
      }, 400);
    });

    reelsEl.addEventListener('click', (e) => {
      if (movedDistance > 5) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    /* ---------- Boundary check (loop invisible) ---------- */
    const checkBoundary = () => {
      if (!desktopQuery.matches) return;
      const step = getStep();
      const index = Math.round(reelsEl.scrollLeft / step);

      if (index < M) {
        // En zona de clones iniciales → saltar hacia adelante
        instantScrollTo((index + N) * step);
      } else if (index >= M + N) {
        // En zona de clones finales → saltar hacia atrás
        instantScrollTo((index - N) * step);
      }
    };

    let scrollSettleTimer;
    reelsEl.addEventListener('scroll', () => {
      if (!desktopQuery.matches) return;
      clearTimeout(scrollSettleTimer);
      scrollSettleTimer = setTimeout(checkBoundary, 200);
    }, { passive: true });

    /* ---------- Flechas ---------- */
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (!desktopQuery.matches) return;
        reelsEl.scrollBy({ left: -getStep(), behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (!desktopQuery.matches) return;
        const step = getStep();
        const index = Math.round(reelsEl.scrollLeft / step);

        // Si estamos en la última posición real, pre-saltar al inicio
        // (equivalente visual) para que el scroll termine en la posición correcta
        if (index >= M + N - 1) {
          instantScrollTo((index - N) * step);
        }

        reelsEl.scrollBy({ left: step, behavior: 'smooth' });
      });
    }

    /* ---------- Resize ---------- */
    desktopQuery.addEventListener('change', setInitialScroll);
  }

});
