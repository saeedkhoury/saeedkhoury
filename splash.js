/* ─────────────────────────────────────────────────────────────────────── *
 *  MARK v11 — 1:1 video match                                              *
 *                                                                           *
 *  "Saeed Khoury" on magenta/green glitch →                               *
 *  text scrambles character-by-character into "SK" →                      *
 *  SK holds (~2.5 s) →                                                     *
 *  SK zooms toward viewer and smashes the screen →                        *
 *  hard cut to SMPTE colour bars + canvas spider-web crack →              *
 *  camera zooms into the crack centre → site reveals.                     *
 * ─────────────────────────────────────────────────────────────────────────*/
(function () {
  'use strict';

  /* ── Stale cleanup ───────────────────────────────────────────── */
  ['sk-stage', 'sk-kf', 'sk-logo'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el && el.parentNode) el.parentNode.removeChild(el);
  });
  document.querySelectorAll('.sk-shard, .sk-fl').forEach(function (el) {
    if (el.parentNode) el.parentNode.removeChild(el);
  });

  if (sessionStorage.getItem('sk-intro')) return;
  sessionStorage.setItem('sk-intro', '1');

  var AC = null;
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}

  document.body.style.overflow = 'hidden';

  /* ── CSS ─────────────────────────────────────────────────────── */
  var kf = document.createElement('style');
  kf.id = 'sk-kf';
  kf.textContent = [
    '#sk-stage{position:fixed;inset:0;z-index:9998;background:#000;overflow:hidden;}',
    '#sk-cvs{position:absolute;inset:0;width:100%;height:100%;z-index:9999;display:block;}',

    /* Logo element — always centred via translate */
    '#sk-logo{',
      'position:fixed;top:50%;left:50%;',
      'transform:translate(-50%,-50%);',
      'z-index:10002;',
      'color:#fff;',
      'font-family:"Space Grotesk",system-ui,sans-serif;',
      'font-weight:900;',
      'white-space:nowrap;',
      'pointer-events:none;user-select:none;text-align:center;',
      'font-size:clamp(2.4rem,5.5vw,4.2rem);',
      'opacity:0;',
    '}',
    '#sk-logo.sk-vis   { opacity:1; transition:opacity .4s ease; }',
    '#sk-logo.sk-big   { font-size:clamp(5rem,11vw,7.5rem); opacity:1; transition:font-size .3s ease; }',
    '#sk-logo.sk-zoom  { font-size:clamp(5rem,11vw,7.5rem); opacity:1;',
      'animation:sk-zoom-in 1s ease-in forwards; }',
    '@keyframes sk-zoom-in{',
      '0%  {transform:translate(-50%,-50%) scale(1);   opacity:1;filter:blur(0);}',
      '100%{transform:translate(-50%,-50%) scale(18);  opacity:0;filter:blur(14px);}',
    '}',

    /* White flash */
    '@keyframes sk-fl{0%{opacity:1}100%{opacity:0}}',
    '.sk-fl{position:fixed;inset:0;z-index:10010;background:#fff;pointer-events:none;',
      'animation:sk-fl .22s ease-out forwards;}',

    /* Camera shake on stage */
    '@keyframes sk-shk{',
      '0%  {transform:translate(0,0)}',
      '15% {transform:translate(-12px,8px)}',
      '30% {transform:translate(10px,-10px)}',
      '45% {transform:translate(-8px,9px)}',
      '60% {transform:translate(7px,-6px)}',
      '80% {transform:translate(-3px,3px)}',
      '100%{transform:translate(0,0)}',
    '}',

    /* Glass shard pieces */
    '.sk-shard{position:fixed;inset:0;z-index:10000;pointer-events:none;will-change:transform,opacity;}',
  ].join('');
  document.head.appendChild(kf);

  /* ── DOM ─────────────────────────────────────────────────────── */
  var stage = document.createElement('div');
  stage.id = 'sk-stage';

  var canvas = document.createElement('canvas');
  canvas.id = 'sk-cvs';
  stage.appendChild(canvas);
  document.body.appendChild(stage);

  var logo = document.createElement('div');
  logo.id = 'sk-logo';
  logo.textContent = 'Saeed Khoury';
  document.body.appendChild(logo);

  var W, H, ctx;
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  ctx = canvas.getContext('2d');

  /* ════════════════════════════════════════════════════════════════
   *  GLITCH CANVAS — magenta / green horizontal bands + digits
   * ════════════════════════════════════════════════════════════════ */
  var glitchActive = false;
  var glitchRaf    = null;

  function drawGlitch() {
    if (!glitchActive) return;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    /* Magenta + green bands */
    var bands = 28 + (Math.random() * 22 | 0);
    for (var i = 0; i < bands; i++) {
      var y = Math.random() * H;
      var h = 2 + Math.random() * 32;
      var a = 0.14 + Math.random() * 0.52;
      ctx.fillStyle = Math.random() > 0.5
        ? 'rgba(233,30,140,' + a + ')'
        : 'rgba(0,255,80,'   + a + ')';
      ctx.fillRect(0, y, W * (0.35 + Math.random() * 0.65), h);
    }

    /* Dark over-bars */
    for (var j = 0; j < 7; j++) {
      ctx.fillStyle = 'rgba(0,0,0,' + (0.38 + Math.random() * 0.38) + ')';
      ctx.fillRect(0, Math.random() * H, W, 2 + Math.random() * 9);
    }

    /* Floating green digits */
    ctx.font = '11px "JetBrains Mono",monospace';
    var dchars = '01234![]{}|#';
    for (var k = 0; k < 38; k++) {
      ctx.fillStyle = 'rgba(0,255,80,' + (0.3 + Math.random() * 0.5) + ')';
      ctx.fillText(
        dchars[Math.random() * dchars.length | 0],
        Math.random() * W,
        Math.random() * H
      );
    }

    /* CRT scanlines */
    for (var s = 0; s < H; s += 3) {
      ctx.fillStyle = 'rgba(0,0,0,0.07)';
      ctx.fillRect(0, s, W, 1);
    }

    glitchRaf = requestAnimationFrame(drawGlitch);
  }

  /* ════════════════════════════════════════════════════════════════
   *  SMPTE EIA-189-A colour bars
   * ════════════════════════════════════════════════════════════════ */
  function drawSMPTE() {
    var bars = [
      [255,255,255],[255,255,0],[0,255,255],
      [0,255,0],[255,0,255],[255,0,0],[0,0,255]
    ];
    var topH = (H * 0.75) | 0;
    var bw   = W / 7;
    for (var i = 0; i < 7; i++) {
      var c = bars[i];
      ctx.fillStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
      ctx.fillRect(Math.round(i * bw), 0, Math.ceil(bw), topH);
    }
    var btm = H - topH;
    var seg = W / 4;
    ctx.fillStyle = '#000080'; ctx.fillRect(0,       topH, seg,     btm);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(seg,     topH, seg,     btm);
    ctx.fillStyle = '#222';    ctx.fillRect(seg*2,   topH, seg,     btm);
    ctx.fillStyle = '#000';    ctx.fillRect(seg*3,   topH, seg/3,   btm);
    ctx.fillStyle = '#111';    ctx.fillRect(seg*3+seg/3,   topH, seg/3, btm);
    ctx.fillStyle = '#222';    ctx.fillRect(seg*3+seg*2/3, topH, seg/3, btm);
  }

  /* ════════════════════════════════════════════════════════════════
   *  CRACK — seeded spider-web + concentric rings + impact star
   * ════════════════════════════════════════════════════════════════ */
  var seed = 0;
  function rng() {
    seed = Math.imul(seed, 1664525) + 1013904223 >>> 0;
    return seed / 0x100000000;
  }

  function drawCrack(cx, cy) {
    seed = 42;
    var numRays = 16;
    var shortSide = Math.min(W, H);

    ctx.save();
    ctx.shadowColor = 'rgba(255,255,255,0.35)';
    ctx.shadowBlur  = 3;
    ctx.strokeStyle = 'rgba(210,230,255,0.92)';
    ctx.lineWidth   = 1.2;

    for (var r = 0; r < numRays; r++) {
      var base  = (r / numRays) * Math.PI * 2;
      var len   = (0.30 + rng() * 0.60) * shortSide * 0.60;
      var angle = base;
      var x = cx, y = cy;
      var step  = 18;

      ctx.beginPath();
      ctx.moveTo(x, y);

      while (Math.hypot(x - cx, y - cy) < len) {
        angle += (rng() - 0.5) * 0.38;
        x += Math.cos(angle) * step;
        y += Math.sin(angle) * step;
        ctx.lineTo(x, y);

        /* Branch */
        if (rng() < 0.32) {
          var bx = x, by = y;
          var ba = angle + (rng() > 0.5 ? 0.48 : -0.48);
          var bl = len * (0.18 + rng() * 0.32);
          ctx.moveTo(bx, by);
          for (var bs = 0; bs < bl; bs += step) {
            ba += (rng() - 0.5) * 0.38;
            bx += Math.cos(ba) * step;
            by += Math.sin(ba) * step;
            ctx.lineTo(bx, by);
          }
          ctx.moveTo(x, y);
        }
      }
      ctx.stroke();
    }

    /* Concentric pressure rings */
    ctx.shadowBlur = 0;
    [[H * 0.055, 0.62], [H * 0.130, 0.50], [H * 0.230, 0.38], [H * 0.360, 0.26]]
      .forEach(function (rr, idx) {
        ctx.beginPath();
        ctx.arc(cx, cy, rr[0], 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(210,230,255,' + rr[1] + ')';
        ctx.lineWidth   = 1.4 - idx * 0.22;
        ctx.stroke();
      });

    /* Impact star */
    var pts = 10, outerR = 22, innerR = 5;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    for (var p = 0; p < pts * 2; p++) {
      var a  = (p * Math.PI) / pts - Math.PI / 2;
      var rr = p % 2 === 0 ? outerR : innerR;
      var px = cx + Math.cos(a) * rr;
      var py = cy + Math.sin(a) * rr;
      p === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /* ════════════════════════════════════════════════════════════════
   *  GLASS SHARDS — clip-path divs flying from centre
   * ════════════════════════════════════════════════════════════════ */
  function buildShards() {
    var defs = [
      { clip:'polygon(50% 50%,50% 0%,68% 0%)',               tx:'0%',    ty:'-130%', rot:'-8deg',  del:0     },
      { clip:'polygon(50% 50%,68% 0%,100% 0%,100% 22%)',      tx:'130%',  ty:'-120%', rot:'7deg',   del:0.035 },
      { clip:'polygon(50% 50%,100% 22%,100% 52%)',            tx:'138%',  ty:'0%',    rot:'11deg',  del:0.060 },
      { clip:'polygon(50% 50%,100% 52%,100% 100%,68% 100%)', tx:'125%',  ty:'125%',  rot:'-7deg',  del:0.040 },
      { clip:'polygon(50% 50%,68% 100%,32% 100%)',            tx:'0%',    ty:'138%',  rot:'9deg',   del:0.020 },
      { clip:'polygon(50% 50%,32% 100%,0% 100%,0% 72%)',     tx:'-128%', ty:'120%',  rot:'-10deg', del:0.050 },
      { clip:'polygon(50% 50%,0% 72%,0% 30%)',               tx:'-138%', ty:'0%',    rot:'8deg',   del:0.015 },
      { clip:'polygon(50% 50%,0% 30%,0% 0%,32% 0%)',         tx:'-122%', ty:'-125%', rot:'-6deg',  del:0.070 },
    ];
    defs.forEach(function (d) {
      var s = document.createElement('div');
      s.className = 'sk-shard';
      /* Each shard shows a glassy tint — no background-image needed */
      s.style.cssText = [
        'clip-path:' + d.clip,
        'background:linear-gradient(135deg,rgba(190,215,255,0.14),rgba(140,190,255,0.07))',
        'transition:transform .92s cubic-bezier(.25,.46,.45,.94) ' + d.del + 's,',
          'opacity .72s ease ' + (d.del + 0.18) + 's',
        'transform:translate(0,0) rotate(0deg)',
        'opacity:1',
      ].join(';');
      document.body.appendChild(s);
      setTimeout(function () {
        s.style.transform = 'translate(' + d.tx + ',' + d.ty + ') rotate(' + d.rot + ')';
        s.style.opacity   = '0';
      }, 30);
      setTimeout(function () {
        if (s.parentNode) s.parentNode.removeChild(s);
      }, 1600);
    });
  }

  /* ════════════════════════════════════════════════════════════════
   *  TEXT SCRAMBLE — name → SK
   * ════════════════════════════════════════════════════════════════ */
  var CHARS = '0123456789!@#$[]{}|ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz';

  function scrambleTo(el, from, to, dur, onDone) {
    var start = Date.now();
    var iv = setInterval(function () {
      var t   = Math.min((Date.now() - start) / dur, 1);
      if (t >= 1) { el.textContent = to; clearInterval(iv); if (onDone) onDone(); return; }

      /* Chars that have "settled" grow from 0 → to.length */
      var settled = Math.round(t * to.length);
      var result  = '';
      for (var i = 0; i < to.length; i++) {
        result += i < settled
          ? to[i]
          : CHARS[Math.random() * CHARS.length | 0];
      }
      el.textContent = result;
    }, 40);
  }

  /* ════════════════════════════════════════════════════════════════
   *  HAPTIC + AUDIO
   * ════════════════════════════════════════════════════════════════ */
  function haptic() {
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

  /* ════════════════════════════════════════════════════════════════
   *  TIMELINE
   * ════════════════════════════════════════════════════════════════ */

  /* Phase 1 — Glitch starts immediately */
  glitchActive = true;
  drawGlitch();

  /* Fade in "Saeed Khoury" */
  setTimeout(function () { logo.classList.add('sk-vis'); }, 200);

  /* Phase 2 — Scramble name → SK  (1 500 ms) */
  setTimeout(function () {
    scrambleTo(logo, 'Saeed Khoury', 'SK', 480, function () {
      logo.className = 'sk-big';   /* Large "SK" style — no transition flicker */
    });
  }, 1500);

  /* Phase 4 — SK zooms in  (4 500 ms) */
  setTimeout(function () {
    logo.className = 'sk-zoom';
  }, 4500);

  /* Phase 5 — Hard cut: SMPTE + crack  (5 500 ms) */
  setTimeout(function () {
    /* Stop glitch loop */
    glitchActive = false;
    if (glitchRaf) cancelAnimationFrame(glitchRaf);

    /* Draw SMPTE bars */
    drawSMPTE();

    /* White flash */
    var fl = document.createElement('div');
    fl.className = 'sk-fl';
    document.body.appendChild(fl);
    setTimeout(function () { if (fl.parentNode) fl.parentNode.removeChild(fl); }, 240);

    /* Haptic + audio */
    haptic();

    /* Shake the stage container */
    stage.style.animation = 'sk-shk .42s ease-out';
    setTimeout(function () { stage.style.animation = ''; }, 450);

    /* Hide logo */
    logo.style.opacity    = '0';
    logo.style.transition = 'opacity .12s';

    /* Draw crack a frame later (SMPTE must paint first) */
    setTimeout(function () { drawCrack(W / 2, H / 2); }, 80);

    /* Shards fly outward */
    setTimeout(function () { buildShards(); }, 180);

  }, 5500);

  /* Phase 6 — Zoom into crack centre  (6 800 ms) */
  setTimeout(function () {
    canvas.style.transition     = 'transform 1.1s cubic-bezier(.25,1,.5,1), opacity .7s ease-out .35s';
    canvas.style.transformOrigin = '50% 50%';
    canvas.style.transform      = 'scale(6)';
    canvas.style.opacity        = '0';
    document.body.style.overflow = '';
  }, 6800);

  /* Phase 7 — Cleanup  (8 000 ms) */
  setTimeout(function () {
    if (stage.parentNode) stage.parentNode.removeChild(stage);
    if (logo.parentNode)  logo.parentNode.removeChild(logo);
    var kfEl = document.getElementById('sk-kf');
    if (kfEl && kfEl.parentNode) kfEl.parentNode.removeChild(kfEl);
  }, 8000);

})();
