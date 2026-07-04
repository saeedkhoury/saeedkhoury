/* ─────────────────────────────────────────────────────────────────────────── *
 *  MARK v8 — SMPTE Crash Opening (1:1 with reference video + PNG)             *
 *                                                                               *
 *  SK monogram → 2× glitch pulses → SMPTE colour bars hard-cut →              *
 *  spiderweb cracks draw over bars → shake + haptic → glass falls.             *
 * ─────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── Stale cleanup ───────────────────────────────────────────────── */
  ['sk-splash','sk-cvs','sk-kf'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el && el.parentNode) el.parentNode.removeChild(el);
  });
  document.querySelectorAll('.sk-shard,.sk-fl').forEach(function (el) {
    if (el.parentNode) el.parentNode.removeChild(el);
  });

  if (sessionStorage.getItem('sk-intro')) return;
  sessionStorage.setItem('sk-intro', '1');

  /* ── Pre-warm AudioContext (iOS navigation gesture unlocks it) ───── */
  var AC = null;
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}

  document.body.style.overflow = 'hidden';

  var W  = window.innerWidth;
  var H  = window.innerHeight;
  var CX = W / 2;
  /* Crack impact point: slightly above vertical centre, matching the PNG */
  var IY = H * 0.48;

  /* ── Keyframes + styles ──────────────────────────────────────────── */
  var kf = document.createElement('style');
  kf.id  = 'sk-kf';
  kf.textContent = [
    /* Black overlay */
    '#sk-splash{position:fixed;inset:0;z-index:9998;background:#000;',
    'display:flex;align-items:center;justify-content:center}',

    /* SK monogram */
    '#sk-logo{',
    'font-family:"Space Grotesk",system-ui,sans-serif;font-weight:900;',
    'font-size:clamp(88px,22vw,200px);letter-spacing:-6px;',
    'color:#fff;user-select:none;',
    'opacity:0;transition:opacity .28s ease;will-change:filter,transform}',
    '#sk-logo.sk-in{opacity:1}',

    /* Glitch 1 — moderate skew + hue rotate */
    '@keyframes skG1{',
    '0%{transform:skewX(0) translateX(0);filter:none}',
    '20%{transform:skewX(-14deg) translateX(-6px) scale(1.06);filter:hue-rotate(160deg) brightness(2.5)}',
    '45%{transform:skewX(9deg) translateX(4px);filter:hue-rotate(300deg) brightness(1.5)}',
    '70%{transform:skewX(-4deg);filter:hue-rotate(60deg)}',
    '100%{transform:skewX(0);filter:none}}',
    '.skG1{animation:skG1 .17s ease-out forwards}',

    /* Glitch 2 — harder, chromatic split feel */
    '@keyframes skG2{',
    '0%{transform:skewX(0);filter:none}',
    '15%{transform:skewX(18deg) translateX(-10px) scale(0.96);filter:brightness(4) saturate(0) invert(1)}',
    '35%{transform:skewX(-12deg) translateX(8px);filter:hue-rotate(200deg) brightness(3)}',
    '65%{transform:skewX(6deg);filter:hue-rotate(120deg)}',
    '100%{transform:skewX(0);filter:none}}',
    '.skG2{animation:skG2 .14s ease-out forwards}',

    /* Canvas (SMPTE + cracks) */
    '#sk-cvs{position:fixed;inset:0;z-index:9999;pointer-events:none}',

    /* Camera shake — applied to the canvas element */
    '@keyframes skShk{',
    '0%{transform:translate(0,0)}',
    '12%{transform:translate(-11px,7px)}',
    '28%{transform:translate(10px,-9px)}',
    '44%{transform:translate(-8px,8px)}',
    '60%{transform:translate(7px,-6px)}',
    '75%{transform:translate(-4px,4px)}',
    '88%{transform:translate(3px,-2px)}',
    '100%{transform:translate(0,0)}}',

    /* White flash */
    '@keyframes skFl{0%{opacity:1}100%{opacity:0}}',
    '.sk-fl{position:fixed;inset:0;z-index:10001;background:#fff;',
    'animation:skFl .2s ease-out forwards;pointer-events:none}',

    /* Shards */
    '.sk-shard{position:fixed;z-index:10000;pointer-events:none;will-change:transform}',
  ].join('');
  document.head.appendChild(kf);

  /* ── Black overlay + SK logo ─────────────────────────────────────── */
  var splash = document.createElement('div');
  splash.id  = 'sk-splash';
  var logo   = document.createElement('div');
  logo.id    = 'sk-logo';
  logo.textContent = 'SK';
  splash.appendChild(logo);
  document.body.appendChild(splash);

  /* ── Canvas (drawn later, hidden until SMPTE phase) ─────────────── */
  var cvs = document.createElement('canvas');
  cvs.id  = 'sk-cvs';
  cvs.width = W; cvs.height = H;
  cvs.style.display = 'none';
  document.body.appendChild(cvs);
  var ctx = cvs.getContext('2d');

  /* ════════════════════════════════════════════════════════════════════
   *  PHASE 1 — SK appears (200 ms delay)
   * ════════════════════════════════════════════════════════════════════ */
  setTimeout(function () { logo.classList.add('sk-in'); }, 200);

  /* ════════════════════════════════════════════════════════════════════
   *  PHASE 2 — Glitch pulse 1  (t = 750 ms)
   * ════════════════════════════════════════════════════════════════════ */
  setTimeout(function () {
    logo.classList.add('skG1');
    setTimeout(function () { logo.classList.remove('skG1'); }, 180);
  }, 750);

  /* ════════════════════════════════════════════════════════════════════
   *  PHASE 2b — Glitch pulse 2, harder  (t = 1080 ms)
   * ════════════════════════════════════════════════════════════════════ */
  setTimeout(function () {
    logo.classList.add('skG2');
    setTimeout(function () { logo.classList.remove('skG2'); }, 150);
  }, 1080);

  /* ════════════════════════════════════════════════════════════════════
   *  PHASE 3 — SMPTE bars hard-cut  (t = 1380 ms)
   *  The overlay goes from black to full-colour in a single frame —
   *  exactly like a TV cutting to colour-bar test signal.
   * ════════════════════════════════════════════════════════════════════ */
  setTimeout(function () {
    drawSMPTE();                /* draw bars onto canvas */
    cvs.style.display = 'block';
    splash.style.display = 'none'; /* black overlay gone */

    /* ── PHASE 4 — Cracks draw progressively (250 ms) ── */
    var cracks = buildCracks();
    var drawn  = 0;
    var t0     = null;
    var DUR    = 250;

    requestAnimationFrame(function frame(ts) {
      if (!t0) t0 = ts;
      var p   = Math.min(1, (ts - t0) / DUR);
      /* fast burst at start (sqrt easing) so primary rays appear first */
      var tgt = Math.round(Math.pow(p, 0.38) * cracks.length);
      while (drawn < tgt) { drawCrack(cracks[drawn]); drawn++; }
      if (p < 1) { requestAnimationFrame(frame); }
      else       { setTimeout(doImpact, 380); } /* hold 380 ms then impact */
    });
  }, 1380);

  /* ════════════════════════════════════════════════════════════════════
   *  PHASE 5 — Impact: shake + flash + haptic + shard fall
   * ════════════════════════════════════════════════════════════════════ */
  function doImpact() {
    hapticFeedback();

    /* Camera shake on the canvas */
    cvs.style.animation = 'skShk 0.38s ease-out';
    setTimeout(function () { cvs.style.animation = ''; }, 400);

    /* White flash */
    var fl = document.createElement('div');
    fl.className = 'sk-fl';
    document.body.appendChild(fl);
    setTimeout(function () { if (fl.parentNode) fl.parentNode.removeChild(fl); }, 220);

    /* Snapshot + build shards */
    setTimeout(function () {
      var snap  = cvs.toDataURL();
      var halfH = Math.round(H / 2);
      var ease  = 'cubic-bezier(0.42,0,1,1)';

      var top = makeShard(snap, 0,     halfH,      0);
      var bot = makeShard(snap, halfH, H - halfH, -halfH);
      document.body.appendChild(top);
      document.body.appendChild(bot);
      cvs.style.display = 'none';

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          top.style.transition = 'transform 1.05s ' + ease;
          bot.style.transition = 'transform 1.05s ' + ease + ' 0.055s';
          top.style.transform  = 'translateY(-112%) rotate(-3.5deg)';
          bot.style.transform  = 'translateY(112%)  rotate(3.5deg)';

          /* Cleanup */
          setTimeout(function () {
            ['sk-cvs','sk-splash','sk-kf'].forEach(function (id) {
              var el = document.getElementById(id);
              if (el && el.parentNode) el.parentNode.removeChild(el);
            });
            document.querySelectorAll('.sk-shard,.sk-fl').forEach(function (el) {
              if (el.parentNode) el.parentNode.removeChild(el);
            });
            document.body.style.overflow = '';
          }, 1200);
        });
      });
    }, 70);
  }

  /* ════════════════════════════════════════════════════════════════════
   *  SMPTE colour bars — exact EIA-189-A broadcast test signal
   *
   *  Top 75 %: 7 equal columns, left→right:
   *    White | Yellow | Cyan | Green | Magenta | Red | Blue
   *  Bottom 25 %: classic SMPTE lower band
   * ════════════════════════════════════════════════════════════════════ */
  function drawSMPTE() {
    var topH = Math.round(H * 0.75);
    var botH = H - topH;
    var bw   = W / 7;

    /* Main bars */
    var bars = ['#ffffff','#ffff00','#00ffff','#00ff00','#ff00ff','#ff0000','#0000ff'];
    bars.forEach(function (c, i) {
      ctx.fillStyle = c;
      ctx.fillRect(Math.round(i * bw), 0, Math.ceil(bw) + 1, topH);
    });

    /* Bottom band: -I | White | +Q | Black pluge | 3-step pluge */
    var band = [
      { c:'#000075', f:1/7 },
      { c:'#ffffff', f:1/7 },
      { c:'#220099', f:1/7 },
      { c:'#000000', f:2/7 },
      { c:'#0d0d0d', f:1/14 },
      { c:'#000000', f:1/14 },
      { c:'#1a1a1a', f:1/14 },
    ];
    var bx = 0;
    band.forEach(function (b) {
      var w = Math.round(W * b.f);
      ctx.fillStyle = b.c;
      ctx.fillRect(bx, topH, w, botH);
      bx += w;
    });
    /* Fill remainder */
    ctx.fillStyle = '#000000';
    ctx.fillRect(bx, topH, W - bx, botH);
  }

  /* ════════════════════════════════════════════════════════════════════
   *  Crack geometry — seeded spiderweb from impact point
   * ════════════════════════════════════════════════════════════════════ */
  function buildCracks() {
    var rng    = seededRng(37);
    var lines  = [];
    var N      = 16; /* primary rays */
    var maxDim = Math.max(W, H);

    for (var i = 0; i < N; i++) {
      var angle = (i / N) * Math.PI * 2 + (rng() - 0.5) * 0.5;
      var len   = (0.42 + rng() * 0.65) * maxDim;
      var pts   = jag(CX, IY, angle, len, rng, 7 + Math.floor(rng() * 5));
      lines.push({ pts: pts, primary: true });

      /* 2–4 secondary branches */
      var nb = 2 + Math.floor(rng() * 3);
      for (var b = 0; b < nb; b++) {
        var bi  = 1 + Math.floor(rng() * Math.max(1, pts.length - 2));
        var bp  = pts[bi];
        var ba  = angle + (rng() - 0.5) * 2.0;
        var bl  = len * (0.18 + rng() * 0.42);
        lines.push({ pts: jag(bp.x, bp.y, ba, bl, rng, 3 + Math.floor(rng() * 3)), primary: false });
      }
    }

    /* Primaries first so they render under secondaries */
    lines.sort(function (a, b) { return b.primary - a.primary; });
    return lines;
  }

  function jag(sx, sy, angle, length, rng, steps) {
    var pts = [{ x: sx, y: sy }];
    var x = sx, y = sy;
    for (var i = 0; i < steps; i++) {
      angle += (rng() - 0.5) * 0.38;
      x     += Math.cos(angle) * (length / steps);
      y     += Math.sin(angle) * (length / steps);
      pts.push({ x: x, y: y });
    }
    return pts;
  }

  function seededRng(seed) {
    var s = seed >>> 0;
    return function () {
      s  = Math.imul(s, 1664525) + 1013904223 >>> 0;
      return s / 0x100000000;
    };
  }

  function drawCrack(line) {
    var pts = line.pts;
    if (pts.length < 2) return;
    var lw  = line.primary ? 1.8 : 1.1;

    /* Purple/white glow halo along the crack */
    ctx.save();
    ctx.lineWidth   = lw + 6;
    ctx.lineJoin    = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = line.primary ? 'rgba(220,200,255,0.45)' : 'rgba(180,160,255,0.28)';
    ctx.shadowColor = 'rgba(140,80,255,0.70)';
    ctx.shadowBlur  = line.primary ? 18 : 10;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.restore();

    /* Bright white fracture line on top */
    ctx.save();
    ctx.lineWidth   = lw;
    ctx.lineJoin    = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,0.94)';
    ctx.shadowColor = 'rgba(255,255,255,0.60)';
    ctx.shadowBlur  = 3;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (var j = 1; j < pts.length; j++) ctx.lineTo(pts[j].x, pts[j].y);
    ctx.stroke();
    ctx.restore();
  }

  /* ── Glass shard helper ──────────────────────────────────────────── */
  function makeShard(url, topPx, hPx, bgY) {
    var el = document.createElement('div');
    el.className = 'sk-shard';
    el.style.cssText = [
      'top:'    + topPx + 'px',
      'left:0', 'right:0',
      'height:' + hPx   + 'px',
      'background:url(' + url + ') no-repeat',
      'background-size:' + W + 'px ' + H + 'px',
      'background-position:0 ' + bgY + 'px',
    ].join(';');
    return el;
  }

  /* ── Haptic ──────────────────────────────────────────────────────── */
  function hapticFeedback() {
    if (navigator.vibrate) navigator.vibrate([0, 0, 80, 30, 120, 20, 60]);
    if (!AC) return;
    try {
      (AC.state === 'suspended' ? AC.resume() : Promise.resolve()).then(function () {
        osc('sine',     58,  22, 0.88, 0,    0.14);
        osc('sine',     88,  36, 0.52, 0,    0.10);
        osc('triangle', 175, 55, 0.30, 0,    0.06);
        osc('sine',     52,  18, 0.68, 0.04, 0.12);
      });
    } catch (e) {}
  }
  function osc(type, f0, f1, gain, delay, dur) {
    try {
      var o = AC.createOscillator(), g = AC.createGain();
      o.connect(g); g.connect(AC.destination); o.type = type;
      var t = AC.currentTime + delay;
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(gain, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.start(t); o.stop(t + dur + 0.01);
    } catch (e) {}
  }

})();
