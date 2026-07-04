/* ─────────────────────────────────────────────────────────────────────────── *
 *  THE MARK — v5                                                               *
 *  Nike-tier: pure black, name only, confident hold, curtain reveal.           *
 *  Haptic: Android vibrate pattern + iOS triple-oscillator sub-bass.           *
 * ─────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── Stale cleanup (multiple-run safety) ────────────────────────────────── */
  var stale = document.getElementById('sk-splash');
  if (stale) { stale.parentNode.removeChild(stale); document.body.style.overflow = ''; }
  document.querySelectorAll('.sk-slab').forEach(function (el) {
    if (el.parentNode) el.parentNode.removeChild(el);
  });
  var staleKf = document.getElementById('sk-kf');
  if (staleKf && staleKf.parentNode) staleKf.parentNode.removeChild(staleKf);

  if (sessionStorage.getItem('sk-intro')) return;
  sessionStorage.setItem('sk-intro', '1');

  /* ── Viewport ────────────────────────────────────────────────────────────── */
  var W    = window.innerWidth;
  var H    = window.innerHeight;
  var CX   = W / 2;
  var CY   = H / 2;
  var FS   = Math.min(Math.max(W * 0.082, 36), 86); /* clamp: readable on small phones */
  var halfH = Math.round(H / 2);

  /* ── Pre-warm AudioContext on first user gesture so iOS won't block it ─── */
  /*
   * iOS requires AudioContext creation inside a user-gesture handler.
   * Navigation counts as a gesture, so creating it synchronously here works —
   * but we cannot call resume() until we actually need it.
   */
  var AC = null;
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}

  document.body.style.overflow = 'hidden';

  /* ── Keyframes ───────────────────────────────────────────────────────────── */
  var kfEl = document.createElement('style');
  kfEl.id  = 'sk-kf';
  kfEl.textContent = [
    /* Gentle glow pulse during hold — barely visible, just breathing */
    '@keyframes sk-pulse{',
    '  0%,100%{opacity:.85}',
    '  50%    {opacity:1}',
    '}',
    /* Flash */
    '@keyframes sk-flash{',
    '  0%  {opacity:1}',
    '  100%{opacity:0}',
    '}',
    /* Micro camera shake */
    '@keyframes sk-shake{',
    '  0%  {transform:translate(0,0)}',
    '  20% {transform:translate(-7px,3px)}',
    '  40% {transform:translate(6px,-5px)}',
    '  60% {transform:translate(-4px,4px)}',
    '  80% {transform:translate(3px,-2px)}',
    '  100%{transform:translate(0,0)}',
    '}',
  ].join('');
  document.head.appendChild(kfEl);

  /* ── Overlay ─────────────────────────────────────────────────────────────── */
  var splash = document.createElement('div');
  splash.id = 'sk-splash';
  css(splash, {
    position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
    zIndex: '9999',
    background: '#000000', /* absolute black — not BG purple-tinted */
    overflow: 'hidden',
  });

  /* Hidden canvas for snapshot only */
  var cvs = document.createElement('canvas');
  cvs.width = W; cvs.height = H;
  css(cvs, { position: 'absolute', top: '0', left: '0', opacity: '0', pointerEvents: 'none' });
  splash.appendChild(cvs);
  var ctx = cvs.getContext('2d');

  /* ── Name element ────────────────────────────────────────────────────────── */
  /*
   * Nike uses ONE element on pure black. We use ONE element: the name.
   * No ambient glow, no monogram, no underline during the hold.
   * The power comes from the negative space around it.
   */
  var nameEl = document.createElement('div');
  nameEl.textContent = 'Saeed Khoury';
  css(nameEl, {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    fontWeight: '700',
    fontSize: FS + 'px',
    letterSpacing: '-0.02em',
    whiteSpace: 'nowrap',
    /* Pure white first — gradient applied via filter during reveal */
    color: '#ffffff',
    opacity: '0',
    userSelect: 'none',
    pointerEvents: 'none',
    zIndex: '4',
    willChange: 'opacity, filter',
    /* Safari fix: force GPU layer */
    WebkitTransform: 'translate(-50%, -50%)',
  });
  splash.appendChild(nameEl);

  document.body.appendChild(splash);

  /* ════════════════════════════════════════════════════════════════════════════
   *  PHASE 1 — Reveal (pure cross-fade, 0 → 1, no motion)
   *  Nike style: the mark simply APPEARS. No slide, no zoom, no blur.
   *  Power comes from the darkness giving way to the name.
   * ════════════════════════════════════════════════════════════════════════════ */
  var T_REVEAL  = 120;  /* delay before reveal starts */
  var D_FADE_IN = 700;  /* fade-in duration ms */
  var D_HOLD    = 950;  /* confidence hold ms */
  var T_EXIT    = T_REVEAL + D_FADE_IN + D_HOLD; /* ~1770ms */

  setTimeout(function () {
    /* Fade the name in with a very slight text-shadow glow building */
    nameEl.style.transition = 'opacity ' + D_FADE_IN + 'ms cubic-bezier(0.16,1,0.3,1),' +
                              'filter ' + D_FADE_IN + 'ms cubic-bezier(0.16,1,0.3,1)';
    nameEl.style.opacity = '1';
    nameEl.style.filter  = 'drop-shadow(0 0 12px rgba(255,255,255,0.15))';

    /* After fully visible: start a very subtle pulse so it breathes */
    setTimeout(function () {
      nameEl.style.transition = 'none';
      nameEl.style.animation  = 'sk-pulse ' + (D_HOLD * 1.8 / 1000).toFixed(2) + 's ease-in-out 1 forwards';
    }, D_FADE_IN + 40);

  }, T_REVEAL);

  /* ════════════════════════════════════════════════════════════════════════════
   *  PHASE 2 — Exit: flash + curtain split
   * ════════════════════════════════════════════════════════════════════════════ */
  setTimeout(function () {
    /* Snap to full brightness before flash */
    nameEl.style.animation = 'none';
    nameEl.style.opacity   = '1';
    nameEl.style.filter    = 'drop-shadow(0 0 28px rgba(255,255,255,0.9)) ' +
                             'drop-shadow(0 0 60px rgba(124,58,237,0.6))';

    /* Haptic — fire immediately at exit moment */
    hapticFeedback();

    /* Micro shake */
    splash.style.animation = 'sk-shake 0.32s ease-out';
    setTimeout(function () { splash.style.animation = ''; }, 360);

    /* White flash */
    var flash = document.createElement('div');
    css(flash, {
      position: 'absolute', top: '0', left: '0', right: '0', bottom: '0',
      zIndex: '20',
      background: '#ffffff',
      animation: 'sk-flash 0.18s ease-out forwards',
      pointerEvents: 'none',
    });
    splash.appendChild(flash);
    setTimeout(function () {
      if (flash.parentNode) flash.parentNode.removeChild(flash);
    }, 200);

    /* Snapshot + curtain ~55ms in (just past peak flash) */
    setTimeout(function () {
      var snap    = renderSnapshot();
      var topSlab = makeSlab(true,  snap);
      var botSlab = makeSlab(false, snap);

      document.body.appendChild(topSlab);
      document.body.appendChild(botSlab);

      /* Hide original overlay — slabs take over */
      splash.style.visibility = 'hidden';

      /*
       * Double rAF: slabs must be painted at start position before
       * the transition fires, or the browser skips the first frame.
       */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          /* Strong ease-in — like two panes of glass giving way to gravity */
          var easing = 'cubic-bezier(0.42, 0, 1, 1)';
          topSlab.style.transition = 'transform 1.05s ' + easing;
          botSlab.style.transition = 'transform 1.05s ' + easing + ' 0.04s';
          topSlab.style.transform  = 'translateY(-110%)';
          botSlab.style.transform  = 'translateY(110%)';
        });
      });

      /* Cleanup everything after curtain exits */
      setTimeout(function () {
        document.querySelectorAll('.sk-slab').forEach(function (el) {
          if (el.parentNode) el.parentNode.removeChild(el);
        });
        if (splash.parentNode) splash.parentNode.removeChild(splash);
        var kf = document.getElementById('sk-kf');
        if (kf && kf.parentNode) kf.parentNode.removeChild(kf);
        document.body.style.overflow = '';
      }, 1150);

    }, 55);

  }, T_EXIT);

  /* ── renderSnapshot ──────────────────────────────────────────────────────── */
  /*
   * Draws the name onto the hidden canvas on pure black.
   * Both curtain slabs use this image so the name is visible on each half
   * as they slide apart — the text appears to SPLIT at the seam.
   */
  function renderSnapshot() {
    ctx.clearRect(0, 0, W, H);

    /* Pure black */
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);

    /* Name — three white glow passes then a gradient fill */
    ctx.save();
    ctx.font         = '700 ' + FS + 'px "Space Grotesk", system-ui, sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    /* Outer soft glow */
    ctx.shadowColor = 'rgba(255,255,255,0.3)';
    ctx.shadowBlur  = 60;
    ctx.fillStyle   = '#ffffff';
    ctx.fillText('Saeed Khoury', CX, CY);

    /* Mid glow */
    ctx.shadowColor = 'rgba(200,180,255,0.5)';
    ctx.shadowBlur  = 22;
    ctx.fillText('Saeed Khoury', CX, CY);

    /* Tight glow */
    ctx.shadowColor = 'rgba(255,255,255,0.8)';
    ctx.shadowBlur  = 6;
    ctx.fillText('Saeed Khoury', CX, CY);

    /* Gradient fill — white centre fading to purple/cyan at edges */
    ctx.shadowBlur = 0;
    var tw   = ctx.measureText('Saeed Khoury').width;
    var grad = ctx.createLinearGradient(CX - tw / 2, 0, CX + tw / 2, 0);
    grad.addColorStop(0,    '#ffffff');
    grad.addColorStop(0.18, '#f0eaff');
    grad.addColorStop(0.38, '#c084fc');
    grad.addColorStop(0.52, '#22d3ee');
    grad.addColorStop(0.66, '#c084fc');
    grad.addColorStop(0.82, '#f0eaff');
    grad.addColorStop(1,    '#ffffff');
    ctx.fillStyle = grad;
    ctx.fillText('Saeed Khoury', CX, CY);

    ctx.restore();

    /* Razor seam at the exact split point — creates a glowing cut line */
    ctx.save();
    var sg = ctx.createLinearGradient(0, 0, W, 0);
    sg.addColorStop(0,    'rgba(255,255,255,0)');
    sg.addColorStop(0.12, 'rgba(200,180,255,0.85)');
    sg.addColorStop(0.5,  'rgba(255,255,255,1)');
    sg.addColorStop(0.88, 'rgba(200,180,255,0.85)');
    sg.addColorStop(1,    'rgba(255,255,255,0)');
    ctx.strokeStyle = sg;
    ctx.lineWidth   = 1.5;
    ctx.shadowColor = 'rgba(124,58,237,0.9)';
    ctx.shadowBlur  = 8;
    ctx.beginPath();
    ctx.moveTo(0, CY);
    ctx.lineTo(W, CY);
    ctx.stroke();
    ctx.restore();

    return cvs.toDataURL();
  }

  /* ── makeSlab — one half of the curtain ─────────────────────────────────── */
  function makeSlab(isTop, dataURL) {
    var slab = document.createElement('div');
    slab.className = 'sk-slab';
    css(slab, {
      position: 'fixed',
      left: '0', right: '0',
      height: halfH + 'px',
      top: isTop ? '0' : halfH + 'px',
      backgroundImage: 'url(' + dataURL + ')',
      backgroundSize: W + 'px ' + H + 'px',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '0 ' + (isTop ? '0' : '-' + halfH + 'px'),
      zIndex: '9999',
      willChange: 'transform',
      pointerEvents: 'none',
    });

    /* Glowing seam edge on the cut face of each slab */
    var edge = document.createElement('div');
    css(edge, {
      position: 'absolute',
      left: '0', right: '0',
      height: '2px',
      background: 'linear-gradient(to right,' +
        'transparent 0%,rgba(200,180,255,0.9) 20%,' +
        'rgba(255,255,255,1) 50%,' +
        'rgba(200,180,255,0.9) 80%,transparent 100%)',
      boxShadow: '0 0 14px 2px rgba(124,58,237,0.7)',
    });
    if (isTop) {
      edge.style.bottom = '0';
    } else {
      edge.style.top = '0';
    }
    slab.appendChild(edge);

    return slab;
  }

  /* ── hapticFeedback ──────────────────────────────────────────────────────── */
  /*
   * Android: navigator.vibrate with a punch pattern.
   * iOS: Three simultaneous sub-bass oscillators (sine + triangle) at 40-80Hz
   *      create actual physical resonance through the speaker chassis.
   *      We use a pre-warmed AudioContext (created at IIFE start) so iOS
   *      doesn't block it — the navigation gesture unlocks it.
   */
  function hapticFeedback() {
    /* ── Android ── */
    if (navigator.vibrate) {
      navigator.vibrate([0, 0, 80, 30, 120, 20, 60]);
    }

    /* ── iOS (and Android audio reinforcement) ── */
    if (!AC) return;

    try {
      var resume = AC.state === 'suspended' ? AC.resume() : Promise.resolve();
      resume.then(function () {
        var now = AC.currentTime;

        /* Oscillator 1 — deep fundamental punch (60 Hz) */
        fireOsc(AC, 'sine',     60,  28,  0.9,  0,    0.14);
        /* Oscillator 2 — mid-bass body (90 Hz) — reinforces physical feel */
        fireOsc(AC, 'sine',     90,  40,  0.55, 0,    0.10);
        /* Oscillator 3 — sub click transient (180 Hz — the attack) */
        fireOsc(AC, 'triangle', 180, 60,  0.35, 0,    0.06);
        /* Oscillator 4 — second thud (40 ms later) simulates double-punch */
        fireOsc(AC, 'sine',     55,  22,  0.7,  0.04, 0.12);
      });
    } catch (e) {}
  }

  function fireOsc(ac, type, freqStart, freqEnd, gainPeak, delayS, durS) {
    try {
      var osc  = ac.createOscillator();
      var gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = type;
      var t0 = ac.currentTime + delayS;
      var t1 = t0 + durS;
      osc.frequency.setValueAtTime(freqStart, t0);
      osc.frequency.exponentialRampToValueAtTime(freqEnd, t1);
      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(gainPeak, t0 + 0.012); /* sharp attack */
      gain.gain.exponentialRampToValueAtTime(0.001, t1);
      osc.start(t0);
      osc.stop(t1 + 0.01);
    } catch (e) {}
  }

  /* ── css helper ──────────────────────────────────────────────────────────── */
  function css(el, styles) {
    Object.keys(styles).forEach(function (k) { el.style[k] = styles[k]; });
  }

})();
