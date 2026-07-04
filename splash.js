/* ─────────────────────────────────────────────────────────────────────────── *
 *  Cinematic Splash — Saeed Khoury Portfolio                                  *
 *  "Saeed Khoury" fires from infinite distance, crashes into the screen,       *
 *  shatters it into two halves that slide apart, revealing the site.           *
 *  Total runtime: ~2.5 s.                                                      *
 * ─────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* Run once per browser session */
  if (sessionStorage.getItem('sk-intro')) return;
  sessionStorage.setItem('sk-intro', '1');

  /* ── Brand constants ──────────────────────────────────────────────────────── */
  var BG     = '#07070d';
  var ACCENT = '#7c3aed';
  var CYAN   = '#22d3ee';
  var W  = window.innerWidth;
  var H  = window.innerHeight;
  var CX = W / 2;
  var CY = H / 2;

  /* ── Prevent page scroll during animation ────────────────────────────────── */
  document.body.style.overflow = 'hidden';

  /* ── Inject keyframes ────────────────────────────────────────────────────── */
  var kfEl = document.createElement('style');
  kfEl.textContent = [
    '@keyframes sk-shake{',
    '  0%  {transform:translate(0,0)}',
    '  9%  {transform:translate(-9px,5px)}',
    '  20% {transform:translate(8px,-7px)}',
    '  31% {transform:translate(-7px,6px)}',
    '  42% {transform:translate(6px,-5px)}',
    '  53% {transform:translate(-4px,4px)}',
    '  64% {transform:translate(3px,-3px)}',
    '  75% {transform:translate(-2px,2px)}',
    '  86% {transform:translate(1px,-1px)}',
    '  100%{transform:translate(0,0)}',
    '}',
    '@keyframes sk-flash{',
    '  0%  {opacity:1}',
    '  45% {opacity:0.7}',
    '  100%{opacity:0}',
    '}',
  ].join('\n');
  document.head.appendChild(kfEl);

  /* ── Build full-screen overlay ───────────────────────────────────────────── */
  var splash = document.createElement('div');
  splash.id = 'sk-splash';
  css(splash, {
    position: 'fixed', inset: '0', zIndex: '9999',
    background: BG, overflow: 'hidden',
  });

  /* Ambient radial glow */
  var ambientGlow = document.createElement('div');
  css(ambientGlow, {
    position: 'absolute', inset: '0', opacity: '0',
    transition: 'opacity 0.65s ease',
    background: 'radial-gradient(ellipse 58% 40% at 50% 50%,' +
      'rgba(124,58,237,0.22) 0%,rgba(34,211,238,0.05) 50%,transparent 72%)',
    pointerEvents: 'none',
  });
  splash.appendChild(ambientGlow);

  /* Flying name element */
  var nameEl = document.createElement('div');
  nameEl.textContent = 'Saeed Khoury';
  css(nameEl, {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%,-50%) scale(0.006)',
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    fontWeight: '700',
    fontSize: Math.min(W * 0.095, 88) + 'px',
    letterSpacing: '-0.03em',
    whiteSpace: 'nowrap',
    opacity: '0',
    filter: 'blur(22px)',
    willChange: 'transform, filter, opacity',
    background: 'linear-gradient(100deg,#fff 15%,#c084fc 35%,#22d3ee 52%,#c084fc 68%,#fff 85%)',
    backgroundSize: '220% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    userSelect: 'none',
    pointerEvents: 'none',
  });
  splash.appendChild(nameEl);

  /* Single canvas for ALL post-impact drawing: shockwave + cracks + particles */
  var cvs = document.createElement('canvas');
  cvs.width  = W;
  cvs.height = H;
  css(cvs, {
    position: 'absolute', inset: '0',
    pointerEvents: 'none', zIndex: '2',
  });
  splash.appendChild(cvs);

  document.body.appendChild(splash);
  var ctx = cvs.getContext('2d');

  /* ── Animation state ─────────────────────────────────────────────────────── */
  var mainRaf    = null;
  var particles  = [];
  var cracks     = [];
  /* These are set at impact time */
  var impactTime = 0;
  var crackT0    = 0;
  var CRACK_DUR  = 280;   /* ms */
  var SHOCK_DUR  = 420;   /* ms */
  var CRACK_START= 90;    /* ms after impact: when cracks begin drawing */

  /* ── PHASE 1 — Fly-in (quintic ease-in, 1 380 ms) ───────────────────────── */
  setTimeout(function () {
    ambientGlow.style.opacity = '1';
    nameEl.style.opacity = '1';

    var t0        = performance.now();
    var FLY_DUR   = 1380;
    var prevScale = 0.006;

    function flyFrame(now) {
      var t = Math.min((now - t0) / FLY_DUR, 1);
      /* Quintic ease-in: almost stationary at first, explosive at end */
      var e     = t * t * t * t * t;
      var scale = 0.006 + e * 0.994;
      /* Velocity-proportional motion blur */
      var velBlur  = Math.min(10, (scale - prevScale) * 350);
      var baseBlur = Math.max(0, 20 * (1 - Math.min(1, e * 1.6)));
      prevScale = scale;

      nameEl.style.transform = 'translate(-50%,-50%) scale(' + scale.toFixed(5) + ')';
      nameEl.style.filter    = 'blur(' + (baseBlur + velBlur).toFixed(1) + 'px)';
      nameEl.style.opacity   = Math.min(1, e * 6).toFixed(3);

      if (t < 1) {
        mainRaf = requestAnimationFrame(flyFrame);
      } else {
        impact();
      }
    }
    mainRaf = requestAnimationFrame(flyFrame);
  }, 120);

  /* ── PHASE 2 — Impact ────────────────────────────────────────────────────── */
  function impact() {
    impactTime = performance.now();

    /* Haptic — Android vibrate; iOS doesn't support navigator.vibrate */
    if (navigator.vibrate) navigator.vibrate([12, 6, 24]);

    /* Snap text then fade out */
    nameEl.style.transition = 'opacity 0.05s, transform 0.12s ease-out';
    nameEl.style.opacity    = '0';
    nameEl.style.transform  = 'translate(-50%,-50%) scale(1.1)';

    /* White flash */
    var flash = document.createElement('div');
    css(flash, {
      position: 'absolute', inset: '0', zIndex: '10',
      background: 'rgba(255,255,255,0.92)',
      animation: 'sk-flash 0.24s ease-out forwards',
      pointerEvents: 'none',
    });
    splash.appendChild(flash);
    setTimeout(function () {
      if (flash.parentNode) flash.parentNode.removeChild(flash);
    }, 260);

    /* Camera shake */
    splash.style.animation = 'sk-shake 0.42s ease-out';
    setTimeout(function () { splash.style.animation = ''; }, 450);

    /* Build crack geometry and particle list right away */
    buildCracks();
    spawnParticles();
    crackT0 = impactTime + CRACK_START;

    /* Single unified render loop handles shockwave + cracks + particles */
    mainRaf = requestAnimationFrame(renderLoop);

    /* Trigger split once cracks are fully drawn */
    setTimeout(doSplit, CRACK_START + CRACK_DUR + 80);
  }

  /* ── Unified render loop ─────────────────────────────────────────────────── */
  function renderLoop(now) {
    ctx.clearRect(0, 0, W, H);
    var elapsed = now - impactTime;

    /* ── Shockwave rings (0 → SHOCK_DUR ms) ─── */
    if (elapsed < SHOCK_DUR) {
      var st = elapsed / SHOCK_DUR;
      var maxR = Math.max(W, H) * 0.7;

      /* Primary ring */
      var r1 = st * maxR;
      var a1 = (1 - st) * 0.75;
      drawRing(CX, CY, r1, Math.max(0.3, 4.5 * (1 - st)),
        'rgba(124,58,237,' + a1.toFixed(2) + ')');

      /* Secondary ring — slightly delayed */
      var st2 = Math.max(0, (elapsed - 45) / SHOCK_DUR);
      var r2  = st2 * maxR * 0.85;
      var a2  = (1 - st) * 0.4;
      if (a2 > 0 && r2 > 0)
        drawRing(CX, CY, r2, 1.5, 'rgba(34,211,238,' + a2.toFixed(2) + ')');
    }

    /* ── Cracks (start at CRACK_START ms after impact) ─── */
    if (elapsed >= CRACK_START) {
      var cp  = Math.min(1, (now - crackT0) / CRACK_DUR);
      var cpE = 1 - (1 - cp) * (1 - cp); /* ease-out */
      cracks.forEach(function (c) { drawCrack(c, cpE); });
    }

    /* ── Particles ─── */
    particles = particles.filter(function (p) { return p.a > 0.01; });
    particles.forEach(function (p) {
      p.x  += p.vx;  p.y  += p.vy;
      p.vy += 0.14;  p.vx *= 0.972;
      p.rot += p.rv; p.a  -= 0.02;
      ctx.save();
      ctx.globalAlpha = p.a;
      ctx.fillStyle   = p.c;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    mainRaf = requestAnimationFrame(renderLoop);
  }

  /* ── Ring helper ─────────────────────────────────────────────────────────── */
  function drawRing(x, y, r, lw, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth   = lw;
    ctx.stroke();
  }

  /* ── PHASE 3 — Crack generation ──────────────────────────────────────────── */
  function buildCracks() {
    cracks = [];
    var j = function () { return (Math.random() - 0.5) * 14; };

    /* Main crack — center → top */
    cracks.push(makeSeg([
      {x: CX + j(),   y: CY},
      {x: CX - 3 + j(), y: CY * 0.5},
      {x: CX + j(),   y: CY * 0.18},
      {x: CX + 2 + j(), y: 0},
    ], 3.2, 'rgba(228,224,255,0.97)'));

    /* Main crack — center → bottom */
    cracks.push(makeSeg([
      {x: CX + j(),   y: CY},
      {x: CX + 3 + j(), y: CY + H * 0.28},
      {x: CX + j(),   y: CY + H * 0.58},
      {x: CX + j(),   y: H},
    ], 3.2, 'rgba(228,224,255,0.97)'));

    /* Branch cracks radiating outward */
    [
      {a: -52,  l: 210}, {a: -115, l: 182}, {a: -35,  l: 148},
      {a:  57,  l: 202}, {a:  130, l: 175}, {a:  45,  l: 138},
      {a: -148, l: 155}, {a:  153, l: 162},
    ].forEach(function (arm) {
      var r  = arm.a * Math.PI / 180;
      var mx = CX + Math.cos(r) * arm.l * 0.5 + j();
      var my = CY + Math.sin(r) * arm.l * 0.5 + j();
      var ex = CX + Math.cos(r) * arm.l + j();
      var ey = CY + Math.sin(r) * arm.l + j();

      cracks.push(makeSeg(
        [{x: CX, y: CY}, {x: mx, y: my}, {x: ex, y: ey}],
        1.5, 'rgba(185,180,248,0.74)'
      ));

      /* Sub-branch off the arm tip */
      var r2 = r + (Math.random() - 0.5) * 0.9;
      var sl = arm.l * 0.38;
      cracks.push(makeSeg([
        {x: ex, y: ey},
        {x: ex + Math.cos(r2) * sl * 0.5 + j(), y: ey + Math.sin(r2) * sl * 0.5 + j()},
        {x: ex + Math.cos(r2) * sl + j(),        y: ey + Math.sin(r2) * sl + j()},
      ], 0.9, 'rgba(155,150,220,0.55)'));
    });
  }

  function makeSeg(pts, width, color) {
    var len = 0;
    for (var i = 1; i < pts.length; i++) {
      var dx = pts[i].x - pts[i - 1].x;
      var dy = pts[i].y - pts[i - 1].y;
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return {pts: pts, width: width, color: color, totalLen: len};
  }

  function drawCrack(s, progress) {
    var drawLen  = s.totalLen * progress;
    var traveled = 0;
    ctx.beginPath();
    ctx.strokeStyle = s.color;
    ctx.lineWidth   = s.width;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';

    for (var i = 0; i < s.pts.length - 1; i++) {
      var a    = s.pts[i];
      var b    = s.pts[i + 1];
      var sLen = Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));

      if (i === 0) ctx.moveTo(a.x, a.y);
      if (traveled >= drawLen) break;

      if (traveled + sLen <= drawLen) {
        ctx.lineTo(b.x, b.y);
      } else {
        var t = (drawLen - traveled) / sLen;
        ctx.lineTo(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
        break;
      }
      traveled += sLen;
    }
    ctx.stroke();
  }

  /* ── Particles ───────────────────────────────────────────────────────────── */
  function spawnParticles() {
    for (var i = 0; i < 65; i++) {
      var ang  = Math.random() * Math.PI * 2;
      var spd  = 1.8 + Math.random() * 6.5;
      var long = Math.random() > 0.5;
      particles.push({
        x:   CX + (Math.random() - 0.5) * 60,
        y:   CY + (Math.random() - 0.5) * 60,
        vx:  Math.cos(ang) * spd,
        vy:  Math.sin(ang) * spd,
        w:   long ? 1.2 + Math.random() * 1.8 : 2 + Math.random() * 3.5,
        h:   long ? 5   + Math.random() * 10  : 2 + Math.random() * 3.5,
        c:   Math.random() > 0.5 ? ACCENT : CYAN,
        a:   0.9,
        rot: Math.random() * Math.PI * 2,
        rv:  (Math.random() - 0.5) * 0.28,
      });
    }
  }

  /* ── PHASE 4 — Screen split ──────────────────────────────────────────────── */
  function doSplit() {
    cancelAnimationFrame(mainRaf);

    /* Snapshot crack state to image for the slab overlays */
    var crackImg = cvs.toDataURL();

    var leftSlab  = buildSlab(true,  crackImg);
    var rightSlab = buildSlab(false, crackImg);

    document.body.appendChild(leftSlab);
    document.body.appendChild(rightSlab);

    /* Hide splash (don't remove — avoids background flicker) */
    splash.style.visibility = 'hidden';

    /* Double rAF: ensures painted styles are committed before transition fires */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var spring = 'cubic-bezier(0.22, 1, 0.36, 1)';
        var easing = 'transform 0.98s ' + spring;

        leftSlab.style.transition  = easing;
        rightSlab.style.transition = easing;

        /* Slide apart with subtle 3-D perspective tilt.
           perspective() must be first in transform to apply to the element itself. */
        leftSlab.style.transform  = 'perspective(1200px) translateX(-105%) rotateY(8deg) rotateZ(-0.4deg)';
        rightSlab.style.transform = 'perspective(1200px) translateX(105%)  rotateY(-8deg) rotateZ(0.4deg)';
      });
    });

    /* Cleanup: remove all splash DOM, restore scroll */
    setTimeout(function () {
      if (leftSlab.parentNode)  leftSlab.parentNode.removeChild(leftSlab);
      if (rightSlab.parentNode) rightSlab.parentNode.removeChild(rightSlab);
      if (splash.parentNode)    splash.parentNode.removeChild(splash);
      document.body.style.overflow = '';
    }, 1120);
  }

  /* Build one half-slab ───────────────────────────────────────────────────── */
  function buildSlab(isLeft, crackDataURL) {
    var slab = document.createElement('div');
    css(slab, {
      position: 'fixed', top: '0',
      width: '50vw', height: '100vh',
      background: BG,
      zIndex: '9999',
      overflow: 'hidden',
      willChange: 'transform',
      pointerEvents: 'none',
    });
    /* Position: left slab on left, right slab on right */
    slab.style[isLeft ? 'left' : 'right'] = '0';
    slab.style.transformOrigin = isLeft ? 'left center' : 'right center';

    /*
     * Crack overlay — the canvas snapshot is full viewport width.
     * Left slab:  img.left = 0   → shows left  half
     * Right slab: img.left = -100% → offsets image left by 50vw, showing right half
     */
    var img = document.createElement('img');
    img.src = crackDataURL;
    css(img, {
      position: 'absolute', top: '0',
      width: '200%', height: '100%',
      opacity: '0.94',
      pointerEvents: 'none',
    });
    img.style.left = isLeft ? '0' : '-100%';
    slab.appendChild(img);

    /* Glowing razor edge at the cut seam */
    var edge = document.createElement('div');
    css(edge, {
      position: 'absolute', top: '0', bottom: '0',
      width: '4px',
    });
    edge.style[isLeft ? 'right' : 'left'] = '0';
    edge.style.background = isLeft
      ? 'linear-gradient(to right,transparent,rgba(228,220,255,0.95))'
      : 'linear-gradient(to left, transparent,rgba(228,220,255,0.95))';
    edge.style.boxShadow = isLeft
      ? '2px 0 18px rgba(124,58,237,0.65)'
      : '-2px 0 18px rgba(124,58,237,0.65)';
    slab.appendChild(edge);

    return slab;
  }

  /* ── Generic CSS helper ──────────────────────────────────────────────────── */
  function css(el, styles) {
    Object.keys(styles).forEach(function (k) { el.style[k] = styles[k]; });
  }

})();
