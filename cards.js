/* Cleanova Studio - designed scenes: themes, card types, highlight frame, lower-third, ticker, brand bar. Developed by SMAA */
(function () {
  'use strict';
  const S = window.Studio, FX = S.fx;
  const C = S.cards = {};
  const PI = Math.PI;
  const cl = (v, a, b) => Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, v));
  const eo = p => 1 - Math.pow(1 - p, 3);
  const ob = p => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
  const L = (u, e) => [u, e];

  /* =============== themes =============== */
  C.THEMES = {
    neon: { n: L('نیون', 'Neon'), c1: '#12063a', c2: '#0a1a4a', a1: '#ff4fa3', a2: '#35d6ff', a3: '#ffd24a', fx: 'glow' },
    social: { n: L('سوشل', 'Social'), c1: '#10052e', c2: '#2a0b5e', a1: '#a855ff', a2: '#22d3ee', a3: '#ffe14a', fx: 'glow' },
    gold: { n: L('سنہری', 'Golden'), c1: '#2a0a14', c2: '#4a1428', a1: '#ffd36b', a2: '#ff9ec2', a3: '#fff1c1', fx: 'sparkle' },
    green: { n: L('سبز / اسلامی', 'Green / Islamic'), c1: '#04251e', c2: '#0b3d3a', a1: '#2fe0b0', a2: '#ffe08a', a3: '#ffffff', fx: 'stars' },
    news: { n: L('خبر', 'News'), c1: '#0a1020', c2: '#17274d', a1: '#ff3b4a', a2: '#4aa8ff', a3: '#ffd24a', fx: 'grid' },
    promo: { n: L('پروموشن', 'Promo'), c1: '#1d0b05', c2: '#40160a', a1: '#ff8a3d', a2: '#ffd24a', a3: '#ffffff', fx: 'glow' },
    sunset: { n: L('عید / غروب', 'Eid / Sunset'), c1: '#0f1a3d', c2: '#3a1a5c', a1: '#ffb347', a2: '#ff6fb5', a3: '#ffe9a8', fx: 'stars' },
    rose: { n: L('گلابی', 'Rose'), c1: '#2b0a2e', c2: '#5a1457', a1: '#ff6fb5', a2: '#ffd24a', a3: '#ffffff', fx: 'sparkle' },
    ocean: { n: L('سمندر', 'Ocean'), c1: '#03182e', c2: '#06406b', a1: '#2ee6d6', a2: '#6fb7ff', a3: '#ffffff', fx: 'glow' }
  };
  C.THEME_LIST = Object.keys(C.THEMES);
  const th = p => C.THEMES[p && p.theme] || C.THEMES.neon;

  /* =============== drawing helpers =============== */
  const fontOf = t => (S.isRTL(t) ? '"CSNaskh","Noto Naskh Arabic",serif' : 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif');
  const rr = (c, x, y, w, h, r) => { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2))); else c.rect(x, y, w, h); };
  const lines = s => String(s || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const cols = s => String(s || '').split('|').map(x => x.trim());
  const EM = /^((?:\p{Extended_Pictographic}|️|‍)+)\s*/u;
  const splitIcon = s => { const m = EM.exec(s); return m ? { icon: m[1], rest: s.slice(m[0].length) } : { icon: '', rest: s }; };
  C.lines = lines; C.cols = cols;
  const logos = {};
  C.logoImg = src => { if (!src) return null; let e = logos[src]; if (!e) { e = logos[src] = { img: new Image(), ok: false }; e.img.onload = () => { e.ok = true; }; e.img.src = src; } return e.ok ? e.img : null; };

  /* text: o {color, grad:[a,b], w, align, maxW, glow, sp, stroke, italic} returns the size used */
  function T(c, text, x, y, size, o) {
    text = String(text == null ? '' : text); if (!text) return size; o = o || {};
    const fam = fontOf(text); let sz = size; const f = z => (o.italic ? 'italic ' : '') + (o.w || 800) + ' ' + z + 'px ' + fam;
    c.save(); c.font = f(sz); c.textBaseline = 'middle'; c.textAlign = o.align || 'center'; c.direction = S.isRTL(text) ? 'rtl' : 'ltr';
    if ('letterSpacing' in c) c.letterSpacing = (S.isRTL(text) ? 0 : (o.sp || 0)) + 'px';
    let w = c.measureText(text).width;
    if (o.maxW) { while (w > o.maxW && sz > size * .4) { sz *= .94; c.font = f(sz); w = c.measureText(text).width; } }
    let fs = o.color || '#fff';
    if (o.grad) { const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, o.grad[0]); g.addColorStop(1, o.grad[1]); fs = g; }
    if (o.glow) { c.shadowColor = o.glow; c.shadowBlur = sz * .35; }
    if (o.stroke) { c.lineWidth = sz * .08; c.strokeStyle = o.stroke; c.lineJoin = 'round'; c.strokeText(text, x, y); }
    c.fillStyle = fs; c.fillText(text, x, y); c.restore(); return sz;
  }
  /* wrapped paragraph, returns height used */
  function P(c, text, x, y, size, maxW, o) {
    o = o || {}; text = String(text || ''); if (!text) return 0; const fam = fontOf(text); c.save(); c.font = (o.italic ? 'italic ' : '') + (o.w || 700) + ' ' + size + 'px ' + fam;
    const words = text.split(/\s+/), ls = []; let cur = '';
    words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > maxW && cur) { ls.push(cur); cur = w; } else cur = t; }); if (cur) ls.push(cur); c.restore();
    const lh = size * (S.isRTL(text) ? 1.75 : 1.3), max = o.maxLines || 99; ls.slice(0, max).forEach((l, i) => T(c, l, x, y + i * lh, size, o)); return Math.min(ls.length, max) * lh;
  }
  const E = (u, d, du) => eo(cl((u - d) / (du || .55)));
  const grad2 = (c, x0, y0, x1, y1, a, b) => { const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  const pill = (c, x, y, w, h, fill, stroke, lw) => { rr(c, x - w / 2, y - h / 2, w, h, h / 2); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.lineWidth = lw || 2; c.strokeStyle = stroke; c.stroke(); } };
  const panel = (c, x, y, w, h, r, a) => { rr(c, x, y, w, h, r); c.fillStyle = 'rgba(255,255,255,' + (a || .09) + ')'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(255,255,255,.18)'; c.stroke(); };
  function geo(W, H) { const col = Math.min(W * .9, H * .75), B = col / .9; return { col, B, cx: W / 2 }; }
  C.geo = geo;

  /* animated background */
  C.bg = function (c, t, W, H, p) {
    const T0 = th(p); c.save(); c.fillStyle = grad2(c, 0, 0, W * .3, H, T0.c1, T0.c2); c.fillRect(0, 0, W, H);
    const blobs = [[.2, .25, T0.a1], [.85, .6, T0.a2], [.4, .95, T0.a1]];
    blobs.forEach((b, i) => { const x = (b[0] + Math.sin(t * .35 + i * 2) * .07) * W, y = (b[1] + Math.cos(t * .3 + i) * .05) * H, r = Math.max(W, H) * .5; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, b[2] + '55'); g.addColorStop(1, b[2] + '00'); c.fillStyle = g; c.fillRect(0, 0, W, H); });
    if (T0.fx === 'grid') { c.strokeStyle = 'rgba(120,170,255,.08)'; c.lineWidth = 1; const s = W / 12, o = (t * 12) % s; for (let x = -o; x < W; x += s) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = -o; y < H; y += s) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } }
    if (T0.fx === 'stars' || T0.fx === 'sparkle') { for (let i = 0; i < 26; i++) { const x = FX.rnd(i, 1) * W, y = FX.rnd(i, 2) * H, a = .25 + .5 * Math.abs(Math.sin(t * (.8 + FX.rnd(i, 3)) + i)), r = W * (.003 + FX.rnd(i, 4) * .004); c.globalAlpha = a; c.fillStyle = i % 3 ? '#fff' : T0.a1; c.beginPath(); c.arc(x, y, r, 0, PI * 2); c.fill(); } c.globalAlpha = 1; }
    const v = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .3, W / 2, H / 2, Math.hypot(W, H) * .6); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.45)'); c.fillStyle = v; c.fillRect(0, 0, W, H); c.restore();
  };

  /* =============== card drawers: (c, d, u, len, W, H, T0, X) =============== */
  const imgDraw = (c, bmp, x, y, w, h, r) => { if (!bmp) return false; c.save(); rr(c, x, y, w, h, r); c.clip(); const k = Math.max(w / bmp.width, h / bmp.height); c.drawImage(bmp, x + w / 2 - bmp.width * k / 2, y + h / 2 - bmp.height * k / 2, bmp.width * k, bmp.height * k); c.restore(); return true; };
  const DR = {};
  DR.hook = (c, d, u, len, W, H, t0) => {
    const { col, B, cx } = geo(W, H);
    let e = E(u, .1); c.globalAlpha *= 1; c.save(); c.globalAlpha = e; T(c, d.kicker, cx, H * .17 + (1 - e) * 20, B * .05, { color: t0.a2, sp: 3, maxW: col, w: 800 }); c.restore();
    e = E(u, .3); c.save(); c.globalAlpha = e; T(c, d.title, cx, H * .245 + (1 - e) * 24, B * .13, { color: '#fff', w: 900, maxW: col, glow: t0.a1 }); c.restore();
    e = E(u, .55); c.save(); c.globalAlpha = e; T(c, d.sub, cx, H * .335, B * .042, { color: '#e6e1ff', w: 700, maxW: col, sp: 1 }); c.restore();
    const items = lines(d.items), bh = Math.min(H * .075, (H * .4) / Math.max(1, items.length)), y0 = H * .44; let endT = 1;
    items.forEach((s, i) => {
      const st = .9 + i * .55, ee = E(u, st); if (ee <= 0) return; const y = y0 + i * (bh + H * .018) + bh / 2, w = col * .78;
      c.save(); c.globalAlpha = ee; c.translate((i % 2 ? 1 : -1) * (1 - ee) * 60, 0); rr(c, cx - w / 2, y - bh / 2, w, bh, bh * .28); c.fillStyle = 'rgba(255,255,255,.07)'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(255,255,255,.28)'; c.stroke();
      const fs = T(c, s.toUpperCase(), cx, y, Math.min(B * .06, bh * .5), { color: '#cfc8ff', sp: 2, w: 800, maxW: w * .86 });
      const sp = cl((u - st - .5) / .4); if (sp > 0) { c.font = '800 ' + fs + 'px ' + fontOf(s); const tw = Math.min(w * .86, c.measureText(s.toUpperCase()).width + 30); c.strokeStyle = t0.a1; c.lineWidth = Math.max(3, B * .008); c.shadowColor = t0.a1; c.shadowBlur = 10; c.beginPath(); c.moveTo(cx - tw / 2, y); c.lineTo(cx - tw / 2 + tw * eo(sp), y); c.stroke(); }
      c.restore(); endT = st + .9;
    });
    const ey = y0 + items.length * (bh + H * .018) + B * .12; e = ob(cl((u - endT) / .5)); if (e > 0 && d.emoji) { c.save(); c.translate(cx, ey); c.scale(e, e); c.font = B * .17 + 'px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(d.emoji, 0, 0); c.restore(); }
    e = E(u, endT + .35); if (e > 0 && d.cta) { c.save(); c.globalAlpha = e; const w = Math.min(col * .6, 700); pill(c, cx, H * .9, w, H * .05, 'rgba(255,255,255,.06)', t0.a3, 2); T(c, d.cta.toUpperCase(), cx, H * .9, B * .04, { color: t0.a3, sp: 2, maxW: w * .85 }); c.restore(); }
  };
  DR.title = (c, d, u, len, W, H, t0) => {
    const { col, B, cx } = geo(W, H); let y = H * .13, e = ob(cl(u / .5));
    if (d.badge) { c.save(); c.translate(cx, y); c.scale(e, e); const w = Math.min(col * .62, c.measureText ? col * .62 : 0); pill(c, 0, 0, w, H * .05, grad2(c, -w / 2, 0, w / 2, 0, t0.a3, '#ff9f1c'), null); T(c, d.badge, 0, 0, B * .042, { color: '#2a1200', w: 900, maxW: w * .88, sp: 1 }); c.restore(); }
    y = H * .27;
    [['l1', '#fff', 0], ['l2', null, 1], ['l3', '#fff', 2]].forEach(([k, colr, i]) => {
      const ls = String(d[k] || '').split(/\n/); ls.forEach(s => {
        if (!s.trim()) return; const ee = E(u, .25 + i * .18 + .0, .6); c.save(); c.globalAlpha = ee; c.translate(0, (1 - ee) * 30);
        const sz = k === 'l2' ? B * .15 : B * .12; T(c, s.toUpperCase(), cx, y, sz, { color: colr || '#fff', grad: k === 'l2' ? [t0.a2, t0.a1] : null, w: 900, maxW: col, glow: k === 'l2' ? t0.a1 : null }); c.restore(); y += sz * 1.05;
      });
    });
    e = E(u, 1.1); if (d.tag) { c.save(); c.globalAlpha = e; const w = Math.min(col * .7, 760); pill(c, cx, y + H * .04, w, H * .045, 'rgba(255,255,255,.05)', 'rgba(255,255,255,.35)', 1.5); T(c, d.tag.toUpperCase(), cx, y + H * .04, B * .036, { color: '#e6e1ff', sp: 3, maxW: w * .88, w: 700 }); c.restore(); }
  };
  const CH = ['#ffd24a', '#35d6ff', '#ff4fa3', '#7cf29a'];
  DR.stats = (c, d, u, len, W, H, t0) => {
    const { col, B, cx } = geo(W, H); const chips = lines(d.chips).slice(0, 6).map(cols); let e = E(u, .1);
    c.save(); c.globalAlpha = e; T(c, d.title, cx, H * .2, B * .07, { grad: [t0.a2, t0.a1], w: 900, maxW: col }); c.restore();
    const n = chips.length, per = n > 3 ? Math.ceil(n / 2) : n, rowsN = n > 3 ? 2 : 1, gap = B * .035, size = Math.min((col - gap * (per - 1)) / per, B * .3);
    const y0 = H * .5 - (rowsN * size + (rowsN - 1) * gap) / 2;
    chips.forEach((ch, i) => {
      const r = Math.floor(i / per), k = i % per, inRow = Math.min(per, n - r * per), x = cx - (inRow * size + (inRow - 1) * gap) / 2 + k * (size + gap), y = y0 + r * (size + gap), ee = ob(cl((u - .4 - i * .18) / .5)); if (ee <= 0) return;
      c.save(); c.translate(x + size / 2, y + size / 2); c.scale(ee, ee); rr(c, -size / 2, -size / 2, size, size, size * .14); c.fillStyle = CH[i % 4]; c.shadowColor = CH[i % 4]; c.shadowBlur = 24; c.fill(); c.shadowBlur = 0;
      T(c, ch[0], 0, -size * .08, size * .34, { color: '#1b1033', w: 900, maxW: size * .86 }); T(c, (ch[1] || '').toUpperCase(), 0, size * .27, size * .14, { color: '#1b1033', w: 800, maxW: size * .86, sp: 1 }); c.restore();
    });
    e = E(u, 1.2 + n * .15); c.save(); c.globalAlpha = e; if (d.foot) P(c, d.foot, cx, H * .76, B * .045, col, { color: t0.a2, w: 800, maxLines: 3 }); c.restore();
  };
  DR.list = (c, d, u, len, W, H, t0) => {
    const { col, B, cx } = geo(W, H); const items = lines(d.items).slice(0, 9); let e = E(u, .1);
    c.save(); c.globalAlpha = e; T(c, d.title, cx, H * .13, B * .075, { grad: [t0.a2, t0.a1], w: 900, maxW: col, glow: t0.a1 }); c.restore();
    const n = Math.max(1, items.length), rowH = Math.min(H * .105, H * .66 / n), y0 = H * .22, gap = rowH * .14, rtl = S.isRTL(items.join(' '));
    items.forEach((s, i) => {
      const ee = E(u, .4 + i * .45), y = y0 + i * (rowH + gap); if (ee <= 0) return;
      c.save(); c.globalAlpha = ee; c.translate((rtl ? 1 : -1) * (1 - ee) * 70, 0); panel(c, cx - col / 2, y, col, rowH, rowH * .26, .1);
      const r = rowH * .34, bx = rtl ? cx + col / 2 - rowH * .2 - r : cx - col / 2 + rowH * .2 + r;
      c.beginPath(); c.arc(bx, y + rowH / 2, r, 0, PI * 2); c.fillStyle = CH[i % 4]; c.fill();
      if (String(d.numbered) !== '0') T(c, String(i + 1), bx, y + rowH / 2, r * 1.2, { color: '#1b1033', w: 900 }); else T(c, '★', bx, y + rowH / 2, r * 1.1, { color: '#1b1033' });
      const tx = rtl ? bx - r - rowH * .2 : bx + r + rowH * .2, mw = col - rowH * 1.2 - r * 2; c.save(); c.beginPath(); c.rect(0, 0, W, H); c.clip();
      T(c, s, tx, y + rowH / 2, Math.min(B * .052, rowH * .42), { align: rtl ? 'right' : 'left', color: '#fff', w: 700, maxW: mw }); c.restore(); c.restore();
    });
  };
  DR.details = (c, d, u, len, W, H, t0) => {
    const { col, B, cx } = geo(W, H); const rows = lines(d.rows).slice(0, 5).map(cols); let e = E(u, .1);
    c.save(); c.globalAlpha = e; T(c, d.title, cx, H * .12, B * .08, { grad: [t0.a2, '#9fe8ff'], w: 900, maxW: col, glow: t0.a2 }); c.restore();
    const rowH = Math.min(H * .095, H * .56 / Math.max(1, rows.length)), y0 = H * .2, gap = rowH * .16;
    rows.forEach((r, i) => {
      const ee = E(u, .35 + i * .3), y = y0 + i * (rowH + gap); if (ee <= 0) return; const ic = splitIcon(r[0] || ''), rtl = S.isRTL(r.join(' '));
      c.save(); c.globalAlpha = ee; c.translate(0, (1 - ee) * 30); panel(c, cx - col / 2, y, col, rowH, rowH * .22, .1);
      const R = rowH * .34, bx = rtl ? cx + col / 2 - rowH * .16 - R : cx - col / 2 + rowH * .16 + R; c.beginPath(); c.arc(bx, y + rowH / 2, R, 0, PI * 2); c.fillStyle = grad2(c, bx - R, y, bx + R, y + rowH, CH[i % 4], t0.a1); c.fill();
      if (ic.icon) { c.font = R * 1.05 + 'px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ic.icon, bx, y + rowH / 2 + R * .05); }
      const tx = rtl ? bx - R - rowH * .18 : bx + R + rowH * .18, al = rtl ? 'right' : 'left', mw = col - rowH * 1.1 - R * 2;
      T(c, ic.rest.toUpperCase(), tx, y + rowH * .27, rowH * .17, { align: al, color: t0.a2, w: 800, sp: 1, maxW: mw }); T(c, r[1] || '', tx, y + rowH * .55, rowH * .3, { align: al, color: '#fff', w: 800, maxW: mw }); if (r[2]) T(c, r[2], tx, y + rowH * .8, rowH * .16, { align: al, color: '#b9b2e6', w: 600, maxW: mw }); c.restore();
    });
    const by = y0 + rows.length * (rowH + gap) + H * .05; e = ob(cl((u - .9 - rows.length * .3) / .5));
    if (d.big && e > 0) { c.save(); c.translate(cx, by + H * .03); c.scale(e, e); const w = Math.min(col * .66, 800); pill(c, 0, 0, w, H * .07, grad2(c, -w / 2, 0, w / 2, 0, t0.a3, '#ff9f1c'), null); T(c, d.big, 0, 0, B * .075, { color: '#2a1200', w: 900, maxW: w * .9 }); c.restore(); }
    e = E(u, 1.3 + rows.length * .3); if (d.foot) { c.save(); c.globalAlpha = e; const ls = String(d.foot).split(/\n/); ls.forEach((s, i) => T(c, s, cx, by + H * .1 + i * B * .06, B * .052, { color: i ? t0.a1 : '#fff', w: 900, maxW: col, glow: i ? t0.a1 : null })); c.restore(); }
  };
  DR.quote = (c, d, u, len, W, H, t0) => {
    const { col, B, cx } = geo(W, H); let e = ob(cl(u / .6));
    c.save(); c.globalAlpha = .55 * e; T(c, '❝', cx, H * .27, B * .3, { color: t0.a1, w: 900 }); c.restore();
    e = E(u, .3); c.save(); c.globalAlpha = e; c.translate(0, (1 - e) * 24); const h = P(c, d.text, cx, H * .42, B * .062, col * .92, { color: '#fff', w: 700, maxLines: 8 }); c.restore();
    e = E(u, .9); c.save(); c.globalAlpha = e; c.strokeStyle = t0.a1; c.lineWidth = 3; c.beginPath(); c.moveTo(cx - col * .12, H * .78); c.lineTo(cx + col * .12, H * .78); c.stroke(); T(c, d.author, cx, H * .83, B * .045, { color: t0.a2, w: 800, maxW: col }); c.restore();
  };
  DR.fact = (c, d, u, len, W, H, t0) => {
    const { col, B, cx } = geo(W, H); let e = ob(cl(u / .5)); c.save(); c.translate(cx, H * .2); c.scale(e, e); const w = Math.min(col * .6, 700); pill(c, 0, 0, w, H * .055, grad2(c, -w / 2, 0, w / 2, 0, t0.a1, t0.a2), null); T(c, d.kicker, 0, 0, B * .045, { color: '#fff', w: 900, sp: 2, maxW: w * .9 }); c.restore();
    const m = /^([^\d]*)([\d.,]+)(.*)$/.exec(String(d.big || '')); let big = d.big; if (m) { const num = parseFloat(m[2].replace(/,/g, '')), q = eo(cl((u - .3) / 1.1)); const dec = (m[2].split('.')[1] || '').length; big = m[1] + (num * q).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, m[2].indexOf(',') >= 0 ? ',' : 'x').replace(/x/g, '') + m[3]; }
    e = E(u, .25); c.save(); c.globalAlpha = e; T(c, big, cx, H * .42, B * .26, { grad: [t0.a3, t0.a1], w: 900, maxW: col, glow: t0.a1 }); c.restore();
    e = E(u, 1.2); c.save(); c.globalAlpha = e; P(c, d.text, cx, H * .62, B * .055, col * .92, { color: '#fff', w: 700, maxLines: 5 }); c.restore();
  };
  DR.ba = (c, d, u, len, W, H, t0, X) => {
    const { col, B, cx } = geo(W, H); let e = E(u, .05); c.save(); c.globalAlpha = e; T(c, d.title, cx, H * .1, B * .07, { grad: [t0.a2, t0.a1], w: 900, maxW: col }); c.restore();
    const pw = col * .47, ph = H * .5, y = H * .17, gap = col * .06;
    [[cx - gap / 2 - pw, d.before, d.btext, 0, '#ff5a5a'], [cx + gap / 2, d.after, d.atext, 1, '#4be38a']].forEach(([x, lab, tx, i, colr]) => {
      const ee = E(u, .2 + i * .3); c.save(); c.globalAlpha = ee; c.translate((i ? 1 : -1) * (1 - ee) * 60, 0);
      const bmp = X && X.imgs && X.imgs[i]; if (!imgDraw(c, bmp, x, y, pw, ph, B * .04)) { rr(c, x, y, pw, ph, B * .04); c.fillStyle = grad2(c, x, y, x + pw, y + ph, colr + '55', t0.c2); c.fill(); }
      rr(c, x, y, pw, ph, B * .04); c.lineWidth = 3; c.strokeStyle = colr; c.stroke(); pill(c, x + pw / 2, y + ph * .06, pw * .6, ph * .08, colr, null); T(c, String(lab || '').toUpperCase(), x + pw / 2, y + ph * .06, B * .04, { color: '#fff', w: 900, sp: 1, maxW: pw * .55 });
      c.restore();
      const e2 = E(u, .7 + i * .2); c.save(); c.globalAlpha = e2; P(c, tx, x + pw / 2, y + ph + H * .045, B * .042, pw * 1.02, { color: '#fff', w: 700, maxLines: 4 }); c.restore();
    });
  };
  DR.timeline = (c, d, u, len, W, H, t0) => {
    const { col, B, cx } = geo(W, H); const ev = lines(d.events).slice(0, 6).map(cols); let e = E(u, .05); c.save(); c.globalAlpha = e; T(c, d.title, cx, H * .11, B * .07, { grad: [t0.a2, t0.a1], w: 900, maxW: col }); c.restore();
    const rtl = S.isRTL(ev.map(x => x.join(' ')).join(' ')), lx = rtl ? cx + col * .32 : cx - col * .32, y0 = H * .22, step = Math.min(H * .115, H * .66 / Math.max(1, ev.length));
    const pr = cl((u - .2) / (.5 + ev.length * .35)); c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = 4; c.beginPath(); c.moveTo(lx, y0); c.lineTo(lx, y0 + (ev.length - 1) * step * pr + 1); c.stroke();
    ev.forEach((r, i) => {
      const ee = E(u, .3 + i * .35); if (ee <= 0) return; const y = y0 + i * step; c.save(); c.globalAlpha = ee; c.beginPath(); c.arc(lx, y, B * .022 * (.6 + .4 * ee), 0, PI * 2); c.fillStyle = CH[i % 4]; c.shadowColor = CH[i % 4]; c.shadowBlur = 14; c.fill(); c.shadowBlur = 0;
      const al = rtl ? 'right' : 'left', tx = rtl ? lx - B * .05 : lx + B * .05, mw = col * .62; T(c, r[0], tx, y - step * .17, step * .26, { align: al, color: t0.a3, w: 900, maxW: mw }); T(c, r[1] || '', tx, y + step * .17, step * .22, { align: al, color: '#fff', w: 600, maxW: mw }); c.restore();
    });
  };
  const ticker = (c, tk, t, W, H, yy) => {
    const { B } = geo(W, H), h = H * .048, y = yy === undefined ? H * .905 : yy, txt = String(tk.text || ''), lab = String(tk.label || '');
    c.save(); c.fillStyle = 'rgba(8,10,24,.92)'; c.fillRect(0, y, W, h); c.font = '700 ' + h * .5 + 'px ' + fontOf(txt); const tw = c.measureText(txt).width + W * .3;
    c.save(); c.beginPath(); c.rect(0, y, W, h); c.clip(); const rtl = S.isRTL(txt), off = (t * W * .12) % tw; c.fillStyle = '#fff'; c.textBaseline = 'middle'; c.textAlign = 'left'; c.direction = rtl ? 'rtl' : 'ltr'; for (let k = -1; k < 3; k++) c.fillText(txt, W * .3 + k * tw - (rtl ? -off : off) * 1, y + h / 2); c.restore();
    c.font = '900 ' + h * .5 + 'px ' + fontOf(lab); const lw = c.measureText(lab).width + h * .9; c.fillStyle = '#e11d2e'; c.fillRect(0, y, lw, h); c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(lab, lw / 2, y + h / 2 + 1); c.restore();
  };
  C.drawTicker = ticker;
  DR.headline = (c, d, u, len, W, H, t0) => {
    const { col, B, cx } = geo(W, H); let e = ob(cl(u / .45)); c.save(); c.translate(cx, H * .2); c.scale(e, e); const w = Math.min(col * .7, 760); pill(c, 0, 0, w, H * .055, '#e11d2e', null); T(c, d.tag, 0, 0, B * .045, { color: '#fff', w: 900, sp: 3, maxW: w * .9 }); c.restore();
    e = E(u, .3); c.save(); c.globalAlpha = e; c.translate((1 - e) * -40, 0); const h = P(c, d.headline, cx, H * .33, B * .085, col, { color: '#fff', w: 900, maxLines: 5, glow: 'rgba(255,255,255,.2)' }); c.restore();
    e = E(u, .9); c.save(); c.globalAlpha = e; P(c, d.sub, cx, H * .33 + Math.max(h, B * .2) + H * .04, B * .048, col, { color: '#c8d3ff', w: 600, maxLines: 4 }); T(c, d.source, cx, H * .8, B * .036, { color: t0.a2, w: 800, sp: 1, maxW: col }); c.restore();
  };
  DR.countdown = (c, d, u, len, W, H, t0) => {
    const { col, B, cx } = geo(W, H); let e = E(u, .05); c.save(); c.globalAlpha = e; T(c, d.title, cx, H * .18, B * .075, { grad: [t0.a2, t0.a1], w: 900, maxW: col }); c.restore();
    const dt = new Date(String(d.date || '').replace(/-/g, '/')), days = isNaN(dt) ? 0 : Math.max(0, Math.ceil((dt - Date.now()) / 864e5)), q = eo(cl((u - .3) / 1.2)), R = B * .27, y = H * .45;
    c.save(); c.lineWidth = B * .035; c.strokeStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.arc(cx, y, R, 0, PI * 2); c.stroke(); c.strokeStyle = grad2(c, cx - R, y - R, cx + R, y + R, t0.a2, t0.a1); c.lineCap = 'round'; c.shadowColor = t0.a1; c.shadowBlur = 20; const fr = Math.min(1, days / 100) || .05; c.beginPath(); c.arc(cx, y, R, -PI / 2, -PI / 2 + PI * 2 * fr * q); c.stroke(); c.restore();
    T(c, String(Math.round(days * q)), cx, y, B * .24, { color: '#fff', w: 900, glow: t0.a2 }); T(c, d.label, cx, H * .72, B * .055, { color: t0.a3, w: 800, sp: 2, maxW: col }); T(c, d.datetext || d.date, cx, H * .79, B * .045, { color: '#c8c2ee', w: 600, maxW: col });
  };
  DR.issue = (c, d, u, len, W, H, t0) => {
    const { col, B, cx } = geo(W, H); const rows = lines(d.rows).slice(0, 5).map(cols); let e = E(u, .05); c.save(); c.globalAlpha = e; T(c, d.title, cx, H * .11, B * .075, { grad: [t0.a1, t0.a3], w: 900, maxW: col, glow: t0.a1 }); c.restore();
    const n = Math.max(1, rows.length), h = Math.min(H * .15, H * .7 / n), y0 = H * .2, gap = h * .1, rtl = S.isRTL(rows.join(' '));
    const cs = ['#ff4f6a', '#ffb02e', '#35d6ff', '#4be38a', '#a855ff'];
    rows.forEach((r, i) => {
      const ee = E(u, .3 + i * .5), y = y0 + i * (h + gap); if (ee <= 0) return; c.save(); c.globalAlpha = ee; c.translate((rtl ? 1 : -1) * (1 - ee) * 80, 0); panel(c, cx - col / 2, y, col, h, h * .12, .1);
      c.fillStyle = cs[i % 5]; rr(c, rtl ? cx + col / 2 - h * .09 : cx - col / 2, y, h * .09, h, h * .045); c.fill();
      const tx = rtl ? cx + col / 2 - h * .22 : cx - col / 2 + h * .22, al = rtl ? 'right' : 'left', mw = col - h * .4;
      T(c, String(r[0] || '').toUpperCase(), tx, y + h * .2, h * .15, { align: al, color: cs[i % 5], w: 900, sp: 2, maxW: mw }); P(c, r[1] || '', rtl ? tx : tx + 0, y + h * .5, Math.min(B * .042, h * .22), mw, { align: al, color: '#fff', w: 600, maxLines: 3 }); c.restore();
    });
  };
  DR.appeal = (c, d, u, len, W, H, t0) => {
    const { col, B, cx } = geo(W, H); let e = E(u, .05); c.save(); c.globalAlpha = e; T(c, d.title, cx, H * .14, B * .075, { grad: [t0.a1, t0.a3], w: 900, maxW: col }); c.restore();
    const goal = parseFloat(String(d.goal).replace(/,/g, '')) || 0, got = parseFloat(String(d.raised).replace(/,/g, '')) || 0, pct = goal ? cl(got / goal) : 0, q = eo(cl((u - .4) / 1.3)), bw = col, bh = B * .06, y = H * .38, fmt = n => Math.round(n).toLocaleString('en-US');
    e = E(u, .25); c.save(); c.globalAlpha = e; T(c, (d.unit || '') + ' ' + fmt(got * q), cx - bw / 2, y - B * .09, B * .085, { align: 'left', grad: [t0.a3, t0.a1], w: 900, maxW: bw * .6 }); T(c, (S.lang === 'ur' ? 'ہدف ' : 'Goal ') + (d.unit || '') + ' ' + fmt(goal), cx + bw / 2, y - B * .09, B * .04, { align: 'right', color: '#c8c2ee', w: 700, maxW: bw * .4 }); c.restore();
    rr(c, cx - bw / 2, y, bw, bh, bh / 2); c.fillStyle = 'rgba(255,255,255,.12)'; c.fill(); if (pct * q > .01) { rr(c, cx - bw / 2, y, Math.max(bh, bw * pct * q), bh, bh / 2); c.fillStyle = grad2(c, cx - bw / 2, 0, cx + bw / 2, 0, t0.a2, t0.a1); c.shadowColor = t0.a1; c.shadowBlur = 16; c.fill(); c.shadowBlur = 0; }
    T(c, Math.round(pct * 100 * q) + '%', cx, y + bh / 2, bh * .6, { color: '#fff', w: 900 });
    e = E(u, 1.1); c.save(); c.globalAlpha = e; const hs = lines(d.how); const ph = Math.min(H * .3, B * .09 * hs.length + B * .1); panel(c, cx - col / 2, H * .5, col, ph, B * .04, .1); T(c, d.howtitle || (S.lang === 'ur' ? 'کیسے مدد کریں' : 'HOW TO HELP'), cx, H * .5 + B * .06, B * .04, { color: t0.a2, w: 900, sp: 2, maxW: col }); hs.slice(0, 5).forEach((s, i) => T(c, s, cx, H * .5 + B * .14 + i * B * .08, B * .048, { color: '#fff', w: 700, maxW: col * .9 })); c.restore();
    e = E(u, 1.6); c.save(); c.globalAlpha = e; if (d.note) P(c, d.note, cx, H * .86, B * .042, col, { color: '#c8c2ee', w: 600, maxLines: 3 }); c.restore();
  };
  DR.cta = (c, d, u, len, W, H, t0) => {
    const { col, B, cx } = geo(W, H); const rows = lines(d.rows).slice(0, 5).map(cols); let e = E(u, .05); c.save(); c.globalAlpha = e; T(c, d.title, cx, H * .15, B * .08, { grad: [t0.a2, t0.a1], w: 900, maxW: col }); c.restore();
    const h = Math.min(H * .085, H * .5 / Math.max(1, rows.length)), y0 = H * .27, gap = h * .22;
    rows.forEach((r, i) => {
      const ee = E(u, .3 + i * .28), y = y0 + i * (h + gap); if (ee <= 0) return; const rtl = S.isRTL(r.join(' ')); c.save(); c.globalAlpha = ee; c.translate(0, (1 - ee) * 26); panel(c, cx - col / 2, y, col, h, h * .3, .1);
      const R = h * .34, bx = rtl ? cx + col / 2 - h * .16 - R : cx - col / 2 + h * .16 + R; c.beginPath(); c.arc(bx, y + h / 2, R, 0, PI * 2); c.fillStyle = grad2(c, bx - R, y, bx + R, y + h, CH[i % 4], t0.a1); c.fill();
      c.font = R * 1.1 + 'px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(splitIcon(r[0] || '').icon || '•', bx, y + h / 2 + R * .05);
      T(c, r[1] || splitIcon(r[0] || '').rest, rtl ? bx - R - h * .2 : bx + R + h * .2, y + h / 2, h * .36, { align: rtl ? 'right' : 'left', color: '#fff', w: 800, maxW: col - h * 1.3 }); c.restore();
    });
    e = ob(cl((u - .5 - rows.length * .3) / .5)); if (d.handle && e > 0) { c.save(); c.translate(cx, H * .78); c.scale(e, e); const w = Math.min(col * .8, 880); pill(c, 0, 0, w, H * .07, grad2(c, -w / 2, 0, w / 2, 0, t0.a1, t0.a2), null); T(c, d.handle, 0, 0, B * .06, { color: '#fff', w: 900, maxW: w * .9 }); c.restore(); }
    e = E(u, 1.5 + rows.length * .3); c.save(); c.globalAlpha = e; if (d.note) P(c, d.note, cx, H * .88, B * .042, col, { color: '#c8c2ee', w: 600, maxLines: 2 }); c.restore();
  };
  DR.testimonial = (c, d, u, len, W, H, t0) => {
    const { col, B, cx } = geo(W, H); const n = cl(parseInt(d.stars, 10) || 5, 1, 5); for (let i = 0; i < 5; i++) { const e = ob(cl((u - .1 - i * .1) / .4)); if (e > 0) { c.save(); c.translate(cx + (i - 2) * B * .09, H * .2); c.scale(e, e); T(c, '★', 0, 0, B * .08, { color: i < n ? '#ffd24a' : 'rgba(255,255,255,.2)', glow: i < n ? '#ffb300' : null }); c.restore(); } }
    let e = E(u, .5); c.save(); c.globalAlpha = e; c.translate(0, (1 - e) * 20); P(c, d.text, cx, H * .38, B * .058, col * .92, { color: '#fff', w: 600, italic: !S.isRTL(d.text), maxLines: 7 }); c.restore();
    e = ob(cl((u - 1) / .5)); if (e > 0) { c.save(); c.translate(cx, H * .7); c.scale(e, e); c.beginPath(); c.arc(0, 0, B * .075, 0, PI * 2); c.fillStyle = grad2(c, -B * .07, -B * .07, B * .07, B * .07, t0.a1, t0.a2); c.fill(); T(c, String(d.name || '?').trim().slice(0, 1).toUpperCase(), 0, 0, B * .09, { color: '#fff', w: 900 }); c.restore(); }
    e = E(u, 1.2); c.save(); c.globalAlpha = e; T(c, d.name, cx, H * .8, B * .055, { color: '#fff', w: 900, maxW: col }); T(c, d.role, cx, H * .85, B * .038, { color: t0.a2, w: 700, maxW: col }); c.restore();
  };
  DR.place = (c, d, u, len, W, H, t0) => {
    const { col, B, cx } = geo(W, H); let e = E(u, .05); c.save(); c.globalAlpha = e; T(c, d.title, cx, H * .11, B * .075, { grad: [t0.a2, t0.a1], w: 900, maxW: col }); c.restore();
    const mx = cx - col / 2, my = H * .19, mw = col, mh = H * .33; e = E(u, .2); c.save(); c.globalAlpha = e; rr(c, mx, my, mw, mh, B * .04); c.save(); c.clip(); c.fillStyle = '#16264a'; c.fillRect(mx, my, mw, mh);
    c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = 2; for (let i = 1; i < 7; i++) { c.beginPath(); c.moveTo(mx + mw * i / 7, my); c.lineTo(mx + mw * i / 7, my + mh); c.stroke(); c.beginPath(); c.moveTo(mx, my + mh * i / 5); c.lineTo(mx + mw, my + mh * i / 5); c.stroke(); }
    c.strokeStyle = 'rgba(255,200,90,.55)'; c.lineWidth = B * .018; c.beginPath(); c.moveTo(mx, my + mh * .7); c.bezierCurveTo(mx + mw * .3, my + mh * .2, mx + mw * .6, my + mh * .9, mx + mw, my + mh * .3); c.stroke(); c.restore();
    rr(c, mx, my, mw, mh, B * .04); c.lineWidth = 2.5; c.strokeStyle = t0.a2; c.stroke(); c.restore();
    const pe = ob(cl((u - .6) / .6)), py = my + mh * .52 - Math.abs(Math.sin(u * 3)) * B * .02 * (u > 1.2 ? 1 : 0); if (pe > 0) { c.save(); c.translate(cx, py); c.scale(pe, pe); c.fillStyle = '#ff3b4a'; c.shadowColor = '#ff3b4a'; c.shadowBlur = 18; c.beginPath(); c.arc(0, -B * .06, B * .05, PI * .8, PI * .2); c.lineTo(0, B * .03); c.closePath(); c.fill(); c.shadowBlur = 0; c.fillStyle = '#fff'; c.beginPath(); c.arc(0, -B * .06, B * .02, 0, PI * 2); c.fill(); c.restore(); }
    e = E(u, .9); c.save(); c.globalAlpha = e; T(c, d.name, cx, H * .6, B * .068, { color: '#fff', w: 900, maxW: col }); P(c, d.address, cx, H * .665, B * .045, col, { color: '#d5d0f5', w: 600, maxLines: 3 }); T(c, d.hint, cx, H * .8, B * .04, { color: t0.a3, w: 700, maxW: col }); c.restore();
  };
  DR.product = (c, d, u, len, W, H, t0, X) => {
    const { col, B, cx } = geo(W, H); let e = ob(cl(u / .5)); if (d.badge) { c.save(); c.translate(cx, H * .1); c.scale(e, e); const w = Math.min(col * .4, 460); pill(c, 0, 0, w, H * .045, t0.a1, null); T(c, d.badge.toUpperCase(), 0, 0, B * .04, { color: '#fff', w: 900, sp: 2, maxW: w * .9 }); c.restore(); }
    e = ob(cl((u - .2) / .6)); const R = B * .3, y = H * .33; if (e > 0) { c.save(); c.translate(cx, y); c.scale(e, e); const g = c.createRadialGradient(0, 0, R * .3, 0, 0, R * 1.3); g.addColorStop(0, t0.a1 + '88'); g.addColorStop(1, t0.a1 + '00'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, R * 1.3, 0, PI * 2); c.fill(); c.beginPath(); c.arc(0, 0, R, 0, PI * 2); c.fillStyle = 'rgba(255,255,255,.1)'; c.fill(); c.lineWidth = 4; c.strokeStyle = t0.a2; c.stroke(); c.save(); c.beginPath(); c.arc(0, 0, R - 3, 0, PI * 2); c.clip(); const bmp = X && X.imgs && X.imgs[0]; if (bmp) { const k = Math.max(2 * R / bmp.width, 2 * R / bmp.height); c.drawImage(bmp, -bmp.width * k / 2, -bmp.height * k / 2, bmp.width * k, bmp.height * k); } else { c.font = R * 1.1 + 'px "Noto Color Emoji","Apple Color Emoji","Segoe UI Emoji",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🛍️', 0, 0); } c.restore(); c.restore(); }
    e = E(u, .6); c.save(); c.globalAlpha = e; T(c, d.name, cx, H * .61, B * .075, { color: '#fff', w: 900, maxW: col }); c.restore();
    e = ob(cl((u - .9) / .5)); if (e > 0 && d.price) { c.save(); c.translate(cx, H * .7); c.scale(e, e); const w = Math.min(col * .6, 700); pill(c, 0, 0, w, H * .075, grad2(c, -w / 2, 0, w / 2, 0, t0.a2, t0.a1), null); T(c, d.price, d.old ? -w * .12 : 0, 0, B * .075, { color: '#1b1033', w: 900, maxW: w * (d.old ? .5 : .85) }); if (d.old) { T(c, d.old, w * .22, 0, B * .045, { color: 'rgba(27,16,51,.7)', w: 700, maxW: w * .3 }); c.strokeStyle = '#1b1033'; c.lineWidth = 3; c.beginPath(); c.moveTo(w * .09, 0); c.lineTo(w * .35, 0); c.stroke(); } c.restore(); }
    lines(d.features).slice(0, 4).forEach((s, i) => { const ee = E(u, 1.2 + i * .25); c.save(); c.globalAlpha = ee; T(c, '✔ ' + s, cx, H * .79 + i * B * .065, B * .047, { color: '#e8e4ff', w: 700, maxW: col }); c.restore(); });
  };
  DR.offer = (c, d, u, len, W, H, t0) => {
    const { col, B, cx } = geo(W, H); c.save(); c.translate(cx, H * .42); c.globalAlpha *= .16; c.rotate(u * .3); for (let i = 0; i < 14; i++) { c.rotate(PI / 7); c.fillStyle = t0.a2; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.max(W, H), -B * .05); c.lineTo(Math.max(W, H), B * .05); c.closePath(); c.fill(); } c.restore();
    let e = E(u, .05); c.save(); c.globalAlpha = e; T(c, d.kicker, cx, H * .22, B * .07, { color: t0.a3, w: 900, sp: 4, maxW: col, glow: t0.a1 }); c.restore();
    e = ob(cl((u - .2) / .6)); c.save(); c.translate(cx, H * .42); const s = e * (1 + .03 * Math.sin(u * 5)); c.scale(s, s); T(c, d.big, 0, 0, B * .2, { grad: [t0.a3, t0.a1], w: 900, maxW: col, glow: t0.a1, stroke: 'rgba(0,0,0,.35)' }); c.restore();
    e = E(u, .8); c.save(); c.globalAlpha = e; P(c, d.sub, cx, H * .56, B * .055, col, { color: '#fff', w: 700, maxLines: 3 }); c.restore();
    e = ob(cl((u - 1.1) / .5)); if (d.code && e > 0) { c.save(); c.translate(cx, H * .72); c.scale(e, e); const w = Math.min(col * .62, 700); rr(c, -w / 2, -H * .035, w, H * .07, H * .02); c.setLineDash([12, 8]); c.lineWidth = 3; c.strokeStyle = t0.a2; c.stroke(); c.setLineDash([]); T(c, (S.lang === 'ur' ? 'کوڈ: ' : 'CODE: ') + d.code, 0, 0, B * .055, { color: '#fff', w: 900, sp: 2, maxW: w * .9 }); c.restore(); }
    e = E(u, 1.4); c.save(); c.globalAlpha = e; T(c, d.till, cx, H * .83, B * .042, { color: '#ffd7b0', w: 700, maxW: col }); c.restore();
  };
  DR.invite = (c, d, u, len, W, H, t0) => {
    const { col, B, cx } = geo(W, H); let e = E(u, .05, .8); c.save(); c.globalAlpha = e; const fw = col * .98, fh = H * .86, fx = cx - fw / 2, fy = H * .07; rr(c, fx, fy, fw, fh, B * .05); c.lineWidth = 4; c.strokeStyle = t0.a1; c.stroke(); rr(c, fx + B * .02, fy + B * .02, fw - B * .04, fh - B * .04, B * .04); c.lineWidth = 1.5; c.stroke();
    [[fx, fy], [fx + fw, fy], [fx, fy + fh], [fx + fw, fy + fh]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], B * .022, 0, PI * 2); c.fillStyle = t0.a1; c.fill(); }); c.restore();
    const seq = [[d.kicker, .17, .045, t0.a1, 800, 3], [d.name1, .3, .105, '#fff', 800, 0], ['&', .385, .06, t0.a1, 800, 0], [d.name2, .47, .105, '#fff', 800, 0], [d.date, .6, .06, t0.a3, 800, 1], [d.time, .66, .045, '#e8e4ff', 700, 1]];
    seq.forEach(([s, y, z, colr, w, sp], i) => { const ee = E(u, .3 + i * .25); c.save(); c.globalAlpha = ee; c.translate(0, (1 - ee) * 20); T(c, s, cx, H * y, B * z, { color: colr, w, sp, maxW: col * .9, glow: i === 1 || i === 3 ? t0.a1 : null }); c.restore(); });
    e = E(u, 1.9); c.save(); c.globalAlpha = e; c.strokeStyle = t0.a1; c.lineWidth = 2; c.beginPath(); c.moveTo(cx - col * .15, H * .715); c.lineTo(cx + col * .15, H * .715); c.stroke(); P(c, d.venue, cx, H * .76, B * .05, col * .85, { color: '#fff', w: 700, maxLines: 3 }); if (d.note) T(c, d.note, cx, H * .87, B * .038, { color: '#d9ccb0', w: 600, italic: !S.isRTL(d.note), maxW: col * .9 }); c.restore();
  };
  DR.outro = (c, d, u, len, W, H, t0, X) => {
    const { col, B, cx } = geo(W, H); const e = ob(cl(u / .6)); c.save(); c.translate(cx, H * .36); c.scale(e, e); const R = B * .16; const g = c.createRadialGradient(0, 0, R * .5, 0, 0, R * 1.6); g.addColorStop(0, t0.a1 + '77'); g.addColorStop(1, t0.a1 + '00'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, R * 1.6, 0, PI * 2); c.fill();
    c.beginPath(); c.arc(0, 0, R, 0, PI * 2); c.fillStyle = 'rgba(255,255,255,.12)'; c.fill(); c.lineWidth = 4; c.strokeStyle = t0.a2; c.stroke(); const lg = C.logoImg(X && X.logo); if (lg) { c.save(); c.beginPath(); c.arc(0, 0, R - 3, 0, PI * 2); c.clip(); const k = Math.max(2 * R / lg.width, 2 * R / lg.height); c.drawImage(lg, -lg.width * k / 2, -lg.height * k / 2, lg.width * k, lg.height * k); c.restore(); } else T(c, '✨', 0, 0, R * 1.1, { color: '#fff' }); c.restore();
    let e2 = E(u, .5); c.save(); c.globalAlpha = e2; T(c, d.name, cx, H * .57, B * .085, { color: '#fff', w: 900, maxW: col, glow: t0.a1 }); T(c, d.tag, cx, H * .64, B * .045, { color: t0.a2, w: 700, maxW: col }); c.restore();
    e2 = ob(cl((u - .9) / .5)); if (d.handle && e2 > 0) { c.save(); c.translate(cx, H * .74); c.scale(e2, e2); const w = Math.min(col * .7, 760); pill(c, 0, 0, w, H * .06, grad2(c, -w / 2, 0, w / 2, 0, t0.a1, t0.a2), null); T(c, d.handle, 0, 0, B * .052, { color: '#fff', w: 900, maxW: w * .9 }); c.restore(); }
  };
  DR.table = (c, d, u, len, W, H, t0) => {
    const { col, B, cx } = geo(W, H); const rows = lines(d.rows).slice(0, 10).map(cols); let e = E(u, .05); c.save(); c.globalAlpha = e; T(c, d.title, cx, H * .12, B * .075, { grad: [t0.a2, t0.a1], w: 900, maxW: col }); c.restore();
    const rowH = Math.min(H * .08, H * .66 / Math.max(1, rows.length)), y0 = H * .2, rtl = S.isRTL(rows.join(' '));
    rows.forEach((r, i) => { const ee = E(u, .3 + i * .22), y = y0 + i * rowH; if (ee <= 0) return; c.save(); c.globalAlpha = ee; c.translate((i % 2 ? 1 : -1) * (1 - ee) * 50, 0); rr(c, cx - col / 2, y, col, rowH * .88, rowH * .25); c.fillStyle = i % 2 ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.12)'; c.fill();
      const a = rtl ? cx + col / 2 - rowH * .3 : cx - col / 2 + rowH * .3, b = rtl ? cx - col / 2 + rowH * .3 : cx + col / 2 - rowH * .3; T(c, r[0], a, y + rowH * .44, rowH * .38, { align: rtl ? 'right' : 'left', color: '#fff', w: 700, maxW: col * .6 }); T(c, r[1] || '', b, y + rowH * .44, rowH * .42, { align: rtl ? 'left' : 'right', color: t0.a3, w: 900, maxW: col * .3 }); c.restore(); });
    e = E(u, 1 + rows.length * .2); c.save(); c.globalAlpha = e; if (d.foot) P(c, d.foot, cx, H * .9, B * .045, col, { color: t0.a2, w: 800, maxLines: 2 }); c.restore();
  };
  DR.text = (c, d, u, len, W, H, t0) => {
    const { col, B, cx } = geo(W, H); let e = ob(cl(u / .6)); c.save(); c.translate(cx, H * .45); c.scale(.7 + .3 * e, .7 + .3 * e); c.globalAlpha = cl(e); c.translate(-cx, -H * .45); P(c, d.title, cx, H * .3, B * .11, col, { grad: [t0.a2, t0.a1], w: 900, maxLines: 4, glow: t0.a1 }); c.restore();
    e = E(u, .6); c.save(); c.globalAlpha = e; P(c, d.sub, cx, H * .66, B * .055, col * .95, { color: '#e8e4ff', w: 600, maxLines: 4 }); c.restore();
  };

  /* =============== types =============== */
  const D = (u, e) => ({ u, e });
  const T0 = (name, e, len, f, def) => ({ n: name, e, len, f, def });
  C.TYPES = {
    hook: T0(L('ہک / سوال', 'Hook'), '🪝', 5.8, ['kicker:t', 'title:t', 'sub:t', 'items:a', 'emoji:t', 'cta:t'], { kicker: L('کیا آپ نے کبھی سوچا', 'EVER WONDERED HOW'), title: L('سوشل میڈیا', 'SOCIAL MEDIA'), sub: L('صرف اتنا ہی نہیں ہو سکتا…', 'CAN BECOME MORE THAN JUST…'), items: L('سکرولنگ\nلائکنگ\nشیئرنگ', 'Scrolling\nLiking\nSharing'), emoji: L('🤔', '🤔'), cta: L('آئیے دیکھیں', "LET'S FIND OUT") }),
    title: T0(L('بڑا عنوان', 'Title card'), '🏷️', 4.2, ['badge:t', 'l1:t', 'l2:a', 'l3:t', 'tag:t'], { badge: L('2 دن · 100٪ مفت', '2-DAY · 100% FREE'), l1: L('ڈیجیٹل', 'DIGITAL'), l2: L('مارکیٹنگ', 'MARKETING & AI'), l3: L('ورکشاپ', 'WORKSHOP'), tag: L('سوشل میڈیا کھولیں', 'SOCIAL MEDIA UNLOCKED') }),
    stats: T0(L('اعداد / چپس', 'Stat chips'), '🔢', 4, ['title:t', 'chips:a', 'foot:t'], { title: L('ایک نظر میں', 'AT A GLANCE'), chips: L('100٪ | مفت\n2 | دن\n6-8 | شام روزانہ', '100% | FREE\n2 | DAYS\n6-8 | PM · DAILY'), foot: L('صارف سے تخلیق کار تک', 'FROM USERS TO CREATORS') }),
    list: T0(L('فہرست / ٹاپ 5', 'List / Top 5'), '📋', 6.5, ['title:t', 'items:a', 'numbered:t'], { title: L('5 بہترین مشورے', 'TOP 5 TIPS'), items: L('پہلا مشورہ یہاں\nدوسرا مشورہ یہاں\nتیسرا مشورہ یہاں\nچوتھا مشورہ یہاں\nپانچواں مشورہ یہاں', 'First tip goes here\nSecond tip goes here\nThird tip goes here\nFourth tip goes here\nFifth tip goes here'), numbered: L('1', '1') }),
    details: T0(L('تفصیلات', 'Details'), '📅', 6.2, ['title:t', 'rows:a', 'big:t', 'foot:a'], { title: L('پروگرام کی تفصیل', 'EVENT DETAILS'), rows: L('📅 تاریخ | 13 تا 14 نومبر 2026 | جمعہ اور ہفتہ\n⏰ وقت | شام 6 تا 8 بجے | روزانہ دو گھنٹے\n📍 مقام | ابو تراب بوائز اسکول | کراچی\n🏛️ منتظم | محکمہ تعلیم | ٹاؤن', '📅 DATES | 13–14 November 2026 | Friday & Saturday\n⏰ TIMINGS | 6:00 – 8:00 PM | Two hours each day\n📍 VENUE | Abu Turab Boys School | Karachi\n🏛️ ORGANISED BY | Education Dept | Town'), big: L('100٪ مفت', '100% FREE'), foot: L('مضبوط ہنر.\nلامحدود امکانات.', 'POWERFUL SKILLS.\nENDLESS POSSIBILITIES.') }),
    quote: T0(L('اقتباس / شعر', 'Quote'), '❝', 5, ['text:a', 'author:t'], { text: L('جو لوگ کوشش کرتے ہیں وہ کبھی ناکام نہیں ہوتے', 'Success is the sum of small efforts repeated day in and day out'), author: L('— نام', '— Author') }),
    fact: T0(L('کیا آپ جانتے ہیں؟', 'Did you know?'), '💡', 5, ['kicker:t', 'big:t', 'text:a'], { kicker: L('کیا آپ جانتے ہیں؟', 'DID YOU KNOW?'), big: L('70%', '70%'), text: L('یہاں اپنی بات لکھیں، یہ اعداد آپ کے دیے ہوئے ہونے چاہییں۔', 'Write your fact here. Numbers must come from a source you trust.') }),
    ba: T0(L('پہلے / بعد', 'Before / After'), '↔️', 5.5, ['title:t', 'before:t', 'after:t', 'btext:t', 'atext:t', 'img0:i', 'img1:i'], { title: L('فرق دیکھیں', 'SEE THE DIFFERENCE'), before: L('پہلے', 'BEFORE'), after: L('بعد', 'AFTER'), btext: L('پہلے کی حالت', 'How it was'), atext: L('اب کی حالت', 'How it is now') }),
    timeline: T0(L('ٹائم لائن', 'Timeline'), '🕒', 6.5, ['title:t', 'events:a'], { title: L('کب کیا ہوا', 'WHAT HAPPENED WHEN'), events: L('2020 | آغاز\n2022 | پہلا سنگ میل\n2024 | بڑی کامیابی\n2026 | آج', '2020 | The beginning\n2022 | First milestone\n2024 | Big success\n2026 | Today') }),
    headline: T0(L('خبر / ہیڈ لائن', 'News headline'), '📰', 5.5, ['tag:t', 'headline:a', 'sub:a', 'source:t', 'ticker:t', 'tickerLabel:t'], { tag: L('اہم خبر', 'BREAKING NEWS'), headline: L('یہاں خبر کی سرخی لکھیں', 'Write the headline of the story here'), sub: L('خبر کی مختصر تفصیل یہاں۔', 'A short summary of the story goes here.'), source: L('ذریعہ: ', 'SOURCE: '), ticker: L('تازہ ترین خبروں کے لیے ہمارے ساتھ رہیں', 'Stay with us for the latest updates'), tickerLabel: L('لائیو', 'LIVE') }),
    countdown: T0(L('الٹی گنتی', 'Countdown'), '⏳', 5, ['title:t', 'date:d', 'label:t', 'datetext:t'], { title: L('پروگرام میں بس', 'EVENT STARTS IN'), date: D('2026-12-25', '2026-12-25'), label: L('دن باقی', 'DAYS TO GO'), datetext: L('25 دسمبر 2026', '25 December 2026') }),
    issue: T0(L('مسئلہ اجاگر', 'Issue card'), '⚠️', 7, ['title:t', 'rows:a'], { title: L('مسئلہ', 'THE ISSUE'), rows: L('مسئلہ | یہاں مسئلہ لکھیں\nوجہ | اس کی وجہ لکھیں\nاثر | لوگوں پر کیا اثر پڑ رہا ہے\nحل | ہم کیا کر سکتے ہیں', 'PROBLEM | Describe the problem here\nCAUSE | Why it is happening\nIMPACT | Who it affects and how\nSOLUTION | What can be done') }),
    appeal: T0(L('اپیل / چندہ', 'Appeal'), '🤝', 6.5, ['title:t', 'goal:n', 'raised:n', 'unit:t', 'howtitle:t', 'how:a', 'note:a'], { title: L('مدد کی اپیل', 'HELP US REACH THE GOAL'), goal: D('500000', '500000'), raised: D('320000', '320000'), unit: L('روپے', 'Rs'), howtitle: L('کیسے مدد کریں', 'HOW TO HELP'), how: L('جاز کیش: 0300-0000000\nبینک اکاؤنٹ: یہاں لکھیں', 'JazzCash: 0300-0000000\nBank account: write here'), note: L('آپ کا ہر روپیہ فرق ڈالتا ہے', 'Every contribution makes a difference') }),
    cta: T0(L('رابطہ / کال ٹو ایکشن', 'Contact / CTA'), '📞', 5.5, ['title:t', 'rows:a', 'handle:t', 'note:a'], { title: L('رابطہ کریں', 'CONTACT US'), rows: L('📞 | 0300-0000000\n🌐 | www.example.com\n📍 | آپ کا پتہ', '📞 | 0300-0000000\n🌐 | www.example.com\n📍 | Your address here'), handle: L('@آپ_کا_نام', '@yourname'), note: L('فالو کریں اور شیئر کریں', 'Follow and share') }),
    testimonial: T0(L('گاہک کی رائے', 'Testimonial'), '⭐', 5.5, ['text:a', 'name:t', 'role:t', 'stars:n'], { text: L('بہت شاندار سروس، میں نے دوسروں کو بھی مشورہ دیا۔', 'Amazing service. I have already recommended it to my friends.'), name: L('نام', 'Customer Name'), role: L('گاہک', 'Customer'), stars: D('5', '5') }),
    place: T0(L('جگہ / نقشہ', 'Location'), '📍', 5, ['title:t', 'name:t', 'address:a', 'hint:t'], { title: L('مقام', 'VENUE'), name: L('جگہ کا نام', 'Venue name'), address: L('مکمل پتہ یہاں', 'Full address here'), hint: L('نزدیکی نشانی', 'Near a landmark') }),
    product: T0(L('پروڈکٹ', 'Product'), '🛍️', 6, ['badge:t', 'name:t', 'price:t', 'old:t', 'features:a', 'img0:i'], { badge: L('نیا', 'NEW'), name: L('پروڈکٹ کا نام', 'Product name'), price: L('Rs 1,999', 'Rs 1,999'), old: L('Rs 2,999', 'Rs 2,999'), features: L('پہلی خوبی\nدوسری خوبی\nتیسری خوبی', 'First feature\nSecond feature\nThird feature') }),
    offer: T0(L('آفر / سیل', 'Offer / Sale'), '🏷️', 5.5, ['kicker:t', 'big:t', 'sub:a', 'code:t', 'till:t'], { kicker: L('بڑی سیل', 'MEGA SALE'), big: L('50٪ رعایت', '50% OFF'), sub: L('تمام اشیا پر', 'On everything in store'), code: L('SMAA50', 'SMAA50'), till: L('آخری تاریخ: اس ہفتے تک', 'Valid till this Sunday') }),
    invite: T0(L('دعوت نامہ / شادی', 'Invitation / Wedding'), '💌', 7, ['kicker:t', 'name1:t', 'name2:t', 'date:t', 'time:t', 'venue:a', 'note:t'], { kicker: L('ولیمہ کی دعوت', 'WALIMA INVITATION'), name1: L('دولہا کا نام', 'Groom Name'), name2: L('دلہن کا نام', 'Bride Name'), date: L('ہفتہ، 20 دسمبر 2026', 'Saturday, 20 December 2026'), time: L('شام 7 بجے', '7:00 PM'), venue: L('شادی ہال، شہر', 'Wedding Hall, City'), note: L('آپ کی آمد ہماری خوشی ہے', 'Your presence will be our honour') }),
    outro: T0(L('آخری لوگو کارڈ', 'Logo outro'), '🏁', 4, ['name:t', 'tag:t', 'handle:t'], { name: L('آپ کا نام', 'Your Name'), tag: L('شکریہ، ہمارے ساتھ رہیں', 'Thank you for watching'), handle: L('@آپ_کا_نام', '@yourname') }),
    table: T0(L('جدول / نتیجہ', 'Table / Results'), '🏆', 6, ['title:t', 'rows:a', 'foot:t'], { title: L('نتیجہ', 'RESULTS'), rows: L('ٹیم اے | 3\nٹیم بی | 1\nٹیم سی | 0', 'Team A | 3\nTeam B | 1\nTeam C | 0'), foot: L('مبارک ہو سب کو', 'Congratulations to all') }),
    text: T0(L('سادہ لکھائی', 'Text card'), '🔤', 4, ['title:a', 'sub:a'], { title: L('یہاں بڑی بات لکھیں', 'Write your big message here'), sub: L('ذیلی لائن', 'A smaller line under it') })
  };
  C.TYPE_LIST = Object.keys(C.TYPES);
  C.LBL = {
    kicker: L('اوپر کی لائن', 'Top line'), title: L('عنوان', 'Title'), sub: L('ذیلی لائن', 'Sub line'), items: L('لائنیں (ہر لائن الگ)', 'Lines (one per row)'), emoji: L('ایموجی', 'Emoji'), cta: L('آخری جملہ', 'Closing line'), badge: L('بیج', 'Badge'), l1: L('لائن 1', 'Line 1'), l2: L('لائن 2 (رنگین)', 'Line 2 (colored)'), l3: L('لائن 3', 'Line 3'), tag: L('ٹیگ', 'Tag'),
    chips: L('چپس: بڑا | چھوٹا', 'Chips: big | small'), foot: L('نیچے کی لائن', 'Footer line'), numbered: L('نمبر (1 یا 0)', 'Numbers (1 or 0)'), rows: L('قطاریں: عنوان | قدر | ذیلی', 'Rows: label | value | sub'), big: L('بڑا ٹیکسٹ', 'Big text'), text: L('عبارت', 'Text'), author: L('نام', 'Author'),
    before: L('پہلے کا لیبل', 'Before label'), after: L('بعد کا لیبل', 'After label'), btext: L('پہلے کا متن', 'Before text'), atext: L('بعد کا متن', 'After text'), img0: L('تصویر 1', 'Image 1'), img1: L('تصویر 2', 'Image 2'), events: L('واقعات: سال | بات', 'Events: when | what'), headline: L('سرخی', 'Headline'), source: L('ذریعہ', 'Source'), ticker: L('چلتی پٹی کا متن', 'Ticker text'), tickerLabel: L('پٹی کا لیبل', 'Ticker label'),
    date: L('تاریخ', 'Date'), datetext: L('تاریخ کا متن', 'Date text'), label: L('لیبل', 'Label'), goal: L('ہدف', 'Goal'), raised: L('جمع ہوا', 'Raised'), unit: L('کرنسی', 'Currency'), howtitle: L('مدد کا عنوان', 'Help title'), how: L('طریقے (ہر لائن الگ)', 'Ways (one per row)'), note: L('نوٹ', 'Note'), handle: L('ہینڈل / لنک', 'Handle / link'), name: L('نام', 'Name'), role: L('عہدہ / تعارف', 'Role'), stars: L('ستارے (1-5)', 'Stars (1-5)'), address: L('پتہ', 'Address'), hint: L('نشانی', 'Hint'),
    price: L('قیمت', 'Price'), old: L('پرانی قیمت', 'Old price'), features: L('خوبیاں (ہر لائن الگ)', 'Features (one per row)'), code: L('کوڈ', 'Code'), till: L('آخری تاریخ', 'Valid until'), name1: L('پہلا نام', 'First name'), name2: L('دوسرا نام', 'Second name'), time: L('وقت', 'Time'), venue: L('جگہ', 'Venue'), say: L('بولنے کا متن (وائس اوور)', 'Voice-over text')
  };
  C.makeData = type => { const t = C.TYPES[type], o = {}; Object.keys(t.def).forEach(k => { const v = t.def[k]; o[k] = Array.isArray(v) ? v[S.lang === 'ur' ? 0 : 1] : v[S.lang === 'ur' ? 'u' : 'e']; }); o.say = ''; return o; };
  C.makeCard = (type, over) => ({ type, data: Object.assign(C.makeData(type), over || {}) });
  C.fields = type => (C.TYPES[type] ? C.TYPES[type].f : []).map(s => { const a = s.split(':'); return { k: a[0], kind: a[1] }; });

  /* draw a card scene; X: {imgs:[bitmap], logo} */
  C.drawCard = function (c, clip, p, u, W, H, X) {
    const card = clip.card; if (!card || !DR[card.type]) return;
    C.bg(c, u + (clip.t0 || 0) * .2, W, H, p);
    c.save(); c.globalAlpha *= cl((clip.len - u) / .35); DR[card.type](c, card.data, u, clip.len, W, H, th(p), X); c.restore();
  };
  C.thumb = function (clip, p, X) {
    const tc = document.createElement('canvas'); const f = p && p.fmt ? (S.proj.FORMATS[p.fmt] || [9, 16]) : [9, 16]; const h = 200; tc.width = Math.round(h * f[0] / f[1]); tc.height = h; const c = tc.getContext('2d');
    try { c.save(); c.scale(tc.width / 540, tc.height / (540 * f[1] / f[0])); const W = 540, H = 540 * f[1] / f[0]; if (clip.kind === 'c') C.drawCard(c, Object.assign({}, clip, { len: 99, t0: 0 }), p, Math.min(clip.len * .8, 4.5), W, H, X); c.restore(); } catch (e) { /* ignore */ } return tc;
  };

  /* =============== brand bar (header ribbon + footer strip) =============== */
  C.bar = function (c, p, W, H) {
    const b = p.brand || {}, t0 = th(p), { B, cx } = geo(W, H); if (b.bar === false) return;
    if (b.header) { c.save(); c.font = '800 ' + B * .03 + 'px ' + fontOf(b.header); const w = Math.min(W * .94, c.measureText(b.header.toUpperCase()).width + B * .1); c.restore(); pill(c, cx, H * .028, w, H * .03, grad2(c, cx - w / 2, 0, cx + w / 2, 0, t0.a1, t0.a2), null); T(c, b.header.toUpperCase(), cx, H * .028, B * .028, { color: '#fff', w: 800, sp: 1, maxW: w * .94 }); }
    const fh = H * .042, fy = H - fh; c.save(); c.fillStyle = 'rgba(6,6,20,.92)'; c.fillRect(0, fy, W, fh); c.strokeStyle = t0.a2; c.lineWidth = 1.5; c.globalAlpha = .7; c.beginPath(); c.moveTo(0, fy); c.lineTo(W, fy); c.stroke(); c.globalAlpha = 1; c.restore();
    const txt = (b.footer || b.name || ''), lg = C.logoImg(b.logo), R = fh * .36; let w = 0; if (txt) { c.save(); c.font = '800 ' + fh * .38 + 'px ' + fontOf(txt); w = c.measureText(txt.toUpperCase()).width; c.restore(); }
    const total = (lg ? R * 2 + fh * .25 : 0) + w, x0 = cx - total / 2;
    if (lg) { c.save(); c.beginPath(); c.arc(x0 + R, fy + fh / 2, R, 0, PI * 2); c.clip(); const k = Math.max(2 * R / lg.width, 2 * R / lg.height); c.drawImage(lg, x0 + R - lg.width * k / 2, fy + fh / 2 - lg.height * k / 2, lg.width * k, lg.height * k); c.restore(); }
    if (txt) T(c, txt.toUpperCase(), (lg ? x0 + R * 2 + fh * .25 : x0) + w / 2, fy + fh / 2, fh * .38, { color: '#e8e4ff', w: 800, sp: 1, maxW: W * .9 });
  };

  /* =============== media highlight frame =============== */
  C.hlRect = function (W, H) {
    if (H > W * 1.2) return { x: W * .07, y: H * .15, w: W * .86, h: H * .48 };
    if (W > H * 1.2) return { x: W * .2, y: H * .17, w: W * .6, h: H * .5 };
    return { x: W * .1, y: H * .16, w: W * .8, h: H * .5 };
  };
  /* mediaFn(c, rect) draws the picture inside the frame */
  C.drawHL = function (c, clip, p, u, W, H, mediaFn, allClips) {
    const hl = clip.hl || {}, t0 = th(p), { B, cx } = geo(W, H), R = C.hlRect(W, H); C.bg(c, u + (clip.t0 || 0) * .2, W, H, p);
    c.save(); c.shadowColor = t0.a2; c.shadowBlur = B * .04; rr(c, R.x, R.y, R.w, R.h, B * .05); c.fillStyle = '#000'; c.fill(); c.restore();
    c.save(); rr(c, R.x, R.y, R.w, R.h, B * .05); c.clip(); mediaFn(c, R); c.restore();
    c.save(); rr(c, R.x, R.y, R.w, R.h, B * .05); c.lineWidth = B * .008; c.strokeStyle = grad2(c, R.x, R.y, R.x + R.w, R.y + R.h, t0.a1, t0.a2); c.shadowColor = t0.a1; c.shadowBlur = 14; c.stroke(); c.restore();
    if (hl.chip) { const e = ob(cl(u / .45)); c.save(); c.translate(cx, R.y - H * .002); c.scale(e, e); c.font = '900 ' + B * .036 + 'px ' + fontOf(hl.chip); const w = Math.min(R.w * .9, c.measureText(hl.chip.toUpperCase()).width + B * .12); pill(c, 0, 0, w, H * .04, t0.c1, t0.a1, 2); T(c, hl.chip.toUpperCase(), 0, 0, B * .034, { color: t0.a2, w: 900, sp: 2, maxW: w * .92 }); c.restore(); }
    let y = R.y + R.h + H * .03;
    if (hl.title) { const num = hl.num ? String(hl.num).padStart(2, '0') : ''; let x = R.x; const rtl = S.isRTL(hl.title); if (num) { rr(c, rtl ? R.x + R.w - B * .07 : R.x, y, B * .07, H * .035, H * .01); c.fillStyle = t0.a1; c.fill(); T(c, num, (rtl ? R.x + R.w - B * .035 : R.x + B * .035), y + H * .0175, B * .033, { color: '#fff', w: 900 }); x = rtl ? R.x + R.w - B * .09 : R.x + B * .09; } T(c, hl.title.toUpperCase(), x, y + H * .0175, B * .042, { align: rtl ? 'right' : 'left', color: '#fff', w: 900, maxW: R.w - B * .1 }); y += H * .05; }
    const cs = allClips && p.strip !== false ? allClips.filter(x => x.kind !== 'c' && x.thumb) : []; if (cs.length > 1) { const n = Math.min(cs.length, 9), tw = Math.min(R.w / n - 4, B * .13), th2 = tw * .62, x0 = cx - (n * (tw + 4) - 4) / 2, idx = Math.max(0, cs.indexOf(clip)); const st = cs.length > 9 ? Math.max(0, Math.min(cs.length - 9, idx - 4)) : 0;
      for (let i = 0; i < n; i++) { const k = cs[st + i], x = x0 + i * (tw + 4), on = k === clip; c.save(); rr(c, x, y, tw, th2, 5); c.clip(); c.globalAlpha = on ? 1 : .55; const kk = Math.max(tw / k.thumb.width, th2 / k.thumb.height); c.drawImage(k.thumb, x + tw / 2 - k.thumb.width * kk / 2, y + th2 / 2 - k.thumb.height * kk / 2, k.thumb.width * kk, k.thumb.height * kk); c.restore(); if (on) { rr(c, x, y, tw, th2, 5); c.lineWidth = 2.5; c.strokeStyle = t0.a3; c.stroke(); } } y += th2 + H * .02; }
    const chips = lines(hl.chips).slice(0, 4).map(cols); if (chips.length) { const n = chips.length, gap = B * .03, w = Math.min((R.w - gap * (n - 1)) / n, B * .3), h = Math.min(H * .075, w * .72), x0 = cx - (n * w + (n - 1) * gap) / 2; chips.forEach((ch, i) => { const e = ob(cl((u - .3 - i * .12) / .45)); if (e <= 0) return; c.save(); c.translate(x0 + i * (w + gap) + w / 2, y + h / 2); c.scale(e, e); rr(c, -w / 2, -h / 2, w, h, h * .22); c.fillStyle = CH[i % 4]; c.fill(); T(c, ch[0], 0, -h * .1, h * .42, { color: '#1b1033', w: 900, maxW: w * .9 }); T(c, (ch[1] || '').toUpperCase(), 0, h * .3, h * .17, { color: '#1b1033', w: 800, maxW: w * .9, sp: 1 }); c.restore(); }); y += h + H * .02; }
    if (hl.sub) T(c, hl.sub.toUpperCase(), cx, Math.min(y + H * .02, H * .93 - H * .045), B * .036, { color: t0.a2, w: 800, sp: 1, maxW: W * .9 });
  };

  /* =============== lower third =============== */
  C.drawLower = function (c, lw, t, t0_, t1_, W, H, p) {
    const th0 = th(p), { col, B, cx } = geo(W, H), u = t - t0_, e = eo(cl(u / .5)), o = eo(cl((t1_ - t) / .4)); const a = Math.min(e, o); if (a <= 0) return;
    const w = Math.min(col * .9, B * .86), h = H * .075, rtl = S.isRTL(lw.name + (lw.role || '')), x = rtl ? W - (W - w) / 2 - w : (W - w) / 2, y = H * (lw.y || .8) - h / 2;
    c.save(); c.globalAlpha = a; c.translate((rtl ? 1 : -1) * (1 - e) * w * .4, 0); c.shadowColor = th0.a1; c.shadowBlur = 18; rr(c, x, y, w, h, h * .22); c.fillStyle = 'rgba(8,8,30,.9)'; c.fill(); c.shadowBlur = 0; c.lineWidth = 2.5; c.strokeStyle = grad2(c, x, y, x + w, y + h, th0.a1, th0.a2); c.stroke();
    const tx = rtl ? x + w - h * .3 : x + h * .3, al = rtl ? 'right' : 'left', mw = w - h * 2; T(c, lw.name, tx, y + h * .38, Math.min(h * .44, B * .06), { align: al, color: '#fff', w: 900, maxW: mw }); T(c, lw.role, tx, y + h * .75, h * .24, { align: al, color: th0.a2, w: 700, sp: 1, maxW: mw });
    const bx = rtl ? x + h * .35 : x + w - h * .35 - 5 * h * .1; for (let i = 0; i < 5; i++) { const bh = h * (.25 + .3 * Math.abs(Math.sin(t * 6 + i * 1.3))); c.fillStyle = th0.a2; rr(c, bx + i * h * .1, y + h / 2 - bh / 2, h * .06, bh, h * .03); c.fill(); } c.restore();
  };
  C.th = th;
})();
