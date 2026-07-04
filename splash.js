/* ─────────────────────────────────────────────────────────────────────────── *
 *  THE MARK — Cinematic Opening v4                                             *
 *  Inspired by Nike / Apple app launches. Pure black. Name breathes in.       *
 *  800ms of stillness. Flash. Screen splits top + bottom revealing the site.  *
 *  Total: ~2.8 s                                                              *
 * ─────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── Stale cleanup (bug-fix for testing multiple times) ─────────────────── */
  var stale = document.getElementById('sk-splash');
  if (stale) { stale.parentNode.removeChild(stale); document.body.style.overflow = ''; }
  document.querySelectorAll('.sk-slab').forEach(function (el) {
    if (el.parentNode) el.parentNode.removeChild(el);
  });

  if (sessionStorage.getItem('sk-intro')) return;
  sessionStorage.setItem('sk-intro', '1');

  /* ── Constants ───────────────────────────────────────────────────────────── */
  var BG  = '#07070d';
  var W   = window.innerWidth;
  var H   = window.innerHeight;
  var CX  = W / 2;
  var CY  = H / 2;
  var FS  = Math.min(W * 0.085, 82);

  document.body.style.overflow = 'hidden';

  /* ── Inject keyframes ────────────────────────────────────────────────────── */
  var kfEl = document.createElement('style');
  kfEl.id  = 'sk-kf';
  kfEl.textContent = [
    /* Subtle name glow breath during the hold phase */
    '@keyframes sk-breath{',
    '  0%,100%{filter:drop-shadow(0 0 10px rgba(124,58,237,0.5)) drop-shadow(0 0 24px rgba(34,211,238,0.18))}',
    '  50%    {filter:drop-shadow(0 0 22px rgba(124,58,237,0.9)) drop-shadow(0 0 48px rgba(34,211,238,0.35))}',
    '}',
    /* Camera micro-shake on flash */
    '@keyframes sk-hit{',
    '  0%  {transform:translate(0,0)}',
    '  15% {transform:translate(-8px,4px)}',
    '  30% {transform:translate(7px,-6px)}',
    '  45% {transform:translate(-5px,5px)}',
    '  60% {transform:translate(4px,-3px)}',
    '  75% {transform:translate(-2px,2px)}',
    '  100%{transform:translate(0,0)}',
    '}',
    /* Flash overlay */
    '@keyframes sk-flash{',
    '  0%  {opacity:1}',
    '  40% {opacity:0.92}',
    '  100%{opacity:0}',
    '}',
  ].join('\n');
  document.head.appendChild(kfEl);

  /* ── Full-screen overlay ─────────────────────────────────────────────────── */
  var splash = document.createElement('div');
  splash.id = 'sk-splash';
  css(splash, {
    position: 'fixed', inset: '0', zIndex: '9999',
    background: BG, overflow: 'hidden',
  });

  /* ── Hidden canvas — used only at snapshot moment ───────────────────────── */
  var cvs = document.createElement('canvas');
  cvs.width  = W;
  cvs.height = H;
  css(cvs, { position: 'absolute', inset: '0', opacity: '0', pointerEvents: 'none' });
  splash.appendChild(cvs);
  var ctx = cvs.getContext('2d');

  /* ── Ambient glow that fades in behind the name ──────────────────────────── */
  var glow = document.createElement('div');
  css(glow, {
    position: 'absolute', inset: '0', opacity: '0',
    transition: 'opacity 1.4s ease',
    background: 'radial-gradient(ellipse 60% 36% at 50% 50%,' +
      'rgba(124,58,237,0.14) 0%,rgba(34,211,238,0.04) 55%,transparent 80%)',
    pointerEvents: 'none',
  });
  splash.appendChild(glow);

  /* ── The name wordmark ───────────────────────────────────────────────────── */
  var nameEl = document.createElement('div');
  nameEl.textContent = 'Saeed Khoury';
  css(nameEl, {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%,-50%) translateY(18px)',
    fontFamily: "'Space Grotesk', system-ui, sans-serif",
    fontWeight: '700',
    fontSize: FS + 'px',
    letterSpacing: '-0.03em',
    whiteSpace: 'nowrap',
    opacity: '0',
    /* Gradient text — same as hero */
    background: 'linear-gradient(100deg,#fff 12%,#c084fc 34%,#22d3ee 50%,#c084fc 66%,#fff 88%)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    userSelect: 'none',
    pointerEvents: 'none',
    zIndex: '4',
    willChange: 'transform, opacity, filter',
  });
  splash.appendChild(nameEl);

  /* ── SK monogram — sits below the name like a brand signature ───────────── */
  var mono = document.createElement('div');
  mono.textContent = 'sk';
  css(mono, {
    position: 'absolute',
    top: 'calc(50% + ' + (FS * 0.72) + 'px)',
    left: '50%',
    transform: 'translate(-50%, 0) translateY(8px)',
    fontFamily: "'JetBrains Mono', monospace, system-ui",
    fontWeight: '400',
    fontSize: Math.min(W * 0.028, 22) + 'px',
    letterSpacing: '0.28em',
    opacity: '0',
    color: 'rgba(124,58,237,0.65)',
    userSelect: 'none',
    pointerEvents: 'none',
    zIndex: '4',
    willChange: 'transform, opacity',
  });
  splash.appendChild(mono);

  /* ── Thin underline accent — draws in under the name ────────────────────── */
  var line = document.createElement('div');
  css(line, {
    position: 'absolute',
    top: 'calc(50% + ' + (FS * 0.52) + 'px)',
    left: '50%',
    transform: 'translateX(-50%)',
    height: '1.5px',
    width: '0px',
    background: 'linear-gradient(to right,rgba(124,58,237,0),rgba(124,58,237,0.85) 30%,rgba(34,211,238,0.85) 70%,rgba(34,211,238,0))',
    transition: 'width 0.55s cubic-bezier(0.22,1,0.36,1)',
    pointerEvents: 'none',
    zIndex: '4',
  });
  splash.appendChild(line);

  document.body.appendChild(splash);

  /* ════════════════════════════════════════════════════════════════════════════
   *  PHASE 1 — Name reveal
   *  The wordmark and monogram float up from 18 px below into position.
   *  Classic, premium — no gimmicks.
   * ════════════════════════════════════════════════════════════════════════════ */
  setTimeout(function () {
    glow.style.opacity = '1';

    /* Name floats up */
    nameEl.style.transition =
      'opacity 0.62s cubic-bezier(0.22,1,0.36,1),' +
      'transform 0.62s cubic-bezier(0.22,1,0.36,1),' +
      'filter 0.62s ease';
    nameEl.style.opacity   = '1';
    nameEl.style.transform = 'translate(-50%,-50%) translateY(0)';
    nameEl.style.filter    = 'drop-shadow(0 0 10px rgba(124,58,237,0.5))';

    /* Monogram follows 160 ms later */
    setTimeout(function () {
      mono.style.transition =
        'opacity 0.55s ease,' +
        'transform 0.55s cubic-bezier(0.22,1,0.36,1)';
      mono.style.opacity   = '1';
      mono.style.transform = 'translate(-50%, 0) translateY(0)';
    }, 160);

    /* Underline draws in 220 ms later */
    setTimeout(function () {
      line.style.width = Math.min(W * 0.36, 260) + 'px';
    }, 220);

  }, 80);

  /* ════════════════════════════════════════════════════════════════════════════
   *  PHASE 2 — Confidence hold (800 ms)
   *  The name just breathes. Nothing else moves.
   * ════════════════════════════════════════════════════════════════════════════ */
  var REVEAL_MS   = 680;   /* name fully in */
  var HOLD_MS     = 820;   /* stillness */
  var EXIT_START  = 80 + REVEAL_MS + HOLD_MS; /* ~1580 ms */

  setTimeout(function () {
    nameEl.style.transition = 'filter 0s';
    nameEl.style.animation  = 'sk-breath 2.2s ease-in-out infinite';
  }, 80 + REVEAL_MS);

  /* ════════════════════════════════════════════════════════════════════════════
   *  PHASE 3 — Exit: Flash + horizontal curtain split
   * ════════════════════════════════════════════════════════════════════════════ */
  setTimeout(function () {
    /* Stop breathing — name locks at full glow before flash */
    nameEl.style.animation = 'none';
    nameEl.style.filter    = 'drop-shadow(0 0 28px rgba(124,58,237,1)) drop-shadow(0 0 70px rgba(34,211,238,0.5))';

    /* Haptic */
    hapticFeedback();

    /* Micro shake */
    splash.style.animation = 'sk-hit 0.38s ease-out';
    setTimeout(function () { splash.style.animation = ''; }, 400);

    /* White flash */
    var flash = document.createElement('div');
    css(flash, {
      position: 'absolute', inset: '0', zIndex: '20',
      background: '#ffffff',
      animation: 'sk-flash 0.22s ease-out forwards',
      pointerEvents: 'none',
    });
    splash.appendChild(flash);
    setTimeout(function () {
      if (flash.parentNode) flash.parentNode.removeChild(flash);
    }, 240);

    /* Build the curtain slabs */
    setTimeout(function () {
      var snap = renderSnapshot();

      var topSlab = makeCurtain(true,  snap);
      var botSlab = makeCurtain(false, snap);
      document.body.appendChild(topSlab);
      document.body.appendChild(botSlab);

      splash.style.visibility = 'hidden';

      /*
       * Double-rAF: guarantees slabs are painted at their starting position
       * before the transition fires — prevents a single-frame position jump.
       */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          /*
           * ease-in gravity: starts barely moving (glass giving way to weight),
           * then accelerates hard off the top and bottom.
           */
          var ease = 'cubic-bezier(0.4, 0, 0.9, 1)';

          topSlab.style.transition = 'transform 0.92s ' + ease;
          botSlab.style.transition = 'transform 0.92s ' + ease + ' 0.05s';

          topSlab.style.transform = 'translateY(-110%)';
          botSlab.style.transform = 'translateY(110%)';
        });
      });

      /* Cleanup */
      setTimeout(function () {
        document.querySelectorAll('.sk-slab').forEach(function (el) {
          if (el.parentNode) el.parentNode.removeChild(el);
        });
        if (splash.parentNode) splash.parentNode.removeChild(splash);
        var kf = document.getElementById('sk-kf');
        if (kf && kf.parentNode) kf.parentNode.removeChild(kf);
        document.body.style.overflow = '';
      }, 1050);

    }, 60); /* slight delay after flash peak */

  }, EXIT_START);

  /* ── renderSnapshot ──────────────────────────────────────────────────────── */
  /*
   * Draws the exact same visual that was on screen (name + monogram + line)
   * onto the hidden canvas, then captures it.  Both curtain slabs will show
   * their half of this image, so the name SPLITS as the curtains move apart.
   */
  function renderSnapshot() {
    ctx.clearRect(0, 0, W, H);

    /* Background */
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    /* Ambient glow */
    var grd = ctx.createRadialGradient(CX, CY, 0, CX, CY, Math.min(W, H) * 0.55);
    grd.addColorStop(0,   'rgba(124,58,237,0.10)');
    grd.addColorStop(0.6, 'rgba(124,58,237,0.03)');
    grd.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    /* Name glow passes */
    ctx.save();
    ctx.font         = '700 ' + FS + 'px "Space Grotesk", system-ui, sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    [
      {c: 'rgba(124,58,237,0.5)', b: 40},
      {c: 'rgba(124,58,237,0.28)', b: 18},
      {c: 'rgba(34,211,238,0.2)', b: 55},
    ].forEach(function (g) {
      ctx.shadowColor = g.c;
      ctx.shadowBlur  = g.b;
      ctx.fillStyle   = '#ffffff';
      ctx.fillText('Saeed Khoury', CX, CY);
    });

    /* Name gradient */
    ctx.shadowBlur = 0;
    var tw   = ctx.measureText('Saeed Khoury').width;
    var grad = ctx.createLinearGradient(CX - tw / 2, 0, CX + tw / 2, 0);
    grad.addColorStop(0,    '#ffffff');
    grad.addColorStop(0.12, '#e9e3ff');
    grad.addColorStop(0.34, '#c084fc');
    grad.addColorStop(0.52, '#22d3ee');
    grad.addColorStop(0.68, '#c084fc');
    grad.addColorStop(0.88, '#e9e3ff');
    grad.addColorStop(1,    '#ffffff');
    ctx.fillStyle = grad;
    ctx.fillText('Saeed Khoury', CX, CY);
    ctx.restore();

    /* Monogram */
    var monoY = CY + FS * 0.72;
    ctx.save();
    ctx.font         = '400 ' + Math.min(W * 0.028, 22) + 'px "JetBrains Mono", monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle    = 'rgba(124,58,237,0.65)';
    ctx.letterSpacing = '0.28em';
    ctx.fillText('sk', CX, monoY);
    ctx.restore();

    /* Underline */
    var lw = Math.min(W * 0.36, 260);
    var ly = CY + FS * 0.52;
    ctx.save();
    var lg = ctx.createLinearGradient(CX - lw / 2, 0, CX + lw / 2, 0);
    lg.addColorStop(0,   'rgba(124,58,237,0)');
    lg.addColorStop(0.3, 'rgba(124,58,237,0.85)');
    lg.addColorStop(0.7, 'rgba(34,211,238,0.85)');
    lg.addColorStop(1,   'rgba(34,211,238,0)');
    ctx.strokeStyle = lg;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(CX - lw / 2, ly);
    ctx.lineTo(CX + lw / 2, ly);
    ctx.stroke();
    ctx.restore();

    /* Center split seam — a razor-thin bright line at the exact cut point */
    ctx.save();
    var sg = ctx.createLinearGradient(0, 0, W, 0);
    sg.addColorStop(0,   'rgba(255,255,255,0)');
    sg.addColorStop(0.15,'rgba(255,255,255,0.9)');
    sg.addColorStop(0.5, 'rgba(200,180,255,1)');
    sg.addColorStop(0.85,'rgba(255,255,255,0.9)');
    sg.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.strokeStyle = sg;
    ctx.lineWidth   = 1;
    ctx.shadowColor = 'rgba(124,58,237,0.8)';
    ctx.shadowBlur  = 6;
    ctx.beginPath();
    ctx.moveTo(0, CY);
    ctx.lineTo(W, CY);
    ctx.stroke();
    ctx.restore();

    return cvs.toDataURL();
  }

  /* ── makeCurtain — one horizontal half-slab ──────────────────────────────── */
  /*
   * Top slab: covers 0 → 50 vh, background-position 0 0 shows top half of snap.
   * Bot slab: covers 50vh → 100vh, bg-position 0 -(H/2)px shows bottom half.
   *
   * When top slides to translateY(-110%) and bot to translateY(+110%),
   * the full viewport is cleared, revealing the site underneath.
   */
  function makeCurtain(isTop, dataURL) {
    var halfH = Math.round(H / 2); /* pixels, not vh — avoids mobile Safari 100vh != innerHeight */
    var slab  = document.createElement('div');
    slab.className = 'sk-slab';
    css(slab, {
      position: 'fixed',
      left: '0', right: '0',
      height: halfH + 'px',
      backgroundImage: 'url(' + dataURL + ')',
      backgroundSize: W + 'px ' + H + 'px',
      backgroundRepeat: 'no-repeat',
      zIndex: '9999',
      willChange: 'transform',
      pointerEvents: 'none',
    });

    if (isTop) {
      slab.style.top               = '0';
      slab.style.backgroundPosition = '0 0';

      /* Bottom edge glow — the split seam */
      var edgeTop = document.createElement('div');
      css(edgeTop, {
        position: 'absolute', bottom: '0', left: '0', right: '0',
        height: '2px',
        background: 'linear-gradient(to right,transparent 5%,rgba(200,180,255,0.95) 30%,rgba(255,255,255,1) 50%,rgba(200,180,255,0.95) 70%,transparent 95%)',
        boxShadow: '0 1px 18px rgba(124,58,237,0.7)',
      });
      slab.appendChild(edgeTop);
    } else {
      slab.style.top               = halfH + 'px'; /* top-anchored, not bottom — avoids vh mismatch */
      slab.style.backgroundPosition = '0 -' + halfH + 'px';

      /* Top edge glow */
      var edgeBot = document.createElement('div');
      css(edgeBot, {
        position: 'absolute', top: '0', left: '0', right: '0',
        height: '2px',
        background: 'linear-gradient(to right,transparent 5%,rgba(200,180,255,0.95) 30%,rgba(255,255,255,1) 50%,rgba(200,180,255,0.95) 70%,transparent 95%)',
        boxShadow: '0 -1px 18px rgba(124,58,237,0.7)',
      });
      slab.appendChild(edgeBot);
    }

    return slab;
  }

  /* ── Haptic ──────────────────────────────────────────────────────────────── */
  function hapticFeedback() {
    if (navigator.vibrate) navigator.vibrate([60, 15, 80, 10, 40]);
    try {
      var ac   = new (window.AudioContext || window.webkitAudioContext)();
      var osc  = ac.createOscillator();
      var gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(72, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(24, ac.currentTime + 0.11);
      gain.gain.setValueAtTime(0.65, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 0.16);
    } catch (e) {}
  }

  /* ── Helpers ─────────────────────────────────────────────────────────────── */
  function css(el, styles) {
    Object.keys(styles).forEach(function (k) { el.style[k] = styles[k]; });
  }

})();
