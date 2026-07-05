/* ─────────────────────────────────────────────────────────────────────── *
 *  MARK v13 — Saeed Khoury → scramble → SK (haptic + audio) → zoom       *
 * ─────────────────────────────────────────────────────────────────────────*/
(function () {
  'use strict';

  /* ── Stale cleanup ───────────────────────────────────────────── */
  ['sk-stage', 'sk-kf', 'sk-logo'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el && el.parentNode) el.parentNode.removeChild(el);
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
    '#sk-stage{position:fixed;inset:0;z-index:9998;background:#000;overflow:hidden;transition:opacity 0.7s ease;}',
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
   *  TEXT SCRAMBLE — name → SK
   * ════════════════════════════════════════════════════════════════ */
  var CHARS = '0123456789!@#$[]{}|ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz';

  function scrambleTo(el, from, to, dur, onDone) {
    var start = Date.now();
    var iv = setInterval(function () {
      var t   = Math.min((Date.now() - start) / dur, 1);
      if (t >= 1) { el.textContent = to; clearInterval(iv); if (onDone) onDone(); return; }

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
   *  SK IMPACT — haptic + low-end audio thud when SK locks in
   * ════════════════════════════════════════════════════════════════ */
  function osc(type, f0, f1, gain, delay, dur) {
    try {
      var o = AC.createOscillator(), g = AC.createGain();
      o.connect(g); g.connect(AC.destination); o.type = type;
      var t = AC.currentTime + delay;
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(gain, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.start(t); o.stop(t + dur + 0.01);
    } catch (e) {}
  }

  function skImpact() {
    /* Strong device vibration — two sharp punches */
    if (navigator.vibrate) navigator.vibrate([90, 40, 140]);

    if (!AC) return;
    try {
      (AC.state === 'suspended' ? AC.resume() : Promise.resolve()).then(function () {
        /* Deep sub-bass thud */
        osc('sine',     72,  28, 0.95, 0,    0.18);
        /* Second heavier punch */
        osc('sine',     80,  24, 0.80, 0.04, 0.16);
        /* High transient click for snap */
        osc('triangle', 320, 90, 0.45, 0,    0.06);
        /* Low rumble tail */
        osc('sine',     44,  18, 0.55, 0.06, 0.22);
      });
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
      logo.className = 'sk-big';
      skImpact();
    });
  }, 1500);

  /* Phase 3 — SK zooms toward viewer  (4 500 ms) */
  setTimeout(function () {
    logo.className = 'sk-zoom';
  }, 4500);

  /* Phase 4 — Stop glitch, fade out stage, reveal site  (5 600 ms) */
  setTimeout(function () {
    glitchActive = false;
    if (glitchRaf) cancelAnimationFrame(glitchRaf);
    stage.style.opacity = '0';
    document.body.style.overflow = '';
  }, 5600);

  /* Phase 5 — Cleanup  (6 400 ms) */
  setTimeout(function () {
    if (stage.parentNode) stage.parentNode.removeChild(stage);
    if (logo.parentNode)  logo.parentNode.removeChild(logo);
    var kfEl = document.getElementById('sk-kf');
    if (kfEl && kfEl.parentNode) kfEl.parentNode.removeChild(kfEl);
  }, 6400);

})();
