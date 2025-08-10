// Año dinámico
    document.getElementById('year').textContent = new Date().getFullYear();

    // IntersectionObserver para reveals
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      })
    }, { threshold: .15 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // Canvas de partículas sutiles (respetando reduce motion)
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let w, h, particles;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = Math.max(window.innerHeight, 600);
      particles = Array.from({ length: prefersReduced ? 30 : 90 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + .3,
        vx: (Math.random() - .5) * .2,
        vy: (Math.random() - .5) * .2,
        hue: Math.random() > .5 ? 160 : 195
      }));
    }

    function step() {
      ctx.clearRect(0,0,w,h);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*6);
        grad.addColorStop(0, `hsla(${p.hue}, 80%, 60%, .35)`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fill();
      }
      raf = requestAnimationFrame(step);
    }

    let raf;
    window.addEventListener('resize', () => { cancelAnimationFrame(raf); resize(); step(); });
    resize(); if (!prefersReduced) step();

    // Parallax sutil en Hero
    const hero = document.querySelector('.hero');
    hero.addEventListener('pointermove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - .5;
      const y = (e.clientY - rect.top) / rect.height - .5;
      hero.style.backgroundPosition = `${50 + x*2}% ${50 + y*2}%`;
    });

    // Smooth scroll (ya usamos scrollIntoView en CTA). Mejoramos enlaces nav
    document.querySelectorAll('nav a').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const id = a.getAttribute('href');
        const target = document.querySelector(id);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Simulación de suscripción (front-only)
    function subscribe() {
      const email = document.getElementById('email').value.trim();
      const msg   = document.getElementById('msg').value.trim();
      const status = document.getElementById('form-status');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.style.display = 'block';
        status.style.color = 'var(--danger)';
        status.textContent = 'Por favor, introduce un correo válido.';
        return;
      }
      // Aquí puedes integrar tu backend o un servicio (Formspree, etc.)
      status.style.display = 'block';
      status.style.color = 'var(--accent)';
      status.textContent = '¡Gracias! Te hemos agregado a la lista de novedades.';
      document.querySelector('form').reset();
    }
    window.subscribe = subscribe;

    // Toggle de tema claro/oscuro manual
    const toggle = document.getElementById('toggleTheme');
    let manualLight = false;
    toggle.addEventListener('click', () => {
      manualLight = !manualLight;
      document.documentElement.style.filter = manualLight ? 'invert(1) hue-rotate(180deg)' : 'none';
      toggle.textContent = manualLight ? 'Tema oscuro' : 'Alternar tema';
    });