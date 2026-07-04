/* ─────────────────────────────────────────────────────────────────────────── *
 *  MARK v9 — Glitch → SMPTE → Crack → Explosion                              *
 *                                                                               *
 *  Phase 1 : Magenta/green digital corruption animation (900 ms)              *
 *  Phase 2 : SMPTE colour bars hard-cut (single frame)                        *
 *  Phase 3 : Spiderweb cracks draw + concentric rings + impact star           *
 *  Phase 4 : Shake → flash → haptic → 4-quadrant glass explosion              *
 * ─────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── Stale DOM cleanup (runs before session-guard check) ────── */
  ['sk-splash','sk-logo','sk-cvs','sk-kf'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el && el.parentNode) el.parentNode.removeChild(el);
  });
  document.querySelectorAll('.sk-shard,.sk-fl').forEach(function (el) {
    if (el.parentNode) el.parentNode.removeChild(el);
  });

  if (sessionStorage.getItem('sk-intro')) return;
  sessionStorage.setItem('sk-intro', '1');

  /* ── Pre-warm AudioContext (iOS navigation gesture unlocks it) ── */
  var AC = null;
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}

  document.body.style.overflow = 'hidden';

  var W  = window.innerWidth;
  var H  = window.innerHeight;
  var CX = W / 2;
  var IY = H * 0.47; /* crack impact point, slightly above centre */

  /* ── CSS injection ──────────────────────────────────────────── */
  var kf = document.createElement('style');
  kf.id  = 'sk-kf';
  kf.textContent = [
    /* Black background overlay */
    '#sk-splash{position:fixed;inset:0;z-index:9998;background:#000;pointer-events:none}',

    /* SK monogram — sits ABOVE the canvas so glitch plays behind it */
    '#sk-logo{',
      'position:fixed;top:50%;left:50%;',
      'transform:translate(-50%,-50%);',
      'z-index:10002;',
      'font-family:"Space Grotesk",system-ui,sans-serif;font-weight:900;',
      'font-size:clamp(88px,22vw,200px);letter-spacing:-6px;',
      'color:#fff;user-select:none;pointer-events:none;',
      'opacity:0;transition:opacity .28s ease}',
    '#sk-logo.sk-in{opacity:1}',

    /* Glitch + SMPTE + cracks canvas */
    '#sk-cvs{position:fixed;inset:0;z-index:9999;pointer-events:none}',

    /* Camera shake */
    '@keyframes skShk{',
      '0%{transform:translate(0,0)}',
      '12%{transform:translate(-12px,8px)}',
      '28%{transform:translate(11px,-10px)}',
      '44%{transform:translate(-9px,9px)}',
      '60%{transform:translate(8px,-7px)}',
      '75%{transform:translate(-5px,4px)}',
      '88%{transform:translate(3px,-2px)}',
      '100%{transform:translate(0,0)}}',

    /* White flash */
    '@keyframes skFl{0%{opacity:1}100%{opacity:0}}',
    '.sk-fl{position:fixed;inset:0;z-index:10001;background:#fff;',
      'animation:skFl .22s ease-out forwards;pointer-events:none}',

    /* Shard base (positioning set inline) */
    '.sk-shard{pointer-events:none;will-change:transform}',
  ].join('');
  document.head.appendChild(kf);

  /* ── Black background overlay ───────────────────────────────── */
  var splash = document.createElement('div');
  splash.id  = 'sk-splash';
  document.body.appendChild(splash);

  /* ── SK logo (z-index above canvas) ─────────────────────────── */
  var logo = document.createElement('div');
  logo.id  = 'sk-logo';
  logo.textContent = 'SK';
  document.body.appendChild(logo);

  /* ── Canvas ──────────────────────────────────────────────────── */
  var cvs = document.createElement('canvas');
  cvs.id  = 'sk-cvs';
  cvs.width = W; cvs.height = H;
  document.body.appendChild(cvs);
  var ctx = cvs.getContext('2d');

  /* ════════════════════════════════════════════════════════════════
   *  PHASE 1 — SK appears
   * ════════════════════════════════════════════════════════════════ */
  setTimeout(function () { logo.classList.add('sk-in'); }, 150);

  /* ════════════════════════════════════════════════════════════════
   *  PHASE 2 — Digital glitch animation (900 ms)
   *
   *  Magenta (#e91e8c) and green (#00ff50) horizontal bands flicker
   *  rapidly. Scattered garbled site-text fragments overlay on top.
   *  CRT scanlines applied every 3 px for extra authenticity.
   * ════════════════════════════════════════════════════════════════ */
  var GLITCH_WORDS = [
    'DECISIONS','PIVM','HE TRN','MEAXTC2781','IBALSE E','SHIFHI+','BIEIK',
    'MEI ESTUCI','CCHIU EII','ABOUT','PROJECTS','SAEED K.','◉◎▓',
    'KHOURY','UI·UX','CODE','...ddd...','▓▒░░','CONTACT','VIBE',
  ];
  var GLITCH_DUR = 900;
  var glitchT0   = null;

  setTimeout(function () {
    requestAnimationFrame(function glitchFrame(ts) {
      if (!glitchT0) glitchT0 = ts;
      var p = Math.min(1, (ts - glitchT0) / GLITCH_DUR);

      /* Black base */
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);

      /* Horizontal coloured bands */
      var y = 0;
      while (y < H) {
        var r  = Math.random();
        var bh = r < 0.42 ? (1 + Math.floor(Math.random() * 3))
                           : (5 + Math.floor(Math.random() * 42));
        var cr = Math.random();
        if      (cr < 0.27) ctx.fillStyle = 'rgba(233,30,140,' + (0.40 + Math.random() * 0.60) + ')';
        else if (cr < 0.50) ctx.fillStyle = 'rgba(0,255,80,'   + (0.35 + Math.random() * 0.65) + ')';
        else                ctx.fillStyle = 'rgba(0,0,0,'       + (0.72 + Math.random() * 0.28) + ')';
        ctx.fillRect(0, y, W, bh);
        y += bh;
      }

      /* Garbled text fragments */
      ctx.textBaseline = 'top';
      for (var i = 0; i < 18; i++) {
        var word = GLITCH_WORDS[Math.floor(Math.random() * GLITCH_WORDS.length)];
        var fs   = 10 + Math.floor(Math.random() * 9);
        ctx.font = '600 ' + fs + 'px "Space Grotesk",monospace';
        ctx.fillStyle = 'rgba(255,255,255,' + (0.22 + Math.random() * 0.72) + ')';
        var dx = (Math.random() - 0.5) * 28;
        ctx.fillText(word, Math.random() * W + dx, Math.random() * H);
      }

      /* CRT scanlines */
      ctx.fillStyle = 'rgba(0,0,0,0.13)';
      for (var sl = 0; sl < H; sl += 3) ctx.fillRect(0, sl, W, 1);

      if (p < 1) {
        requestAnimationFrame(glitchFrame);
      } else {
        startSMPTE();
      }
    });
  }, 350);

  /* ════════════════════════════════════════════════════════════════
   *  PHASE 3 — SMPTE colour bars hard-cut
   * ════════════════════════════════════════════════════════════════ */
  function startSMPTE() {
    drawSMPTE();
    logo.style.opacity   = '0';   /* logo out */
    splash.style.display = 'none';

    /* Cracks begin 60 ms after bars appear */
    setTimeout(function () {
      var cracks = buildCracks();
      var drawn  = 0;
      var t0     = null;
      var DUR    = 240;

      requestAnimationFrame(function frame(ts) {
        if (!t0) t0 = ts;
        var p   = Math.min(1, (ts - t0) / DUR);
        /* Fast burst easing: cracks appear quickly then slow down */
        var tgt = Math.round(Math.pow(p, 0.38) * cracks.length);
        while (drawn < tgt) { drawCrack(cracks[drawn]); drawn++; }

        if (p < 1) {
          requestAnimationFrame(frame);
        } else {
          /* Overlay concentric rings + impact star on top of cracks */
          drawConcentricRings();
          drawImpactStar();
          /* Hold 400 ms, then impact */
          setTimeout(doImpact, 400);
        }
      });
    }, 60);
  }

  /* ════════════════════════════════════════════════════════════════
   *  SMPTE EIA-189-A colour bars
   *  Top 75 %: 7 equal columns — white | yellow | cyan | green |
   *            magenta | red | blue
   *  Bottom 25 %: classic pluge band
   * ════════════════════════════════════════════════════════════════ */
  function drawSMPTE() {
    var topH = Math.round(H * 0.75);
    var botH = H - topH;
    var bw   = W / 7;

    ['#ffffff','#ffff00','#00ffff','#00ff00','#ff00ff','#ff0000','#0000ff']
      .forEach(function (c, i) {
        ctx.fillStyle = c;
        ctx.fillRect(Math.round(i * bw), 0, Math.ceil(bw) + 1, topH);
      });

    var band = [
      { c:'#000075', f:1/7  }, { c:'#ffffff', f:1/7  },
      { c:'#220099', f:1/7  }, { c:'#000000', f:2/7  },
      { c:'#0d0d0d', f:1/14 }, { c:'#000000', f:1/14 },
      { c:'#1a1a1a', f:1/14 },
    ];
    var bx = 0;
    band.forEach(function (b) {
      var bww = Math.round(W * b.f);
      ctx.fillStyle = b.c;
      ctx.fillRect(bx, topH, bww, botH);
      bx += bww;
    });
    ctx.fillStyle = '#000';
    ctx.fillRect(bx, topH, W - bx, botH);
  }

  /* ── Concentric glass-pressure rings ─────────────────────────── */
  function drawConcentricRings() {
    [H * 0.055, H * 0.130, H * 0.230, H * 0.360].forEach(function (r, i) {
      var alpha = 0.50 - i * 0.09;
      if (alpha <= 0) return;
      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, IY, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,' + alpha.toFixed(2) + ')';
      ctx.lineWidth   = i === 0 ? 2.8 : 1.6;
      ctx.shadowColor = 'rgba(255,255,255,0.55)';
      ctx.shadowBlur  = 9;
      ctx.stroke();
      ctx.restore();
    });
  }

  /* ── Black star-burst impact point ───────────────────────────── */
  function drawImpactStar() {
    var pts = 10, outerR = 22, innerR = 5;
    ctx.save();
    ctx.translate(CX, IY);
    ctx.beginPath();
    for (var i = 0; i < pts * 2; i++) {
      var a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
      var r = i % 2 === 0 ? outerR : innerR;
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else         ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fillStyle   = '#000000';
    ctx.shadowColor = 'rgba(0,0,0,1)';
    ctx.shadowBlur  = 22;
    ctx.fill();
    ctx.restore();
  }

  /* ════════════════════════════════════════════════════════════════
   *  PHASE 4 — Impact: shake + flash + haptic + explosion
   * ════════════════════════════════════════════════════════════════ */
  function doImpact() {
    hapticFeedback();

    cvs.style.animation = 'skShk 0.40s ease-out';
    setTimeout(function () { cvs.style.animation = ''; }, 440);

    var fl = document.createElement('div');
    fl.className = 'sk-fl';
    document.body.appendChild(fl);
    setTimeout(function () { if (fl.parentNode) fl.parentNode.removeChild(fl); }, 240);

    /* Snapshot → 4-quadrant shards fly in 4 diagonal directions */
    setTimeout(function () {
      var snap = cvs.toDataURL();
      cvs.style.display = 'none';

      var ease = 'cubic-bezier(0.42,0,1,1)';
      var quads = [
        { clip:'polygon(0% 0%,50% 0%,50% 50%,0% 50%)',           tx:'-112%', ty:'-112%', rot:'-7deg',  del:0     },
        { clip:'polygon(50% 0%,100% 0%,100% 50%,50% 50%)',        tx:'112%',  ty:'-112%', rot:'7deg',   del:0.045 },
        { clip:'polygon(0% 50%,50% 50%,50% 100%,0% 100%)',        tx:'-112%', ty:'112%',  rot:'7deg',   del:0.022 },
        { clip:'polygon(50% 50%,100% 50%,100% 100%,50% 100%)',    tx:'112%',  ty:'112%',  rot:'-7deg',  del:0.068 },
      ];

      var shards = quads.map(function (q) {
        var el = document.createElement('div');
        el.className = 'sk-shard';
        el.style.cssText = [
          'position:fixed;top:0;left:0;right:0;bottom:0',
          'z-index:10000',
          'background:url(' + snap + ') no-repeat 0 0',
          'background-size:' + W + 'px ' + H + 'px',
          'clip-path:' + q.clip,
        ].join(';');
        document.body.appendChild(el);
        return { el: el, tx: q.tx, ty: q.ty, rot: q.rot, del: q.del };
      });

      /* Double rAF ensures CSS transition fires after initial paint */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          shards.forEach(function (s) {
            s.el.style.transition = 'transform 1.0s ' + ease + ' ' + s.del + 's';
            s.el.style.transform  = 'translate(' + s.tx + ',' + s.ty + ') rotate(' + s.rot + ')';
          });

          /* Cleanup after shards have flown off-screen */
          setTimeout(function () {
            ['sk-cvs','sk-splash','sk-logo','sk-kf'].forEach(function (id) {
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
    }, 72);
  }

  /* ════════════════════════════════════════════════════════════════
   *  Crack geometry — seeded spiderweb from impact point
   *  16 primary rays + 2–4 secondary branches each
   * ════════════════════════════════════════════════════════════════ */
  function buildCracks() {
    var rng   = seededRng(37);
    var lines = [];
    var N     = 16;
    var mDim  = Math.max(W, H);

    for (var i = 0; i < N; i++) {
      var angle = (i / N) * Math.PI * 2 + (rng() - 0.5) * 0.5;
      var len   = (0.42 + rng() * 0.65) * mDim;
      var pts   = jag(CX, IY, angle, len, rng, 7 + Math.floor(rng() * 5));
      lines.push({ pts: pts, primary: true });

      var nb = 2 + Math.floor(rng() * 3);
      for (var b = 0; b < nb; b++) {
        var bi = 1 + Math.floor(rng() * Math.max(1, pts.length - 2));
        var ba = angle + (rng() - 0.5) * 2.0;
        var bl = len * (0.18 + rng() * 0.42);
        lines.push({ pts: jag(pts[bi].x, pts[bi].y, ba, bl, rng, 3 + Math.floor(rng() * 3)), primary: false });
      }
    }
    /* Primary rays first so secondaries render on top */
    lines.sort(function (a, b) { return b.primary - a.primary; });
    return lines;
  }

  function jag(sx, sy, angle, length, rng, steps) {
    var pts = [{ x: sx, y: sy }], x = sx, y = sy;
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
      s = Math.imul(s, 1664525) + 1013904223 >>> 0;
      return s / 0x100000000;
    };
  }

  function drawCrack(line) {
    var pts = line.pts;
    if (pts.length < 2) return;
    var lw = line.primary ? 1.8 : 1.1;

    /* Soft glow halo */
    ctx.save();
    ctx.lineWidth   = lw + 7;
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.strokeStyle = line.primary ? 'rgba(220,200,255,0.42)' : 'rgba(180,160,255,0.26)';
    ctx.shadowColor = 'rgba(160,100,255,0.68)';
    ctx.shadowBlur  = line.primary ? 20 : 11;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.restore();

    /* Bright white fracture line */
    ctx.save();
    ctx.lineWidth   = lw;
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,0.93)';
    ctx.shadowColor = 'rgba(255,255,255,0.55)';
    ctx.shadowBlur  = 3;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (var j = 1; j < pts.length; j++) ctx.lineTo(pts[j].x, pts[j].y);
    ctx.stroke();
    ctx.restore();
  }

  /* ── Haptic ──────────────────────────────────────────────────── */
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
