/* ─────────────────────────────────────────────────────────────────────────── *
 *  MARK v6 — Nike-tier opening                                                 *
 *  Pure black → name appears small + centered → 1.1s hold → overlay fades.    *
 *  No flash. No curtain. No crash. Just the mark and the silence.              *
 * ─────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── Stale DOM cleanup (safe for repeated testing) ───────────────── */
  var prev = document.getElementById('sk-splash');
  if (prev) { prev.parentNode.removeChild(prev); document.body.style.overflow = ''; }
  var prevKf = document.getElementById('sk-kf');
  if (prevKf) prevKf.parentNode.removeChild(prevKf);

  if (sessionStorage.getItem('sk-intro')) return;
  sessionStorage.setItem('sk-intro', '1');

  /* ── Pre-warm AudioContext (iOS requires creation during a gesture) ─ */
  var AC = null;
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}

  document.body.style.overflow = 'hidden';

  /* ── Inject styles ────────────────────────────────────────────────── */
  var st = document.createElement('style');
  st.id  = 'sk-kf';
  st.textContent = [
    '#sk-splash{',
    '  position:fixed;inset:0;z-index:9999;',
    '  background:#000;',
    '  display:flex;flex-direction:column;',
    '  align-items:center;justify-content:center;',
    '  transition:opacity 0.55s cubic-bezier(0.4,0,0.2,1);',
    '  pointer-events:all;',
    '}',
    '#sk-splash.sk-out{opacity:0;pointer-events:none;}',

    '#sk-mark{',
    '  font-family:"Space Grotesk",system-ui,sans-serif;',
    '  font-weight:700;',
    /* Nike's swoosh is ~18% of screen width — keep the name at a similar
       modest scale so it feels like a brand mark, not a headline. */
    '  font-size:clamp(24px,5.5vw,52px);',
    '  letter-spacing:-0.02em;',
    '  color:#fff;',
    '  white-space:nowrap;',
    '  opacity:0;',
    '  transform:translateY(6px);',
    '  transition:opacity 0.6s cubic-bezier(0.16,1,0.3,1),',
    '             transform 0.6s cubic-bezier(0.16,1,0.3,1);',
    '  user-select:none;',
    '}',
    '#sk-mark.sk-in{opacity:1;transform:translateY(0);}',

    /* Thin rule under the name — Nike has just the swoosh; we add a
       1 px line as a minimal accent that feels like a signature. */
    '#sk-rule{',
    '  width:0;height:1px;',
    '  background:rgba(255,255,255,0.25);',
    '  margin-top:14px;',
    '  transition:width 0.5s cubic-bezier(0.22,1,0.36,1) 0.35s;',
    '}',
    '#sk-rule.sk-in{width:clamp(60px,12vw,110px);}',
  ].join('');
  document.head.appendChild(st);

  /* ── Build DOM ────────────────────────────────────────────────────── */
  var splash = document.createElement('div');
  splash.id  = 'sk-splash';

  var mark = document.createElement('div');
  mark.id   = 'sk-mark';
  mark.textContent = 'Saeed Khoury';

  var rule = document.createElement('div');
  rule.id  = 'sk-rule';

  splash.appendChild(mark);
  splash.appendChild(rule);
  document.body.appendChild(splash);

  /* ─────────────────────────────────────────────────────────────────────
   *  PHASE 1 — Appear (180 ms delay so the black frame is felt first)
   * ───────────────────────────────────────────────────────────────────── */
  setTimeout(function () {
    mark.classList.add('sk-in');
    rule.classList.add('sk-in');
  }, 180);

  /* ─────────────────────────────────────────────────────────────────────
   *  PHASE 2 — Confident hold, then silent fade
   *
   *  180 (delay) + 600 (fade-in) + 1100 (hold) = 1880 ms before exit
   * ───────────────────────────────────────────────────────────────────── */
  setTimeout(function () {
    /* Haptic fires at the MOMENT the overlay starts to vanish —
       it punctuates the reveal of the site, not the name appearance. */
    hapticFeedback();

    /* The overlay simply becomes transparent; the site was underneath all along. */
    splash.classList.add('sk-out');

    /* Remove DOM after the transition completes (550 ms transition) */
    setTimeout(function () {
      if (splash.parentNode) splash.parentNode.removeChild(splash);
      if (st.parentNode)     st.parentNode.removeChild(st);
      document.body.style.overflow = '';
    }, 600);

  }, 1880);

  /* ── Haptic ───────────────────────────────────────────────────────── */
  /*
   * Android: navigator.vibrate — single firm pulse.
   * iOS: four-oscillator sub-bass through the speaker chassis.
   *      The AudioContext was pre-warmed at IIFE start so the navigation
   *      gesture already unlocked it — no "user gesture required" block.
   */
  function hapticFeedback() {
    if (navigator.vibrate) navigator.vibrate([0, 0, 60, 20, 80]);

    if (!AC) return;
    try {
      var resume = AC.state === 'suspended' ? AC.resume() : Promise.resolve();
      resume.then(function () {
        fireOsc('sine',     58,  24, 0.85, 0,    0.14);
        fireOsc('sine',     88,  38, 0.50, 0,    0.10);
        fireOsc('triangle', 175, 55, 0.30, 0,    0.06);
        fireOsc('sine',     52,  20, 0.65, 0.04, 0.12);
      });
    } catch (e) {}
  }

  function fireOsc(type, f0, f1, gain, delay, dur) {
    try {
      var o = AC.createOscillator();
      var g = AC.createGain();
      o.connect(g); g.connect(AC.destination);
      o.type = type;
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
