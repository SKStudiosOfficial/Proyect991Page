// ============================
// Utilidad segura de selectores
// ============================
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ============================
// Año dinámico
// ============================
const yearSpan = $('#year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

// ============================
// IntersectionObserver para .reveal
// ============================
(() => {
  const revealEls = $$('.reveal');
  if (!revealEls.length || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => io.observe(el));
})();

// ============================
// Menú móvil accesible
// ============================
(() => {
  const menuBtn = $('#menuToggle');
  const nav = $('#siteNav');
  if (!menuBtn || !nav) return;

  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });

  // Cerrar al hacer click en un link (cualquier link del nav)
  $$('a', nav).forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }));
})();

// ============================
// Canvas de partículas (respeta reduce-motion)
// ============================
(() => {
  const canvas = $('#bg-canvas');
  if (!canvas) return;

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d', { alpha: true });
  let w = 0, h = 0, particles = [], raf = null;

  function makeParticles() {
    const count = prefersReduced ? 20 : 90;
    return Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      hue: Math.random() > 0.5 ? 160 : 195
    }));
  }

  function resize() {
    w = canvas.width  = window.innerWidth;
    h = canvas.height = Math.max(window.innerHeight, 600);
    particles = makeParticles();
  }

  function step() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
      grad.addColorStop(0, `hsla(${p.hue}, 80%, 60%, .35)`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fill();
    }
    raf = requestAnimationFrame(step);
  }

  function start() {
    cancelAnimationFrame(raf);
    resize();
    if (!prefersReduced) step();
  }

  window.addEventListener('resize', start, { passive: true });
  start();
})();

// ============================
// Parallax sutil en .hero (con rAF)
// ============================
(() => {
  const hero = $('.hero');
  if (!hero) return;

  let px = 0, py = 0, ticking = false;

  hero.addEventListener('pointermove', (e) => {
    const rect = hero.getBoundingClientRect();
    px = (e.clientX - rect.left) / rect.width  - 0.5;
    py = (e.clientY - rect.top)  / rect.height - 0.5;

    if (!ticking) {
      requestAnimationFrame(() => {
        hero.style.backgroundPosition = `${50 + px * 2}% ${50 + py * 2}%`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

// ============================
// Smooth scroll SOLO para anchors internos
// ============================
(() => {
  $$('nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    // Solo intercepta si es un hash interno (#seccion)
    if (!href.startsWith('#')) return;

    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = $(href);
      if (target && 'scrollIntoView' in target) {
        target.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Si no existe el objetivo, no hacemos nada (o podríamos ir a /)
      }
    });
  });
})();

// ============================
// Simulación de suscripción (front-only)
// ============================
function subscribe() {
  // Busca un form en /#contacto o /#suscripcion, y si no, el primero que haya
  const form = $('#contacto form') || $('#suscripcion form') || $('form');
  const emailInput = form ? $('#email', form) : $('#email');
  const msgInput   = form ? $('#msg', form)   : $('#msg');
  const status     = form ? $('#form-status', form) : $('#form-status');

  const email = (emailInput && emailInput.value || '').trim();
  const msg   = (msgInput && msgInput.value || '').trim();

  if (!status) return;

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  status.style.display = 'block';

  if (!emailOk) {
    status.style.color = 'var(--danger)';
    status.textContent = 'Por favor, introduce un correo válido.';
    return;
  }

  // Integración real: Formspree/Resend/tu backend.
  status.style.color = 'var(--accent)';
  status.textContent = '¡Gracias! Te hemos agregado a la lista de novedades.';

  if (form && typeof form.reset === 'function') form.reset();
}
window.subscribe = subscribe;

// ============================
// Toggle de tema (sin invertir imágenes)
// ============================
(() => {
  const toggle = $('#toggleTheme');
  const root = document.documentElement;

  if (!toggle) return;

  let manualTheme = localStorage.getItem('p991-theme') || '';
  if (manualTheme) root.setAttribute('data-theme', manualTheme);

  function setLabel() {
    toggle.textContent = root.getAttribute('data-theme') === 'light'
      ? 'Tema oscuro'
      : 'Alternar tema';
  }

  toggle.addEventListener('click', () => {
    const now = root.getAttribute('data-theme') === 'light' ? '' : 'light';
    if (now) root.setAttribute('data-theme', now);
    else root.removeAttribute('data-theme');

    localStorage.setItem('p991-theme', now);
    setLabel();
  });

  setLabel();
})();
