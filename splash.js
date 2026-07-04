/* ─────────────────────────────────────────────────────────────────────── *
 *  MARK v10 — Name → SK → Kick → Crack → Reveal                           *
 *                                                                           *
 *  "Saeed Khoury" fades in → text collapses to large "SK" initials →      *
 *  suspenseful hold → SK punches forward and smashes the screen →          *
 *  CSS spider-web cracks appear → camera zooms through the break →         *
 *  stage removes itself and the profile card is revealed.                  *
 * ─────────────────────────────────────────────────────────────────────────*/
(function () {
  'use strict';

  /* ── Stale cleanup (before session-guard check) ─────────────── */
  ['sk-stage', 'sk-kf'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el && el.parentNode) el.parentNode.removeChild(el);
  });
  document.querySelectorAll('.sk-fl').forEach(function (el) {
    if (el.parentNode) el.parentNode.removeChild(el);
  });

  if (sessionStorage.getItem('sk-intro')) return;
  sessionStorage.setItem('sk-intro', '1');

  /* ── Pre-warm AudioContext ───────────────────────────────────── */
  var AC = null;
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}

  document.body.style.overflow = 'hidden';

  /* ── CSS ─────────────────────────────────────────────────────── */
  var kf = document.createElement('style');
  kf.id  = 'sk-kf';
  kf.textContent = '\
    #sk-stage {\
      position:fixed;inset:0;z-index:9999;\
      background:#000;\
      display:flex;align-items:center;justify-content:center;\
      overflow:hidden;\
      perspective:1000px;\
    }\
    #sk-text {\
      color:#fff;\
      font-family:"Space Grotesk",system-ui,sans-serif;\
      font-weight:900;\
      font-size:3.5rem;\
      letter-spacing:-.5px;\
      white-space:nowrap;\
      z-index:10;\
      opacity:0;\
      transition:opacity .38s ease;\
      will-change:transform,opacity,filter;\
    }\
    #sk-text.sk-in   { opacity:1 }\
    #sk-text.sk-grow {\
      font-size:6.5rem;\
      letter-spacing:-5px;\
      transition:\
        font-size      .5s cubic-bezier(.25,1,.5,1),\
        letter-spacing .5s cubic-bezier(.25,1,.5,1);\
    }\
    #sk-text.sk-kick {\
      transform:translateZ(500px) scale(4);\
      opacity:0;\
      filter:blur(8px);\
      transition:\
        transform .22s cubic-bezier(.6,-.28,.735,.045),\
        opacity   .18s ease-out,\
        filter    .18s ease-out;\
    }\
    #sk-crack {\
      position:absolute;inset:0;z-index:20;\
      opacity:0;pointer-events:none;\
      background-image:\
        radial-gradient(circle at 50% 48%,\
          rgba(255,255,255,.38) 0,\
          rgba(255,255,255,.18) 38px,\
          transparent 130px),\
        linear-gradient(  0deg, transparent 49.6%,rgba(255,255,255,.68) 50%,transparent 50.4%),\
        linear-gradient( 30deg, transparent 49.6%,rgba(255,255,255,.58) 50%,transparent 50.4%),\
        linear-gradient(-30deg, transparent 49.6%,rgba(255,255,255,.58) 50%,transparent 50.4%),\
        linear-gradient( 60deg, transparent 49.6%,rgba(255,255,255,.48) 50%,transparent 50.4%),\
        linear-gradient(-60deg, transparent 49.6%,rgba(255,255,255,.48) 50%,transparent 50.4%),\
        linear-gradient( 90deg, transparent 49.6%,rgba(255,255,255,.44) 50%,transparent 50.4%),\
        linear-gradient( 15deg, transparent 49.6%,rgba(255,255,255,.40) 50%,transparent 50.4%),\
        linear-gradient(-15deg, transparent 49.6%,rgba(255,255,255,.40) 50%,transparent 50.4%),\
        linear-gradient( 75deg, transparent 49.6%,rgba(255,255,255,.36) 50%,transparent 50.4%),\
        linear-gradient(-75deg, transparent 49.6%,rgba(255,255,255,.36) 50%,transparent 50.4%),\
        linear-gradient( 45deg, transparent 49.6%,rgba(255,255,255,.30) 50%,transparent 50.4%),\
        linear-gradient(-45deg, transparent 49.6%,rgba(255,255,255,.30) 50%,transparent 50.4%),\
        radial-gradient(circle, transparent 18%, rgba(0,0,0,.82) 90%);\
    }\
    #sk-crack.sk-show { opacity:1 }\
    #sk-crack.sk-zoom {\
      transform:scale(3.8);\
      opacity:0;\
      filter:blur(20px);\
      transition:\
        transform .80s cubic-bezier(.25,1,.5,1),\
        opacity   .60s ease-out,\
        filter    .60s ease-out;\
    }\
    @keyframes sk-shk {\
      0%  {transform:translate(0,0)}\
      15% {transform:translate(-11px,7px)}\
      30% {transform:translate(10px,-9px)}\
      45% {transform:translate(-8px,8px)}\
      60% {transform:translate(7px,-6px)}\
      80% {transform:translate(-3px,3px)}\
      100%{transform:translate(0,0)}\
    }\
    @keyframes sk-fl  {0%{opacity:1}100%{opacity:0}}\
    .sk-fl {\
      position:fixed;inset:0;z-index:30;\
      background:#fff;pointer-events:none;\
      animation:sk-fl .22s ease-out forwards;\
    }\
  ';
  document.head.appendChild(kf);

  /* ── DOM ─────────────────────────────────────────────────────── */
  var stage = document.createElement('div');
  stage.id  = 'sk-stage';

  var text  = document.createElement('div');
  text.id   = 'sk-text';
  text.textContent = 'Saeed Khoury';

  var crack = document.createElement('div');
  crack.id  = 'sk-crack';

  stage.appendChild(text);
  stage.appendChild(crack);
  document.body.appendChild(stage);

  /* ════════════════════════════════════════════════════════════════
   *  STEP 1 — Full name fades in   (200 ms)
   * ════════════════════════════════════════════════════════════════ */
  setTimeout(function () { text.classList.add('sk-in'); }, 200);

  /* ════════════════════════════════════════════════════════════════
   *  STEP 2 — Collapses to "SK" initials   (1 400 ms)
   *
   *  Text content changes to "SK" instantly; the font-size
   *  transitions from 3.5 rem → 6.5 rem so the two big letters
   *  seem to expand from the collapsed name — a concentration of
   *  energy before the impact.
   * ════════════════════════════════════════════════════════════════ */
  setTimeout(function () {
    text.textContent = 'SK';
    text.classList.add('sk-grow');
  }, 1400);

  /* ════════════════════════════════════════════════════════════════
   *  STEP 3 — Kick forward + shatter   (2 600 ms)
   *
   *  SK punches into the screen (translateZ + scale + blur fade).
   *  At the same moment:
   *    • 12-line CSS spider-web crack overlay appears instantly
   *    • White flash for impact pop
   *    • Camera shake on the stage
   *    • Haptic / audio rumble
   * ════════════════════════════════════════════════════════════════ */
  setTimeout(function () {
    hapticFeedback();

    /* White flash */
    var fl = document.createElement('div');
    fl.className = 'sk-fl';
    document.body.appendChild(fl);
    setTimeout(function () {
      if (fl.parentNode) fl.parentNode.removeChild(fl);
    }, 250);

    /* SK flies forward */
    text.classList.add('sk-kick');

    /* Crack web snaps on */
    crack.classList.add('sk-show');

    /* Stage shake */
    stage.style.animation = 'sk-shk .42s ease-out';
    setTimeout(function () { stage.style.animation = ''; }, 450);

  }, 2600);

  /* ════════════════════════════════════════════════════════════════
   *  STEP 4 — Zoom through the cracks → reveal site   (2 950 ms)
   * ════════════════════════════════════════════════════════════════ */
  setTimeout(function () {
    crack.classList.add('sk-zoom');
    document.body.style.overflow = '';

    /* Remove stage once animation finishes */
    setTimeout(function () {
      if (stage.parentNode) stage.parentNode.removeChild(stage);
      var kfEl = document.getElementById('sk-kf');
      if (kfEl && kfEl.parentNode) kfEl.parentNode.removeChild(kfEl);
    }, 950);

  }, 2950);

  /* ── Haptic + audio rumble ───────────────────────────────────── */
  function hapticFeedback() {
    if (navigator.vibrate) navigator.vibrate([0, 0, 80, 30, 120, 20, 60]);
    if (!AC) return;
    try {
      (AC.state === 'suspended' ? AC.resume() : Promise.resolve())
        .then(function () {
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
