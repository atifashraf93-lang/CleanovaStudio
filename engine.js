/* Cleanova Studio - timeline, renderer, preview player, audio mix and MP4/WebM export. Developed by SMAA */
(function () {
  'use strict';
  const S = window.Studio, FX = S.fx;
  const cl = (v, a, b) => Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, v));

  /* =================== project model =================== */
  const P = S.proj = {};
  P.FORMATS = { '9:16': [9, 16], '16:9': [16, 9], '1:1': [1, 1], '4:5': [4, 5] };
  P.newProject = function () {
    return {
      id: S.uid(), name: '', fmt: '9:16', res: 720, fit: 'blur', filter: 'none', filterAmt: 1, overlay: 'none', overlayAmt: 1, autoColor: true,
      clips: [], texts: [], stickers: [], voice: [], lines: [], style: 'family', credit: true,
      music: { kind: 'none', mood: 'calm', seed: 1, vol: .55, start: 0, duck: true }, vvol: 1, created: Date.now(),
      theme: 'neon', brand: { on: false, name: '', header: '', footer: '', logo: '' }, ticker: null, lowers: []
    };
  };
  P.newClip = function (o) {
    return Object.assign({ id: S.uid(), kind: 'i', name: '', in: 0, out: 0, speed: 1, len: 3, mute: false, freeze: false, fit: null, anim: { in: 'none', mid: 'none', out: 'none' }, vfx: 'none', trans: { type: 'fade', dur: .6 }, adj: null, score: 1, date: Date.now(), dur: 0, sw: 0, sh: 0 }, o || {});
  };
  P.newCard = function (type, over, len) {
    const C = S.cards, t = C.TYPES[type];
    return P.newClip({ kind: 'c', name: S.lang === 'ur' ? t.n[0] : t.n[1], len: len || t.len, card: C.makeCard(type, over), cfiles: [null, null], trans: { type: 'fade', dur: .5 }, anim: { in: 'none', mid: 'none', out: 'none' } });
  };
  P.newLower = function (o) { return Object.assign({ id: S.uid(), name: '', role: '', y: .8, clip: null, all: false, t0: 0, t1: 4 }, o || {}); };
  P.newText = function (o) {
    return Object.assign({ id: S.uid(), text: '', x: .5, y: .5, size: 7, font: 'sans', bold: true, color: '#ffffff', stroke: '', bg: '', shadow: true, w: .86, in: 'fade', mid: 'none', out: 'fade', clip: null, at: null, t0: 0, t1: 3, all: false, rot: 0 }, o || {});
  };
  P.newSticker = function (o) {
    return Object.assign({ id: S.uid(), ref: 'e:✨', x: .5, y: .5, size: 18, rot: 0, anim: 'pop', clip: null, t0: 0, t1: 3, all: false, x1: null, y1: null }, o || {});
  };
  const RT = ['an', 'file', 'url', 'el', 'bmp', 'thumb', 'frames', 'node', 'gain', 'buf', 'blob', '_musBuf', '_bmpLoading', '_pre', '_seeking', 'cfiles', 'cbmp', '_cLoading'];
  P.serialize = function (p) {
    return JSON.stringify(p, (k, v) => (RT.indexOf(k) >= 0 || (k[0] === '_' && k !== '_x') ? undefined : v));
  };
  P.blobsOf = function (p) {
    const m = {};
    p.clips.forEach(c => { if (c.file) m['c:' + c.id] = c.file; });
    p.clips.forEach(c => { if (c.cfiles) c.cfiles.forEach((f, i) => { if (f) m['f' + i + ':' + c.id] = f; }); });
    p.voice.forEach(v => { if (v.blob) m['v:' + v.id] = v.blob; });
    if (p.music.file) m['m:file'] = p.music.file;
    return m;
  };
  P.restore = async function (json, blobs) {
    const p = JSON.parse(json);
    p.clips.forEach(c => { const f = blobs['c:' + c.id]; if (f) { c.file = f; c.url = URL.createObjectURL(f); } });
    p.clips.forEach(c => { if (c.kind === 'c') { c.cfiles = [blobs['f0:' + c.id] || null, blobs['f1:' + c.id] || null]; } });
    p.voice.forEach(v => { const b = blobs['v:' + v.id]; if (b) v.blob = b; });
    if (!p.brand) p.brand = { on: false, name: '', header: '', footer: '', logo: '' }; if (!p.lowers) p.lowers = []; if (!p.theme) p.theme = 'neon';
    if (blobs['m:file']) p.music.file = blobs['m:file'];
    /* thumbs for placeholders */
    for (const c of p.clips) { try { if (c.kind === 'c') c.thumb = S.cards.thumb(c, p); else await P.makeThumb(c); } catch (e) { /* ignore */ } }
    return p;
  };
  P.makeThumb = async function (c) {
    if (c.kind === 'c') return c.thumb;
    const tc = document.createElement('canvas'); const k = 220 / Math.max(c.sw || 220, c.sh || 220); tc.width = Math.max(2, Math.round((c.sw || 220) * k)); tc.height = Math.max(2, Math.round((c.sh || 220) * k));
    const x = tc.getContext('2d');
    if (c.kind === 'i') { const im = await createImageBitmap(c.file, { resizeWidth: tc.width, resizeHeight: tc.height }); x.drawImage(im, 0, 0, tc.width, tc.height); im.close && im.close(); }
    else {
      const v = document.createElement('video'); v.muted = true; v.preload = 'auto'; v.src = c.url;
      await new Promise((res, rej) => { v.onloadeddata = res; v.onerror = () => rej(new Error('video')); setTimeout(res, 4000); });
      await new Promise(res => { v.onseeked = res; v.currentTime = Math.min(c.in || 0, (v.duration || 1) - .05); setTimeout(res, 2000); });
      x.drawImage(v, 0, 0, tc.width, tc.height); v.removeAttribute('src'); v.load();
    }
    c.thumb = tc; return tc;
  };

  /* WAV helper: AudioBuffer -> Blob */
  P.bufToWav = function (buf) {
    const ch = buf.numberOfChannels, n = buf.length, sr = buf.sampleRate, bytes = n * ch * 2, ab = new ArrayBuffer(44 + bytes), dv = new DataView(ab);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); dv.setUint32(4, 36 + bytes, true); w(8, 'WAVE'); w(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, ch, true); dv.setUint32(24, sr, true); dv.setUint32(28, sr * ch * 2, true); dv.setUint16(32, ch * 2, true); dv.setUint16(34, 16, true); w(36, 'data'); dv.setUint32(40, bytes, true);
    const d = []; for (let c = 0; c < ch; c++) d.push(buf.getChannelData(c));
    let o = 44; for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { const s = Math.max(-1, Math.min(1, d[c][i])); dv.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2; }
    return new Blob([ab], { type: 'audio/wav' });
  };

  /* =================== layout =================== */
  P.layout = function (p) {
    let end = 0, prev = null;
    p.clips.forEach((c, i) => {
      if (c.kind === 'v' && !c.freeze) c.len = Math.max(.2, (c.out - c.in) / (c.speed || 1));
      c.len = Math.max(.3, c.len);
      let d = 0;
      if (prev && c.trans && c.trans.type !== 'none') d = Math.max(0, Math.min(c.trans.dur || .6, prev.len * .45, c.len * .45));
      c.d = d; c.t0 = prev ? prev.t1 - d : 0; c.t1 = c.t0 + c.len; end = c.t1; prev = c;
    });
    p.dur = end;
    const nextD = c => { const i = p.clips.indexOf(c); const n = p.clips[i + 1]; return n ? n.d : 0; };
    const resolve = it => {
      if (it.at === 'start') { const vs = p.voice.find(v => v.at === 'start' && v.buf); it._t0 = 0; it._t1 = Math.min(p.dur, Math.max(Math.min(3.2, Math.max(1.2, p.dur * .4)), vs ? vs.buf.duration + .8 : 0)); return; }
      if (it.at === 'end') { const ve = p.voice.find(v => v.at === 'end' && v.buf); it._t1 = p.dur; it._t0 = Math.max(0, p.dur - Math.max(3, ve ? ve.buf.duration + .9 : 0)); return; }
      if (it.all) { it._t0 = 0; it._t1 = p.dur; return; }
      if (it.clip) {
        const c = p.clips.find(x => x.id === it.clip);
        if (c) { it._t0 = c.t0 + c.d + .12; it._t1 = Math.max(it._t0 + .8, c.t1 - nextD(c) - .05); return; }
      }
      it._t0 = it.t0; it._t1 = Math.max(it.t0 + .5, it.t1);
    };
    p.texts.forEach(resolve); p.stickers.forEach(resolve); (p.lowers || []).forEach(resolve);
    p.voice.forEach(v => { if (v.at === 'end') v._t = Math.max(0, p.dur - (v.buf ? v.buf.duration : 2.5) - .5); else if (v.at === 'start') v._t = .25; else if (v.clip) { const c = p.clips.find(x => x.id === v.clip); v._t = c ? c.t0 + c.d + .15 : (v.t || 0); } else v._t = v.t || 0; });
    return p.dur;
  };

  /* =================== engine =================== */
  class Engine {
    constructor(canvas) {
      this.cv = canvas; this.c = canvas.getContext('2d', { alpha: false }); this.p = null; this.t = 0; this.playing = false; this.exporting = false;
      this.ac = null; this.sel = null; this.hits = []; this.onTick = null; this.onEnd = null; this.W = 360; this.H = 640; this.dirty = true;
      this.loop = this.loop.bind(this); this.shortSide = 540; this.srcNodes = [];
      this._idle = () => { if (!this.playing && this.dirty && this.p) { this.dirty = false; this.prepare(this.t); this.render(this.t); } this._ir = requestAnimationFrame(this._idle); };
      this._ir = requestAnimationFrame(this._idle);
    }
    destroy() { cancelAnimationFrame(this._ir); this.pause(); if (this.p) this.p.clips.forEach(c => this.relClip(c)); }
    invalidate() { this.dirty = true; }
    setProject(p) { this.p = p; this.layoutAll(); this.size(); this.invalidate(); }
    layoutAll() { if (!this.p) return 0; this.dur = P.layout(this.p); this.t = cl(this.t, 0, this.dur); return this.dur; }
    size(short) {
      const p = this.p; if (!p) return; const f = P.FORMATS[p.fmt] || [9, 16]; short = short || this.shortSide;
      let w, h; if (f[0] >= f[1]) { h = short; w = short * f[0] / f[1]; } else { w = short; h = short * f[1] / f[0]; }
      w = Math.round(w / 2) * 2; h = Math.round(h / 2) * 2;
      if (this.cv.width !== w || this.cv.height !== h) { this.cv.width = w; this.cv.height = h; }
      this.W = w; this.H = h; this.invalidate();
    }

    /* ---------- media windows ---------- */
    relClip(c) {
      if (c.el) { try { c.el.pause(); } catch (e) { /* ignore */ } if (c.node) { try { c.node.disconnect(); c.gain.disconnect(); } catch (e) { /* ignore */ } } c.node = null; c.gain = null; c.el.removeAttribute('src'); try { c.el.load(); } catch (e) { /* ignore */ } c.el = null; }
      if (c.bmp) { try { c.bmp.close(); } catch (e) { /* ignore */ } c.bmp = null; }
    }
    mkVideo(c) {
      const el = document.createElement('video'); el.playsInline = true; el.preload = 'auto'; el.muted = true; el.setAttribute('playsinline', ''); el.src = c.url; c.el = el; c._pre = false;
      el.addEventListener('loadedmetadata', () => { try { el.currentTime = c.in || 0; } catch (e) { /* ignore */ } });
      el.addEventListener('seeked', () => { c._seeking = false; this.invalidate(); });
      el.addEventListener('error', () => { c.bad = true; });
    }
    loadBmp(c) {
      if (c.bmp || c._bmpLoading || c.bad || !c.file) return; c._bmpLoading = true;
      const k = Math.min(1, Math.max(this.W, this.H) * 1.3 / Math.max(c.sw || 1, c.sh || 1)), o = { resizeQuality: 'medium' };
      if (k < 1 && c.sw) { o.resizeWidth = Math.max(2, Math.round(c.sw * k)); o.resizeHeight = Math.max(2, Math.round(c.sh * k)); }
      createImageBitmap(c.file, o).then(b => { c._bmpLoading = false; if (c._dead) { b.close(); return; } c.bmp = b; this.invalidate(); }).catch(() => { c._bmpLoading = false; c.bad = true; });
    }
    hookAudio(c) {
      if (!this.ac || !c.el || c.node || c.mute || this.p.vvol <= 0) return;
      try {
        c.node = this.ac.createMediaElementSource(c.el); c.gain = this.ac.createGain(); c.gain.gain.value = this.p.vvol;
        c.node.connect(c.gain); c.gain.connect(this.master); c.el.muted = false;
      } catch (e) { c.node = null; }
    }
    prepare(t) {
      const p = this.p; if (!p) return;
      for (const c of p.clips) {
        const near = t >= c.t0 - 1.6 && t <= c.t1 + .3, far = t < c.t0 - 4 || t > c.t1 + 1.2;
        if (c.kind === 'c') { if (near) this.loadCard(c); continue; }
        if (c.kind === 'i') { if (near) this.loadBmp(c); else if (far && c.bmp) { try { c.bmp.close(); } catch (e) { /* ignore */ } c.bmp = null; } continue; }
        if (near && !c.el && !c.bad) this.mkVideo(c);
        else if (far && c.el) { this.relClip(c); continue; }
        const el = c.el; if (!el) continue;
        const active = t >= c.t0 && t < c.t1;
        const lt = c.freeze ? c.in : Math.min(c.out, c.in + Math.max(0, t - c.t0) * c.speed);
        if (this.playing && active && !c.freeze) {
          this.hookAudio(c);
          if (c.gain) c.gain.gain.value = c.mute ? 0 : p.vvol;
          const rate = cl(c.speed, .0625, 16);
          if (el.playbackRate !== rate) el.playbackRate = rate;
          if (el.readyState >= 1 && Math.abs(el.currentTime - lt) > .4 && !c._seeking) { c._seeking = true; try { el.currentTime = lt; } catch (e) { c._seeking = false; } }
          if (el.paused && el.readyState >= 2) { const pr = el.play(); if (pr && pr.catch) pr.catch(() => { /* autoplay blocked */ }); }
        } else {
          if (!el.paused) el.pause();
          if (el.readyState >= 1 && !c._seeking) {
            const target = active || t < c.t0 ? (active ? lt : c.in) : lt;
            if (Math.abs(el.currentTime - target) > (active ? .03 : .2)) { c._seeking = true; try { el.currentTime = target; } catch (e) { c._seeking = false; } }
          }
        }
      }
    }
    loadCard(c) {
      if (!c.cfiles || c._cLoading) return; if (!c.cbmp) c.cbmp = [null, null];
      c.cfiles.forEach((f, i) => { if (f && !c.cbmp[i] && !c['_cl' + i]) { c['_cl' + i] = true; createImageBitmap(f, { resizeWidth: 900 }).then(b => { c.cbmp[i] = b; this.dirty = true; }).catch(() => { c.cbmp[i] = null; }); } });
    }
    ready(t) {
      const p = this.p; if (!p) return true;
      for (const c of p.clips) { if (t >= c.t0 - .05 && t < c.t1) { if (c.kind === 'c') { if (c.cfiles && c.cfiles.some((f, i) => f && !(c.cbmp && c.cbmp[i]))) return false; } else if (c.kind === 'v') { if (!c.el || c.el.readyState < 2 || c._seeking) return false; } else if (!c.bmp && !c.bad) return false; } }
      return true;
    }

    /* ---------- drawing ---------- */
    source(c) {
      if (c.kind === 'i' && c.bmp) return { el: c.bmp, w: c.bmp.width, h: c.bmp.height };
      if (c.kind === 'v' && c.el && c.el.readyState >= 2 && c.el.videoWidth) return { el: c.el, w: c.el.videoWidth, h: c.el.videoHeight };
      if (c.kind === 'c') return null;
      if (c.thumb) return { el: c.thumb, w: c.thumb.width, h: c.thumb.height };
      return null;
    }
    layer(ctx, c, t) {
      const W = this.W, H = this.H, p = this.p, u = Math.max(0, t - c.t0), len = c.len, src = this.source(c);
      if (c.kind === 'c') { ctx.save(); S.cards.drawCard(ctx, c, p, u, W, H, { imgs: c.cbmp || [], logo: p.brand && p.brand.logo }); ctx.restore(); return; }
      if (src && c.hl && c.hl.on) { this.layerHL(ctx, c, t, u, src); return; }
      if (!src) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); return; }
      const seed = parseInt(c.id.slice(-3), 36) || 0;
      const fin = Math.min(.5, len * .3), fout = Math.min(.5, len * .3);
      let a = 1, tx = 0, ty = 0, s = 1, r = 0, sx = 1;
      const mul = x => { a *= x.a; tx += x.tx; ty += x.ty; s *= x.s; r += x.r; sx *= x.sx; };
      const an = c.anim || {};
      if (an.in && an.in !== 'none' && u < fin) mul(FX.IN[an.in](u / fin));
      if (an.out && an.out !== 'none' && len - u < fout) mul(FX.OUT[an.out](1 - (len - u) / fout));
      const mid = an.mid && FX.MID[an.mid]; if (mid) mul(mid(cl(u / len), u, seed));
      if (c.vfx === 'punch') s *= 1 + .1 * Math.pow(Math.max(0, Math.sin(u * Math.PI / .75)), 3);
      if (c.vfx === 'mirror') sx *= -1;
      if (c.vfx === 'shake') { tx += Math.sin(u * 40) * .007; ty += Math.cos(u * 33) * .007; }
      const fit = c.fit || p.fit, cover = Math.max(W / src.w, H / src.h), contain = Math.min(W / src.w, H / src.h);
      const sc0 = fit === 'fit' || fit === 'blur' ? contain : cover;
      const filt = FX.filterCSS(p.filter, p.filterAmt, p.autoColor ? c.adj : null);
      const ga = ctx.globalAlpha;
      ctx.save();
      if (fit === 'blur' && Math.abs(cover - contain) / cover > .02) {
        const cs = cover * 1.05; const bgDraw = x => { x.save(); x.translate(W / 2, H / 2); x.drawImage(src.el, -src.w * cs / 2, -src.h * cs / 2, src.w * cs, src.h * cs); x.restore(); };
        FX.blurDraw(ctx, bgDraw, W, H, 14); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(0, 0, W, H);
      }
      const fg = (dx) => {
        ctx.save(); ctx.globalAlpha = ga * a; ctx.translate(W / 2 + tx * W + (dx || 0), H / 2 + ty * H); ctx.rotate(r); ctx.scale(s * sx, s);
        if (filt !== 'none') ctx.filter = filt;
        ctx.drawImage(src.el, -src.w * sc0 / 2, -src.h * sc0 / 2, src.w * sc0, src.h * sc0); ctx.restore();
      };
      fg(0);
      if (c.vfx === 'glitch') {
        const ph = (u % 1.4) / 1.4; if (ph < .16) {
          for (let i = 0; i < 4; i++) { const y0 = FX.rnd(i, Math.floor(u * 12)) * H, hh = H * (.03 + FX.rnd(i, 9) * .06); ctx.save(); ctx.beginPath(); ctx.rect(0, y0, W, hh); ctx.clip(); fg((FX.rnd(i, Math.floor(u * 12) + 2) - .5) * W * .12); ctx.restore(); }
          ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = ga * .18; ctx.fillStyle = '#f0f'; ctx.fillRect(0, 0, W, H); ctx.restore();
        }
      }
      ctx.restore();
    }
    layerHL(ctx, c, t, u, src) {
      const W = this.W, H = this.H, p = this.p, fin = Math.min(.5, c.len * .3); let a = 1; const an = c.anim || {};
      const ga = ctx.globalAlpha; ctx.save();
      S.cards.drawHL(ctx, c, p, u, W, H, (x, R) => {
        const cover = Math.max(R.w / src.w, R.h / src.h); let s = cover;
        const mid = an.mid && FX.MID[an.mid]; let m = mid ? mid(cl(u / c.len), u, 3) : null; if (m) s *= m.s;
        if (c.vfx === 'punch') s *= 1 + .1 * Math.pow(Math.max(0, Math.sin(u * Math.PI / .75)), 3);
        const filt = FX.filterCSS(p.filter, p.filterAmt, p.autoColor ? c.adj : null); if (filt !== 'none') x.filter = filt;
        x.translate(R.x + R.w / 2 + (m ? m.tx * R.w : 0), R.y + R.h / 2 + (m ? m.ty * R.h : 0)); x.drawImage(src.el, -src.w * s / 2, -src.h * s / 2, src.w * s, src.h * s);
      }, p.clips);
      ctx.restore(); ctx.globalAlpha = ga;
    }
    render(t) {
      const p = this.p, c = this.c, W = this.W, H = this.H; if (!p) return;
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.filter = 'none'; c.globalCompositeOperation = 'source-over'; c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
      const cs = p.clips; let i = -1; for (let k = 0; k < cs.length; k++) if (cs[k].t0 <= t + 1e-6) i = k;
      if (i >= 0) {
        const B = cs[i];
        if (i > 0 && t < B.t0 + B.d && B.d > 0) {
          const A = cs[i - 1], pr = cl((t - B.t0) / B.d), f = FX.TR[B.trans.type] || FX.TR.fade;
          f(c, pr, x => this.layer(x, A, t), x => this.layer(x, B, t), W, H);
        } else this.layer(c, B, t);
      }
      FX.filterTop(c, p.filter, p.filterAmt, W, H);
      if (p.overlay && p.overlay !== 'none' && FX.OVL[p.overlay]) FX.OVL[p.overlay](c, t, W, H, p.overlayAmt === undefined ? 1 : p.overlayAmt);
      this.hits = [];
      p.stickers.forEach(st => { if (t >= st._t0 && t <= st._t1) { c.save(); const h = FX.drawSticker(c, st, t, st._t0, st._t1, W, H); c.restore(); if (h) { h.kind = 'sticker'; h.id = st.id; this.hits.push(h); } } });
      p.texts.forEach(it => { if (it.text && t >= it._t0 && t <= it._t1) { const h = FX.drawText(c, it, t, it._t0, it._t1, W, H); if (h) { h.kind = 'text'; h.id = it.id; this.hits.push(h); } } });
      if (p.ticker && p.ticker.on && p.ticker.text) S.cards.drawTicker(c, p.ticker, t, W, H);
      (p.lowers || []).forEach(lw => { if ((lw.name || lw.role) && t >= lw._t0 && t <= lw._t1) S.cards.drawLower(c, lw, t, lw._t0, lw._t1, W, H, p); });
      if (p.brand && p.brand.on) S.cards.bar(c, p, W, H);
      if (p.credit) FX.credit(c, W, H, t, p.dur, 'Developed by SMAA');
      if (!this.exporting && this.sel) {
        const h = this.hits.find(x => x.id === this.sel);
        if (h) { c.save(); c.strokeStyle = '#7c5cff'; c.lineWidth = Math.max(2, W / 240); c.setLineDash([W / 60, W / 90]); c.strokeRect(h.x - h.w / 2, h.y - h.h / 2, h.w, h.h); c.restore(); }
      }
      c.restore();
    }
    hitAt(x, y) { for (let i = this.hits.length - 1; i >= 0; i--) { const h = this.hits[i]; if (Math.abs(x - h.x) <= h.w / 2 + 8 && Math.abs(y - h.y) <= h.h / 2 + 8) return h; } return null; }

    /* ---------- audio ---------- */
    ensureAudio() {
      if (!this.ac) {
        const AC = window.AudioContext || window.webkitAudioContext; this.ac = new AC();
        this.master = this.ac.createGain(); this.spk = this.ac.createGain(); this.master.connect(this.spk); this.spk.connect(this.ac.destination);
        this.musGain = this.ac.createGain(); this.musGain.connect(this.master);
        this.voiGain = this.ac.createGain(); this.voiGain.connect(this.master);
      }
      if (this.ac.state === 'suspended') this.ac.resume();
    }
    async loadMusic() {
      const p = this.p, m = p.music; p._musBuf = null;
      if (m.kind === 'synth') { p._musBuf = await S.music.get(m.mood, m.seed || 1); }
      else if (m.kind === 'file' && m.file) { this.ensureAudio(); const ab = await m.file.arrayBuffer(); p._musBuf = await new Promise((res, rej) => this.ac.decodeAudioData(ab, res, rej)); }
      return p._musBuf;
    }
    stopAudio() { this.srcNodes.forEach(n => { try { n.stop(); } catch (e) { /* ignore */ } try { n.disconnect(); } catch (e) { /* ignore */ } }); this.srcNodes = []; }
    startAudio(t) {
      this.stopAudio(); const p = this.p, ac = this.ac, now = ac.currentTime + .03; if (!ac) return;
      const m = p.music, mb = p._musBuf;
      this.musGain.gain.cancelScheduledValues(0);
      if (mb && m.kind !== 'none') {
        const s = ac.createBufferSource(); s.buffer = mb; s.loop = true; s.connect(this.musGain);
        const off = ((t + (m.start || 0)) % mb.duration + mb.duration) % mb.duration; s.start(now, off); this.srcNodes.push(s);
        const v = m.vol, g = this.musGain.gain; g.setValueAtTime(t < .5 ? 0 : v, now); if (t < .5) g.linearRampToValueAtTime(v, now + .8 - t);
        const fo = Math.max(0, p.dur - 1.6 - t); g.setValueAtTime(v, now + fo); g.linearRampToValueAtTime(0, now + fo + 1.6);
        if (m.duck) {
          p.voice.forEach(vo => { if (!vo.buf) return; const a0 = vo._t - t, a1 = a0 + vo.buf.duration; if (a1 < 0) return; g.setTargetAtTime(v * .28, now + Math.max(0, a0 - .1), .12); g.setTargetAtTime(v, now + Math.max(0, a1 + .2), .25); });
        }
      }
      p.voice.forEach(vo => {
        if (!vo.buf) return; const end = vo._t + vo.buf.duration; if (end <= t) return;
        const s = ac.createBufferSource(); s.buffer = vo.buf; const g = ac.createGain(); g.gain.value = vo.vol === undefined ? 1 : vo.vol; s.connect(g); g.connect(this.voiGain);
        const when = now + Math.max(0, vo._t - t), off = Math.max(0, t - vo._t); s.start(when, off); this.srcNodes.push(s);
      });
    }

    /* ---------- playback ---------- */
    async play() {
      if (this.playing || !this.p) return; this.layoutAll(); if (this.t >= this.dur - .05) this.t = 0;
      this.ensureAudio(); if (this.p.music.kind !== 'none' && !this.p._musBuf) { try { await this.loadMusic(); } catch (e) { /* ignore */ } }
      this.playing = true; this.tBase = this.t; this.w0 = performance.now(); this.startAudio(this.t); this.raf = requestAnimationFrame(this.loop);
      if (this.onState) this.onState(true);
    }
    pause() {
      if (!this.playing) return; this.playing = false; cancelAnimationFrame(this.raf); this.stopAudio();
      if (this.p) this.p.clips.forEach(c => { if (c.el) try { c.el.pause(); } catch (e) { /* ignore */ } });
      this.invalidate(); if (this.onState) this.onState(false);
    }
    seek(t) {
      this.t = cl(t, 0, this.dur || 0); if (this.playing) { this.tBase = this.t; this.w0 = performance.now(); this.startAudio(this.t); } this.invalidate();
    }
    loop() {
      if (!this.playing) return;
      let t = this.tBase + (performance.now() - this.w0) / 1000;
      if (t >= this.dur) { this.t = this.dur; this.prepare(this.dur - .01); this.render(this.dur - .001); this.playing = false; this.stopAudio(); this.p.clips.forEach(c => { if (c.el) try { c.el.pause(); } catch (e) { /* ignore */ } }); if (this.onTick) this.onTick(this.dur); if (this.onState) this.onState(false); if (this.onEnd) this.onEnd(); return; }
      this.t = t; this.prepare(t); this.render(t); if (this.onTick) this.onTick(t); this.raf = requestAnimationFrame(this.loop);
    }

    /* ---------- export ---------- */
    static mimes() {
      const L = ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
      if (!window.MediaRecorder) return [];
      return L.filter(m => { try { return MediaRecorder.isTypeSupported(m); } catch (e) { return false; } });
    }
    static mime() { return Engine.mimes()[0] || ''; }
    async exportVideo(o) {
      const list = Engine.mimes(); if (!list.length) throw new Error('recorder');
      /* try the best format first; if the phone's recorder fails, fall back to the next one */
      const cands = [list.find(m => /mp4;codecs=avc1/.test(m)), list.find(m => m === 'video/mp4'), list.find(m => /webm/.test(m))].filter((m, i, a) => m && a.indexOf(m) === i); let last = null;
      for (const m of cands) {
        try { return await this._export(o, m); } catch (e) { last = e; if (e.message === 'cancelled' || e.kind !== 'rec') throw e; }
      }
      throw last || new Error('recorder');
    }
    async _export(o, mime) {
      o = o || {}; const p = this.p; if (!p) throw new Error('no project');
      this.pause(); this.layoutAll();
      const prevShort = this.shortSide; this.exporting = true; this.sel = null; this.shortSide = o.res || p.res || 720; this.size(this.shortSide);
      let cancelled = false, recErr = null; this._cancel = () => { cancelled = true; };
      const prevTick = this.onTick; let rec = null;
      try {
        this.p.clips.forEach(c => { if (c.bmp) { try { c.bmp.close(); } catch (e) { /* ignore */ } c.bmp = null; } });
        this.ensureAudio(); this.spk.gain.value = 0; this.stopAudio();
        if (!this.recDest) { this.recDest = this.ac.createMediaStreamDestination(); this.master.connect(this.recDest); }
        if (p.music.kind !== 'none') { try { await this.loadMusic(); } catch (e) { /* ignore */ } }
        const stream = this.cv.captureStream(30); this.recDest.stream.getAudioTracks().forEach(tr => stream.addTrack(tr));
        const bps = this.W * this.H >= 1500000 ? 9e6 : 5.5e6;
        rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: bps, audioBitsPerSecond: 128000 });
        const chunks = []; rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
        rec.onerror = e => { recErr = (e && e.error) || e || new Error('rec'); };
        const stopped = new Promise(res => { rec.onstop = res; });
        this.t = 0; this.prepare(0);
        for (let i = 0; i < 60 && !this.ready(0); i++) { await S.sleep(100); this.prepare(0); }
        this.render(0);
        const done = new Promise(res => { this.onEnd = () => res('ok'); });
        this.onTick = t => { if (o.onProgress) o.onProgress(t / Math.max(.1, this.dur)); };
        rec.start(1000); await this.play();
        const w0 = Date.now(); let wd = 0;
        const watch = new Promise(res => { wd = setInterval(() => { if (cancelled) res('cancel'); else if (recErr) res('fail'); else if (Date.now() - w0 > 10000 && !chunks.length) res('fail'); }, 300); });
        const r = await Promise.race([done, watch]); clearInterval(wd);
        if (r !== 'ok') { this.pause(); this.onEnd = null; } else await S.sleep(180);
        try { if (rec.state !== 'inactive') rec.stop(); } catch (e) { /* ignore */ }
        await Promise.race([stopped, S.sleep(4000)]);
        if (r === 'cancel') throw new Error('cancelled');
        if (r === 'fail' || recErr || !chunks.length) { const er = new Error('recorder failed'); er.kind = 'rec'; throw er; }
        const type = (mime.split(';')[0]) || 'video/mp4';
        return { blob: new Blob(chunks, { type }), mime: type, ext: type.indexOf('mp4') >= 0 ? 'mp4' : 'webm' };
      } finally {
        try { if (rec && rec.state !== 'inactive') rec.stop(); } catch (e) { /* ignore */ }
        this.onTick = prevTick; this.onEnd = null; this.exporting = false; if (this.spk) this.spk.gain.value = 1;
        this.shortSide = prevShort; this.size(prevShort); this.t = 0; this.invalidate();
      }
    }
    cancelExport() { if (this._cancel) this._cancel(); }
  }
  S.Engine = Engine;
})();
