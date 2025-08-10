// Año dinámico
document.getElementById('year').textContent = new Date().getFullYear();

// ===== IntersectionObserver para reveals
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
      io.unobserve(e.target);
    }
  });
}, { threshold: .15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ===== Menú móvil accesible
const menuBtn = document.getElementById('menuToggle');
const nav = document.getElementById('siteNav');
menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
}));

// ===== Canvas de partículas (respeta reduce-motion)
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d', { alpha: true });
let w, h, particles = [], raf;

function makeParticles() {
  const count = prefersReduced ? 20 : 90;
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.5 + .3,
    vx: (Math.random() - .5) * .2,
    vy: (Math.random() - .5) * .2,
    hue: Math.random() > .5 ? 160 : 195
  }));
}
function resize() {
  w = canvas.width = window.innerWidth;
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
window.addEventListener('resize', () => { cancelAnimationFrame(raf); resize(); if (!prefersReduced) step(); });
resize(); if (!prefersReduced) step();

// ===== Parallax sutil en Hero (con rAF)
const hero = document.querySelector('.hero');
let px = 0, py = 0, ticking = false;
hero.addEventListener('pointermove', (e) => {
  const rect = hero.getBoundingClientRect();
  px = (e.clientX - rect.left) / rect.width - .5;
  py = (e.clientY - rect.top) / rect.height - .5;
  if (!ticking) {
    requestAnimationFrame(() => {
      hero.style.backgroundPosition = `${50 + px * 2}% ${50 + py * 2}%`;
      ticking = false;
    });
    ticking = true;
  }
});

// ===== Smooth scroll para nav
document.querySelectorAll('nav a').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const id = a.getAttribute('href');
    const target = document.querySelector(id);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ===== Simulación de suscripción (front-only)
function subscribe() {
  const email = document.getElementById('email').value.trim();
  const msg   = document.getElementById('msg').value.trim();
  const status = document.getElementById('form-status');
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
  document.querySelector('form').reset();
}
window.subscribe = subscribe;

// ===== Toggle de tema (sin invertir imágenes)
const toggle = document.getElementById('toggleTheme');
const root = document.documentElement;
let manualTheme = localStorage.getItem('p991-theme') || '';
if (manualTheme) root.setAttribute('data-theme', manualTheme);
toggle.addEventListener('click', () => {
  const now = root.getAttribute('data-theme') === 'light' ? '' : 'light';
  if (now) root.setAttribute('data-theme', now); else root.removeAttribute('data-theme');
  localStorage.setItem('p991-theme', now);
  toggle.textContent = now ? 'Tema oscuro' : 'Alternar tema';
});
// Ajustar label inicial
toggle.textContent = root.getAttribute('data-theme') === 'light' ? 'Tema oscuro' : 'Alternar tema';
