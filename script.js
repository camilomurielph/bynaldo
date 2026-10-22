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
     6. AUTOPLAY DEL CARRUSEL DE VIDEOS (solo móvil)
     ===================================================== */
  const reels = document.querySelector('.reels');
  const mobileQuery = window.matchMedia('(max-width: 640px)');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let autoplayRAF = null;
  let lastTimestamp = 0;
  let floatScroll = 0;
  let isPaused = false;
  let pauseTimeout = null;
  const PAUSE_DELAY = 4000;      // ms de inactividad para reanudar
  const SPEED = 0.35;            // px por frame @60fps ≈ 21 px/s

  const stopAutoplay = () => {
    if (autoplayRAF) {
      cancelAnimationFrame(autoplayRAF);
      autoplayRAF = null;
    }
  };

  const startAutoplay = () => {
    if (!reels) return;
    if (autoplayRAF) return;
    if (!mobileQuery.matches) return;
    if (prefersReducedMotion.matches) return;
    if (isPaused) return;

    floatScroll = reels.scrollLeft;
    lastTimestamp = performance.now();
    autoplayRAF = requestAnimationFrame(tick);
  };

  const tick = (now) => {
    if (!reels || isPaused) {
      autoplayRAF = null;
      return;
    }

    const delta = now - lastTimestamp;
    lastTimestamp = now;

    const maxScroll = reels.scrollWidth - reels.clientWidth;
    if (maxScroll <= 0) {
      autoplayRAF = null;
      return;
    }

    // Velocidad independiente del framerate
    const move = (SPEED / 16.67) * delta;
    floatScroll += move;

    if (floatScroll >= maxScroll - 1) {
      // Llegamos al final: esperar un momento y volver al inicio
      isPaused = true;
      autoplayRAF = null;
      setTimeout(() => {
        if (!reels) return;
        reels.scrollTo({ left: 0, behavior: 'smooth' });
        setTimeout(() => {
          if (!reels) return;
          isPaused = false;
          startAutoplay();
        }, 900);
      }, 1500);
      return;
    }

    reels.scrollLeft = floatScroll;
    autoplayRAF = requestAnimationFrame(tick);
  };

  const pauseForInteraction = () => {
    isPaused = true;
    stopAutoplay();
    if (pauseTimeout) clearTimeout(pauseTimeout);
  };

  const scheduleResume = () => {
    if (pauseTimeout) clearTimeout(pauseTimeout);
    pauseTimeout = setTimeout(() => {
      isPaused = false;
      startAutoplay();
    }, PAUSE_DELAY);
  };

  if (reels) {
    // Pausar al tocar/dragear/rueda
    ['touchstart', 'mousedown', 'wheel'].forEach((evt) => {
      reels.addEventListener(evt, pauseForInteraction, { passive: true });
    });

    // Programar reanudación al terminar el gesto
    ['touchend', 'mouseup', 'touchcancel'].forEach((evt) => {
      reels.addEventListener(evt, scheduleResume, { passive: true });
    });

    // Solo correr cuando el carrusel está visible en pantalla
    if ('IntersectionObserver' in window) {
      const reelsObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isPaused) startAutoplay();
          else if (!entry.isIntersecting) stopAutoplay();
        });
      }, { threshold: 0.25 });
      reelsObserver.observe(reels);
    } else {
      startAutoplay();
    }

    // Al cambiar de breakpoint
    mobileQuery.addEventListener('change', (e) => {
      if (e.matches) {
        startAutoplay();
      } else {
        stopAutoplay();
        if (reels) reels.scrollLeft = 0;
      }
    });

    // Detener si la pestaña no está visible (ahorra batería)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAutoplay();
      else if (!isPaused) startAutoplay();
    });
  }
});
