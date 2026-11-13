/* Cleanova Studio - media analysis and automatic editing (rules based, runs on the phone). Developed by SMAA */
(function () {
  'use strict';
  const S = window.Studio, P = S.proj, FX = S.fx, M = S.music;
  const A = S.auto = {};
  const cl = (v, a, b) => Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, v));

  /* =============== styles =============== */
  A.STYLES = {
    family: { n: ['فیملی / یادیں', 'Family'], e: '👨‍👩‍👧', g: ['#ff9a6c', '#ff5fa2'], d: ['نرم، گرم رنگ، آہستہ زوم', 'Soft, warm, slow zoom'], mood: 'calm', filter: 'warm', fa: .7, overlay: 'bokeh', oa: .6, trans: ['fade', 'dissolve', 'slideL', 'circleOpen'], photoLen: 3.2, vidMax: 5.5, text: { font: 'naskh', size: 6.4, color: '#ffffff', stroke: '', bg: 'rgba(0,0,0,.38)', y: .82, in: 'fade', out: 'fade', mid: 'none' }, title: { size: 10, in: 'zoom', y: .45 } },
    safar: { n: ['سفر', 'Travel'], e: '🏔️', g: ['#3ec9ff', '#4d6bff'], d: ['تیز کٹ، شوخ رنگ', 'Quick cuts, vivid colors'], mood: 'travel', filter: 'vivid', fa: .6, overlay: 'lightleak', oa: .6, trans: ['pushL', 'slideL', 'zoomIn', 'wipeL', 'blur'], photoLen: 2.6, vidMax: 4.5, text: { font: 'sans', size: 6.8, color: '#ffffff', stroke: '#000000', bg: '', y: .8, in: 'slideU', out: 'fade', mid: 'none' }, title: { size: 11, in: 'pop', y: .45 } },
    shadi: { n: ['شادی', 'Wedding'], e: '💍', g: ['#ffd36b', '#ff8a5c'], d: ['سنہری، پھول کی پتیاں', 'Golden, petals'], mood: 'party', filter: 'golden', fa: .8, overlay: 'petals', oa: .9, trans: ['circleOpen', 'heart', 'fade', 'splitV', 'spin'], photoLen: 3, vidMax: 5, text: { font: 'naskh', size: 7, color: '#ffe08a', stroke: '#5a1a00', bg: '', y: .8, in: 'zoom', out: 'fade', mid: 'glow' }, title: { size: 11, in: 'pop', y: .45 } },
    islamic: { n: ['اسلامی / نعت', 'Islamic'], e: '🕌', g: ['#2fbf9b', '#1d6b8f'], d: ['پرسکون، ستارے، نرم روشنی', 'Calm, stars, soft light'], mood: 'islamic', filter: 'soft', fa: .8, overlay: 'stars', oa: .8, trans: ['fade', 'dissolve', 'dipBlack'], photoLen: 3.6, vidMax: 5.5, text: { font: 'naskh', size: 7, color: '#ffe9a8', stroke: '', bg: 'rgba(8,28,22,.5)', y: .8, in: 'fade', out: 'fade', mid: 'none' }, title: { size: 10, in: 'fade', y: .45 } },
    party: { n: ['پارٹی / سالگرہ', 'Party'], e: '🎉', g: ['#ff5fa2', '#ffb347'], d: ['کنفیٹی، تیز، رنگین', 'Confetti, fast, colorful'], mood: 'happy', filter: 'vivid', fa: .7, overlay: 'confetti', oa: .8, trans: ['flash', 'spin', 'zoomIn', 'glitch', 'checker'], photoLen: 2.4, vidMax: 4, text: { font: 'hand', size: 7.4, color: '#ffffff', stroke: '#ff3d7f', bg: '', y: .8, in: 'bounce', out: 'fade', mid: 'none' }, title: { size: 12, in: 'bounce', y: .45 } },
    cinema: { n: ['فلمی', 'Cinematic'], e: '🎬', g: ['#3a4a6b', '#0d1730'], d: ['گہرے رنگ، فلم کا گرین', 'Dark tones, film grain'], mood: 'epic', filter: 'cinematic', fa: .9, overlay: 'film', oa: .7, trans: ['dipBlack', 'fade', 'zoomOut'], photoLen: 3.4, vidMax: 5.5, text: { font: 'serif', size: 6.4, color: '#f3ead2', stroke: '', bg: '', y: .84, in: 'fade', out: 'fade', mid: 'none' }, title: { size: 10, in: 'fade', y: .45 } },
    simple: { n: ['سادہ', 'Simple'], e: '✨', g: ['#8b7cff', '#5ad1ff'], d: ['صاف اور سادہ', 'Clean and simple'], mood: 'calm', filter: 'none', fa: 1, overlay: 'none', oa: 1, trans: ['fade'], photoLen: 3, vidMax: 5, text: { font: 'sans', size: 6.2, color: '#ffffff', stroke: '', bg: 'rgba(0,0,0,.4)', y: .82, in: 'fade', out: 'fade', mid: 'none' }, title: { size: 9, in: 'fade', y: .45 } }
  };
  A.STYLE_LIST = Object.keys(A.STYLES);
  A.KW = {
    shadi: ['shadi', 'shaadi', 'wedding', 'barat', 'baraat', 'mehndi', 'walima', 'dulha', 'dulhan', 'nikah', 'شادی', 'بارات', 'مہندی', 'ولیمہ', 'دولہا', 'دلہن', 'نکاح'],
    islamic: ['allah', 'dua', 'naat', 'ramzan', 'ramadan', 'eid', 'umrah', 'hajj', 'madina', 'makkah', 'mecca', 'quran', 'masjid', 'shukar', 'alhamdulillah', 'mubarak', 'rasool', 'اللہ', 'دعا', 'نعت', 'رمضان', 'عید', 'عمرہ', 'حج', 'مدینہ', 'مکہ', 'قرآن', 'مسجد', 'شکر', 'مبارک', 'رسول'],
    party: ['birthday', 'salgirah', 'party', 'celebrat', 'congrat', 'masti', 'fun', 'جشن', 'سالگرہ', 'پارٹی', 'مستی'],
    safar: ['safar', 'travel', 'trip', 'tour', 'murree', 'hunza', 'swat', 'naran', 'mountain', 'pahad', 'road', 'journey', 'سفر', 'ٹرپ', 'مری', 'ہنزہ', 'سوات', 'ناران', 'پہاڑ', 'وادی', 'مسافر'],
    family: ['family', 'bachay', 'bachon', 'kids', 'ammi', 'abbu', 'ghar', 'yaad', 'beta', 'beti', 'خاندان', 'بچے', 'بچوں', 'امی', 'ابو', 'گھر', 'یاد', 'بیٹا', 'بیٹی']
  };
  A.detect = function (text) {
    const t = String(text || '').toLowerCase(); let best = null, bs = 0; const sc = {};
    Object.keys(A.KW).forEach(k => { let n = 0; A.KW[k].forEach(w => { if (t.indexOf(w) >= 0) n++; }); sc[k] = n; if (n > bs) { bs = n; best = k; } });
    return { style: best, score: bs, all: sc };
  };

  /* =============== analysis =============== */
  const stats = (ctx, w, h) => {
    const d = ctx.getImageData(0, 0, w, h).data; let sum = 0, g = 0; const l = new Float32Array(w * h);
    for (let i = 0, j = 0; i < d.length; i += 4, j++) { const v = (.299 * d[i] + .587 * d[i + 1] + .114 * d[i + 2]); l[j] = v; sum += v; }
    for (let y = 0; y < h - 1; y++) for (let x = 0; x < w - 1; x++) { const k = y * w + x; g += Math.abs(l[k] - l[k + 1]) + Math.abs(l[k] - l[k + w]); }
    const luma = sum / l.length / 255, sharp = g / (l.length * 2);
    const sh = cl(sharp / 11), expo = 1 - cl(Math.abs(luma - .5) * 1.7);
    return { luma, sharp, q: (.35 + .65 * sh) * (.3 + .7 * expo), l };
  };
  const ahash = (l, w, h) => { /* 8x8 average hash of a luma grid */
    const c = document.createElement('canvas'); c.width = 8; c.height = 8; const x = c.getContext('2d'); const id = x.createImageData(w, h);
    for (let i = 0; i < l.length; i++) { id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = l[i]; id.data[i * 4 + 3] = 255; }
    const t = document.createElement('canvas'); t.width = w; t.height = h; t.getContext('2d').putImageData(id, 0, 0); x.drawImage(t, 0, 0, 8, 8);
    const d = x.getImageData(0, 0, 8, 8).data; let m = 0; const v = []; for (let i = 0; i < 64; i++) { v.push(d[i * 4]); m += d[i * 4]; } m /= 64; return v.map(a => (a > m ? 1 : 0)).join('');
  };
  const ham = (a, b) => { let n = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++; return n; };
  const jpeg = (src, sw, sh, max) => { const k = max / Math.max(sw, sh), c = document.createElement('canvas'); c.width = Math.max(2, Math.round(sw * Math.min(1, k))); c.height = Math.max(2, Math.round(sh * Math.min(1, k))); c.getContext('2d').drawImage(src, 0, 0, c.width, c.height); return { c, url: c.toDataURL('image/jpeg', .6) }; };
  const waitEv = (el, ev, ms) => new Promise(res => { let done = false; const f = () => { if (!done) { done = true; el.removeEventListener(ev, f); res(true); } }; el.addEventListener(ev, f); setTimeout(() => { if (!done) { done = true; el.removeEventListener(ev, f); res(false); } }, ms); });

  A.loadFile = async function (file, wantFrames) {
    const isV = /^video\//.test(file.type) || /\.(mp4|mov|3gp|mkv|webm|m4v)$/i.test(file.name);
    const c = P.newClip({ kind: isV ? 'v' : 'i', name: file.name, file, url: URL.createObjectURL(file), date: file.lastModified || Date.now() });
    const SZ = 48, an = document.createElement('canvas'); an.width = an.height = SZ; const ax = an.getContext('2d', { willReadFrequently: true });
    if (!isV) {
      const bmp = await createImageBitmap(file); c.sw = bmp.width; c.sh = bmp.height;
      const t = jpeg(bmp, bmp.width, bmp.height, 220); c.thumb = t.c; ax.drawImage(bmp, 0, 0, SZ, SZ); const st = stats(ax, SZ, SZ);
      c.an = { q: st.q, luma: st.luma, hash: ahash(st.l, SZ, SZ) }; c.score = st.q; if (wantFrames) c.frames = [jpeg(bmp, bmp.width, bmp.height, 320).url];
      if (bmp.close) bmp.close(); c.len = 3; c.dur = 0;
    } else {
      const v = document.createElement('video'); v.muted = true; v.preload = 'auto'; v.playsInline = true; v.src = c.url;
      const ok = await waitEv(v, 'loadedmetadata', 8000); if (!ok || !v.videoWidth) { URL.revokeObjectURL(c.url); throw new Error('video'); }
      c.sw = v.videoWidth; c.sh = v.videoHeight; c.dur = isFinite(v.duration) ? v.duration : 5; c.in = 0; c.out = c.dur;
      const n = cl(Math.ceil(c.dur / 2), 3, 8), ts = [], qs = [], lumas = []; const keep = wantFrames ? [0, Math.floor(n / 2), n - 1] : []; c.frames = [];
      for (let i = 0; i < n; i++) {
        const tt = Math.min(c.dur - .05, Math.max(0, (i + .5) * c.dur / n)); ts.push(tt);
        v.currentTime = tt; await waitEv(v, 'seeked', 2500);
        try { ax.drawImage(v, 0, 0, SZ, SZ); const st = stats(ax, SZ, SZ); qs.push(st.q); lumas.push(st.luma); } catch (e) { qs.push(.5); lumas.push(.5); }
        if (i === Math.min(1, n - 1)) { const t = jpeg(v, c.sw, c.sh, 220); c.thumb = t.c; }
        if (keep.indexOf(i) >= 0) c.frames.push(jpeg(v, c.sw, c.sh, 320).url);
      }
      v.removeAttribute('src'); v.load();
      c.an = { ts, qs, lumas }; c.score = qs.reduce((a, b) => a + b, 0) / qs.length;
      if (!c.thumb) c.thumb = document.createElement('canvas');
    }
    return c;
  };

  /* choose the best window of length L in a video */
  A.window = function (c, L) {
    if (c.kind !== 'v') return [0, 0];
    if (c.dur <= L + .4) return [0, c.dur];
    const { ts, qs } = c.an; let best = 0, bs = -1;
    for (let s = 0; s <= c.dur - L + 1e-6; s += .5) {
      let sum = 0, n = 0; ts.forEach((t, i) => { if (t >= s - .6 && t <= s + L + .6) { sum += qs[i]; n++; } });
      const v = n ? sum / n : 0; const sc = v - s * .002; if (sc > bs) { bs = sc; best = s; }
    }
    return [best, Math.min(c.dur, best + L)];
  };
  A.adjFor = function (c) {
    let m = c.an && c.an.luma !== undefined ? c.an.luma : (c.an && c.an.lumas ? c.an.lumas.reduce((a, b) => a + b, 0) / c.an.lumas.length : .5);
    const adj = { b: 1, c: 1, s: 1 };
    if (m < .3) { adj.b = 1.2; adj.c = 1.06; } else if (m < .4) { adj.b = 1.1; adj.c = 1.03; } else if (m > .75) { adj.b = .9; adj.c = 1.04; } else if (m > .66) adj.b = .95;
    adj.s = 1.06; return adj;
  };
  /* drop near-identical photos that sit next to each other (bursts) */
  A.dedupe = function (clips) {
    const out = [], dropped = [];
    clips.forEach(c => {
      const last = out[out.length - 1];
      if (last && c.kind === 'i' && last.kind === 'i' && c.an.hash && last.an.hash && ham(c.an.hash, last.an.hash) <= 4) {
        if (c.score > last.score) { dropped.push(last); out[out.length - 1] = c; } else dropped.push(c);
      } else out.push(c);
    });
    return { kept: out, dropped };
  };

  /* =============== building the project =============== */
  const capLen = t => Math.min(7, .9 + String(t || '').length * .055);
  A.cleanLines = txt => String(txt || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);

  /* o: {style, fmt, res, lines[], music:{kind,mood,file}, target (sec,0=auto), credit, name, assign (array of clip index or null per caption line), order:'date'|'picked'} */
  A.build = function (clipsIn, o) {
    o = o || {}; const st = A.STYLES[o.style] || A.STYLES.family;
    const p = P.newProject(); p.style = o.style in A.STYLES ? o.style : 'family'; p.fmt = o.fmt || '9:16'; p.res = o.res || 720; p.fit = 'blur';
    p.filter = st.filter; p.filterAmt = st.fa; p.overlay = st.overlay; p.overlayAmt = st.oa; p.credit = o.credit !== false; p.name = o.name || '';
    const mus = o.music || {}; const mood = mus.mood || st.mood;
    p.music = { kind: mus.kind || 'synth', mood, seed: 1, vol: .55, start: 0, duck: true, file: mus.file || null };
    if (p.music.kind === 'file' && !p.music.file) p.music.kind = 'synth';
    const beat = p.music.kind === 'synth' ? 60 / M.bpm(mood) : 0;
    let cs = clipsIn.slice(); if (o.order !== 'picked') cs.sort((a, b) => a.date - b.date);
    cs.forEach(c => { c.adj = A.adjFor(c); c.speed = 1; c.freeze = false; c.vfx = 'none'; c.anim = { in: 'none', mid: c.kind === 'i' ? 'kenburns' : 'none', out: 'none' }; });

    /* script */
    const L = (o.lines || []).slice(); let title = '', end = '', caps = [];
    if (L.length === 1) title = L[0]; else if (L.length >= 2) { title = L[0]; end = L[L.length - 1]; caps = L.slice(1, -1); }
    if (L.length === 2) caps = [];
    /* assign captions to clips */
    const capOf = new Array(cs.length).fill(null).map(() => []);
    if (caps.length && cs.length) {
      const K = caps.length, Mc = cs.length, start = Mc > K ? 1 : 0, avail = Mc - start;
      caps.forEach((t, j) => {
        let idx = o.assign && o.assign[j] !== undefined && o.assign[j] !== null && cs[o.assign[j]] ? o.assign[j] : start + Math.floor(j * avail / K);
        capOf[Math.min(Mc - 1, idx)].push(t);
      });
    }
    const hasCap = i => capOf[i].length > 0;

    /* desired visible length per clip */
    const vis = cs.map((c, i) => {
      let v = c.kind === 'i' ? st.photoLen : Math.min(c.dur, st.vidMax);
      if (hasCap(i)) v = Math.max(v, capLen(capOf[i].join(' ')));
      return v;
    });
    const total = () => vis.reduce((a, b) => a + b, 0) - Math.max(0, cs.length - 1) * .55;
    if (o.target && cs.length) {
      let f = o.target / total();
      if (f < 1) { for (let i = 0; i < vis.length; i++) vis[i] = Math.max(hasCap(i) ? vis[i] * .8 : 1.6, vis[i] * f); }
      else if (f > 1.25) { for (let i = 0; i < vis.length; i++) if (cs[i].kind === 'i') vis[i] = Math.min(6, vis[i] * Math.min(f, 1.8)); }
      /* still too long: drop the weakest clips without captions */
      let guard = 0; while (total() > o.target * 1.12 && cs.length > 3 && guard++ < 200) {
        let wi = -1, ws = 9; cs.forEach((c, i) => { if (!hasCap(i) && c.score < ws) { ws = c.score; wi = i; } });
        if (wi < 0) break; cs.splice(wi, 1); vis.splice(wi, 1); capOf.splice(wi, 1);
      }
    }
    /* transitions + beat snapping */
    const tdur = beat ? cl(beat * .5, .3, .7) : .6;
    p.clips = cs;
    cs.forEach((c, i) => {
      const list = st.trans; c.trans = i === 0 ? { type: 'none', dur: 0 } : { type: list[(i - 1) % list.length], dur: tdur };
      if (c.trans.type === 'glitch') c.trans.dur = .45;
    });
    cs.forEach((c, i) => {
      let v = vis[i]; if (beat) v = Math.max(1, Math.round(v / beat)) * beat;
      const dn = cs[i + 1] ? Math.min(cs[i + 1].trans.dur, v * .45) : 0;
      if (c.kind === 'v') {
        const w = A.window(c, Math.min(c.dur, v)); c.in = w[0]; c.out = Math.min(c.dur, w[0] + v + dn); if (c.out - c.in < .5) { c.in = 0; c.out = c.dur; }
        c.len = c.out - c.in;
      } else c.len = v + dn;
    });
    /* texts */
    const tx = st.text, mk = (text, extra) => P.newText(Object.assign({ text, font: tx.font, bold: true, color: tx.color, stroke: tx.stroke, bg: tx.bg, size: tx.size, y: tx.y, in: tx.in, out: tx.out, mid: tx.mid }, extra));
    if (title) p.texts.push(mk(title, { at: 'start', y: st.title.y, size: st.title.size * (title.length > 26 ? .75 : 1), in: st.title.in, bg: '' }));
    cs.forEach((c, i) => { if (hasCap(i)) { const t = capOf[i].join('\n'); p.texts.push(mk(t, { clip: c.id, size: tx.size * (t.length > 60 ? .82 : 1) })); } });
    if (end) p.texts.push(mk(end, { at: 'end', y: .5, size: st.title.size * .85 * (end.length > 26 ? .8 : 1), in: 'zoom', bg: '' }));
    p.lines = L;
    P.layout(p);
    return p;
  };
  /* After voice-overs exist: stretch clips so each voice fits, then fix layout */
  A.fitVoices = function (p) {
    p.voice.forEach(v => {
      if (!v.buf) return; let c = null;
      if (v.at === 'start') c = p.clips[0]; else if (v.at === 'end') c = p.clips[p.clips.length - 1]; else c = p.clips.find(x => x.id === v.clip);
      if (!c) return; const need = v.buf.duration + .9 + (c.d || 0);
      const cur = c.len - (p.clips[p.clips.indexOf(c) + 1] ? p.clips[p.clips.indexOf(c) + 1].d : 0);
      if (cur < need) { if (c.kind === 'i') c.len += need - cur; else { const room = (c.dur - c.out) / (c.speed || 1); const add = Math.min(room, need - cur); c.out += add * (c.speed || 1); if (add < need - cur) { /* video too short: hold the last frame is not possible, so just let the voice run on */ } } }
    });
    P.layout(p);
  };
})();
