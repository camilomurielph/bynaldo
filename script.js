/* =========================================================
   ByNaldo — Landing
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* =====================================================
     1. TEMA CLARO / OSCURO
     ===================================================== */
  const root = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');

  // El tema inicial ya lo aplica el script inline del <head>.
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

    /* Cerrar al tocar un link del menú */
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    /* Cerrar con la tecla Escape */
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && bodyEl.classList.contains('menu-open')) {
        closeMenu();
      }
    });

    /* Cerrar si se agranda la ventana a desktop estando el menú abierto */
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
});
