/* Cleanova Studio - effects: clip animations, transitions, filters, overlays, stickers, animated text. Developed by SMAA */
(function () {
  'use strict';
  const S = window.Studio;
  const fx = S.fx = {};
  const PI = Math.PI;
  const cl = (v, a, b) => Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, v));
  const eo = p => 1 - Math.pow(1 - p, 3);
  const eio = p => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const ob = p => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
  const obn = p => { const n = 7.5625, d = 2.75; if (p < 1 / d) return n * p * p; if (p < 2 / d) return n * (p -= 1.5 / d) * p + .75; if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + .9375; return n * (p -= 2.625 / d) * p + .984375; };
  const rnd = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
  fx.ease = { eo, eio, ob, obn }; fx.rnd = rnd;

  /* =============== clip animations =============== */
  const ID = () => ({ a: 1, tx: 0, ty: 0, s: 1, r: 0, sx: 1 });
  fx.IN = {
    none: p => ID(),
    fade: p => ({ a: eo(p), tx: 0, ty: 0, s: 1, r: 0, sx: 1 }),
    slideL: p => ({ a: 1, tx: -(1 - eo(p)), ty: 0, s: 1, r: 0, sx: 1 }),
    slideR: p => ({ a: 1, tx: (1 - eo(p)), ty: 0, s: 1, r: 0, sx: 1 }),
    slideU: p => ({ a: 1, tx: 0, ty: (1 - eo(p)), s: 1, r: 0, sx: 1 }),
    slideD: p => ({ a: 1, tx: 0, ty: -(1 - eo(p)), s: 1, r: 0, sx: 1 }),
    zoomIn: p => ({ a: eo(p), tx: 0, ty: 0, s: .6 + .4 * eo(p), r: 0, sx: 1 }),
    zoomOut: p => ({ a: eo(p), tx: 0, ty: 0, s: 1.5 - .5 * eo(p), r: 0, sx: 1 }),
    bounce: p => ({ a: cl(p * 4), tx: 0, ty: -(1 - obn(p)), s: 1, r: 0, sx: 1 }),
    spin: p => ({ a: eo(p), tx: 0, ty: 0, s: .5 + .5 * eo(p), r: -(1 - eo(p)) * PI, sx: 1 }),
    flip: p => ({ a: 1, tx: 0, ty: 0, s: 1, r: 0, sx: Math.max(.001, eo(p)) }),
    pop: p => ({ a: cl(p * 5), tx: 0, ty: 0, s: Math.max(.01, ob(p)), r: 0, sx: 1 })
  };
  fx.OUT = {
    none: q => ID(),
    fade: q => ({ a: 1 - eo(q), tx: 0, ty: 0, s: 1, r: 0, sx: 1 }),
    slideL: q => ({ a: 1, tx: -eo(q), ty: 0, s: 1, r: 0, sx: 1 }),
    slideR: q => ({ a: 1, tx: eo(q), ty: 0, s: 1, r: 0, sx: 1 }),
    slideU: q => ({ a: 1, tx: 0, ty: -eo(q), s: 1, r: 0, sx: 1 }),
    slideD: q => ({ a: 1, tx: 0, ty: eo(q), s: 1, r: 0, sx: 1 }),
    zoomIn: q => ({ a: 1 - eo(q), tx: 0, ty: 0, s: 1 + .5 * eo(q), r: 0, sx: 1 }),
    zoomOut: q => ({ a: 1 - eo(q), tx: 0, ty: 0, s: 1 - .4 * eo(q), r: 0, sx: 1 }),
    spin: q => ({ a: 1 - eo(q), tx: 0, ty: 0, s: 1 - .5 * eo(q), r: eo(q) * PI, sx: 1 }),
    flip: q => ({ a: 1, tx: 0, ty: 0, s: 1, r: 0, sx: Math.max(.001, 1 - eo(q)) })
  };
  /* continuous motion: p 0..1 across the clip, u seconds since start */
  fx.MID = {
    none: () => ID(),
    kenburns: (p, u, seed) => {
      const v = seed % 4;
      if (v === 0) return { a: 1, tx: 0, ty: 0, s: 1 + .13 * p, r: 0, sx: 1 };
      if (v === 1) return { a: 1, tx: 0, ty: 0, s: 1.13 - .13 * p, r: 0, sx: 1 };
      if (v === 2) return { a: 1, tx: (p - .5) * .06, ty: 0, s: 1.1, r: 0, sx: 1 };
      return { a: 1, tx: (.5 - p) * .06, ty: (p - .5) * .03, s: 1.1, r: 0, sx: 1 };
    },
    slowzoom: p => ({ a: 1, tx: 0, ty: 0, s: 1 + .2 * p, r: 0, sx: 1 }),
    pulse: (p, u) => ({ a: 1, tx: 0, ty: 0, s: 1 + .035 * Math.sin(u * 5), r: 0, sx: 1 }),
    shake: (p, u) => ({ a: 1, tx: Math.sin(u * 37) * .006, ty: Math.cos(u * 31) * .006, s: 1.04, r: Math.sin(u * 23) * .006, sx: 1 }),
    sway: (p, u) => ({ a: 1, tx: Math.sin(u * 1.6) * .02, ty: 0, s: 1.06, r: Math.sin(u * 1.6) * .02, sx: 1 })
  };
  const L = (u, e) => [u, e];
  fx.IN_NAMES = { none: L('کوئی نہیں', 'None'), fade: L('فیڈ', 'Fade'), slideL: L('بائیں سے', 'Slide left'), slideR: L('دائیں سے', 'Slide right'), slideU: L('نیچے سے', 'Slide up'), slideD: L('اوپر سے', 'Slide down'), zoomIn: L('زوم اِن', 'Zoom in'), zoomOut: L('زوم آؤٹ', 'Zoom out'), bounce: L('اچھلنا', 'Bounce'), spin: L('گھومنا', 'Spin'), flip: L('پلٹنا', 'Flip'), pop: L('پاپ', 'Pop') };
  fx.OUT_NAMES = { none: L('کوئی نہیں', 'None'), fade: L('فیڈ', 'Fade'), slideL: L('بائیں', 'Left'), slideR: L('دائیں', 'Right'), slideU: L('اوپر', 'Up'), slideD: L('نیچے', 'Down'), zoomIn: L('زوم اِن', 'Zoom in'), zoomOut: L('زوم آؤٹ', 'Zoom out'), spin: L('گھومنا', 'Spin'), flip: L('پلٹنا', 'Flip') };
  fx.MID_NAMES = { none: L('کوئی نہیں', 'None'), kenburns: L('آٹو زوم/پین', 'Auto zoom/pan'), slowzoom: L('آہستہ زوم', 'Slow zoom'), pulse: L('دھڑکنا', 'Pulse'), shake: L('ہلنا', 'Shake'), sway: L('جھولنا', 'Sway') };
  fx.VFX_NAMES = { none: L('کوئی نہیں', 'None'), mirror: L('آئینہ', 'Mirror'), glitch: L('گلچ', 'Glitch'), punch: L('زوم پنچ', 'Zoom punch') };

  /* =============== transitions =============== */
  /* A and B are functions (ctx) that draw the outgoing and incoming layers. */
  const around = (c, W, H, fn) => { c.translate(W / 2, H / 2); fn(); c.translate(-W / 2, -H / 2); };
  const heartPath = (c, cx, cy, s) => {
    c.beginPath(); c.moveTo(cx, cy + s * .35);
    c.bezierCurveTo(cx - s * .6, cy - s * .05, cx - s * .5, cy - s * .65, cx, cy - s * .25);
    c.bezierCurveTo(cx + s * .5, cy - s * .65, cx + s * .6, cy - s * .05, cx, cy + s * .35); c.closePath();
  };
  fx.tmp = null;
  function tmpCanvas(w, h) {
    if (!fx.tmp) fx.tmp = document.createElement('canvas');
    if (fx.tmp.width !== w || fx.tmp.height !== h) { fx.tmp.width = w; fx.tmp.height = h; }
    return fx.tmp;
  }
  /* cheap blur: draw small, scale up */
  fx.blurDraw = function (c, layer, W, H, k) {
    k = Math.max(1, k);
    const tc = tmpCanvas(Math.max(8, Math.round(W / k)), Math.max(8, Math.round(H / k)));
    const t = tc.getContext('2d');
    t.setTransform(1, 0, 0, 1, 0, 0); t.clearRect(0, 0, tc.width, tc.height);
    t.save(); t.scale(tc.width / W, tc.height / H); layer(t); t.restore();
    c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'low'; c.drawImage(tc, 0, 0, W, H); c.restore();
  };
  const rectsClip = (c, rects) => { c.beginPath(); rects.forEach(r => c.rect(r[0], r[1], r[2], r[3])); c.clip(); };
  fx.TR = {
    fade: (c, p, A, B) => { A(c); c.globalAlpha = p; B(c); c.globalAlpha = 1; },
    dissolve: (c, p, A, B, W, H) => { const e = eio(p); A(c); c.save(); c.globalAlpha = e; around(c, W, H, () => { const s = 1.06 - .06 * e; c.scale(s, s); }); B(c); c.restore(); },
    slideL: (c, p, A, B, W) => { A(c); c.save(); c.translate(-(1 - p) * W, 0); B(c); c.restore(); },
    slideR: (c, p, A, B, W) => { A(c); c.save(); c.translate((1 - p) * W, 0); B(c); c.restore(); },
    slideU: (c, p, A, B, W, H) => { A(c); c.save(); c.translate(0, (1 - p) * H); B(c); c.restore(); },
    slideD: (c, p, A, B, W, H) => { A(c); c.save(); c.translate(0, -(1 - p) * H); B(c); c.restore(); },
    pushL: (c, p, A, B, W) => { c.save(); c.translate(-p * W, 0); A(c); c.restore(); c.save(); c.translate((1 - p) * W, 0); B(c); c.restore(); },
    pushR: (c, p, A, B, W) => { c.save(); c.translate(p * W, 0); A(c); c.restore(); c.save(); c.translate(-(1 - p) * W, 0); B(c); c.restore(); },
    pushU: (c, p, A, B, W, H) => { c.save(); c.translate(0, -p * H); A(c); c.restore(); c.save(); c.translate(0, (1 - p) * H); B(c); c.restore(); },
    pushD: (c, p, A, B, W, H) => { c.save(); c.translate(0, p * H); A(c); c.restore(); c.save(); c.translate(0, -(1 - p) * H); B(c); c.restore(); },
    wipeL: (c, p, A, B, W, H) => { A(c); c.save(); rectsClip(c, [[0, 0, W * p, H]]); B(c); c.restore(); },
    wipeR: (c, p, A, B, W, H) => { A(c); c.save(); rectsClip(c, [[W * (1 - p), 0, W * p, H]]); B(c); c.restore(); },
    wipeU: (c, p, A, B, W, H) => { A(c); c.save(); rectsClip(c, [[0, H * (1 - p), W, H * p]]); B(c); c.restore(); },
    wipeD: (c, p, A, B, W, H) => { A(c); c.save(); rectsClip(c, [[0, 0, W, H * p]]); B(c); c.restore(); },
    zoomIn: (c, p, A, B, W, H) => { B(c); c.save(); c.globalAlpha = 1 - p; around(c, W, H, () => { const s = 1 + p * .8; c.scale(s, s); }); A(c); c.restore(); },
    zoomOut: (c, p, A, B, W, H) => { A(c); c.save(); c.globalAlpha = p; around(c, W, H, () => { const s = .5 + .5 * p; c.scale(s, s); }); B(c); c.restore(); },
    spin: (c, p, A, B, W, H) => { A(c); c.save(); c.globalAlpha = p; around(c, W, H, () => { c.rotate((1 - p) * PI); const s = .4 + .6 * p; c.scale(s, s); }); B(c); c.restore(); },
    flip: (c, p, A, B, W, H) => { c.save(); around(c, W, H, () => { c.scale(Math.max(.002, p < .5 ? 1 - 2 * p : 2 * p - 1), 1); }); (p < .5 ? A : B)(c); c.restore(); },
    cube: (c, p, A, B, W) => {
      c.save(); c.translate(-p * W, 0); c.translate(W, 0); c.scale(1 - .35 * p, 1); c.translate(-W, 0); A(c); c.restore();
      c.save(); c.translate((1 - p) * W, 0); c.scale(.65 + .35 * p, 1); B(c); c.restore();
    },
    pageTurn: (c, p, A, B, W, H) => {
      B(c); c.save(); const x = W * (1 - p), k = H * .18;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(x + k * (1 - p), 0); c.lineTo(x - k * p, H); c.lineTo(0, H); c.closePath(); c.clip(); A(c); c.restore();
      c.save(); const g = c.createLinearGradient(x - 24, 0, x + 6, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)');
      c.fillStyle = g; c.beginPath(); c.moveTo(x - 24 + k * (1 - p), 0); c.lineTo(x + 6 + k * (1 - p), 0); c.lineTo(x + 6 - k * p, H); c.lineTo(x - 24 - k * p, H); c.closePath(); c.fill(); c.restore();
    },
    circleOpen: (c, p, A, B, W, H) => { A(c); c.save(); c.beginPath(); c.arc(W / 2, H / 2, p * Math.hypot(W, H) / 2, 0, PI * 2); c.clip(); B(c); c.restore(); },
    circleClose: (c, p, A, B, W, H) => { B(c); c.save(); c.beginPath(); c.rect(0, 0, W, H); c.arc(W / 2, H / 2, (1 - p) * Math.hypot(W, H) / 2, 0, PI * 2, true); c.clip('evenodd'); A(c); c.restore(); },
    blinds: (c, p, A, B, W, H) => { A(c); c.save(); const n = 8, r = []; for (let i = 0; i < n; i++) r.push([0, i * H / n, W, H / n * p]); rectsClip(c, r); B(c); c.restore(); },
    vblinds: (c, p, A, B, W, H) => { A(c); c.save(); const n = 6, r = []; for (let i = 0; i < n; i++) r.push([i * W / n, 0, W / n * p, H]); rectsClip(c, r); B(c); c.restore(); },
    glitch: (c, p, A, B, W, H) => {
      const base = p < .5 ? A : B, other = p < .5 ? B : A, k = Math.sin(p * PI);
      base(c);
      for (let i = 0; i < 6; i++) {
        const y0 = rnd(i, Math.floor(p * 9)) * H, hh = H * (.03 + rnd(i, 7) * .08), dx = (rnd(i, Math.floor(p * 9) + 3) - .5) * W * .25 * k;
        c.save(); rectsClip(c, [[0, y0, W, hh]]); c.translate(dx, 0); (rnd(i, 5) > .5 ? other : base)(c); c.restore();
      }
    },
    flash: (c, p, A, B, W, H) => { (p < .5 ? A : B)(c); c.fillStyle = '#fff'; c.globalAlpha = p < .5 ? p * 2 : 2 - p * 2; c.fillRect(0, 0, W, H); c.globalAlpha = 1; },
    blur: (c, p, A, B, W, H) => {
      const first = p < .5, q = first ? p * 2 : (1 - p) * 2;
      fx.blurDraw(c, first ? A : B, W, H, 1 + q * 14);
    },
    dipBlack: (c, p, A, B, W, H) => { (p < .5 ? A : B)(c); c.fillStyle = '#000'; c.globalAlpha = p < .5 ? p * 2 : 2 - p * 2; c.fillRect(0, 0, W, H); c.globalAlpha = 1; },
    dipWhite: (c, p, A, B, W, H) => { (p < .5 ? A : B)(c); c.fillStyle = '#fff'; c.globalAlpha = p < .5 ? p * 2 : 2 - p * 2; c.fillRect(0, 0, W, H); c.globalAlpha = 1; },
    diagWipe: (c, p, A, B, W, H) => { A(c); c.save(); c.beginPath(); c.moveTo(0, 0); c.lineTo(2 * W * p, 0); c.lineTo(0, 2 * H * p); c.closePath(); c.clip(); B(c); c.restore(); },
    clock: (c, p, A, B, W, H) => { A(c); c.save(); c.beginPath(); c.moveTo(W / 2, H / 2); c.arc(W / 2, H / 2, Math.hypot(W, H), -PI / 2, -PI / 2 + PI * 2 * p); c.closePath(); c.clip(); B(c); c.restore(); },
    checker: (c, p, A, B, W, H) => {
      A(c); c.save(); const n = 6, m = Math.max(2, Math.round(n * H / W)), r = [], cw = W / n, ch = H / m;
      for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { const d = (i + j) / (n + m - 2), l = cl((p * 1.7 - d * .7)); const w = cw * l, h = ch * l; r.push([i * cw + (cw - w) / 2, j * ch + (ch - h) / 2, w, h]); }
      rectsClip(c, r); B(c); c.restore();
    },
    splitH: (c, p, A, B, W, H) => { A(c); c.save(); rectsClip(c, [[0, H / 2 * (1 - p), W, H * p]]); B(c); c.restore(); },
    splitV: (c, p, A, B, W, H) => { A(c); c.save(); rectsClip(c, [[W / 2 * (1 - p), 0, W * p, H]]); B(c); c.restore(); },
    heart: (c, p, A, B, W, H) => { A(c); c.save(); heartPath(c, W / 2, H / 2, p * Math.max(W, H) * 2.6); c.clip(); B(c); c.restore(); }
  };
  fx.TR_NAMES = {
    none: L('سیدھا کٹ', 'Cut'), fade: L('فیڈ', 'Fade'), dissolve: L('گھلنا', 'Dissolve'), slideL: L('سلائیڈ بائیں', 'Slide left'), slideR: L('سلائیڈ دائیں', 'Slide right'), slideU: L('سلائیڈ اوپر', 'Slide up'), slideD: L('سلائیڈ نیچے', 'Slide down'),
    pushL: L('دھکیلنا بائیں', 'Push left'), pushR: L('دھکیلنا دائیں', 'Push right'), pushU: L('دھکیلنا اوپر', 'Push up'), pushD: L('دھکیلنا نیچے', 'Push down'),
    wipeL: L('وائپ بائیں', 'Wipe left'), wipeR: L('وائپ دائیں', 'Wipe right'), wipeU: L('وائپ اوپر', 'Wipe up'), wipeD: L('وائپ نیچے', 'Wipe down'),
    zoomIn: L('زوم اِن', 'Zoom in'), zoomOut: L('زوم آؤٹ', 'Zoom out'), spin: L('گھومنا', 'Spin'), flip: L('پلٹنا', 'Flip'), cube: L('کیوب', 'Cube'), pageTurn: L('ورق پلٹنا', 'Page turn'),
    circleOpen: L('گول کھلنا', 'Circle open'), circleClose: L('گول بند', 'Circle close'), blinds: L('پردے', 'Blinds'), vblinds: L('کھڑے پردے', 'Vertical blinds'), glitch: L('گلچ', 'Glitch'), flash: L('چمک', 'Flash'), blur: L('دھندلا', 'Blur'),
    dipBlack: L('کالے میں', 'Dip to black'), dipWhite: L('سفید میں', 'Dip to white'), diagWipe: L('ترچھا', 'Diagonal'), clock: L('گھڑی', 'Clock'), checker: L('خانے', 'Checker'), splitH: L('افقی دروازہ', 'Split H'), splitV: L('عمودی دروازہ', 'Split V'), heart: L('دل', 'Heart')
  };
  fx.TR_LIST = Object.keys(fx.TR_NAMES);
  fx.TR_CUTE = ['fade', 'dissolve', 'slideL', 'slideR', 'pushL', 'pushR', 'zoomIn', 'wipeL', 'wipeR', 'circleOpen', 'blur', 'flash', 'spin', 'splitV', 'checker', 'cube'];

  /* =============== filters =============== */
  /* each filter is a set of CSS filter values plus an optional tint */
  const NEUT = { sepia: 0, saturate: 1, brightness: 1, contrast: 1, grayscale: 0, hue: 0 };
  fx.FILTERS = {
    none: { n: L('اصل', 'Original'), f: {} },
    warm: { n: L('گرم', 'Warm'), f: { sepia: .22, saturate: 1.2, brightness: 1.04 }, tint: ['#ff9a3c', .09, 'soft-light'] },
    cool: { n: L('ٹھنڈا', 'Cool'), f: { hue: -8, saturate: 1.1, brightness: 1.02 }, tint: ['#3c8cff', .1, 'soft-light'] },
    vintage: { n: L('پرانا', 'Vintage'), f: { sepia: .5, contrast: .92, saturate: .85, brightness: 1.04 }, vig: .35 },
    bw: { n: L('سیاہ و سفید', 'B&W'), f: { grayscale: 1, contrast: 1.15 } },
    cinematic: { n: L('فلمی', 'Cinematic'), f: { contrast: 1.15, saturate: 1.12, brightness: .95 }, tint: ['#0b3a52', .2, 'soft-light'], vig: .25 },
    vivid: { n: L('شوخ', 'Vivid'), f: { saturate: 1.5, contrast: 1.1 } },
    soft: { n: L('نرم', 'Soft'), f: { brightness: 1.08, contrast: .9, saturate: 1.05 } },
    sepia: { n: L('سیپیا', 'Sepia'), f: { sepia: 1 } },
    fade: { n: L('ہلکا', 'Faded'), f: { contrast: .8, brightness: 1.1, saturate: .7 } },
    dramatic: { n: L('ڈرامائی', 'Dramatic'), f: { contrast: 1.35, saturate: .9, brightness: .9 }, vig: .3 },
    golden: { n: L('سنہری', 'Golden'), f: { sepia: .35, saturate: 1.4, hue: -8, brightness: 1.05 }, tint: ['#ffc060', .12, 'soft-light'] },
    rose: { n: L('گلابی', 'Rose'), f: { saturate: 1.2, brightness: 1.05 }, tint: ['#ff6fa5', .12, 'soft-light'] },
    mint: { n: L('پودینہ', 'Mint'), f: { saturate: 1.1, hue: 12 }, tint: ['#40e0b0', .1, 'soft-light'] }
  };
  fx.FILTER_LIST = Object.keys(fx.FILTERS);
  fx.filterCSS = function (name, amt, adj) {
    const d = fx.FILTERS[name] || fx.FILTERS.none; const f = d.f || {}; amt = amt === undefined ? 1 : amt;
    const v = {}; Object.keys(NEUT).forEach(k => { v[k] = NEUT[k] + ((f[k] === undefined ? NEUT[k] : f[k]) - NEUT[k]) * amt; });
    if (adj) { v.brightness *= adj.b || 1; v.contrast *= adj.c || 1; v.saturate *= adj.s || 1; }
    const parts = [];
    if (v.sepia > .01) parts.push('sepia(' + v.sepia.toFixed(2) + ')');
    if (Math.abs(v.saturate - 1) > .01) parts.push('saturate(' + v.saturate.toFixed(2) + ')');
    if (Math.abs(v.brightness - 1) > .01) parts.push('brightness(' + v.brightness.toFixed(2) + ')');
    if (Math.abs(v.contrast - 1) > .01) parts.push('contrast(' + v.contrast.toFixed(2) + ')');
    if (v.grayscale > .01) parts.push('grayscale(' + v.grayscale.toFixed(2) + ')');
    if (Math.abs(v.hue) > .5) parts.push('hue-rotate(' + v.hue.toFixed(0) + 'deg)');
    return parts.length ? parts.join(' ') : 'none';
  };
  /* tint and vignette that go on top of the whole frame */
  let vigCache = {};
  fx.vignette = function (c, W, H, a) {
    const key = W + 'x' + H; let g = vigCache[key];
    if (!g || g.c !== c) { g = { c, g: c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.hypot(W, H) * .55) }; g.g.addColorStop(0, 'rgba(0,0,0,0)'); g.g.addColorStop(1, 'rgba(0,0,0,1)'); vigCache = {}; vigCache[key] = g; }
    c.save(); c.globalAlpha = cl(a); c.fillStyle = g.g; c.fillRect(0, 0, W, H); c.restore();
  };
  fx.filterTop = function (c, name, amt, W, H) {
    const d = fx.FILTERS[name]; if (!d || name === 'none') return;
    if (d.tint) { c.save(); c.globalCompositeOperation = d.tint[2]; c.globalAlpha = cl(d.tint[1] * amt * 2); c.fillStyle = d.tint[0]; c.fillRect(0, 0, W, H); c.restore(); }
    if (d.vig) fx.vignette(c, W, H, d.vig * amt);
  };

  /* =============== overlays =============== */
  const COLS = ['#ff5a7a', '#ffd166', '#5ad1ff', '#7cf29a', '#c58bff', '#ffffff'];
  const star4 = (c, x, y, r) => { c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * PI / 4, rr = i % 2 ? r * .28 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); };
  const star5 = (c, x, y, r) => { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * .42 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); };
  let noise = null, noiseT = -1;
  function grain(c, t, W, H, a) {
    if (!noise) { noise = document.createElement('canvas'); noise.width = noise.height = 128; }
    const k = Math.floor(t * 12);
    if (k !== noiseT) {
      noiseT = k; const x = noise.getContext('2d'), id = x.createImageData(128, 128), d = id.data;
      for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255 | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
      x.putImageData(id, 0, 0);
    }
    c.save(); c.globalAlpha = cl(.13 * a); c.globalCompositeOperation = 'overlay';
    const sc = Math.max(1, W / 360), ox = rnd(k, 1) * 128, oy = rnd(k, 2) * 128;
    for (let y = -oy * sc; y < H; y += 128 * sc) for (let x = -ox * sc; x < W; x += 128 * sc) c.drawImage(noise, x, y, 128 * sc, 128 * sc);
    c.restore();
  }
  fx.OVL = {
    confetti: (c, t, W, H, a) => {
      const n = Math.round(60 * a);
      for (let i = 0; i < n; i++) {
        const sp = .12 + rnd(i, 2) * .2, ph = rnd(i, 3), y = (((ph + t * sp) % 1.1) - .05) * H, x = rnd(i, 1) * W + Math.sin(t * 2 + i) * W * .02;
        const w = W * .017 * (.7 + rnd(i, 4)), h = w * 1.8;
        c.save(); c.translate(x, y); c.rotate(t * (1 + rnd(i, 5) * 4) + i); c.scale(1, Math.cos(t * (3 + rnd(i, 6) * 4) + i)); c.fillStyle = COLS[i % COLS.length]; c.fillRect(-w / 2, -h / 2, w, h); c.restore();
      }
    },
    stars: (c, t, W, H, a) => {
      const n = Math.round(28 * a);
      for (let i = 0; i < n; i++) {
        const x = rnd(i, 1) * W, y = rnd(i, 2) * H, al = .5 + .5 * Math.sin(t * (1.5 + rnd(i, 3) * 3) + i * 3), r = W * (.008 + rnd(i, 4) * .016) * (.5 + al);
        c.save(); c.globalAlpha = al * .95; c.fillStyle = i % 3 ? '#fff6c9' : '#ffffff'; c.shadowColor = '#fff3b0'; c.shadowBlur = r * 1.6; star4(c, x, y, r); c.fill(); c.restore();
      }
    },
    hearts: (c, t, W, H, a) => {
      const n = Math.round(16 * a);
      for (let i = 0; i < n; i++) {
        const sp = .08 + rnd(i, 2) * .1, ph = rnd(i, 3), pp = ((ph + t * sp) % 1.15), y = H * (1.05 - pp), x = rnd(i, 1) * W + Math.sin(t * 1.5 + i * 2) * W * .04, s = W * (.05 + rnd(i, 4) * .06);
        c.save(); c.globalAlpha = cl(1 - Math.max(0, pp - .8) * 4) * .85; c.fillStyle = i % 2 ? '#ff4f7b' : '#ff8fb1'; heartPath(c, x, y, s); c.fill(); c.restore();
      }
    },
    petals: (c, t, W, H, a) => {
      const n = Math.round(22 * a);
      for (let i = 0; i < n; i++) {
        const sp = .05 + rnd(i, 2) * .06, y = (((rnd(i, 3) + t * sp) % 1.1) - .05) * H, x = rnd(i, 1) * W + Math.sin(t * .9 + i) * W * .06, s = W * (.012 + rnd(i, 4) * .012);
        c.save(); c.translate(x, y); c.rotate(t * (.5 + rnd(i, 5)) + i); c.scale(1, .5 + .5 * Math.abs(Math.sin(t + i))); c.fillStyle = i % 3 ? '#ffc2d4' : '#fff0f5'; c.beginPath(); c.ellipse(0, 0, s * 1.6, s, 0, 0, PI * 2); c.fill(); c.restore();
      }
    },
    rain: (c, t, W, H, a) => {
      const n = Math.round(60 * a); c.save(); c.strokeStyle = 'rgba(200,220,255,.55)'; c.lineWidth = Math.max(1, W / 540);
      for (let i = 0; i < n; i++) {
        const sp = 1.1 + rnd(i, 2) * .6, y = (((rnd(i, 3) + t * sp) % 1.1) - .05) * H, x = rnd(i, 1) * W + y * .12, l = H * .035;
        c.beginPath(); c.moveTo(x, y); c.lineTo(x - l * .12, y + l); c.stroke();
      }
      c.restore();
    },
    snow: (c, t, W, H, a) => {
      const n = Math.round(50 * a); c.save(); c.fillStyle = 'rgba(255,255,255,.88)';
      for (let i = 0; i < n; i++) {
        const sp = .04 + rnd(i, 2) * .06, y = (((rnd(i, 3) + t * sp) % 1.1) - .05) * H, x = rnd(i, 1) * W + Math.sin(t * .8 + i * 5) * W * .03, r = W * (.003 + rnd(i, 4) * .008);
        c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill();
      }
      c.restore();
    },
    sparks: (c, t, W, H, a) => {
      const n = Math.round(34 * a); c.save(); c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < n; i++) {
        const sp = .12 + rnd(i, 2) * .15, pp = (rnd(i, 3) + t * sp) % 1, y = H * (1 - pp), x = rnd(i, 1) * W + Math.sin(t * 3 + i) * W * .02, r = W * (.003 + rnd(i, 4) * .005);
        c.globalAlpha = (1 - pp) * .9; c.fillStyle = i % 2 ? '#ffb347' : '#ff7a3c'; c.shadowColor = '#ff8a3c'; c.shadowBlur = r * 4; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill();
      }
      c.restore();
    },
    bokeh: (c, t, W, H, a) => {
      const n = Math.round(12 * a); c.save(); c.globalCompositeOperation = 'screen';
      for (let i = 0; i < n; i++) {
        const x = (rnd(i, 1) + Math.sin(t * .2 + i) * .05) * W, y = (rnd(i, 2) + Math.cos(t * .17 + i * 2) * .05) * H, r = W * (.05 + rnd(i, 3) * .1);
        const g = c.createRadialGradient(x, y, 0, x, y, r); const col = ['255,220,150', '255,170,200', '170,210,255', '255,255,255'][i % 4];
        g.addColorStop(0, 'rgba(' + col + ',' + (.28 * (.6 + .4 * Math.sin(t + i))) + ')'); g.addColorStop(1, 'rgba(' + col + ',0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill();
      }
      c.restore();
    },
    lightleak: (c, t, W, H, a) => {
      c.save(); c.globalCompositeOperation = 'screen';
      const x1 = W * (.15 + .7 * (.5 + .5 * Math.sin(t * .45))), y1 = H * .25, g1 = c.createRadialGradient(x1, y1, 0, x1, y1, W * .9);
      g1.addColorStop(0, 'rgba(255,140,60,' + .55 * a * (.6 + .4 * Math.sin(t * 1.3)) + ')'); g1.addColorStop(1, 'rgba(255,140,60,0)'); c.fillStyle = g1; c.fillRect(0, 0, W, H);
      const x2 = W * (.85 - .6 * (.5 + .5 * Math.sin(t * .33))), y2 = H * .8, g2 = c.createRadialGradient(x2, y2, 0, x2, y2, W * .8);
      g2.addColorStop(0, 'rgba(255,80,160,' + .4 * a * (.6 + .4 * Math.cos(t * 1.1)) + ')'); g2.addColorStop(1, 'rgba(255,80,160,0)'); c.fillStyle = g2; c.fillRect(0, 0, W, H); c.restore();
    },
    grain: (c, t, W, H, a) => { grain(c, t, W, H, a * 1.4); },
    vignette: (c, t, W, H, a) => { fx.vignette(c, W, H, .75 * a); },
    vhs: (c, t, W, H, a) => {
      c.save(); c.fillStyle = 'rgba(0,0,0,' + .16 * a + ')'; for (let y = 0; y < H; y += 5) c.fillRect(0, y, W, 2);
      const k = Math.floor(t * 8); if (rnd(k, 1) > .6) { const y0 = rnd(k, 2) * H, hh = H * .04; try { c.drawImage(c.canvas, 0, y0, W, hh, (rnd(k, 3) - .5) * W * .06, y0, W, hh); } catch (e) { /* ignore */ } }
      c.globalCompositeOperation = 'screen'; c.fillStyle = 'rgba(255,0,60,' + .04 * a + ')'; c.fillRect(0, 0, W * .5, H); c.fillStyle = 'rgba(0,120,255,' + .04 * a + ')'; c.fillRect(W * .5, 0, W * .5, H); c.restore();
      grain(c, t, W, H, a * .8);
    },
    film: (c, t, W, H, a) => {
      grain(c, t, W, H, a * 1.6); fx.vignette(c, W, H, .4 * a);
      const k = Math.floor(t * 14); c.save(); c.strokeStyle = 'rgba(255,255,255,' + .25 * a + ')'; c.lineWidth = 1;
      if (rnd(k, 5) > .55) { const x = rnd(k, 6) * W; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + (rnd(k, 7) - .5) * 6, H); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,' + (rnd(k, 8) * .05 * a) + ')'; c.fillRect(0, 0, W, H); c.restore();
    }
  };
  fx.OVL_NAMES = { none: L('کوئی نہیں', 'None'), confetti: L('کنفیٹی', 'Confetti'), stars: L('ستارے', 'Stars'), hearts: L('دل', 'Hearts'), petals: L('پھول کی پتیاں', 'Petals'), rain: L('بارش', 'Rain'), snow: L('برف', 'Snow'), sparks: L('چنگاریاں', 'Sparks'), bokeh: L('بوکے', 'Bokeh'), lightleak: L('روشنی کی لہر', 'Light leak'), grain: L('گرین', 'Film grain'), vignette: L('کنارے گہرے', 'Vignette'), vhs: L('VHS', 'VHS'), film: L('پرانی فلم', 'Old film') };
  fx.OVL_LIST = Object.keys(fx.OVL_NAMES);

  /* =============== stickers =============== */
  fx.EMOJI = ['❤️', '💖', '💕', '✨', '⭐', '🌟', '🌙', '☪️', '🕌', '🕋', '🤲', '📿', '🌹', '🌸', '🌺', '🌼', '🍃', '🎉', '🎊', '🎈', '🎁', '🎂', '🥳', '😍', '😂', '🥰', '😎', '🤩', '👍', '👏', '🙏', '💐', '🌈', '☀️', '🌅', '⛰️', '🏔️', '🌊', '🚗', '✈️', '🏖️', '🏕️', '📸', '🎵', '🎶', '🔥', '💯', '👑', '💍', '💒', '👶', '🧿', '🍰', '☕', '🌴', '🦋'];
  const V = {
    heart: (c, s) => { c.fillStyle = '#ff4f7b'; heartPath(c, 0, 0, s * 1.6); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-s * .28, -s * .22, s * .1, s * .06, -.6, 0, PI * 2); c.fill(); },
    star: (c, s) => { c.fillStyle = '#ffd24a'; c.strokeStyle = '#ffb300'; c.lineWidth = s * .05; star5(c, 0, 0, s * .55); c.fill(); c.stroke(); },
    crescent: (c, s) => { c.fillStyle = '#ffe08a'; c.beginPath(); c.arc(0, 0, s * .5, 0, PI * 2); c.fill(); c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(s * .2, -s * .05, s * .42, 0, PI * 2); c.fill(); c.globalCompositeOperation = 'source-over'; c.fillStyle = '#ffe08a'; star5(c, s * .22, -s * .08, s * .13); c.fill(); },
    sparkle: (c, s) => { c.fillStyle = '#fff3b0'; c.shadowColor = '#ffd86b'; c.shadowBlur = s * .3; star4(c, 0, 0, s * .55); c.fill(); star4(c, s * .32, -s * .3, s * .17); c.fill(); },
    lantern: (c, s) => { c.strokeStyle = '#ffd36b'; c.lineWidth = s * .05; c.beginPath(); c.moveTo(0, -s * .55); c.lineTo(0, -s * .38); c.stroke(); c.fillStyle = '#ffb347'; c.beginPath(); c.roundRect ? c.roundRect(-s * .2, -s * .38, s * .4, s * .66, s * .12) : c.rect(-s * .2, -s * .38, s * .4, s * .66); c.fill(); c.fillStyle = '#ffe9a8'; c.beginPath(); c.ellipse(0, -s * .05, s * .09, s * .2, 0, 0, PI * 2); c.fill(); c.fillStyle = '#c77d1a'; c.fillRect(-s * .24, -s * .42, s * .48, s * .06); c.fillRect(-s * .24, s * .26, s * .48, s * .06); },
    arch: (c, s) => { c.strokeStyle = '#ffd36b'; c.lineWidth = s * .07; c.fillStyle = 'rgba(255,211,107,.15)'; c.beginPath(); c.moveTo(-s * .35, s * .5); c.lineTo(-s * .35, -s * .05); c.bezierCurveTo(-s * .35, -s * .35, -s * .1, -s * .45, 0, -s * .6); c.bezierCurveTo(s * .1, -s * .45, s * .35, -s * .35, s * .35, -s * .05); c.lineTo(s * .35, s * .5); c.closePath(); c.fill(); c.stroke(); },
    flower: (c, s) => { for (let i = 0; i < 6; i++) { c.save(); c.rotate(i * PI / 3); c.fillStyle = i % 2 ? '#ff9ec2' : '#ffc2d8'; c.beginPath(); c.ellipse(0, -s * .26, s * .14, s * .26, 0, 0, PI * 2); c.fill(); c.restore(); } c.fillStyle = '#ffd24a'; c.beginPath(); c.arc(0, 0, s * .13, 0, PI * 2); c.fill(); },
    ring: (c, s) => { c.strokeStyle = '#ffd24a'; c.lineWidth = s * .09; c.beginPath(); c.arc(0, s * .1, s * .3, 0, PI * 2); c.stroke(); c.fillStyle = '#7fdcff'; c.beginPath(); c.moveTo(0, -s * .32); c.lineTo(s * .13, -s * .2); c.lineTo(0, -s * .06); c.lineTo(-s * .13, -s * .2); c.closePath(); c.fill(); },
    arrow: (c, s) => { c.fillStyle = '#ffffff'; c.strokeStyle = '#000'; c.lineWidth = s * .03; c.beginPath(); c.moveTo(-s * .5, -s * .12); c.lineTo(s * .1, -s * .12); c.lineTo(s * .1, -s * .3); c.lineTo(s * .5, 0); c.lineTo(s * .1, s * .3); c.lineTo(s * .1, s * .12); c.lineTo(-s * .5, s * .12); c.closePath(); c.fill(); c.stroke(); },
    bubble: (c, s) => { c.fillStyle = '#fff'; c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = s * .03; c.beginPath(); c.moveTo(-s * .5, -s * .25); c.quadraticCurveTo(-s * .5, -s * .4, -s * .35, -s * .4); c.lineTo(s * .35, -s * .4); c.quadraticCurveTo(s * .5, -s * .4, s * .5, -s * .25); c.lineTo(s * .5, s * .1); c.quadraticCurveTo(s * .5, s * .25, s * .35, s * .25); c.lineTo(-s * .1, s * .25); c.lineTo(-s * .3, s * .45); c.lineTo(-s * .28, s * .25); c.lineTo(-s * .35, s * .25); c.quadraticCurveTo(-s * .5, s * .25, -s * .5, s * .1); c.closePath(); c.fill(); c.stroke(); }
  };
  fx.VEC_NAMES = ['heart', 'star', 'crescent', 'sparkle', 'lantern', 'arch', 'flower', 'ring', 'arrow', 'bubble'];
  const FR = {
    gold: (c, W, H) => { const m = W * .035; c.strokeStyle = '#e6b54a'; c.lineWidth = W * .012; c.strokeRect(m, m, W - 2 * m, H - 2 * m); c.lineWidth = W * .004; c.strokeRect(m * 1.8, m * 1.8, W - 3.6 * m, H - 3.6 * m); [[m, m], [W - m, m], [m, H - m], [W - m, H - m]].forEach(p => { c.fillStyle = '#ffd36b'; c.beginPath(); c.arc(p[0], p[1], W * .014, 0, PI * 2); c.fill(); }); },
    polaroid: (c, W, H) => { c.fillStyle = '#fbfbfb'; const b = W * .05, bb = H * .12; c.beginPath(); c.rect(0, 0, W, H); c.rect(b, b, W - 2 * b, H - b - bb); c.fill('evenodd'); },
    rounded: (c, W, H) => { const r = W * .08, m = W * .02; c.fillStyle = '#000'; c.beginPath(); c.rect(0, 0, W, H); c.roundRect ? c.roundRect(m, m, W - 2 * m, H - 2 * m, r) : c.rect(m, m, W - 2 * m, H - 2 * m); c.fill('evenodd'); },
    film: (c, W, H) => { const b = W * .075; c.fillStyle = '#0a0a0a'; c.fillRect(0, 0, b, H); c.fillRect(W - b, 0, b, H); c.fillStyle = '#d8d8d8'; const n = Math.round(H / (b * 1.3)); for (let i = 0; i < n; i++) { const y = (i + .5) * H / n - b * .2; c.fillRect(b * .25, y, b * .5, b * .4); c.fillRect(W - b * .75, y, b * .5, b * .4); } },
    arches: (c, W, H) => { c.strokeStyle = '#ffd36b'; c.lineWidth = W * .01; const n = 5, w = W / n; for (let i = 0; i < n; i++) { c.beginPath(); c.moveTo(i * w, H * .09); c.quadraticCurveTo(i * w + w / 2, -H * .03, (i + 1) * w, H * .09); c.stroke(); c.beginPath(); c.moveTo(i * w, H * .91); c.quadraticCurveTo(i * w + w / 2, H * 1.03, (i + 1) * w, H * .91); c.stroke(); } }
  };
  fx.FRAME_NAMES = Object.keys(FR);
  fx.STICKER_ANIMS = { none: L('کوئی نہیں', 'None'), pop: L('پاپ', 'Pop in'), bounce: L('اچھلنا', 'Bounce'), pulse: L('دھڑکنا', 'Pulse'), spin: L('گھومنا', 'Spin'), float: L('تیرنا', 'Float'), swing: L('جھولنا', 'Swing') };
  /* st: {ref:'e:❤️'|'v:heart'|'f:gold', x,y (0..1), size (% of width), rot (deg), anim, x1,y1 (optional end point)} */
  fx.drawStickerStatic = function (c, ref, cx, cy, size) {
    c.save(); c.translate(cx, cy); const k = ref.slice(0, 2), v = ref.slice(2);
    if (k === 'e:') { c.font = size * .9 + 'px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(v, 0, size * .04); }
    else if (k === 'v:' && V[v]) V[v](c, size);
    c.restore();
  };
  fx.drawSticker = function (c, st, t, t0, t1, W, H) {
    const u = t - t0, dur = t1 - t0, k = st.ref.slice(0, 2), v = st.ref.slice(2);
    if (k === 'f:') { c.save(); c.globalAlpha = cl(Math.min(u / .3, (t1 - t) / .3)); if (FR[v]) FR[v](c, W, H); c.restore(); return null; }
    let x = st.x, y = st.y;
    if (st.x1 !== undefined && st.x1 !== null) { const p = eio(cl(u / Math.max(.2, dur))); x = st.x + (st.x1 - st.x) * p; y = st.y + (st.y1 - st.y) * p; }
    let s = st.size / 100 * W, a = 1, r = (st.rot || 0) * PI / 180, ty = 0;
    const an = st.anim || 'pop';
    if (an === 'pop' || an === 'bounce' || an === 'pulse' || an === 'spin' || an === 'float' || an === 'swing') {
      if (u < .5) s *= Math.max(.01, ob(cl(u / .5)));
    }
    if (an === 'bounce') ty = -Math.abs(Math.sin(u * 5)) * s * .22;
    if (an === 'pulse') s *= 1 + .08 * Math.sin(u * 6);
    if (an === 'spin') r += u * 2.2;
    if (an === 'float') ty = Math.sin(u * 2) * s * .12;
    if (an === 'swing') r += Math.sin(u * 3) * .35;
    a = cl(Math.min(1, (t1 - t) / .3));
    c.save(); c.globalAlpha = a; c.translate(x * W, y * H + ty); c.rotate(r); fx.drawStickerStatic(c, st.ref, 0, 0, s); c.restore();
    return { x: x * W, y: y * H + ty, w: s * 1.1, h: s * 1.1 };
  };

  /* =============== text =============== */
  fx.FONTS = {
    sans: { n: L('سادہ', 'Clean'), css: 'system-ui,"Segoe UI",Roboto,"Noto Naskh Arabic",sans-serif' },
    naskh: { n: L('نسخ', 'Naskh'), css: '"CSNaskh","Noto Naskh Arabic",serif' },
    serif: { n: L('کلاسک', 'Serif'), css: 'Georgia,"Times New Roman","CSNaskh",serif' },
    hand: { n: L('ہاتھ کا', 'Hand'), css: '"Comic Sans MS","Segoe Script",cursive,"CSNaskh"' },
    mono: { n: L('ٹائپ', 'Mono'), css: '"Courier New",monospace,"CSNaskh"' }
  };
  fx.TXT_IN = { none: L('کوئی نہیں', 'None'), fade: L('فیڈ', 'Fade'), slideU: L('نیچے سے', 'Slide up'), slideD: L('اوپر سے', 'Slide down'), slideL: L('بائیں سے', 'From left'), slideR: L('دائیں سے', 'From right'), zoom: L('زوم', 'Zoom'), pop: L('پاپ', 'Pop'), bounce: L('اچھلنا', 'Bounce'), type: L('ٹائپ', 'Typewriter'), words: L('لفظ بہ لفظ', 'Word by word') };
  fx.TXT_MID = { none: L('کوئی نہیں', 'None'), glow: L('چمک', 'Glow'), wave: L('لہر', 'Wave'), float: L('تیرنا', 'Float'), color: L('رنگ بدلنا', 'Color shift') };
  fx.TXT_OUT = { none: L('کوئی نہیں', 'None'), fade: L('فیڈ', 'Fade'), slideD: L('نیچے', 'Down'), slideU: L('اوپر', 'Up'), zoom: L('زوم', 'Zoom') };
  const lcache = new Map();
  function layout(c, it, W) {
    const px = Math.max(8, it.size / 100 * W), key = [it.text, it.font, it.bold ? 1 : 0, Math.round(px), it.w, W].join('|');
    let r = lcache.get(key); if (r) return r;
    const rtl = S.isRTL(it.text), fam = (fx.FONTS[it.font] || fx.FONTS.sans).css;
    c.save(); c.font = (it.bold ? '700 ' : '') + px + 'px ' + fam;
    const maxW = (it.w || .86) * W, sp = c.measureText(' ').width, lines = [];
    String(it.text || '').split('\n').forEach(par => {
      const ws = par.split(/\s+/).filter(Boolean); let cur = [], cw = 0;
      const flush = () => { if (cur.length) { lines.push({ ws: cur, w: cw }); } cur = []; cw = 0; };
      ws.forEach(w => { const m = c.measureText(w).width; if (cur.length && cw + sp + m > maxW) flush(); cw += (cur.length ? sp : 0) + m; cur.push({ t: w, w: m }); });
      flush(); if (!ws.length) lines.push({ ws: [], w: 0 });
    });
    const lh = px * (rtl ? 1.75 : 1.32); let mw = 0, idx = 0, chars = 0;
    lines.forEach(l => { mw = Math.max(mw, l.w); let cum = 0; l.ws.forEach((w, i) => { w.x = rtl ? l.w - cum - w.w : cum; cum += w.w + sp; w.i = idx++; w.c0 = chars; chars += w.t.length; }); });
    r = { lines, px, fam, rtl, lh, w: mw, h: lines.length * lh, n: idx, chars };
    c.restore(); if (lcache.size > 80) lcache.clear(); lcache.set(key, r); return r;
  }
  fx.drawText = function (c, it, t, t0, t1, W, H) {
    const u = t - t0, tin = it.inDur || .6, tout = .45;
    const pin = cl(u / tin), pout = cl((t1 - t) / tout), L1 = layout(c, it, W);
    let a = 1, tx = 0, ty = 0, sc = 1, reveal = 1e9, revealChars = false;
    const ai = it.in || 'fade', ao = it.out || 'fade', am = it.mid || 'none', px = L1.px;
    if (ai === 'fade') a *= eo(pin); else if (ai === 'slideU') { ty += (1 - eo(pin)) * px * 1.6; a *= eo(pin); } else if (ai === 'slideD') { ty -= (1 - eo(pin)) * px * 1.6; a *= eo(pin); } else if (ai === 'slideL') { tx -= (1 - eo(pin)) * W * .3; a *= eo(pin); } else if (ai === 'slideR') { tx += (1 - eo(pin)) * W * .3; a *= eo(pin); } else if (ai === 'zoom') { sc *= .4 + .6 * eo(pin); a *= eo(pin); } else if (ai === 'pop') { sc *= Math.max(.01, ob(pin)); a *= cl(pin * 5); } else if (ai === 'bounce') { ty -= (1 - obn(pin)) * px * 2.4; a *= cl(pin * 4); }
    else if (ai === 'type') { const q = cl(u / Math.max(.4, Math.min(2.2, L1.chars * .06))); if (L1.rtl) { reveal = Math.ceil(q * L1.n); } else { reveal = 1e9; revealChars = Math.floor(q * L1.chars + .5); } }
    else if (ai === 'words') { const q = cl(u / Math.max(.5, Math.min(2.5, L1.n * .28))); reveal = Math.ceil(q * L1.n); }
    if (ao === 'fade') a *= eo(pout); else if (ao === 'slideD') { ty += (1 - eo(pout)) * px; a *= eo(pout); } else if (ao === 'slideU') { ty -= (1 - eo(pout)) * px; a *= eo(pout); } else if (ao === 'zoom') { sc *= .5 + .5 * eo(pout); a *= eo(pout); }
    if (am === 'float') ty += Math.sin(u * 2) * px * .15;
    if (a <= .001) return null;
    const x = it.x * W + tx, y = it.y * H + ty;
    c.save(); c.globalAlpha = cl(a); c.translate(x, y); c.scale(sc, sc);
    if (it.rot) c.rotate(it.rot * PI / 180);
    const hw = L1.w / 2, hh = L1.h / 2, pad = px * .35;
    if (it.bg) { c.fillStyle = it.bg; c.beginPath(); const bx = -hw - pad, by = -hh - pad * .5, bw = L1.w + pad * 2, bh = L1.h + pad; if (c.roundRect) c.roundRect(bx, by, bw, bh, px * .35); else c.rect(bx, by, bw, bh); c.fill(); }
    c.font = (it.bold ? '700 ' : '') + px + 'px ' + L1.fam; c.textBaseline = 'middle'; c.textAlign = 'left'; c.direction = L1.rtl ? 'rtl' : 'ltr';
    let col = it.color || '#fff';
    if (am === 'color') col = 'hsl(' + ((u * 90) % 360 | 0) + ',90%,70%)';
    if (it.shadow !== false && !it.bg) { c.shadowColor = 'rgba(0,0,0,.65)'; c.shadowBlur = px * .18; c.shadowOffsetY = px * .05; }
    if (am === 'glow') { c.shadowColor = it.color || '#fff'; c.shadowBlur = px * (.25 + .25 * Math.sin(u * 4)); c.shadowOffsetY = 0; }
    L1.lines.forEach((ln, li) => {
      const ly = -hh + li * L1.lh + L1.lh / 2, lx0 = -ln.w / 2;
      ln.ws.forEach(w => {
        if (w.i >= reveal) return;
        let txt = w.t;
        if (revealChars !== false) { const rem = revealChars - w.c0; if (rem <= 0) return; if (rem < w.t.length) txt = w.t.slice(0, rem); }
        let wy = ly; if (am === 'wave') wy += Math.sin(u * 4 + w.i * .8) * px * .16;
        if (it.stroke) { c.lineWidth = px * .12; c.lineJoin = 'round'; c.strokeStyle = it.stroke; c.strokeText(txt, lx0 + w.x, wy); }
        c.fillStyle = col; c.fillText(txt, lx0 + w.x, wy);
      });
    });
    c.restore();
    return { x, y, w: (L1.w + pad * 2) * sc, h: (L1.h + pad) * sc };
  };

  /* =============== misc =============== */
  fx.roundRect = function (c, x, y, w, h, r) { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); };
  fx.credit = function (c, W, H, t, t1, text) {
    const a = cl(Math.min((t - (t1 - 2.2)) / .5, (t1 - t) / .4)); if (a <= 0) return;
    c.save(); c.globalAlpha = a; c.fillStyle = '#fff'; c.shadowColor = 'rgba(0,0,0,.7)'; c.shadowBlur = W * .01; c.font = '600 ' + (W * .034) + 'px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'ltr'; c.fillText(text, W / 2, H * .94); c.restore();
  };
})();
