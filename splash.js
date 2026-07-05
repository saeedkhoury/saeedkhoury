/* ─────────────────────────────────────────────────────────────────────── *
 *  MARK v14 — Saeed Khoury → scramble → SK → zoom → site reveals         *
 *  Haptic: Android navigator.vibrate + iOS white-noise burst + shake      *
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

  /* AudioContext — unlock immediately on first touch (iOS requirement) */
  var AC = null;
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}

  function unlockAC() {
    if (AC && AC.state === 'suspended') AC.resume();
    document.removeEventListener('touchstart', unlockAC, true);
    document.removeEventListener('touchend',   unlockAC, true);
    document.removeEventListener('click',      unlockAC, true);
  }
  document.addEventListener('touchstart', unlockAC, true);
  document.addEventListener('touchend',   unlockAC, true);
  document.addEventListener('click',      unlockAC, true);

  document.body.style.overflow = 'hidden';

  /* ── CSS ─────────────────────────────────────────────────────── */
  var kf = document.createElement('style');
  kf.id = 'sk-kf';
  kf.textContent = [
    '#sk-stage{position:fixed;inset:0;z-index:9998;background:#000;overflow:hidden;transition:opacity 0.7s ease;}',
    '#sk-cvs{position:absolute;inset:0;width:100%;height:100%;z-index:9999;display:block;}',

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
    '#sk-logo.sk-vis  { opacity:1; transition:opacity .4s ease; }',
    '#sk-logo.sk-big  { font-size:clamp(5rem,11vw,7.5rem); opacity:1; transition:font-size .3s ease; }',
    '#sk-logo.sk-zoom { font-size:clamp(5rem,11vw,7.5rem); opacity:1; animation:sk-zoom-in 1s ease-in forwards; }',

    '@keyframes sk-zoom-in{',
      '0%  {transform:translate(-50%,-50%) scale(1);  opacity:1;filter:blur(0);}',
      '100%{transform:translate(-50%,-50%) scale(18); opacity:0;filter:blur(14px);}',
    '}',

    /* Full-screen shake — felt on ALL devices (iOS + Android) */
    '@keyframes sk-shk{',
      '0%  {transform:translate(0,0)}',
      '14% {transform:translate(-12px,8px)}',
      '28% {transform:translate(11px,-10px)}',
      '42% {transform:translate(-9px,9px)}',
      '58% {transform:translate(8px,-7px)}',
      '72% {transform:translate(-5px,4px)}',
      '86% {transform:translate(3px,-2px)}',
      '100%{transform:translate(0,0)}',
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
   *  GLITCH CANVAS
   * ════════════════════════════════════════════════════════════════ */
  var glitchActive = false;
  var glitchRaf    = null;

  function drawGlitch() {
    if (!glitchActive) return;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

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

    for (var j = 0; j < 7; j++) {
      ctx.fillStyle = 'rgba(0,0,0,' + (0.38 + Math.random() * 0.38) + ')';
      ctx.fillRect(0, Math.random() * H, W, 2 + Math.random() * 9);
    }

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

    for (var s = 0; s < H; s += 3) {
      ctx.fillStyle = 'rgba(0,0,0,0.07)';
      ctx.fillRect(0, s, W, 1);
    }

    glitchRaf = requestAnimationFrame(drawGlitch);
  }

  /* ════════════════════════════════════════════════════════════════
   *  TEXT SCRAMBLE
   * ════════════════════════════════════════════════════════════════ */
  var CHARS = '0123456789!@#$[]{}|ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz';

  function scrambleTo(el, from, to, dur, onDone) {
    var start = Date.now();
    var iv = setInterval(function () {
      var t = Math.min((Date.now() - start) / dur, 1);
      if (t >= 1) { el.textContent = to; clearInterval(iv); if (onDone) onDone(); return; }
      var settled = Math.round(t * to.length);
      var result  = '';
      for (var i = 0; i < to.length; i++) {
        result += i < settled ? to[i] : CHARS[Math.random() * CHARS.length | 0];
      }
      el.textContent = result;
    }, 40);
  }

  /* ════════════════════════════════════════════════════════════════
   *  SK IMPACT
   *
   *  Android : navigator.vibrate two-punch pattern
   *  iOS     : white-noise audio burst (physically moves speaker cone)
   *            + shaped oscillator thud
   *  All     : full-screen CSS shake (visual + physical sensation)
   * ════════════════════════════════════════════════════════════════ */
  function osc(type, f0, f1, gain, delay, dur) {
    try {
      var o = AC.createOscillator(), g = AC.createGain();
      o.connect(g); g.connect(AC.destination); o.type = type;
      var t = AC.currentTime + delay;
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(gain, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.start(t); o.stop(t + dur + 0.01);
    } catch (e) {}
  }

  function skImpact() {
    /* 1 — Android vibration */
    if (navigator.vibrate) navigator.vibrate([90, 40, 140]);

    /* 2 — Full-screen shake (works on every device, no permissions needed) */
    stage.style.animation = 'sk-shk 0.42s ease-out';
    setTimeout(function () { stage.style.animation = ''; }, 450);

    /* 3 — Audio impact (white-noise burst = iPhone Taptic-Engine substitute) */
    if (!AC) return;
    try {
      (AC.state === 'suspended' ? AC.resume() : Promise.resolve()).then(function () {
        var t  = AC.currentTime;
        var sr = AC.sampleRate;

        /* White-noise burst: fast-attack shaped noise moves iPhone speaker cone */
        var bufLen = (sr * 0.10) | 0;
        var buf    = AC.createBuffer(1, bufLen, sr);
        var data   = buf.getChannelData(0);
        for (var i = 0; i < bufLen; i++) {
          /* Exponential envelope: instant attack, quick decay */
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 2.2);
        }
        var ns  = AC.createBufferSource();
        ns.buffer = buf;
        var ng  = AC.createGain();
        ng.gain.setValueAtTime(0.9, t);
        ng.gain.exponentialRampToValueAtTime(0.001, t + 0.10);
        ns.connect(ng); ng.connect(AC.destination);
        ns.start(t);

        /* Sub-bass thud layers */
        osc('sine',     72, 26, 0.95, 0,    0.20);
        osc('sine',     80, 22, 0.82, 0.03, 0.18);
        /* High transient snap */
        osc('triangle', 340, 85, 0.48, 0,   0.06);
        /* Low rumble tail */
        osc('sine',     44, 16, 0.55, 0.06, 0.24);
      });
    } catch (e) {}
  }

  /* ════════════════════════════════════════════════════════════════
   *  TIMELINE
   * ════════════════════════════════════════════════════════════════ */

  glitchActive = true;
  drawGlitch();

  setTimeout(function () { logo.classList.add('sk-vis'); }, 200);

  /* Scramble → SK, then fire impact */
  setTimeout(function () {
    scrambleTo(logo, 'Saeed Khoury', 'SK', 480, function () {
      logo.className = 'sk-big';
      skImpact();
    });
  }, 1500);

  /* SK zooms toward viewer */
  setTimeout(function () {
    logo.className = 'sk-zoom';
  }, 4500);

  /* Stop glitch, fade stage out, restore scroll */
  setTimeout(function () {
    glitchActive = false;
    if (glitchRaf) cancelAnimationFrame(glitchRaf);
    stage.style.opacity = '0';
    document.body.style.overflow = '';
  }, 5600);

  /* Cleanup */
  setTimeout(function () {
    if (stage.parentNode) stage.parentNode.removeChild(stage);
    if (logo.parentNode)  logo.parentNode.removeChild(logo);
    var kfEl = document.getElementById('sk-kf');
    if (kfEl && kfEl.parentNode) kfEl.parentNode.removeChild(kfEl);
  }, 6400);

})();
