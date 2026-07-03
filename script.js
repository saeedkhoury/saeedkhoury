/* ─── Canvas Particles ─────────────────────────────────────────── */
(function () {
  var isMobile = ('ontouchstart' in window) || window.innerWidth < 768;
  var canvas = document.getElementById('bg-canvas');

  /* On mobile just hide canvas — saves an entire RAF loop */
  if (isMobile) { canvas.style.display = 'none'; return; }

  var ctx = canvas.getContext('2d');
  var particles = [];
  var mouse = { x: null, y: null, radius: 120 };

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', function () { resize(); initParticles(); });

  /* No mouse-repulsion on mobile (no mouse) */
  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX; mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', function () { mouse.x = null; mouse.y = null; });

  function Particle() {
    this.x  = Math.random() * canvas.width;
    this.y  = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * (isMobile ? 0.25 : 0.4);
    this.vy = (Math.random() - 0.5) * (isMobile ? 0.25 : 0.4);
    this.r  = Math.random() * 1.5 + 0.5;
    this.a  = Math.random() * 0.3 + 0.05;
  }
  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
    if (!isMobile && mouse.x !== null) {
      var dx = this.x - mouse.x, dy = this.y - mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius && dist > 0) {
        var force = (mouse.radius - dist) / mouse.radius;
        this.x += dx / dist * force * 1.2;
        this.y += dy / dist * force * 1.2;
      }
    }
  };
  Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(124,58,237,' + this.a + ')';
    ctx.fill();
  };

  function initParticles() {
    /* Mobile: max 25 particles, no connections; desktop: up to 80 */
    var area  = canvas.width * canvas.height;
    var count = isMobile
      ? Math.min(Math.floor(area / 28000), 25)
      : Math.min(Math.floor(area / 14000), 80);
    particles = [];
    for (var i = 0; i < count; i++) particles.push(new Particle());
  }
  initParticles();

  function connect() {
    var maxDist = 120;
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var d  = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(124,58,237,' + ((1 - d / maxDist) * 0.1) + ')';
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    if (!isMobile) connect(); /* skip expensive O(n²) on mobile */
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ─── Portrait 3-D tracking ─────────────────────────────────────── */
(function () {
  var isMobile = ('ontouchstart' in window) || window.innerWidth < 768;
  var img = document.getElementById('hero-portrait');
  if (!img) return;

  var tx = 0, ty = 0, cx = 0, cy = 0;

  var PERSP  = 800;
  var TILT_Y = 20;
  var TILT_X = 12;
  var MOVE_X = isMobile ? 18 : 70;
  var MOVE_Y = isMobile ? 8  : 35;
  var LERP   = isMobile ? 0.04 : 0.08;  /* slower on mobile = smoother */

  /* Desktop: follow mouse */
  if (!isMobile) {
    window.addEventListener('mousemove', function (e) {
      tx = (e.clientX / window.innerWidth  - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  /* Mobile: follow device tilt (passive = no scroll jank) */
  window.addEventListener('deviceorientation', function (e) {
    if (e.gamma == null) return;
    tx = Math.max(-1, Math.min(1, e.gamma / 40));
    ty = Math.max(-1, Math.min(1, (e.beta - 45) / 40));
  }, { passive: true });

  /* Desktop only: dynamic glow update */
  var glowLive = false;
  if (!isMobile) setTimeout(function () { glowLive = true; }, 1000);

  function tick() {
    cx += (tx - cx) * LERP;
    cy += (ty - cy) * LERP;

    img.style.transform =
      'perspective(' + PERSP + 'px)' +
      ' rotateY(' + (cx * TILT_Y).toFixed(2) + 'deg)' +
      ' rotateX(' + (-cy * TILT_X).toFixed(2) + 'deg)' +
      ' translate(' + (cx * MOVE_X).toFixed(2) + 'px,' + (cy * MOVE_Y).toFixed(2) + 'px)';

    if (glowLive) {
      var d   = Math.sqrt(cx * cx + cy * cy);
      var vpx = Math.round(50 + d * 60);
      var cpx = Math.round(100 + d * 80);
      img.style.filter =
        'drop-shadow(0 0 ' + vpx + 'px rgba(124,58,237,' + (0.20 + d * 0.40).toFixed(2) + '))' +
        ' drop-shadow(0 0 ' + cpx + 'px rgba(34,211,238,' + (0.07 + d * 0.15).toFixed(2) + '))' +
        ' drop-shadow(0 0 200px rgba(124,58,237,0.06))';
    }

    requestAnimationFrame(tick);
  }
  tick();
})();

/* ─── Nav scroll ───────────────────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

/* ─── Mobile nav toggle ────────────────────────────────────────── */
const toggle = document.getElementById('nav-toggle');
const menu   = document.getElementById('nav-menu');
toggle.addEventListener('click', () => {
  menu.classList.toggle('open');
});
document.querySelectorAll('.nav-link').forEach(l => {
  l.addEventListener('click', () => menu.classList.remove('open'));
});

/* ─── Active nav on scroll ─────────────────────────────────────── */
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');
const observer2 = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -40% 0px' });
sections.forEach(s => observer2.observe(s));

/* ─── Scroll reveal ────────────────────────────────────────────── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ─── Hero typewriter ──────────────────────────────────────────── */
(function () {
  const phrases = [
    'Software Engineer',
    'Vibecoder',
    'AI-Powered Builder',
    'CS Student',
    'Problem Solver',
  ];
  const el = document.getElementById('typewriter');
  if (!el) return;
  let pi = 0, ci = 0, deleting = false;
  const speed = { type: 80, delete: 40, pause: 1800 };

  function tick() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; setTimeout(tick, speed.pause); return; }
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
    }
    setTimeout(tick, deleting ? speed.delete : speed.type);
  }
  setTimeout(tick, 600);
})();

/* ─── Terminal animation ───────────────────────────────────────── */
(function () {
  const body = document.getElementById('terminal-body');
  if (!body) return;

  const lines = [
    { type: 'cmd', text: 'whoami' },
    { type: 'out', text: 'saeed-khoury' },
    { type: 'cmd', text: 'cat about.txt' },
    { type: 'out', text: 'Software Engineering student,\nvibecoder, and builder.' },
    { type: 'cmd', text: 'skills --list' },
    { type: 'out', text: 'Java · Python · C · SQL · Assembly\nData Structures · Algorithms · QA' },
    { type: 'cmd', text: 'cat motto.txt' },
    { type: 'out', text: '"Build with intent. Ship with confidence."' },
    { type: 'cmd', text: 'echo $STATUS' },
    { type: 'out', text: '✅ Available for internships' },
  ];

  let li = 0;
  function nextLine() {
    if (li >= lines.length) return;
    const line = lines[li++];
    const row = document.createElement('div');

    if (line.type === 'cmd') {
      const prompt = document.createElement('span');
      prompt.className = 't-prompt';
      prompt.textContent = '~/saeed';
      const dollar = document.createElement('span');
      dollar.style.color = 'var(--dim)';
      dollar.textContent = ' $ ';
      const cmdEl = document.createElement('span');
      cmdEl.className = 't-cmd';
      row.appendChild(prompt);
      row.appendChild(dollar);
      row.appendChild(cmdEl);
      body.appendChild(row);
      let ci2 = 0;
      const typeCmd = () => {
        if (ci2 <= line.text.length) {
          cmdEl.textContent = line.text.slice(0, ci2++);
          setTimeout(typeCmd, 55);
        } else {
          setTimeout(nextLine, 200);
        }
      };
      typeCmd();
    } else {
      row.className = 't-out';
      row.textContent = line.text;
      body.appendChild(row);
      setTimeout(nextLine, 350);
    }
    body.scrollTop = body.scrollHeight;
  }

  /* Start when terminal enters viewport */
  const termObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { nextLine(); termObs.disconnect(); }
  }, { threshold: 0.3 });
  const termCard = document.querySelector('.terminal-card');
  if (termCard) termObs.observe(termCard);
})();

/* ─── Chat typewriter ──────────────────────────────────────────── */
(function () {
  const el     = document.getElementById('chat-type');
  const cursor = document.getElementById('chat-cursor');
  if (!el) return;

  const text = "Sure! I'll design a system with three layers: an IoT sensor layer for real-time fuel readings, a Node.js backend with WebSocket for live data streaming, and a cloud dashboard. I'll also add anomaly detection for theft prevention. Want me to start with the database schema?";

  let ci = 0, started = false;
  function type() {
    if (ci <= text.length) {
      el.textContent = text.slice(0, ci++);
      setTimeout(type, 22);
    } else {
      if (cursor) cursor.style.display = 'none';
    }
  }

  const chatObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      setTimeout(type, 800);
      chatObs.disconnect();
    }
  }, { threshold: 0.4 });
  const chatEl = document.querySelector('.vibe-chat');
  if (chatEl) chatObs.observe(chatEl);
})();

/* ─── Lightbox ─────────────────────────────────────────────────── */
function openLightbox(src, caption) {
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lb-img');
  const cap = document.getElementById('lb-caption');
  img.src = src;
  if (cap) cap.textContent = caption || '';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});
