/* ============================================================
   LES DÉLICES DE LAKAINE — JAVASCRIPT
   ============================================================ */

// ============================================================
// 1. ANIMATED BACKGROUND CANVAS
// ============================================================
(function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], gradientAngle = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  // Gradient color stops — cycles through 3 moods
  const palettes = [
    [
      { stop: 0,    color: '#1A0A06' },
      { stop: 0.35, color: '#2E0A14' },
      { stop: 0.65, color: '#4A1020' },
      { stop: 1,    color: '#1A0A06' },
    ],
    [
      { stop: 0,    color: '#0E0608' },
      { stop: 0.4,  color: '#3A1808' },
      { stop: 0.7,  color: '#5C2A0A' },
      { stop: 1,    color: '#0E0608' },
    ],
    [
      { stop: 0,    color: '#0A0606' },
      { stop: 0.45, color: '#1A1010' },
      { stop: 0.75, color: '#2A0A14' },
      { stop: 1,    color: '#0A0606' },
    ],
  ];

  let paletteIdx = 0, paletteLerp = 0;
  const PALETTE_SPEED = 0.0006;

  function lerpColor(c1, c2, t) {
    function hexToRgb(h) {
      const r = parseInt(h.slice(1,3),16);
      const g = parseInt(h.slice(3,5),16);
      const b = parseInt(h.slice(5,7),16);
      return [r,g,b];
    }
    const [r1,g1,b1] = hexToRgb(c1);
    const [r2,g2,b2] = hexToRgb(c2);
    return `rgb(${Math.round(r1+(r2-r1)*t)},${Math.round(g1+(g2-g1)*t)},${Math.round(b1+(b2-b1)*t)})`;
  }

  // Floating particles
  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : H + 20;
      this.size = Math.random() * 2.5 + 0.5;
      this.speedY = -(Math.random() * 0.5 + 0.15);
      this.speedX = (Math.random() - 0.5) * 0.2;
      this.opacity = 0;
      this.maxOpacity = Math.random() * 0.5 + 0.1;
      this.life = 0;
      this.maxLife = Math.random() * 300 + 200;
      this.color = Math.random() > 0.5 ? '#C9A96E' : '#F2D5C4';
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;

      const halfLife = this.maxLife / 2;
      if (this.life < 60)       this.opacity = Math.min(this.maxOpacity, this.opacity + 0.008);
      else if (this.life > this.maxLife - 60) this.opacity = Math.max(0, this.opacity - 0.008);

      if (this.life > this.maxLife || this.y < -20) this.reset();
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Gold shimmer streaks
  class Streak {
    constructor() { this.reset(); }

    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.w = Math.random() * 80 + 30;
      this.h = Math.random() * 1.5 + 0.3;
      this.angle = (Math.random() - 0.5) * 0.3;
      this.opacity = 0;
      this.speed = Math.random() * 0.003 + 0.001;
      this.phase = Math.random() * Math.PI * 2;
    }

    draw(t) {
      this.opacity = (Math.sin(t * this.speed + this.phase) + 1) / 2 * 0.12;
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      const grad = ctx.createLinearGradient(-this.w/2, 0, this.w/2, 0);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, '#C9A96E');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(-this.w/2, -this.h/2, this.w, this.h);
      ctx.restore();
    }
  }

  // Initialize
  for (let i = 0; i < 80; i++)  particles.push(new Particle());
  const streaks = Array.from({length: 12}, () => new Streak());

  let t = 0;

  function drawGradient() {
    // Slowly cycle palette
    paletteLerp += PALETTE_SPEED;
    if (paletteLerp >= 1) { paletteLerp = 0; paletteIdx = (paletteIdx + 1) % palettes.length; }

    const nextIdx = (paletteIdx + 1) % palettes.length;
    const curPal  = palettes[paletteIdx];
    const nxtPal  = palettes[nextIdx];

    // Create a large radial gradient as base
    const cx = W / 2 + Math.sin(t * 0.0003) * W * 0.15;
    const cy = H / 2 + Math.cos(t * 0.0004) * H * 0.1;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.85);

    for (let i = 0; i < curPal.length; i++) {
      const lColor = lerpColor(curPal[i].color, nxtPal[i].color, paletteLerp);
      grad.addColorStop(curPal[i].stop, lColor);
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle secondary radial for depth
    const grad2 = ctx.createRadialGradient(
      W * 0.8 + Math.sin(t * 0.0002) * W * 0.1,
      H * 0.2 + Math.cos(t * 0.0003) * H * 0.08,
      0,
      W * 0.8, H * 0.2,
      Math.max(W, H) * 0.4
    );
    grad2.addColorStop(0, 'rgba(92,10,20,0.22)');
    grad2.addColorStop(1, 'transparent');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, W, H);
  }

  function loop() {
    t++;
    ctx.clearRect(0, 0, W, H);
    drawGradient();
    streaks.forEach(s => s.draw(t));
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }

  // Pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) requestAnimationFrame(loop);
  });

  loop();
})();


// ============================================================
// 2. NAVBAR — Scroll effect + hamburger + active links
// ============================================================
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const links     = document.querySelectorAll('.nav-link');

  // Scroll → scrolled class
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveLink();
  }, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close menu on link click
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);

      // Close mobile menu
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';

      if (target) {
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
        const top  = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Footer logo → top
  document.querySelector('.nav-logo').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Reset menu state when crossing the mobile/desktop breakpoint
  // (utile lors d'une rotation d'écran ou d'un resize de fenêtre)
  const MOBILE_BREAKPOINT = 900;
  let wasMobile = window.innerWidth <= MOBILE_BREAKPOINT;

  window.addEventListener('resize', () => {
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    if (isMobile !== wasMobile) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      wasMobile = isMobile;
    }
  });

  // Fermer le menu si on touche/clique en dehors de la nav (mobile)
  document.addEventListener('click', e => {
    const isOpen = navLinks.classList.contains('open');
    const clickedInsideNav = navbar.contains(e.target);
    if (isOpen && !clickedInsideNav) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Active section highlighting
  function updateActiveLink() {
    const sections = document.querySelectorAll('section[id], footer[id]');
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) + 20;
    let current = '';

    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= navH) current = sec.id;
    });

    links.forEach(l => {
      l.classList.toggle('active', l.dataset.section === current);
    });
  }
})();


// ============================================================
// 3. SCROLL-TRIGGERED REVEAL ANIMATIONS
// ============================================================
(function initScrollReveal() {
  const cards = document.querySelectorAll(
    '.service-card, .gallery-item, .review-card, .contact-card, .apropos-grid > *'
  );

  // Add initial hidden state
  cards.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(32px)';
    el.style.transition = `opacity 0.65s ease ${i % 6 * 0.08}s, transform 0.65s ease ${i % 6 * 0.08}s`;
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  cards.forEach(el => observer.observe(el));
})();


// ============================================================
// 4. GALLERY FILTER
// ============================================================
(function initGalleryFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items      = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      items.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('hidden', !match);
      });
    });
  });
})();


// ============================================================
// 4bis. GALERIE — LIGHTBOX
// ============================================================
(function initGalleryLightbox() {
  const lightbox    = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCap = document.getElementById('lightboxCaption');
  const closeBtn    = document.getElementById('lightboxClose');
  if (!lightbox) return;

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img     = item.querySelector('.gallery-img');
      const caption = item.querySelector('.gallery-overlay span');
      if (!img) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCap.textContent = caption ? caption.textContent : '';
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });
})();


// ============================================================
// 5. REVIEWS SLIDER
// ============================================================
(function initSlider() {
  const track  = document.getElementById('reviewsTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsWrap = document.getElementById('sliderDots');

  if (!track) return;

  let current = 0;
  let itemsPerView = getItemsPerView();
  let cards = Array.from(track.querySelectorAll('.review-card'));
  let maxSlide = Math.max(0, cards.length - itemsPerView);
  let autoInterval;

  function getItemsPerView() {
    return window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    const totalDots = maxSlide + 1;
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, maxSlide));
    const cardW  = cards[0].offsetWidth + 24; // gap 1.5rem = 24px
    track.style.transform = `translateX(-${current * cardW}px)`;
    dotsWrap.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function next() { goTo(current >= maxSlide ? 0 : current + 1); }
  function prev() { goTo(current <= 0 ? maxSlide : current - 1); }

  prevBtn.addEventListener('click', () => { clearInterval(autoInterval); prev(); startAuto(); });
  nextBtn.addEventListener('click', () => { clearInterval(autoInterval); next(); startAuto(); });

  function startAuto() {
    clearInterval(autoInterval);
    autoInterval = setInterval(next, 4500);
  }

  window.addEventListener('resize', () => {
    itemsPerView = getItemsPerView();
    maxSlide = Math.max(0, cards.length - itemsPerView);
    current  = Math.min(current, maxSlide);
    buildDots();
    goTo(current);
  });

  buildDots();
  goTo(0);
  startAuto();
})();


// ============================================================
// 6. STAR RATING & REVIEW FORM
// ============================================================
(function initReviewForm() {
  const stars       = document.querySelectorAll('.star');
  const ratingInput = document.getElementById('reviewRating');
  let selectedRating = 0;

  stars.forEach(star => {
    star.addEventListener('mouseenter', () => {
      const val = +star.dataset.val;
      stars.forEach(s => s.classList.toggle('active', +s.dataset.val <= val));
    });

    star.addEventListener('mouseleave', () => {
      stars.forEach(s => s.classList.toggle('active', +s.dataset.val <= selectedRating));
    });

    star.addEventListener('click', () => {
      selectedRating = +star.dataset.val;
      ratingInput.value = selectedRating;
      stars.forEach(s => s.classList.toggle('active', +s.dataset.val <= selectedRating));
    });
  });

  document.getElementById('submitReview')?.addEventListener('click', () => {
    const name  = document.getElementById('reviewName').value.trim();
    const event = document.getElementById('reviewEvent').value;
    const text  = document.getElementById('reviewText').value.trim();
    const rating = +ratingInput.value;

    if (!name || !event || !text || rating === 0) {
      showFormError('Veuillez remplir tous les champs et attribuer une note.');
      return;
    }

    // Animate success
    const form    = document.getElementById('reviewForm');
    const success = document.getElementById('reviewSuccess');
    form.style.opacity = '0';
    form.style.transform = 'scale(0.95)';
    setTimeout(() => {
      form.style.display = 'none';
      success.style.display = 'block';
      success.style.animation = 'fadeInUp 0.5s ease';
    }, 300);
  });

  function showFormError(msg) {
    let errEl = document.querySelector('.form-error');
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.className = 'form-error';
      errEl.style.cssText = 'color:#C0392B;font-size:0.85rem;margin-top:0.5rem;font-weight:600;';
      document.getElementById('submitReview').after(errEl);
    }
    errEl.textContent = '⚠ ' + msg;
    setTimeout(() => errEl.remove(), 4000);
  }
})();


// ============================================================
// 7. FOOTER NAV LINKS — smooth scroll
// ============================================================
(function initFooterLinks() {
  document.querySelectorAll('footer a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById(a.getAttribute('href').slice(1));
      if (target) {
        const navH = 80;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
      }
    });
  });
})();


// ============================================================
// 8. BACK TO TOP
// ============================================================
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


// ============================================================
// 9. HERO PARALLAX (subtle)
// ============================================================
(function initParallax() {
  const hero = document.querySelector('.hero-content');
  if (!hero) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      hero.style.transform = `translateY(${y * 0.18}px)`;
      hero.style.opacity   = 1 - y / (window.innerHeight * 0.7);
    }
  }, { passive: true });
})();


// ============================================================
// 10. SECTION TITLE ANIMATION on first view
// ============================================================
(function initTitleReveal() {
  const titles = document.querySelectorAll('.section-title, .section-eyebrow, .section-desc');

  titles.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 100);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  titles.forEach(el => obs.observe(el));
})();
