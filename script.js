/* ─── i18n: language data and switcher ─────────────────────────── */
var currentLang = (function() {
  try { return localStorage.getItem('lang') || 'en'; } catch(e) { return 'en'; }
})();

var typewriterPhrases = {
  en: ['Webcoding & Software Engineer', 'Vibecoder', 'AI-Powered Builder', 'CS Student', 'Problem Solver'],
  he: ['מהנדס תוכנה', 'ויבקודר', 'בונה מונע AI', 'סטודנט למדמ"ח', 'פותר בעיות']
};

var translations = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.vibecoding': 'Vibecoding',
    'nav.projects': 'Projects',
    'nav.contact': 'Contact',
    'nav.resume': 'Resume',
    'intro.badge': 'Open to internships & collaborations',
    'intro.bio': 'Third-year Software Engineering student building real-world solutions — with code, curiosity, and a little AI magic.',
    'intro.cta.resume': 'View Resume',
    'intro.cta.projects': 'See Projects ↓',
    'about.eyebrow': 'About me',
    'about.title': 'The person behind the prompt',
    'about.p1': "I'm a <strong>highly motivated third-year Software Engineering student</strong> with hands-on experience in C, Java, Python, Assembly, and SQL — backed by a strong foundation in algorithms, data structures, and system-level programming.",
    'about.p2': "My coursework spans <strong>Database Management Systems</strong>, OOP, Software-Intensive Systems Engineering, and full-stack development. I've also completed a comprehensive <strong>Quality Assurance</strong> course covering manual testing and test-case design.",
    'about.p3': 'I explore IoT systems, hybrid cloud infrastructure, and real-time data processing — and I bring a solution-oriented mindset to every project I touch.',
    'vibe.eyebrow': 'My approach',
    'vibe.title': 'I vibe. I code. I ship.',
    'vibe.lead': 'Vibecoding is building through intent — describing what you want in natural language and letting AI handle the translation to working software. I use the full AI stack to build apps and websites faster, ship more, and think bigger.',
    'vibe.tool1.desc': 'Primary AI partner for architecture, full-codebase edits, and shipping features end-to-end from the terminal.',
    'vibe.tool2.desc': 'Code generation and reasoning for complex algorithms, API integrations, and rapid prototyping.',
    'vibe.tool3.desc': 'Full-stack app builder — describe a product idea, get a deployable web app in minutes.',
    'vibe.tool4.desc': 'AI-powered IDE with whole-file context edits and inline completions that keep me in flow.',
    'vibe.tool5.desc': 'Component and UI generation — turn a prompt into a production-ready React interface instantly.',
    'vibe.tool6.desc': 'Multi-modal reasoning and research — cross-checking solutions and exploring new problem spaces.',
    'vibe.caption': '↑ That conversation produced the SMN project below. This website was built the same way.',
    'projects.eyebrow': 'Projects',
    'projects.title': "Things I've shipped",
    'proj1.title': 'Wine Data Analysis',
    'proj1.desc': 'Desktop app built with Java and JavaFX — MySQL backend, interactive data grid with search and live charts for wine quality analysis, with email reporting.',
    'proj2.title': 'Smart Fuel Station (SMN)',
    'proj2.desc': 'Full software engineering lifecycle — requirements elicitation, UML diagrams, SRS & SAD documents, and physical/logical architecture design for a multi-role fuel station system.',
    'proj3.title': 'FixPhone — Repair Shop System',
    'proj3.desc': 'Phone repair shop management: 15-table MySQL schema on local & Azure, plus a Python Tkinter dashboard covering customers, devices, service requests, warranties, and technicians.',
    'contact.eyebrow': 'Contact',
    'contact.title': "Let's build something",
    'contact.lead': 'Open to internships, collaborations, and interesting problems. Reach out any time.',
    'contact.email.label': 'Email',
    'contact.linkedin.label': 'LinkedIn',
    'contact.github.label': 'GitHub',
    'contact.whatsapp.label': 'WhatsApp',
    'contact.arrow': '→'
  },
  he: {
    'nav.home': 'דף הבית',
    'nav.about': 'אודות',
    'nav.vibecoding': 'ויבקודינג',
    'nav.projects': 'פרויקטים',
    'nav.contact': 'צור קשר',
    'nav.resume': 'קורות חיים',
    'intro.badge': 'פתוח להתמחויות ושיתופי פעולה',
    'intro.bio': 'סטודנט בשנה השלישית להנדסת תוכנה שבונה פתרונות לעולם האמיתי — עם קוד, סקרנות, וקצת קסם AI.',
    'intro.cta.resume': 'צפה בקורות חיים',
    'intro.cta.projects': 'ראה פרויקטים ↓',
    'about.eyebrow': 'אודותי',
    'about.title': 'האדם מאחורי הפרומפט',
    'about.p1': 'אני סטודנט בשנה השלישית להנדסת תוכנה עם ניסיון מעשי ב-C, Java, Python, Assembly ו-SQL — עם בסיס חזק באלגוריתמים, מבני נתונים ותכנות ברמת מערכת.',
    'about.p2': 'הקורסים שלי כוללים מערכות ניהול מסדי נתונים, תכנות מונחה עצמים, הנדסת מערכות תוכנה-אינטנסיביות ופיתוח Full-Stack. השלמתי גם קורס מקיף בבטחת איכות הכולל בדיקות ידניות ועיצוב מקרי בדיקה.',
    'about.p3': 'אני חוקר מערכות IoT, תשתית ענן היברידית ועיבוד נתונים בזמן אמת — ומביא גישה מוכוונת פתרונות לכל פרויקט שאני נוגע בו.',
    'vibe.eyebrow': 'הגישה שלי',
    'vibe.title': 'מרגיש. מקודד. שולח.',
    'vibe.lead': 'ויבקודינג הוא בנייה דרך כוונה — לתאר מה שרוצים בשפה טבעית ולתת ל-AI לטפל בתרגום לתוכנה עובדת. אני משתמש בסטאק ה-AI המלא כדי לבנות אפליקציות ואתרים מהר יותר, לשלוח יותר ולחשוב גדול יותר.',
    'vibe.tool1.desc': "שותף ה-AI הראשי לארכיטקטורה, עריכת קוד בסיס שלם ושליחת פיצ'רים מקצה לקצה מהטרמינל.",
    'vibe.tool2.desc': 'יצירת קוד ולוגיקה לאלגוריתמים מורכבים, אינטגרציות API ופרוטוטייפינג מהיר.',
    'vibe.tool3.desc': 'בונה אפליקציות Full-Stack — תאר רעיון מוצר, קבל אפליקציית ווב מוכנה לפריסה תוך דקות.',
    'vibe.tool4.desc': 'סביבת פיתוח מונעת AI עם עריכות בהקשר קובץ שלם והשלמות inline שמשמרות את הזרימה.',
    'vibe.tool5.desc': 'יצירת קומפוננטות ו-UI — הפוך פרומפט לממשק React מוכן לייצור תוך רגע.',
    'vibe.tool6.desc': 'לוגיקה מולטי-מודאלית ומחקר — בדיקה צולבת של פתרונות וחקירת מרחבי בעיות חדשים.',
    'vibe.caption': '↑ השיחה הזו הפיקה את פרויקט SMN למטה. האתר הזה נבנה באותה דרך.',
    'projects.eyebrow': 'פרויקטים',
    'projects.title': 'דברים ששלחתי',
    'proj1.title': 'ניתוח נתוני יין',
    'proj1.desc': 'אפליקציית שולחן עבודה עם Java ו-JavaFX — backend של MySQL, גריד נתונים אינטראקטיבי עם חיפוש וגרפים חיים לניתוח איכות יין, ודיווח בדוא"ל.',
    'proj2.title': 'תחנת דלק חכמה (SMN)',
    'proj2.desc': 'מחזור חיים הנדסתי מלא — אפיון דרישות, דיאגרמות UML, תיעוד SRS ו-SAD, ועיצוב ארכיטקטורה פיזית ולוגית למערכת ניהול תחנת דלק מרובת תפקידים.',
    'proj3.title': 'FixPhone — מערכת ניהול תיקונים',
    'proj3.desc': 'ניהול חנות תיקוני טלפונים: schema של 15 טבלאות ב-MySQL על local ו-Azure, בתוספת לוח מחוונים Python Tkinter ללקוחות, מכשירים, קריאות שירות, אחריות וטכנאים.',
    'contact.eyebrow': 'צור קשר',
    'contact.title': 'בואו נבנה משהו',
    'contact.lead': 'פתוח להתמחויות, שיתופי פעולה ובעיות מעניינות. צור קשר בכל עת.',
    'contact.email.label': 'אימייל',
    'contact.linkedin.label': 'לינקדאין',
    'contact.github.label': 'גיטהאב',
    'contact.whatsapp.label': 'וואטסאפ',
    'contact.arrow': '←'
  }
};

function setLang(lang) {
  var isHe = lang === 'he';
  currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = isHe ? 'rtl' : 'ltr';

  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    if (translations[lang][key] !== undefined) el.textContent = translations[lang][key];
  });
  document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
    var key = el.getAttribute('data-i18n-html');
    if (translations[lang][key] !== undefined) el.innerHTML = translations[lang][key];
  });

  var btn = document.getElementById('lang-toggle');
  if (btn) btn.textContent = isHe ? 'EN' : 'עב';

  try { localStorage.setItem('lang', lang); } catch(e) {}
}

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

/* ─── Portrait 3-D tracking + eye-pupil tracking ────────────────── */
(function () {
  var isMobile = ('ontouchstart' in window) || window.innerWidth < 768;

  /* The 3D transform now targets the WRAPPER so both the portrait
     and the eye dots inside it move together as one rigid unit. */
  var wrap = document.getElementById('portrait-interactive');
  var img  = document.getElementById('hero-portrait');
  if (!wrap || !img) return;

  var tx = 0, ty = 0, cx = 0, cy = 0;

  var PERSP  = 800;
  var TILT_Y = 20;
  var TILT_X = 12;
  var MOVE_X = isMobile ? 18 : 70;
  var MOVE_Y = isMobile ? 8  : 35;
  var LERP   = isMobile ? 0.04 : 0.08;

  /* ── Desktop mouse tracking ── */
  if (!isMobile) {
    window.addEventListener('mousemove', function (e) {
      tx = (e.clientX / window.innerWidth  - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  /* ── Mobile gyroscope tracking ── */
  window.addEventListener('deviceorientation', function (e) {
    if (e.gamma == null) return;
    tx = Math.max(-1, Math.min(1, e.gamma / 40));
    ty = Math.max(-1, Math.min(1, (e.beta - 45) / 40));
  }, { passive: true });

  /* ── Dynamic glow on the img (not the wrapper — avoids GPU layer clash) ── */
  var glowLive = false;
  if (!isMobile) setTimeout(function () { glowLive = true; }, 1000);

  function tick() {
    cx += (tx - cx) * LERP;
    cy += (ty - cy) * LERP;

    /* Apply 3D transform to the wrapper (portrait + eyes move as one) */
    wrap.style.transform =
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
  const el = document.getElementById('typewriter');
  if (!el) return;
  let pi = 0, ci = 0, deleting = false;
  const speed = { type: 80, delete: 40, pause: 1800 };

  function tick() {
    const phrases = typewriterPhrases[currentLang] || typewriterPhrases.en;
    const phrase = phrases[pi % phrases.length];
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

/* ─── Language toggle ──────────────────────────────────────────── */
document.getElementById('lang-toggle').addEventListener('click', function() {
  setLang(currentLang === 'en' ? 'he' : 'en');
});

/* Apply stored language preference on load */
if (currentLang === 'he') setLang('he');

/* ─── Projects carousel ────────────────────────────────────────── */
(function () {
  const track  = document.getElementById('proj-track');
  const wrap   = track && track.parentElement;
  const prev   = document.getElementById('proj-prev');
  const next   = document.getElementById('proj-next');
  const dotsEl = document.getElementById('proj-dots');
  if (!track || !prev || !next) return;

  const cards = Array.from(track.children);
  let current = 0;

  function visibleCount() {
    const w = wrap.offsetWidth;
    if (w < 600)  return 1;
    if (w < 960)  return 2;
    return 3;
  }

  function cardWidth() {
    return cards[0] ? cards[0].offsetWidth + 24 : 0; // 24 = gap (1.5rem)
  }

  function maxIndex() {
    return Math.max(0, cards.length - visibleCount());
  }

  function go(idx) {
    current = Math.max(0, Math.min(idx, maxIndex()));
    track.style.transform = `translateX(-${current * cardWidth()}px)`;
    prev.classList.toggle('disabled', current === 0);
    next.classList.toggle('disabled', current >= maxIndex());
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  // Build dots
  const dots = cards.map((_, i) => {
    const d = document.createElement('span');
    d.addEventListener('click', () => go(i));
    dotsEl.appendChild(d);
    return d;
  });

  prev.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));

  // Touch / swipe support
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  // Re-calc on resize
  window.addEventListener('resize', () => go(current));

  go(0);
})();
