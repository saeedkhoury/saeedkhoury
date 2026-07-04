/* ─────────────────────────────────────────────────────────────────────────── *
 *  MARK v7 — Two-act cinematic opening                                         *
 *                                                                               *
 *  ACT 1 — Nike opening: name appears small on pure black, confident hold.     *
 *  ACT 2 — Crash: name flies at screen, impact, spiderweb cracks with          *
 *           colorful fracture-light (like the MOV reference), glass falls.     *
 * ─────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── Stale DOM cleanup ───────────────────────────────────────────── */
  ['sk-splash','sk-crash','sk-kf'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el && el.parentNode) el.parentNode.removeChild(el);
  });
  document.querySelectorAll('.sk-shard').forEach(function (el) {
    if (el.parentNode) el.parentNode.removeChild(el);
  });

  if (sessionStorage.getItem('sk-intro')) return;
  sessionStorage.setItem('sk-intro', '1');

  /* ── Pre-warm AudioContext for iOS ───────────────────────────────── */
  var AC = null;
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}

  document.body.style.overflow = 'hidden';

  var W  = window.innerWidth;
  var H  = window.innerHeight;
  var CX = W / 2;
  var CY = H / 2;

  /* ── Inject keyframes ────────────────────────────────────────────── */
  var kf = document.createElement('style');
  kf.id  = 'sk-kf';
  kf.textContent = [
    /* ACT-1 overlay and mark */
    '#sk-splash{position:fixed;inset:0;z-index:9998;background:#000;',
    '  display:flex;flex-direction:column;align-items:center;justify-content:center}',
    '#sk-mark{font-family:"Space Grotesk",system-ui,sans-serif;font-weight:700;',
    '  font-size:clamp(24px,5.5vw,52px);letter-spacing:-0.02em;color:#fff;',
    '  white-space:nowrap;opacity:0;transform:translateY(6px) scale(1);',
    '  transition:opacity .6s cubic-bezier(.16,1,.3,1),',
    '  transform .6s cubic-bezier(.16,1,.3,1);user-select:none;will-change:transform,opacity}',
    '#sk-mark.sk-in{opacity:1;transform:translateY(0) scale(1)}',
    '#sk-rule{width:0;height:1px;background:rgba(255,255,255,.25);margin-top:14px;',
    '  transition:width .5s cubic-bezier(.22,1,.36,1) .35s}',
    '#sk-rule.sk-in{width:clamp(60px,12vw,110px)}',

    /* ACT-2 crash canvas */
    '#sk-crash{position:fixed;inset:0;z-index:9999;pointer-events:none}',

    /* Camera shake on impact */
    '@keyframes sk-shake{',
    '0%{transform:translate(0,0)}',
    '10%{transform:translate(-9px,5px)}',
    '25%{transform:translate(8px,-7px)}',
    '40%{transform:translate(-6px,6px)}',
    '55%{transform:translate(5px,-4px)}',
    '70%{transform:translate(-3px,3px)}',
    '85%{transform:translate(2px,-2px)}',
    '100%{transform:translate(0,0)}}',

    /* Flash */
    '@keyframes sk-flash{0%{opacity:.9}100%{opacity:0}}',
    '.sk-flash-el{position:fixed;inset:0;z-index:10001;background:#fff;',
    '  animation:sk-flash .18s ease-out forwards;pointer-events:none}',

    /* Glass shard falling */
    '.sk-shard{position:fixed;z-index:10000;will-change:transform;pointer-events:none}',
  ].join('');
  document.head.appendChild(kf);

  /* ════════════════════════════════════════════════════════════════════
   *  ACT 1 — Nike opening
   * ════════════════════════════════════════════════════════════════════ */
  var splash = document.createElement('div'); splash.id = 'sk-splash';
  var mark   = document.createElement('div'); mark.id   = 'sk-mark';
  mark.textContent = 'Saeed Khoury';
  var rule   = document.createElement('div'); rule.id   = 'sk-rule';
  splash.appendChild(mark); splash.appendChild(rule);
  document.body.appendChild(splash);

  /* Appear */
  setTimeout(function () {
    mark.classList.add('sk-in');
    rule.classList.add('sk-in');
  }, 180);

  /* After hold: launch → crash */
  var HOLD_END = 180 + 600 + 1050; /* ~1830 ms */
  setTimeout(launchAndCrash, HOLD_END);

  /* ════════════════════════════════════════════════════════════════════
   *  ACT 2 — Name launches at screen, cracks form, glass falls
   * ════════════════════════════════════════════════════════════════════ */
  function launchAndCrash() {
    /* ── 1. Rocket the mark toward camera (quintic ease-in) ── */
    mark.style.transition = 'transform 0.52s cubic-bezier(0.9,0,1,1), opacity 0.1s ease 0.44s';
    mark.style.transform  = 'translateY(0) scale(22)';
    mark.style.opacity    = '0';
    rule.style.transition = 'opacity 0.1s ease 0.44s';
    rule.style.opacity    = '0';

    /* ── 2. Impact at end of approach ── */
    setTimeout(function impact() {
      hapticFeedback();

      /* Camera shake on the overlay */
      splash.style.animation = 'sk-shake 0.36s ease-out';
      setTimeout(function () { splash.style.animation = ''; }, 380);

      /* White flash */
      var fl = document.createElement('div');
      fl.className = 'sk-flash-el';
      document.body.appendChild(fl);
      setTimeout(function () { if (fl.parentNode) fl.parentNode.removeChild(fl); }, 220);

      /* Hide ACT-1 overlay */
      splash.style.visibility = 'hidden';

      /* ── 3. Build and draw crack canvas ── */
      var cvs = document.createElement('canvas');
      cvs.id = 'sk-crash';
      cvs.width = W; cvs.height = H;
      document.body.appendChild(cvs);
      var ctx = cvs.getContext('2d');

      /* Draw the "behind the glass" scene:
         Colorful vertical light beams — references the color-bar effect
         visible in the MOV (TV-test-bar aesthetic). Using the site's
         purple/cyan/white palette instead of broadcast primaries. */
      drawBackdrop(ctx);

      /* Draw crack lines progressively over 280ms */
      var crackLines = buildCracks(CX, CY, W, H);
      var totalLines = crackLines.length;
      var drawn      = 0;
      var DRAW_MS    = 280;
      var startT     = null;

      function drawFrame(ts) {
        if (!startT) startT = ts;
        var pct    = Math.min(1, (ts - startT) / DRAW_MS);
        /* ease-in so first cracks burst fast then secondary ones fill in */
        var target = Math.round(Math.pow(pct, 0.5) * totalLines);

        while (drawn < target && drawn < totalLines) {
          drawCrackLine(ctx, crackLines[drawn]);
          drawn++;
        }

        if (pct < 1) {
          requestAnimationFrame(drawFrame);
        } else {
          /* ── 4. Hold cracked frame, then fall ── */
          setTimeout(function () { shatterFall(ctx, cvs); }, 380);
        }
      }
      requestAnimationFrame(drawFrame);

    }, 500); /* impact fires 500ms after launch starts */
  }

  /* ════════════════════════════════════════════════════════════════════
   *  Backdrop — colorful light behind the glass
   * ════════════════════════════════════════════════════════════════════ */
  function drawBackdrop(ctx) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    /* Vertical colour bars — site palette, like MOV's TV-bar aesthetic */
    var bars = [
      'rgba(124,58,237,0.85)',  /* purple */
      'rgba(34,211,238,0.75)',  /* cyan   */
      'rgba(200,160,255,0.80)', /* lilac  */
      'rgba(255,255,255,0.70)', /* white  */
      'rgba(56,189,248,0.75)',  /* sky    */
      'rgba(167,139,250,0.80)', /* violet */
      'rgba(34,211,238,0.70)',  /* cyan   */
      'rgba(124,58,237,0.85)',  /* purple */
    ];
    var bw = W / bars.length;
    bars.forEach(function (color, i) {
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0,   color);
      g.addColorStop(0.6, color);
      g.addColorStop(1,   'rgba(0,0,0,0.4)');
      ctx.fillStyle = g;
      ctx.fillRect(i * bw, 0, bw + 1, H);
    });

    /* Bright burst at the impact point (centre) */
    var burst = ctx.createRadialGradient(CX, CY, 0, CX, CY, Math.min(W,H) * 0.55);
    burst.addColorStop(0,    'rgba(255,255,255,0.95)');
    burst.addColorStop(0.08, 'rgba(255,255,255,0.70)');
    burst.addColorStop(0.25, 'rgba(200,160,255,0.40)');
    burst.addColorStop(0.60, 'rgba(124,58,237,0.15)');
    burst.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.fillStyle = burst;
    ctx.fillRect(0, 0, W, H);
  }

  /* ════════════════════════════════════════════════════════════════════
   *  Crack geometry — spiderweb from centre
   * ════════════════════════════════════════════════════════════════════ */
  function buildCracks(ox, oy, W, H) {
    var lines   = [];
    var PRIMARY = 14;
    var rng     = seededRng(42); /* deterministic so it looks consistent */

    for (var i = 0; i < PRIMARY; i++) {
      var angle  = (i / PRIMARY) * Math.PI * 2 + (rng() - 0.5) * 0.45;
      var maxLen = (0.45 + rng() * 0.6) * Math.max(W, H);
      var pts    = jagged(ox, oy, angle, maxLen, rng);
      lines.push({ pts: pts, primary: true });

      /* 2-4 secondary branches off each primary */
      var branches = 2 + Math.floor(rng() * 3);
      for (var b = 0; b < branches; b++) {
        var bi  = Math.floor(rng() * (pts.length - 1)) + 1;
        var bp  = pts[bi];
        var ba  = angle + (rng() - 0.5) * 1.8;
        var bLen = (0.2 + rng() * 0.45) * maxLen;
        lines.push({ pts: jagged(bp.x, bp.y, ba, bLen, rng), primary: false });
      }
    }

    /* Sort: primaries first, then secondaries */
    lines.sort(function (a, b) { return b.primary - a.primary; });
    return lines;
  }

  function jagged(sx, sy, angle, length, rng) {
    var pts   = [{ x: sx, y: sy }];
    var steps = 6 + Math.floor(rng() * 5);
    var x = sx, y = sy;
    for (var i = 0; i < steps; i++) {
      angle  += (rng() - 0.5) * 0.35;
      x      += Math.cos(angle) * (length / steps);
      y      += Math.sin(angle) * (length / steps);
      pts.push({ x: x, y: y });
    }
    return pts;
  }

  /* Seeded LCG so cracks look the same every run (not random each load) */
  function seededRng(seed) {
    var s = seed;
    return function () {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 0xffffffff;
    };
  }

  function drawCrackLine(ctx, line) {
    var pts = line.pts;
    if (pts.length < 2) return;
    var w   = line.primary ? 1.5 : 1;

    /* Coloured glow along the crack — the "light bleeding through" effect */
    ctx.save();
    ctx.strokeStyle = line.primary
      ? 'rgba(200,160,255,0.55)'
      : 'rgba(124,58,237,0.35)';
    ctx.lineWidth   = w + 5;
    ctx.lineJoin    = 'round';
    ctx.lineCap     = 'round';
    ctx.shadowColor = 'rgba(124,58,237,0.7)';
    ctx.shadowBlur  = line.primary ? 14 : 8;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.restore();

    /* Bright white crack edge (the actual glass fracture line) */
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth   = w;
    ctx.lineJoin    = 'round';
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (var j = 1; j < pts.length; j++) ctx.lineTo(pts[j].x, pts[j].y);
    ctx.stroke();
    ctx.restore();
  }

  /* ════════════════════════════════════════════════════════════════════
   *  Glass fall — snapshot canvas → 2 shards slide off screen
   * ════════════════════════════════════════════════════════════════════ */
  function shatterFall(ctx, cvs) {
    /* Clean snapshot of the fully-cracked canvas for the shards */
    var snap    = cvs.toDataURL();
    var halfH   = Math.round(H / 2);
    var gravity = 'cubic-bezier(0.42,0,1,1)';

    /* Top shard — covers 0→halfH, bg-position 0 so shows top half of snap */
    var top = makeShard(snap, 0,     halfH,      0);
    /* Bottom shard — covers halfH→H, bg-position -halfH shows bottom half */
    var bot = makeShard(snap, halfH, H - halfH, -halfH);

    document.body.appendChild(top);
    document.body.appendChild(bot);
    cvs.style.display = 'none';

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        top.style.transition = 'transform 1s ' + gravity;
        bot.style.transition = 'transform 1s ' + gravity + ' 0.05s';
        top.style.transform  = 'translateY(-110%) rotate(-4deg)';
        bot.style.transform  = 'translateY(110%)  rotate(4deg)';

        /* Cleanup */
        setTimeout(function () {
          ['sk-crash','sk-kf','sk-splash'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el && el.parentNode) el.parentNode.removeChild(el);
          });
          document.querySelectorAll('.sk-shard,.sk-flash-el').forEach(function (el) {
            if (el.parentNode) el.parentNode.removeChild(el);
          });
          document.body.style.overflow = '';
        }, 1150);
      });
    });
  }

  function makeShard(dataURL, topPx, heightPx, bgYpx) {
    var el = document.createElement('div');
    el.className = 'sk-shard';
    el.style.cssText = [
      'top:'    + topPx    + 'px',
      'left:0', 'right:0',
      'height:' + heightPx + 'px',
      'background-image:url(' + dataURL + ')',
      'background-size:'   + W + 'px ' + H + 'px',
      'background-position:0 ' + bgYpx + 'px',
      'background-repeat:no-repeat',
    ].join(';');
    return el;
  }

  /* ── Haptic ──────────────────────────────────────────────────────── */
  function hapticFeedback() {
    if (navigator.vibrate) navigator.vibrate([0, 0, 80, 30, 120, 20, 60]);
    if (!AC) return;
    try {
      (AC.state === 'suspended' ? AC.resume() : Promise.resolve()).then(function () {
        fireOsc('sine',     58,  24, 0.88, 0,    0.14);
        fireOsc('sine',     88,  38, 0.52, 0,    0.10);
        fireOsc('triangle', 175, 55, 0.32, 0,    0.06);
        fireOsc('sine',     52,  20, 0.68, 0.04, 0.12);
      });
    } catch (e) {}
  }

  function fireOsc(type, f0, f1, gain, delay, dur) {
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
