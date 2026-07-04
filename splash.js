/* ─────────────────────────────────────────────────────────────────────────── *
 *  Cinematic Splash v2 — Saeed Khoury Portfolio                               *
 *  Name flies sharp from infinite distance → slams into screen →              *
 *  screen shatters → name freezes on cracked glass →                          *
 *  two halves blast open revealing the site.  Total: ~3.2 s                   *
 * ─────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  if (sessionStorage.getItem('sk-intro')) return;
  sessionStorage.setItem('sk-intro', '1');

  /* ── Constants ───────────────────────────────────────────────────────────── */
  var BG     = '#07070d';
  var ACCENT = '#7c3aed';
  var CYAN   = '#22d3ee';
  var W  = window.innerWidth;
  var H  = window.innerHeight;
  var CX = W / 2;
  var CY = H / 2;
  var FS = Math.min(W * 0.095, 88); /* font size px */

  document.body.style.overflow = 'hidden';

  /* ── CSS keyframes ───────────────────────────────────────────────────────── */
  var kfEl = document.createElement('style');
  kfEl.textContent = [
    /* Heavy camera shake with slight rotation */
    '@keyframes sk-shake{',
    '  0%   {transform:translate(0,0) rotate(0deg)}',
    '  8%   {transform:translate(-16px,9px) rotate(-0.6deg)}',
    '  18%  {transform:translate(14px,-12px) rotate(0.4deg)}',
    '  28%  {transform:translate(-12px,10px) rotate(-0.5deg)}',
    '  38%  {transform:translate(10px,-9px) rotate(0.3deg)}',
    '  48%  {transform:translate(-7px,7px) rotate(-0.2deg)}',
    '  58%  {transform:translate(5px,-5px) rotate(0.1deg)}',
    '  68%  {transform:translate(-3px,3px) rotate(0deg)}',
    '  80%  {transform:translate(2px,-2px) rotate(0deg)}',
    '  100% {transform:translate(0,0) rotate(0deg)}',
    '}',
    /* Searing white flash */
    '@keyframes sk-flash{',
    '  0%   {opacity:1}',
    '  25%  {opacity:0.95}',
    '  100% {opacity:0}',
    '}',
    /* Subtle pulse on frozen name */
    '@keyframes sk-pulse{',
    '  0%,100% {filter:drop-shadow(0 0 24px rgba(124,58,237,0.9)) drop-shadow(0 0 60px rgba(34,211,238,0.4))}',
    '  50%     {filter:drop-shadow(0 0 36px rgba(124,58,237,1))   drop-shadow(0 0 90px rgba(34,211,238,0.6))}',
    '}',
  ].join('\n');
  document.head.appendChild(kfEl);

  /* ── DOM ─────────────────────────────────────────────────────────────────── */
  var splash = document.createElement('div');
  splash.id = 'sk-splash';
  css(splash, {
    position: 'fixed', inset: '0', zIndex: '9999',
    background: BG, overflow: 'hidden',
  });

  /* Ambient glow — painted on canvas during fly-in */
  var cvs = document.createElement('canvas');
  cvs.width  = W;
  cvs.height = H;
  css(cvs, { position: 'absolute', inset: '0', zIndex: '1', pointerEvents: 'none' });
  splash.appendChild(cvs);
  var ctx = cvs.getContext('2d');

  /*
   * The name is a sharp DOM element during fly-in.
   * At impact it is drawn onto the canvas (so both split slabs inherit it)
   * and the DOM element is hidden.
   */
  var nameEl = document.createElement('div');
  nameEl.textContent = 'Saeed Khoury';
  css(nameEl, {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%,-50%) scale(0.003)',
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    fontWeight: '700',
    fontSize: FS + 'px',
    letterSpacing: '-0.03em',
    whiteSpace: 'nowrap',
    /* SHARP — no blur; glow grows via filter during approach */
    filter: 'drop-shadow(0 0 4px rgba(124,58,237,0.5))',
    background: 'linear-gradient(100deg,#fff 10%,#c084fc 32%,#22d3ee 50%,#c084fc 68%,#fff 90%)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    userSelect: 'none',
    pointerEvents: 'none',
    zIndex: '4',
    willChange: 'transform, filter',
  });
  splash.appendChild(nameEl);

  document.body.appendChild(splash);

  /* ── State ───────────────────────────────────────────────────────────────── */
  var mainRaf      = null;
  var particles    = [];
  var cracks       = [];
  var impactTime   = 0;
  var crackT0      = 0;
  var nameDrawn    = false;  /* true once name is painted on canvas */
  var CRACK_START  = 75;     /* ms after impact: cracks begin */
  var CRACK_DUR    = 370;    /* ms: crack drawing duration */
  var FREEZE_DUR   = 320;    /* ms: pause after cracks — name frozen on shattered glass */
  var SPLIT_OFFSET = CRACK_START + CRACK_DUR + FREEZE_DUR; /* ms to doSplit */

  /* ── PHASE 1: Fly-in ─────────────────────────────────────────────────────── */
  setTimeout(function () {
    var t0       = performance.now();
    var FLY_DUR  = 1250;
    var prevScale = 0.003;

    function flyFrame(now) {
      var t  = Math.min((now - t0) / FLY_DUR, 1);
      var e  = t * t * t * t * t;            /* quintic ease-in */
      var sc = 0.003 + e * 0.997;

      /* Drop-shadow grows instead of blur — name stays sharp */
      var glowPx  = Math.min(50, sc * 65);
      var glowAlp = Math.min(1, e * 2.5);
      nameEl.style.transform = 'translate(-50%,-50%) scale(' + sc.toFixed(5) + ')';
      nameEl.style.filter    =
        'drop-shadow(0 0 ' + glowPx.toFixed(0) + 'px rgba(124,58,237,' + glowAlp.toFixed(2) + '))' +
        ' drop-shadow(0 0 ' + (glowPx * 0.5).toFixed(0) + 'px rgba(34,211,238,' + (glowAlp * 0.4).toFixed(2) + '))';

      /* Ambient radial glow on canvas behind the name */
      ctx.clearRect(0, 0, W, H);
      if (e > 0.005) {
        var gR   = sc * Math.min(W, H) * 0.55;
        var gAlp = Math.min(0.65, e * 2);
        var grad = ctx.createRadialGradient(CX, CY, 0, CX, CY, gR);
        grad.addColorStop(0,   'rgba(124,58,237,' + (gAlp * 0.55).toFixed(2) + ')');
        grad.addColorStop(0.4, 'rgba(124,58,237,' + (gAlp * 0.2).toFixed(2)  + ')');
        grad.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }

      prevScale = sc;
      if (t < 1) {
        mainRaf = requestAnimationFrame(flyFrame);
      } else {
        impact();
      }
    }
    mainRaf = requestAnimationFrame(flyFrame);
  }, 80);

  /* ── PHASE 2: Impact ─────────────────────────────────────────────────────── */
  function impact() {
    impactTime = performance.now();

    hapticFeedback();

    /* Name freezes at full scale with intense glow */
    nameEl.style.transition = 'transform 0.08s ease-out, filter 0.06s ease-out';
    nameEl.style.transform  = 'translate(-50%,-50%) scale(1)';
    nameEl.style.filter     =
      'drop-shadow(0 0 32px rgba(124,58,237,1)) drop-shadow(0 0 80px rgba(34,211,238,0.5))';

    /* Full-screen white flash */
    var flash = document.createElement('div');
    css(flash, {
      position: 'absolute', inset: '0', zIndex: '20',
      background: '#ffffff',
      animation: 'sk-flash 0.30s ease-out forwards',
      pointerEvents: 'none',
    });
    splash.appendChild(flash);
    setTimeout(function () {
      if (flash.parentNode) flash.parentNode.removeChild(flash);
    }, 320);

    /* Heavy camera shake */
    splash.style.animation = 'sk-shake 0.60s ease-out';
    setTimeout(function () { splash.style.animation = ''; }, 640);

    /* Build crack geometry + particle list immediately */
    buildCracks();
    spawnParticles();
    crackT0 = impactTime + CRACK_START;

    /*
     * At 65ms: paint name to canvas (sharp text with gradient + glow),
     * then hide the DOM element.  From here the canvas owns the name image.
     */
    setTimeout(function () {
      paintNameToCanvas();
      nameEl.style.transition = 'opacity 0.04s';
      nameEl.style.opacity    = '0';
    }, 65);

    /* Single unified render loop: shockwave → name → cracks → particles */
    mainRaf = requestAnimationFrame(renderLoop);

    /* Freeze pause after cracks complete, then split */
    setTimeout(doSplit, SPLIT_OFFSET);
  }

  /* ── Haptic: vibrate (Android) + Web Audio thud (iOS + Android) ─────────── */
  function hapticFeedback() {
    /* Android vibrate — strong, deliberate pattern */
    if (navigator.vibrate) navigator.vibrate([80, 20, 110, 15, 55]);

    /*
     * Web Audio sub-bass thud (40-80 Hz).  Creates physical sensation through
     * speakers/haptics on both iOS and Android.  Requires prior user gesture —
     * works if visitor clicked a link to reach the page (normal navigation).
     */
    try {
      var ac   = new (window.AudioContext || window.webkitAudioContext)();
      var osc  = ac.createOscillator();
      var gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(75, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(28, ac.currentTime + 0.12);
      gain.gain.setValueAtTime(0.7, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.16);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.18);
    } catch (e) { /* silently ignored on blocked AudioContext */ }
  }

  /* ── Paint name text onto canvas (so both split slabs inherit it) ────────── */
  function paintNameToCanvas() {
    ctx.save();
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.font         = '700 ' + FS + 'px "Space Grotesk", system-ui, sans-serif';

    /* Outer purple glow — three passes */
    [
      {c: 'rgba(124,58,237,0.45)', b: 45},
      {c: 'rgba(124,58,237,0.25)', b: 22},
      {c: 'rgba(34,211,238,0.18)', b: 65},
    ].forEach(function (g) {
      ctx.shadowColor = g.c;
      ctx.shadowBlur  = g.b;
      ctx.fillStyle   = 'white';
      ctx.fillText('Saeed Khoury', CX, CY);
    });

    /* Sharp gradient text on top */
    ctx.shadowBlur = 0;
    var tw   = ctx.measureText('Saeed Khoury').width;
    var grad = ctx.createLinearGradient(CX - tw / 2, 0, CX + tw / 2, 0);
    grad.addColorStop(0,    '#ffffff');
    grad.addColorStop(0.12, '#e9e3ff');
    grad.addColorStop(0.35, '#c084fc');
    grad.addColorStop(0.52, '#22d3ee');
    grad.addColorStop(0.68, '#c084fc');
    grad.addColorStop(0.88, '#e9e3ff');
    grad.addColorStop(1,    '#ffffff');
    ctx.fillStyle = grad;
    ctx.fillText('Saeed Khoury', CX, CY);
    ctx.restore();
    nameDrawn = true;
  }

  /* ── Unified render loop ─────────────────────────────────────────────────── */
  function renderLoop(now) {
    var elapsed = now - impactTime;
    ctx.clearRect(0, 0, W, H);

    /* 1. Shockwave rings (0 → 520ms) */
    if (elapsed < 520) {
      var SDUR = 520;
      var st   = elapsed / SDUR;
      var maxR = Math.max(W, H) * 0.9;

      /* Primary violet ring */
      var r1  = st * maxR;
      var a1  = Math.pow(1 - st, 1.4) * 0.95;
      drawRing(CX, CY, r1, Math.max(0.5, 6 * (1 - st)), 'rgba(124,58,237,' + a1.toFixed(3) + ')');

      /* Secondary cyan ring — 60ms lag */
      var st2 = Math.max(0, (elapsed - 60) / SDUR);
      if (st2 > 0) {
        var r2 = st2 * maxR * 0.78;
        var a2 = Math.pow(1 - st, 1.8) * 0.55;
        drawRing(CX, CY, r2, 2, 'rgba(34,211,238,' + a2.toFixed(3) + ')');
      }

      /* Inner white ring — 120ms lag */
      var st3 = Math.max(0, (elapsed - 120) / SDUR);
      if (st3 > 0) {
        var r3 = st3 * maxR * 0.55;
        var a3 = Math.pow(1 - st, 3) * 0.4;
        drawRing(CX, CY, r3, 1, 'rgba(255,255,255,' + a3.toFixed(3) + ')');
      }
    }

    /* 2. Name (drawn once, then re-rendered every frame so clearRect doesn't erase it) */
    if (nameDrawn) {
      paintNameToCanvas();
    }

    /* 3. Cracks grow over the name */
    if (elapsed >= CRACK_START) {
      var cp  = Math.min(1, (now - crackT0) / CRACK_DUR);
      var cpE = 1 - Math.pow(1 - cp, 2.5); /* fast-start ease-out */
      cracks.forEach(function (c) { drawCrack(c, cpE); });
    }

    /* 4. Particles over everything */
    particles = particles.filter(function (p) { return p.a > 0.01; });
    particles.forEach(function (p) {
      p.x  += p.vx; p.y  += p.vy;
      p.vy += 0.17; p.vx *= 0.962;
      p.rot += p.rv; p.a -= 0.017;
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

  function drawRing(x, y, r, lw, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth   = lw;
    ctx.stroke();
  }

  /* ── Crack geometry ──────────────────────────────────────────────────────── */
  function buildCracks() {
    cracks = [];
    var j = function () { return (Math.random() - 0.5) * 18; };

    /* ── Main vertical split (the defining crack) ── */
    cracks.push(makeSeg([
      {x: CX + j(),     y: CY},
      {x: CX - 5 + j(), y: CY - H * 0.28},
      {x: CX + 3 + j(), y: CY - H * 0.55},
      {x: CX + j(),     y: 0},
    ], 4.5, 'rgba(245,240,255,1)', true));

    cracks.push(makeSeg([
      {x: CX + j(),     y: CY},
      {x: CX + 5 + j(), y: CY + H * 0.28},
      {x: CX - 3 + j(), y: CY + H * 0.56},
      {x: CX + j(),     y: H},
    ], 4.5, 'rgba(245,240,255,1)', true));

    /* ── Radial branches ── */
    [
      {a: -48,  l: 250}, {a: -110, l: 215}, {a: -32,  l: 175},
      {a: -158, l: 195}, {a:  55,  l: 248}, {a:  128, l: 208},
      {a:  42,  l: 160}, {a:  170, l: 188}, {a: -75,  l: 155},
      {a:  92,  l: 168}, {a: -130, l: 140}, {a:  18,  l: 145},
    ].forEach(function (arm) {
      var r   = arm.a * Math.PI / 180;
      var pts = [{x: CX, y: CY}];
      for (var s = 1; s <= 3; s++) {
        var f = s / 3;
        pts.push({
          x: CX + Math.cos(r) * arm.l * f + j(),
          y: CY + Math.sin(r) * arm.l * f + j(),
        });
      }
      cracks.push(makeSeg(pts, 2, 'rgba(200,188,255,0.85)'));

      var tipX = pts[pts.length - 1].x;
      var tipY = pts[pts.length - 1].y;

      /* First sub-branch */
      var r2 = r + (Math.random() - 0.5) * 1.1;
      var sl = arm.l * 0.44;
      cracks.push(makeSeg([
        {x: tipX, y: tipY},
        {x: tipX + Math.cos(r2) * sl * 0.5 + j(), y: tipY + Math.sin(r2) * sl * 0.5 + j()},
        {x: tipX + Math.cos(r2) * sl + j(),        y: tipY + Math.sin(r2) * sl + j()},
      ], 1.1, 'rgba(165,152,228,0.6)'));

      /* Second sub-branch (opposite lean) */
      var r3 = r - (Math.random() - 0.5) * 0.8;
      var sl2 = arm.l * 0.32;
      cracks.push(makeSeg([
        {x: tipX, y: tipY},
        {x: tipX + Math.cos(r3) * sl2 + j(), y: tipY + Math.sin(r3) * sl2 + j()},
      ], 0.85, 'rgba(140,128,205,0.45)'));
    });
  }

  function makeSeg(pts, width, color, isMain) {
    var len = 0;
    for (var i = 1; i < pts.length; i++) {
      var dx = pts[i].x - pts[i - 1].x;
      var dy = pts[i].y - pts[i - 1].y;
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return {pts: pts, width: width, color: color, totalLen: len, isMain: !!isMain};
  }

  function drawCrack(s, progress) {
    var drawLen  = s.totalLen * progress;
    var traveled = 0;

    if (s.isMain) {
      /* Inner glow pass for main cracks */
      ctx.save();
      ctx.strokeStyle = 'rgba(200,180,255,0.35)';
      ctx.lineWidth   = s.width + 5;
      ctx.lineCap     = 'round';
      ctx.shadowColor = 'rgba(160,130,255,0.5)';
      ctx.shadowBlur  = 12;
      drawPath(s.pts, drawLen);
      ctx.stroke();
      ctx.restore();
    }

    /* Actual crack line */
    ctx.save();
    ctx.strokeStyle = s.color;
    ctx.lineWidth   = s.width;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    if (s.isMain) {
      ctx.shadowColor = 'rgba(200,180,255,0.6)';
      ctx.shadowBlur  = 8;
    }
    drawPath(s.pts, drawLen);
    ctx.stroke();
    ctx.restore();
  }

  function drawPath(pts, maxLen) {
    var traveled = 0;
    ctx.beginPath();
    for (var i = 0; i < pts.length - 1; i++) {
      var a    = pts[i];
      var b    = pts[i + 1];
      var sLen = Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
      if (i === 0) ctx.moveTo(a.x, a.y);
      if (traveled >= maxLen) break;
      if (traveled + sLen <= maxLen) {
        ctx.lineTo(b.x, b.y);
      } else {
        var t = (maxLen - traveled) / sLen;
        ctx.lineTo(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
        break;
      }
      traveled += sLen;
    }
  }

  /* ── Particles ───────────────────────────────────────────────────────────── */
  function spawnParticles() {
    var cols = [ACCENT, CYAN, '#e9d5ff', '#ffffff', '#67e8f9', '#a78bfa'];
    for (var i = 0; i < 95; i++) {
      var ang  = Math.random() * Math.PI * 2;
      var spd  = 2.5 + Math.random() * 10;
      var big  = Math.random() > 0.65;
      var long = !big && Math.random() > 0.4;
      particles.push({
        x:   CX + (Math.random() - 0.5) * 90,
        y:   CY + (Math.random() - 0.5) * 90,
        vx:  Math.cos(ang) * spd,
        vy:  Math.sin(ang) * spd,
        w:   big  ? 3.5 + Math.random() * 6  : long ? 1.2 + Math.random() * 2 : 2.5 + Math.random() * 3.5,
        h:   big  ? 3.5 + Math.random() * 6  : long ? 7   + Math.random() * 16 : 2.5 + Math.random() * 3.5,
        c:   cols[Math.floor(Math.random() * cols.length)],
        a:   0.95,
        rot: Math.random() * Math.PI * 2,
        rv:  (Math.random() - 0.5) * 0.35,
      });
    }
  }

  /* ── PHASE 4: Screen split ───────────────────────────────────────────────── */
  function doSplit() {
    cancelAnimationFrame(mainRaf);

    /*
     * Render a clean final frame: name + fully drawn cracks, no particles,
     * no shockwave — this is the image frozen onto both split slabs.
     */
    ctx.clearRect(0, 0, W, H);
    paintNameToCanvas();
    cracks.forEach(function (c) { drawCrack(c, 1); });

    var snapshot = cvs.toDataURL();

    var leftSlab  = buildSlab(true,  snapshot);
    var rightSlab = buildSlab(false, snapshot);

    document.body.appendChild(leftSlab);
    document.body.appendChild(rightSlab);

    splash.style.visibility = 'hidden';

    /* Double rAF: guarantees initial transform is painted before transition */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        /*
         * Spring cubic-bezier: fast departure, slight overshoot, settle.
         * perspective() in the transform string applies to the element itself.
         */
        var spring = 'cubic-bezier(0.16, 1, 0.3, 1)';
        var ease   = 'transform 1.1s ' + spring;

        leftSlab.style.transition  = ease;
        rightSlab.style.transition = ease;

        leftSlab.style.transform  = 'perspective(900px) translateX(-115%) rotateY(14deg) rotateZ(-0.7deg)';
        rightSlab.style.transform = 'perspective(900px) translateX(115%)  rotateY(-14deg) rotateZ(0.7deg)';
      });
    });

    /* Cleanup after transition ends */
    setTimeout(function () {
      if (leftSlab.parentNode)  leftSlab.parentNode.removeChild(leftSlab);
      if (rightSlab.parentNode) rightSlab.parentNode.removeChild(rightSlab);
      if (splash.parentNode)    splash.parentNode.removeChild(splash);
      document.body.style.overflow = '';
    }, 1200);
  }

  /* ── Build one split slab ────────────────────────────────────────────────── */
  function buildSlab(isLeft, snapshotDataURL) {
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
    slab.style[isLeft ? 'left' : 'right'] = '0';
    slab.style.transformOrigin = isLeft ? 'left center' : 'right center';

    /*
     * Snapshot image is 100 vw wide drawn on a 200%-wide img.
     * Left  slab: img.left = 0    → shows left  half of snapshot.
     * Right slab: img.left = -100% (= -50vw) → shows right half.
     */
    var img = document.createElement('img');
    img.src = snapshotDataURL;
    css(img, {
      position: 'absolute', top: '0',
      width: '200%', height: '100%',
      pointerEvents: 'none',
    });
    img.style.left = isLeft ? '0' : '-100%';
    slab.appendChild(img);

    /* Dark gradient to BG — makes split feel like real depth */
    var grad = document.createElement('div');
    css(grad, {
      position: 'absolute', inset: '0',
      background: isLeft
        ? 'linear-gradient(to right,rgba(7,7,13,0) 85%,rgba(7,7,13,0.35) 100%)'
        : 'linear-gradient(to left, rgba(7,7,13,0) 85%,rgba(7,7,13,0.35) 100%)',
      pointerEvents: 'none',
    });
    slab.appendChild(grad);

    /* Glowing razor seam edge */
    var edge = document.createElement('div');
    css(edge, {
      position: 'absolute', top: '0', bottom: '0',
      width: '3px',
    });
    edge.style[isLeft ? 'right' : 'left'] = '0';
    edge.style.background = isLeft
      ? 'linear-gradient(to right,transparent,rgba(220,208,255,0.98))'
      : 'linear-gradient(to left, transparent,rgba(220,208,255,0.98))';
    edge.style.boxShadow = isLeft
      ? '1px 0 28px rgba(124,58,237,0.85), 3px 0 10px rgba(255,255,255,0.55)'
      : '-1px 0 28px rgba(124,58,237,0.85), -3px 0 10px rgba(255,255,255,0.55)';
    slab.appendChild(edge);

    return slab;
  }

  /* ── Generic style helper ────────────────────────────────────────────────── */
  function css(el, styles) {
    Object.keys(styles).forEach(function (k) { el.style[k] = styles[k]; });
  }

})();
