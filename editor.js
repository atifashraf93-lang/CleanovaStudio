/* Cleanova Studio - editor screen (preview, timeline, panels) and export. Developed by SMAA */
(function () {
  'use strict';
  const S = window.Studio, A = S.auto, AI = S.ai, P = S.proj, FX = S.fx;
  const app = S.app, SCR = app.SCR, tt = S.tt, esc = S.esc, $ = S.$, $$ = S.$$, chips = app.chips;
  const nm = (o, k) => (o[k] ? o[k][S.lang === 'ur' ? 0 : 1] : k);
  let E = null, p = null, tab = 'clips', hist = [], hpos = -1, dirty = false, REG = {}, VREG = {}, kfMode = false, saved = false, curId = null;
  const sel = { clip: null, text: null, st: null };
  const COLORS = ['#ffffff', '#ffd36b', '#ff9ec2', '#5ad1ff', '#7cf29a', '#ff5a5a', '#c58bff', '#000000'];
  const STROKES = ['', '#000000', '#ffffff', '#ff3d7f', '#5a1a00'];
  const BGS = ['', 'rgba(0,0,0,.45)', 'rgba(255,255,255,.78)', 'rgba(255,211,107,.88)', 'rgba(139,124,255,.82)'];
  const TABS = [['clips', '🎞️', ['کلپس', 'Clips']], ['text', '🔤', ['ٹیکسٹ', 'Text']], ['stk', '😊', ['اسٹکر', 'Stickers']], ['fx', '✨', ['ایفیکٹ', 'Effects']], ['mus', '🎵', ['موسیقی', 'Music']], ['voi', '🎙️', ['آواز', 'Voice']], ['fmt', '📐', ['فارمیٹ', 'Format']]];
  const curClip = () => p.clips.find(c => c.id === sel.clip) || null;
  const curText = () => p.texts.find(t => t.id === sel.text) || null;
  const curSt = () => p.stickers.find(t => t.id === sel.st) || null;

  /* ---------- history ---------- */
  function snap() { return P.serialize(p); }
  function commit() { E.layoutAll(); const j = snap(); if (hist[hpos] !== j) { hist = hist.slice(0, hpos + 1); hist.push(j); if (hist.length > 40) hist.shift(); hpos = hist.length - 1; } dirty = true; paintTL(); paintTime(); E.invalidate(); histBtns(); }
  function touch() { E.layoutAll(); paintTL(); paintTime(); E.invalidate(); }
  function histBtns() { const u = $('#un'), r = $('#rd'); if (u) u.style.opacity = hpos > 0 ? 1 : .4; if (r) r.style.opacity = hpos < hist.length - 1 ? 1 : .4; }
  function restoreSnap(j) {
    const n = JSON.parse(j); E.pause();
    n.clips = n.clips.map(pc => { const o = REG[pc.id]; if (o) { Object.assign(o, pc); return o; } REG[pc.id] = pc; return pc; });
    n.voice = n.voice.map(pv => { const o = VREG[pv.id]; if (o) { Object.assign(o, pv); return o; } return pv; });
    n.music.file = p.music.file || (n.music.file) || null;
    Object.keys(p).forEach(k => { if (!(k in n) && k[0] !== '_') delete p[k]; });
    Object.assign(p, n); p._musBuf = null; E.layoutAll(); paintAll();
  }
  function undo() { if (hpos > 0) { hpos--; restoreSnap(hist[hpos]); histBtns(); dirty = true; } }
  function redo() { if (hpos < hist.length - 1) { hpos++; restoreSnap(hist[hpos]); histBtns(); dirty = true; } }

  /* ---------- screen ---------- */
  SCR.editor = function (arg) {
    if (arg && arg.p && arg.p !== p) {
      if (E) E.destroy(); p = arg.p; REG = {}; VREG = {}; p.clips.forEach(c => { REG[c.id] = c; }); p.voice.forEach(v => { VREG[v.id] = v; });
      sel.clip = p.clips[0] ? p.clips[0].id : null; sel.text = sel.st = null; tab = 'clips'; kfMode = false; hist = []; hpos = -1; dirty = !arg.saved; saved = !!arg.saved; curId = arg.saved ? p.id : null;
      app.arg = { p: p, keep: true };
      if (arg.fresh) setTimeout(() => { if (E && E.p === p && E.t < .5) E.seek(Math.min(1.3, E.dur / 2)); }, 300);
      if (arg.note) setTimeout(() => S.toast('ℹ️ ' + arg.note, 'ℹ️ ' + arg.note, 6000), 500);
    }
    shell();
  };
  function shell() {
    $('#app').innerHTML = '<div class="scr"><div class="ed-top"><button class="ib" id="bk">' + (S.lang === 'ur' ? '→' : '←') + '</button><div class="nm" id="nm">' + esc(p.name || tt('نئی ویڈیو', 'New video')) + '</div><button class="ib" id="un">↶</button><button class="ib" id="rd">↷</button><button class="ib" id="sv">💾</button><button class="pri" id="ex" style="padding:8px 14px">📤 ' + tt('ایکسپورٹ', 'Export') + '</button></div>' +
      '<div class="stage"><canvas id="cv"></canvas></div>' +
      '<div class="ctl"><button class="play" id="pl">▶</button><input type="range" id="sk" min="0" max="1000" value="0"><span class="tm" id="tm">0:00 / 0:00</span></div>' +
      '<div class="tl" id="tl"></div>' +
      '<div class="tabs" id="tabs">' + TABS.map(t => '<button data-t="' + t[0] + '" class="' + (tab === t[0] ? 'on' : '') + '"><i>' + t[1] + '</i>' + t[2][S.lang === 'ur' ? 0 : 1] + '</button>').join('') + '</div>' +
      '<div class="panel" id="pn"></div></div>';
    if (E) E.destroy(); E = new S.Engine($('#cv')); S.engine = E; E.setProject(p); E.onTick = onTick; E.onState = on => { $('#pl').textContent = on ? '⏸' : '▶'; };
    if (document.fonts && document.fonts.load) document.fonts.load('700 20px CSNaskh').then(() => E.invalidate()).catch(() => { });
    if (!hist.length) { hist.push(snap()); hpos = 0; }
    $('#bk').onclick = leave; $('#un').onclick = undo; $('#rd').onclick = redo; $('#sv').onclick = saveProject; $('#ex').onclick = exportUI;
    $('#pl').onclick = () => { if (E.playing) E.pause(); else E.play(); };
    const sk = $('#sk'); let was = false;
    sk.oninput = () => { if (E.playing && !was) { was = true; E.pause(); } E.seek(sk.value / 1000 * E.dur); paintTime(); paintTL(true); };
    sk.onchange = () => { if (was) { was = false; E.play(); } };
    $$('#tabs button').forEach(b => b.onclick = () => { tab = b.dataset.t; $$('#tabs button').forEach(x => x.classList.toggle('on', x === b)); $('#pn').scrollTop = 0; paintPanel(); });
    bindCanvas(); paintTL(); paintTime(); paintPanel(); histBtns();
  }
  function paintAll() { paintTL(); paintTime(); paintPanel(); histBtns(); E.invalidate(); }
  function onTick(t) { const sk = $('#sk'); if (sk && document.activeElement !== sk) sk.value = Math.round(t / Math.max(.1, E.dur) * 1000); paintTime(); paintTL(true); }
  function paintTime() { const tm = $('#tm'); if (tm) tm.textContent = S.fmt(E.t) + ' / ' + S.fmt(E.dur); }

  /* ---------- timeline ---------- */
  function paintTL(light) {
    const tl = $('#tl'); if (!tl) return; const now = p.clips.find(c => E.t >= c.t0 && E.t < c.t1) || p.clips[p.clips.length - 1];
    if (light && tl.dataset.n === String(p.clips.length) && tl.dataset.s === (sel.clip || '')) {
      const hid = E.playing && now ? now.id : sel.clip; $$('.tc', tl).forEach(x => x.classList.toggle('on', x.dataset.id === hid)); return;
    }
    tl.dataset.n = String(p.clips.length); tl.dataset.s = sel.clip || '';
    tl.innerHTML = p.clips.map((c, i) => (i ? '<button class="tr" data-tr="' + c.id + '">' + (c.trans && c.trans.type !== 'none' ? '⇄' : '|') + '</button>' : '') + '<button class="tc' + (c.id === sel.clip ? ' on' : '') + '" data-id="' + c.id + '"><canvas data-c="' + c.id + '"></canvas><span class="d">' + S.dur(c.len) + '</span></button>').join('') + '<button class="tc" id="tla" style="width:54px;color:var(--acc);font-size:24px">＋</button>';
    p.clips.forEach(c => { const cv = tl.querySelector('[data-c="' + c.id + '"]'); if (cv && c.thumb) { cv.width = c.thumb.width; cv.height = c.thumb.height; cv.getContext('2d').drawImage(c.thumb, 0, 0); } });
    $$('.tc[data-id]', tl).forEach(b => b.onclick = () => { sel.clip = b.dataset.id; const c = curClip(); E.seek(c.t0 + c.d + .05); if (tab !== 'clips') { tab = 'clips'; $$('#tabs button').forEach(x => x.classList.toggle('on', x.dataset.t === 'clips')); } paintTL(); paintPanel(); });
    $$('.tr', tl).forEach(b => b.onclick = () => { sel.clip = b.dataset.tr; const c = curClip(); E.seek(c.t0 + .01); tab = 'clips'; $$('#tabs button').forEach(x => x.classList.toggle('on', x.dataset.t === 'clips')); paintTL(); paintPanel(); setTimeout(() => { const t = $('#trs'); if (t) t.scrollIntoView({ block: 'start' }); }, 30); });
    $('#tla').onclick = () => addMediaPick();
    const on = tl.querySelector('.tc.on'); if (on && !light) on.scrollIntoView({ inline: 'center', block: 'nearest' });
  }

  /* ---------- canvas drag ---------- */
  function bindCanvas() {
    const cv = $('#cv'); let drag = null;
    const pt = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * E.W, y: (e.clientY - r.top) / r.height * E.H }; };
    cv.onpointerdown = e => {
      const q = pt(e), h = E.hitAt(q.x, q.y); if (!h) { if (E.sel) { E.sel = null; sel.text = sel.st = null; E.invalidate(); if (tab === 'text' || tab === 'stk') paintPanel(); } return; }
      E.sel = h.id; if (h.kind === 'text') { sel.text = h.id; if (tab !== 'text') { tab = 'text'; $$('#tabs button').forEach(x => x.classList.toggle('on', x.dataset.t === 'text')); } } else { sel.st = h.id; if (tab !== 'stk') { tab = 'stk'; $$('#tabs button').forEach(x => x.classList.toggle('on', x.dataset.t === 'stk')); } }
      const it = h.kind === 'text' ? curText() : curSt(); drag = { it, kind: h.kind, ox: it.x * E.W - q.x, oy: it.y * E.H - q.y, moved: false }; cv.setPointerCapture(e.pointerId); e.preventDefault(); paintPanel();
    };
    cv.onpointermove = e => {
      if (!drag) return; const q = pt(e), x = S.clamp((q.x + drag.ox) / E.W, .02, .98), y = S.clamp((q.y + drag.oy) / E.H, .02, .98); drag.moved = true;
      if (kfMode && drag.kind === 'sticker') { drag.it.x1 = x; drag.it.y1 = y; } else { drag.it.x = x; drag.it.y = y; }
      E.invalidate();
    };
    const up = () => { if (drag && drag.moved) commit(); drag = null; };
    cv.onpointerup = up; cv.onpointercancel = up;
  }

  /* ---------- helpers ---------- */
  function slider(id, label, min, max, step, val, f) { f = f || (v => (+v).toFixed(1)); return '<div class="lbl">' + label + '<b id="' + id + 'v">' + f(val) + '</b></div><input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '">'; }
  function bindSlider(id, apply, f) { const el = $('#' + id); if (!el) return; f = f || (v => (+v).toFixed(1)); el.oninput = () => { apply(+el.value); $('#' + id + 'v').textContent = f(+el.value); touch(); }; el.onchange = () => commit(); }
  const sw = (id, label, on) => '<label class="sw"><span>' + label + '</span><input type="checkbox" id="' + id + '"' + (on ? ' checked' : '') + '></label>';
  const nameList = (obj, keys) => (keys || Object.keys(obj)).map(k => [k, nm(obj, k)]);
  const spot = c => E.seek(c.t0 + c.d + .1);

  /* ---------- panels ---------- */
  function paintPanel() { const pn = $('#pn'); if (!pn) return; const top = pn.scrollTop; ({ clips: pnClips, text: pnText, stk: pnStk, fx: pnFx, mus: pnMus, voi: pnVoi, fmt: pnFmt })[tab](pn); pn.scrollTop = top; }

  /* ---- clips ---- */
  function pnClips(pn) {
    const c = curClip(), i = p.clips.indexOf(c);
    let h = '<div class="acts"><button id="mvl">' + (S.lang === 'ur' ? '▶' : '◀') + '</button><button id="mvr">' + (S.lang === 'ur' ? '◀' : '▶') + '</button><button id="dup">⧉ ' + tt('نقل', 'Duplicate') + '</button><button id="del">🗑 ' + tt('ہٹائیں', 'Delete') + '</button><button id="add">＋ ' + tt('شامل کریں', 'Add media') + '</button></div>';
    if (!c) { pn.innerHTML = h + '<div class="empty">' + tt('کوئی کلپ نہیں', 'No clips') + '</div>'; bindActs(); return; }
    if (c.kind === 'i') h += slider('len', tt('دورانیہ', 'Duration'), 1, 12, .1, c.len - (p.clips[i + 1] ? p.clips[i + 1].d : 0), S.dur);
    else {
      h += slider('tin', tt('شروع', 'Start'), 0, Math.max(.4, c.dur - .3), .1, c.in, S.dur) + slider('tout', tt('آخر', 'End'), .3, c.dur, .1, c.out, S.dur);
      h += '<div class="lbl">' + tt('رفتار', 'Speed') + '</div>' + chips([[.25, '0.25x'], [.5, '0.5x'], [1, '1x'], [1.5, '1.5x'], [2, '2x'], [3, '3x'], [4, '4x']], c.speed, 'sp');
      h += sw('mute', tt('اس کلپ کی آواز بند', 'Mute this clip'), c.mute) + sw('frz', tt('فریم روکیں (freeze)', 'Freeze frame'), c.freeze);
      if (c.freeze) h += slider('len', tt('روکنے کا دورانیہ', 'Hold time'), 1, 10, .1, c.len, S.dur);
    }
    h += '<div class="lbl">' + tt('فریم میں فٹ', 'Fit in frame') + '</div>' + chips([['', tt('عام', 'Default')], ['blur', tt('دھندلا پس منظر', 'Blur background')], ['fill', tt('بھرنا (کراپ)', 'Fill (crop)')], ['fit', tt('پورا (کالے کنارے)', 'Fit (black bars)')]], c.fit || '', 'fit');
    h += '<h4>' + tt('اندر آنے کی حرکت', 'Animation in') + '</h4>' + chips(nameList(FX.IN_NAMES), c.anim.in, 'ai') + '<h4>' + tt('بیچ میں حرکت', 'Motion during clip') + '</h4>' + chips(nameList(FX.MID_NAMES), c.anim.mid, 'am') + '<h4>' + tt('باہر جانے کی حرکت', 'Animation out') + '</h4>' + chips(nameList(FX.OUT_NAMES), c.anim.out, 'ao');
    h += '<h4>' + tt('ویڈیو ایفیکٹ', 'Video effect') + '</h4>' + chips(nameList(Object.assign({}, FX.VFX_NAMES, { shake: ['ہلنا', 'Shake'] })), c.vfx, 'vf');
    if (i > 0) h += '<h4 id="trs">' + tt('پچھلے کلپ سے ٹرانزیشن', 'Transition from previous clip') + '</h4>' + chips(nameList(FX.TR_NAMES, FX.TR_LIST), c.trans.type, 'tr') + slider('trd', tt('ٹرانزیشن کا دورانیہ', 'Transition length'), .2, 1.5, .1, c.trans.dur || .6, S.dur) + '<div class="acts"><button id="tra">' + tt('سب کلپس پر لگائیں', 'Apply to all clips') + '</button></div>';
    pn.innerHTML = h; bindActs();
    const bc = (attr, fn) => $$('[data-' + attr + ']', pn).forEach(b => b.onclick = () => { fn(b.dataset[attr]); commit(); paintPanel(); const cc = curClip(); if (cc && (attr === 'tr' || attr === 'ai' || attr === 'vf' || attr === 'am')) { spot(cc); if (attr === 'tr') E.seek(cc.t0 + cc.d * .5); } });
    bc('sp', v => { c.speed = +v; }); bc('fit', v => { c.fit = v || null; }); bc('ai', v => { c.anim.in = v; }); bc('am', v => { c.anim.mid = v; }); bc('ao', v => { c.anim.out = v; }); bc('vf', v => { c.vfx = v; }); bc('tr', v => { c.trans.type = v; if (v === 'none') c.trans.dur = 0; else if (!c.trans.dur) c.trans.dur = .6; });
    if ($('#len')) bindSlider('len', v => { c.len = v + (p.clips[i + 1] ? p.clips[i + 1].d : 0); }, S.dur);
    if ($('#tin')) { bindSlider('tin', v => { c.in = Math.min(v, c.out - .3); }, S.dur); bindSlider('tout', v => { c.out = Math.max(v, c.in + .3); }, S.dur); }
    if ($('#trd')) bindSlider('trd', v => { c.trans.dur = v; }, S.dur);
    if ($('#mute')) $('#mute').onchange = e => { c.mute = e.target.checked; if (c.node) { try { c.node.disconnect(); } catch (x) { /* ignore */ } c.node = null; } commit(); };
    if ($('#frz')) $('#frz').onchange = e => { c.freeze = e.target.checked; if (c.freeze && c.len < 2) c.len = 3; commit(); paintPanel(); };
    if ($('#tra')) $('#tra').onclick = () => { p.clips.forEach((x, k) => { if (k > 0) { x.trans = { type: c.trans.type, dur: c.trans.dur || .6 }; } }); commit(); S.toast('سب پر لگ گئی', 'Applied to all'); };
  }
  function bindActs() {
    const c = curClip(), i = p.clips.indexOf(c);
    $('#add').onclick = addMediaPick;
    $('#mvl').onclick = () => { if (i > 0) { p.clips.splice(i - 1, 0, p.clips.splice(i, 1)[0]); fixFirst(); commit(); paintTL(); paintPanel(); spot(c); } };
    $('#mvr').onclick = () => { if (i >= 0 && i < p.clips.length - 1) { p.clips.splice(i + 1, 0, p.clips.splice(i, 1)[0]); fixFirst(); commit(); paintTL(); paintPanel(); spot(c); } };
    $('#dup').onclick = () => { if (!c) return; const d = JSON.parse(JSON.stringify(c, (k, v) => (['file', 'url', 'el', 'bmp', 'thumb', 'frames', 'node', 'gain', 'an'].indexOf(k) >= 0 ? undefined : v))); Object.assign(d, { id: S.uid(), file: c.file, url: c.url, thumb: c.thumb, an: c.an }); REG[d.id] = d; p.clips.splice(i + 1, 0, d); sel.clip = d.id; fixFirst(); commit(); paintTL(); paintPanel(); spot(d); };
    $('#del').onclick = () => { if (!c) return; if (p.clips.length <= 1) { S.toast('آخری کلپ نہیں ہٹ سکتا', 'Cannot delete the last clip'); return; } E.relClip(c); p.clips.splice(i, 1); p.texts = p.texts.filter(t => t.clip !== c.id); p.stickers = p.stickers.filter(t => t.clip !== c.id); p.voice = p.voice.filter(v => v.clip !== c.id); sel.clip = (p.clips[Math.min(i, p.clips.length - 1)] || {}).id; fixFirst(); commit(); paintTL(); paintPanel(); };
  }
  function fixFirst() { p.clips.forEach((c, k) => { if (k === 0) c.trans = { type: 'none', dur: 0 }; else if (!c.trans || c.trans.type === 'none' && !c.trans.dur) c.trans = { type: 'fade', dur: .6 }; }); E.layoutAll(); }
  function addMediaPick() {
    const fi = document.createElement('input'); fi.type = 'file'; fi.accept = 'image/*,video/*'; fi.multiple = true;
    fi.onchange = async () => {
      const files = Array.from(fi.files || []); if (!files.length) return; S.toast('جوڑ رہا ہوں…', 'Adding…', 4000); let at = Math.max(0, p.clips.indexOf(curClip())) + 1, n = 0;
      for (const f of files) {
        try {
          const c = await A.loadFile(f, false); c.adj = A.adjFor(c); c.anim = { in: 'none', mid: c.kind === 'i' ? 'kenburns' : 'none', out: 'none' };
          if (c.kind === 'v') { const w = A.window(c, 5); c.in = w[0]; c.out = w[1]; c.len = c.out - c.in; } else c.len = 3;
          c.trans = { type: 'fade', dur: .6 }; REG[c.id] = c; p.clips.splice(at++, 0, c); sel.clip = c.id; n++;
        } catch (e) { /* skip */ }
      }
      if (n) { fixFirst(); commit(); paintTL(); paintPanel(); S.toast(n + ' شامل ہوئیں', n + ' added'); } else S.toast('فائل نہیں کھل سکی', 'Could not open the file');
    };
    fi.click();
  }

  /* ---- shared timing controls for text and stickers ---- */
  function timingHtml(it) {
    const mode = it.at ? 'at' : it.all ? 'all' : it.clip ? 'clip' : 'custom';
    let h = '<div class="lbl">' + tt('کب دکھے', 'When it shows') + '</div>' + chips([['clip', tt('اس کلپ کے ساتھ', 'With the selected clip')], ['all', tt('پوری ویڈیو', 'Whole video')], ['custom', tt('اپنا وقت', 'Custom time')]].concat(it.at ? [['at', it.at === 'start' ? tt('شروع (عنوان)', 'Start (title)') : tt('آخر', 'End')]] : []), mode, 'tm');
    if (mode === 'custom') h += slider('t0', tt('شروع', 'From'), 0, Math.max(1, E.dur), .1, it.t0, S.dur) + slider('t1', tt('آخر', 'To'), .5, Math.max(1, E.dur), .1, it.t1, S.dur);
    return h;
  }
  function bindTiming(it, pn) {
    $$('[data-tm]', pn).forEach(b => b.onclick = () => {
      const v = b.dataset.tm; if (v === 'at') return;
      it.at = null; it.all = v === 'all'; if (v === 'clip') { it.clip = sel.clip; } else it.clip = null; if (v === 'custom') { it.t0 = Math.max(0, it._t0 || 0); it.t1 = Math.min(E.dur, it._t1 || E.dur); }
      commit(); paintPanel();
    });
    if ($('#t0')) { bindSlider('t0', v => { it.t0 = Math.min(v, it.t1 - .5); }, S.dur); bindSlider('t1', v => { it.t1 = Math.max(v, it.t0 + .5); }, S.dur); }
  }
  const showAt = it => { E.layoutAll(); E.seek(Math.min((it._t1 || 1) - .2, (it._t0 || 0) + .9)); };

  /* ---- text ---- */
  function pnText(pn) {
    const it = curText(); const st = A.STYLES[p.style] || A.STYLES.family;
    let h = '<div class="acts"><button id="tadd">＋ ' + tt('نیا ٹیکسٹ', 'New text') + '</button>' + (it ? '<button id="tdel">🗑 ' + tt('ہٹائیں', 'Delete') + '</button><button id="tdup">⧉</button>' : '') + '</div>';
    h += p.texts.map(t => '<button class="item' + (t.id === sel.text ? ' on' : '') + '" data-tix="' + t.id + '" style="width:100%;text-align:start"><span>' + esc((t.text || '').replace(/\n/g, ' ').slice(0, 40) || '…') + '</span><small>' + (t.at === 'start' ? '🏷️' : t.at === 'end' ? '🏁' : S.fmt(t._t0 || 0)) + '</small></button>').join('') || '<div class="mut">' + tt('کوئی ٹیکسٹ نہیں۔ ＋ دبائیں۔', 'No text yet. Tap ＋.') + '</div>';
    if (it) {
      h += '<h4>' + tt('عبارت', 'Text') + '</h4><textarea id="ttx" rows="2">' + esc(it.text) + '</textarea>' +
        '<h4>' + tt('فونٹ', 'Font') + '</h4>' + chips(nameList(FX.FONTS, Object.keys(FX.FONTS)).map(x => [x[0], FX.FONTS[x[0]].n[S.lang === 'ur' ? 0 : 1]]), it.font, 'fo') + sw('tbd', tt('موٹا', 'Bold'), it.bold) +
        slider('tsz', tt('سائز', 'Size'), 3, 18, .2, it.size) +
        '<h4>' + tt('رنگ', 'Color') + '</h4><div class="sw-c">' + COLORS.map(c => '<button data-co="' + c + '" class="' + (it.color === c ? 'on' : '') + '" style="background:' + c + '"></button>').join('') + '<input type="color" id="tcu" value="' + (/^#[0-9a-f]{6}$/i.test(it.color) ? it.color : '#ffffff') + '" style="width:34px;height:30px;border:0;background:none"></div>' +
        '<h4>' + tt('کنارہ', 'Outline') + '</h4><div class="sw-c">' + STROKES.map(c => '<button data-st="' + c + '" class="' + (it.stroke === c ? 'on' : '') + '" style="background:' + (c || 'transparent') + '">' + (c ? '' : '∅') + '</button>').join('') + '</div>' +
        '<h4>' + tt('پس منظر', 'Background') + '</h4><div class="sw-c">' + BGS.map(c => '<button data-bg="' + c + '" class="' + (it.bg === c ? 'on' : '') + '" style="background:' + (c || 'transparent') + '">' + (c ? '' : '∅') + '</button>').join('') + '</div>' +
        '<h4>' + tt('جگہ (یا ویڈیو پر انگلی سے کھینچیں)', 'Position (or drag it on the video)') + '</h4>' + chips([[.15, tt('اوپر', 'Top')], [.5, tt('بیچ', 'Middle')], [.82, tt('نیچے', 'Bottom')]], '', 'po') +
        '<h4>' + tt('اندر آنے کی حرکت', 'Animation in') + '</h4>' + chips(nameList(FX.TXT_IN), it.in, 'ti') + '<h4>' + tt('بیچ میں', 'During') + '</h4>' + chips(nameList(FX.TXT_MID), it.mid, 'tmid') + '<h4>' + tt('باہر', 'Out') + '</h4>' + chips(nameList(FX.TXT_OUT), it.out, 'to') + timingHtml(it);
    }
    pn.innerHTML = h;
    $('#tadd').onclick = () => { const c = curClip(); const t = P.newText({ text: tt('یہاں لکھیں', 'Type here'), clip: c ? c.id : null, font: st.text.font, color: st.text.color, stroke: st.text.stroke, bg: st.text.bg, size: st.text.size, y: .5, in: 'pop', out: 'fade' }); p.texts.push(t); sel.text = t.id; E.sel = t.id; commit(); showAt(t); paintPanel(); };
    $$('[data-tix]', pn).forEach(b => b.onclick = () => { sel.text = b.dataset.tix; E.sel = sel.text; const t = curText(); showAt(t); paintPanel(); });
    if (!it) return;
    $('#tdel').onclick = () => { p.texts = p.texts.filter(t => t.id !== it.id); p.voice = p.voice.filter(v => !(v.text === it.text && (v.clip === it.clip && it.clip || v.at === it.at && it.at))); sel.text = null; E.sel = null; commit(); paintPanel(); };
    $('#tdup').onclick = () => { const d = Object.assign({}, it, { id: S.uid(), y: Math.min(.9, it.y + .08) }); p.texts.push(d); sel.text = d.id; E.sel = d.id; commit(); paintPanel(); };
    $('#ttx').oninput = e => { it.text = e.target.value; E.invalidate(); }; $('#ttx').onchange = () => commit();
    $$('[data-fo]', pn).forEach(b => b.onclick = () => { it.font = b.dataset.fo; commit(); paintPanel(); });
    $('#tbd').onchange = e => { it.bold = e.target.checked; commit(); };
    bindSlider('tsz', v => { it.size = v; });
    $$('[data-co]', pn).forEach(b => b.onclick = () => { it.color = b.dataset.co; commit(); paintPanel(); }); $('#tcu').oninput = e => { it.color = e.target.value; E.invalidate(); }; $('#tcu').onchange = () => commit();
    $$('[data-st]', pn).forEach(b => b.onclick = () => { it.stroke = b.dataset.st; commit(); paintPanel(); });
    $$('[data-bg]', pn).forEach(b => b.onclick = () => { it.bg = b.dataset.bg; commit(); paintPanel(); });
    $$('[data-po]', pn).forEach(b => b.onclick = () => { it.y = +b.dataset.po; it.x = .5; commit(); });
    $$('[data-ti]', pn).forEach(b => b.onclick = () => { it.in = b.dataset.ti; commit(); paintPanel(); showAt(it); });
    $$('[data-tmid]', pn).forEach(b => b.onclick = () => { it.mid = b.dataset.tmid; commit(); paintPanel(); showAt(it); });
    $$('[data-to]', pn).forEach(b => b.onclick = () => { it.out = b.dataset.to; commit(); paintPanel(); E.seek(Math.max(0, it._t1 - .3)); });
    bindTiming(it, pn);
  }

  /* ---- stickers ---- */
  let stkGroup = 'e';
  function pnStk(pn) {
    const it = curSt();
    let h = '<div class="acts">' + (it ? '<button id="sdel">🗑 ' + tt('ہٹائیں', 'Delete') + '</button>' : '') + '</div>' + chips([['e', tt('ایموجی', 'Emoji')], ['v', tt('شکلیں', 'Shapes')], ['f', tt('فریم', 'Frames')]], stkGroup, 'sg');
    if (stkGroup === 'e') h += '<div class="pal">' + FX.EMOJI.map(e => '<button data-add="e:' + e + '">' + e + '</button>').join('') + '</div>';
    else if (stkGroup === 'v') h += '<div class="pal">' + FX.VEC_NAMES.map(v => '<button data-add="v:' + v + '"><canvas width="64" height="64" data-vc="' + v + '"></canvas></button>').join('') + '</div>';
    else h += chips(FX.FRAME_NAMES.map(f => ['f:' + f, f]), '', 'add');
    h += '<div class="mut" style="margin-top:6px">' + tt('اسٹکر پر انگلی رکھ کر ویڈیو میں کھینچیں۔', 'Touch a sticker on the video and drag it.') + '</div>';
    if (it) {
      const fr = it.ref.slice(0, 2) === 'f:';
      h += '<h4>' + tt('منتخب اسٹکر', 'Selected sticker') + '</h4>';
      if (!fr) {
        h += slider('ssz', tt('سائز', 'Size'), 4, 70, 1, it.size, v => v + '%') + slider('srt', tt('گھماؤ', 'Rotation'), -180, 180, 1, it.rot, v => v + '°') + '<h4>' + tt('حرکت', 'Animation') + '</h4>' + chips(nameList(FX.STICKER_ANIMS), it.anim, 'sa');
        h += '<div class="acts"><button id="skf" class="' + (kfMode ? 'on' : '') + '" style="' + (kfMode ? 'background:var(--acc);color:#fff' : '') + '">📍 ' + (kfMode ? tt('اب ویڈیو پر آخری جگہ کھینچیں', 'Now drag the end point on the video') : tt('چلتا ہوا (آخری جگہ طے کریں)', 'Moving (set the end point)')) + '</button>' + (it.x1 !== null && it.x1 !== undefined ? '<button id="skc">✕ ' + tt('حرکت ہٹائیں', 'Remove movement') + '</button>' : '') + '</div>';
      }
      h += timingHtml(it);
    }
    pn.innerHTML = h;
    $$('[data-vc]', pn).forEach(cv => { FX.drawStickerStatic(cv.getContext('2d'), 'v:' + cv.dataset.vc, 32, 32, 52); });
    $$('[data-sg]', pn).forEach(b => b.onclick = () => { stkGroup = b.dataset.sg; paintPanel(); });
    $$('[data-add]', pn).forEach(b => b.onclick = () => {
      const c = curClip(), isF = b.dataset.add.slice(0, 2) === 'f:'; const t = P.newSticker({ ref: b.dataset.add, clip: c ? c.id : null, x: .5, y: .35 + Math.random() * .2, size: isF ? 100 : 20, anim: isF ? 'none' : 'pop' });
      p.stickers.push(t); sel.st = t.id; E.sel = isF ? null : t.id; commit(); showAt(t); paintPanel();
    });
    if (!it) return;
    $('#sdel').onclick = () => { p.stickers = p.stickers.filter(t => t.id !== it.id); sel.st = null; E.sel = null; kfMode = false; commit(); paintPanel(); };
    if ($('#ssz')) { bindSlider('ssz', v => { it.size = v; }, v => v + '%'); bindSlider('srt', v => { it.rot = v; }, v => v + '°'); }
    $$('[data-sa]', pn).forEach(b => b.onclick = () => { it.anim = b.dataset.sa; commit(); paintPanel(); showAt(it); });
    if ($('#skf')) $('#skf').onclick = () => { kfMode = !kfMode; if (kfMode && (it.x1 === null || it.x1 === undefined)) { it.x1 = Math.min(.9, it.x + .25); it.y1 = it.y; } commit(); paintPanel(); };
    if ($('#skc')) $('#skc').onclick = () => { it.x1 = it.y1 = null; kfMode = false; commit(); paintPanel(); };
    bindTiming(it, pn);
  }

  /* ---- effects ---- */
  function pnFx(pn) {
    pn.innerHTML = '<h4>' + tt('فلٹر', 'Filter') + '</h4>' + chips(FX.FILTER_LIST.map(k => [k, FX.FILTERS[k].n[S.lang === 'ur' ? 0 : 1]]), p.filter, 'fl') + slider('fla', tt('مقدار', 'Amount'), 0, 1.5, .05, p.filterAmt, v => Math.round(v * 100) + '%') + sw('ac', tt('آٹو رنگ درست (روشنی/کنٹراسٹ)', 'Auto color fix (brightness/contrast)'), p.autoColor) +
      '<h4>' + tt('اوورلے (پوری ویڈیو پر)', 'Overlay (over the whole video)') + '</h4>' + chips(nameList(FX.OVL_NAMES, FX.OVL_LIST), p.overlay, 'ov') + slider('ova', tt('شدت', 'Intensity'), .2, 1.8, .05, p.overlayAmt, v => Math.round(v * 100) + '%') +
      '<div class="mut" style="margin-top:8px">' + tt('کلپ کی اپنی حرکت، ٹرانزیشن اور ایفیکٹ "کلپس" ٹیب میں ہیں۔', 'Per-clip motion, transitions and effects are in the Clips tab.') + '</div>';
    $$('[data-fl]', pn).forEach(b => b.onclick = () => { p.filter = b.dataset.fl; if (p.filter !== 'none' && p.filterAmt < .3) p.filterAmt = 1; commit(); paintPanel(); });
    $$('[data-ov]', pn).forEach(b => b.onclick = () => { p.overlay = b.dataset.ov; commit(); paintPanel(); });
    bindSlider('fla', v => { p.filterAmt = v; }, v => Math.round(v * 100) + '%'); bindSlider('ova', v => { p.overlayAmt = v; }, v => Math.round(v * 100) + '%');
    $('#ac').onchange = e => { p.autoColor = e.target.checked; commit(); };
  }

  /* ---- music ---- */
  let prevNode = null;
  function previewMood(mood) {
    E.ensureAudio(); if (prevNode) { try { prevNode.stop(); } catch (e) { /* ignore */ } prevNode = null; }
    S.toast('سن لیں…', 'Listen…', 1500);
    S.music.get(mood, 1).then(buf => { const s = E.ac.createBufferSource(); s.buffer = buf; const g = E.ac.createGain(); g.gain.value = .7; s.connect(g); g.connect(E.ac.destination); s.start(); prevNode = s; setTimeout(() => { try { s.stop(); } catch (e) { /* ignore */ } }, 8000); }).catch(() => S.toast('موسیقی نہیں بن سکی', 'Could not make the music'));
  }
  function pnMus(pn) {
    const m = p.music;
    const items = [['none', tt('بغیر', 'None')]].concat(S.music.list.map(k => [k, S.music.MOODS[k].n[S.lang === 'ur' ? 0 : 1]])).concat([['file', m.file ? '🎵 ' + String(m.file.name || '').slice(0, 14) : tt('میرا گانا', 'My song')]]);
    const cur = m.kind === 'none' ? 'none' : m.kind === 'file' ? 'file' : m.mood;
    pn.innerHTML = '<h4>' + tt('موسیقی', 'Music') + '</h4>' + chips(items, cur, 'mu') + '<div class="acts"><button id="mpv"' + (m.kind === 'synth' ? '' : ' disabled style="opacity:.4"') + '>🔊 ' + tt('سنیں', 'Preview') + '</button></div>' +
      '<div class="mut">' + tt('بلٹ اِن دھنیں ایپ خود بناتی ہے (سادہ، کاپی رائٹ سے پاک)۔ اپنا گانا بھی لگا سکتے ہیں۔', 'Built-in tunes are generated by the app (simple, copyright-free). You can also use your own song.') + '</div>' +
      slider('mvol', tt('موسیقی کی آواز', 'Music volume'), 0, 1, .05, m.vol, v => Math.round(v * 100) + '%') + slider('vvol', tt('ویڈیو کی اپنی آواز', 'Video sound'), 0, 1.5, .05, p.vvol, v => Math.round(v * 100) + '%') + slider('mst', tt('موسیقی کہاں سے شروع', 'Music start offset'), 0, 60, 1, m.start || 0, S.dur) + sw('mdk', tt('آواز کے وقت موسیقی خود دھیمی', 'Lower music while the voice speaks'), m.duck);
    $$('[data-mu]', pn).forEach(b => b.onclick = async () => {
      const v = b.dataset.mu;
      if (v === 'file') { const fi = document.createElement('input'); fi.type = 'file'; fi.accept = 'audio/*'; fi.onchange = () => { const f = fi.files[0]; if (f) { m.kind = 'file'; m.file = f; p._musBuf = null; commit(); paintPanel(); S.toast('گانا لگ گیا', 'Song added'); } }; fi.click(); return; }
      if (v === 'none') { m.kind = 'none'; p._musBuf = null; } else { m.kind = 'synth'; m.mood = v; m.seed = 1; p._musBuf = null; previewMood(v); }
      commit(); paintPanel();
    });
    $('#mpv').onclick = () => { if (m.kind === 'synth') previewMood(m.mood); };
    const re = () => { if (E.playing) E.seek(E.t); };
    bindSlider('mvol', v => { m.vol = v; if (E.musGain && E.playing) E.musGain.gain.value = v; }, v => Math.round(v * 100) + '%'); bindSlider('vvol', v => { p.vvol = v; }, v => Math.round(v * 100) + '%'); bindSlider('mst', v => { m.start = v; }, S.dur);
    $('#mst').onchange = () => { commit(); re(); }; $('#mdk').onchange = e => { m.duck = e.target.checked; commit(); re(); };
  }

  /* ---- voice ---- */
  let vMode = 'phone', vVoice = 'Kore';
  function playBuf(buf) { E.ensureAudio(); const s = E.ac.createBufferSource(); s.buffer = buf; s.connect(E.ac.destination); s.start(); }
  function pnVoi(pn) {
    const aiOn = AI.enabled();
    pn.innerHTML = '<h4>' + tt('وائس اوور', 'Voice-over') + '</h4>' + (p.voice.length ? p.voice.map(v => '<div class="item"><span>' + esc((v.text || '').replace(/\n/g, ' ').slice(0, 34) || '🎤') + '</span><small>' + S.dur(v.buf ? v.buf.duration : 0) + '</small><button data-vp="' + v.id + '">▶</button><button data-vd="' + v.id + '">🗑</button></div>').join('') : '<div class="mut">' + tt('ابھی کوئی آواز نہیں۔', 'No voice yet.') + '</div>') +
      '<h4>' + tt('ٹیکسٹ پڑھوائیں', 'Read the texts aloud') + '</h4>' + chips([['phone', tt('فون کی آواز', 'Phone voice')], ['gemini', tt('AI آواز', 'AI voice')]], vMode, 'vm') + (vMode === 'gemini' ? chips(AI.VOICES, vVoice, 'vv') + (aiOn ? '' : '<div class="mut">⚠️ ' + tt('Settings میں key ڈالیں', 'Add the key in Settings') + '</div>') : '') +
      '<div class="acts"><button id="vmk">🗣️ ' + tt('سب ٹیکسٹ کی آواز بنائیں', 'Make voice for all texts') + '</button></div>' +
      '<h4>' + tt('اپنی آواز', 'Your own voice') + '</h4><div class="acts"><button id="vrc">🎤 ' + tt('منتخب کلپ پر ریکارڈ کریں', 'Record on the selected clip') + '</button></div>' +
      (p.voice.length ? slider('vvl', tt('آواز کی بلندی', 'Voice volume'), 0, 1.5, .05, p.voice[0].vol === undefined ? 1 : p.voice[0].vol, v => Math.round(v * 100) + '%') : '');
    $$('[data-vm]', pn).forEach(b => b.onclick = () => { vMode = b.dataset.vm; paintPanel(); }); $$('[data-vv]', pn).forEach(b => b.onclick = () => { vVoice = b.dataset.vv; paintPanel(); });
    $$('[data-vp]', pn).forEach(b => b.onclick = () => { const v = p.voice.find(x => x.id === b.dataset.vp); if (v && v.buf) playBuf(v.buf); });
    $$('[data-vd]', pn).forEach(b => b.onclick = () => { p.voice = p.voice.filter(x => x.id !== b.dataset.vd); commit(); paintPanel(); });
    if ($('#vvl')) bindSlider('vvl', v => { p.voice.forEach(x => { x.vol = v; }); }, v => Math.round(v * 100) + '%');
    $('#vmk').onclick = async () => {
      if (vMode === 'gemini' && !aiOn) { S.toast('پہلے AI key ڈالیں', 'Add the AI key first'); return; }
      if (!p.texts.some(t => t.text && (t.at || t.clip))) { S.toast('پہلے ٹیکسٹ/کیپشن ہونا چاہیے', 'Add some text or captions first'); return; }
      const w = document.createElement('div'); w.className = 'dlg'; w.innerHTML = '<div class="dbox"><h3>🗣️ ' + tt('آواز بن رہی ہے', 'Making the voice') + '</h3><div class="dbody" id="vpm">…</div><div class="bar"><i id="vpb"></i></div></div>'; document.body.appendChild(w);
      try { await AI.makeVoices(p, vMode, { voice: vVoice }, (i, n) => { $('#vpm').textContent = i + '/' + n; $('#vpb').style.width = Math.round(100 * i / Math.max(1, n)) + '%'; }); p.voice.forEach(v => { VREG[v.id] = v; }); p._musBuf = null; commit(); S.stat('voice_' + vMode); }
      catch (e) { S.toast(AI.errText(e), undefined, 5000); }
      w.remove(); paintAll();
    };
    $('#vrc').onclick = () => recordVoice();
  }
  async function recordVoice() {
    const c = curClip(); if (!c) return; let rec;
    try { rec = await AI.recordVoice(); } catch (e) { S.toast('مائیک کی اجازت نہیں ملی', 'Microphone permission was not given', 4000); return; }
    const t0 = Date.now(); let iv;
    const r = await S.dialog({ title: '🎤 ' + tt('ریکارڈنگ', 'Recording'), html: '<div style="text-align:center;font-size:30px" id="rct">0:00</div><div class="mut" style="text-align:center">' + tt('بولیں، ختم ہو تو روکیں دبائیں', 'Speak, then press Stop') + '</div>', buttons: [[tt('روکیں', 'Stop'), true]], cancel: false, onOpen: () => { iv = setInterval(() => { const e = $('#rct'); if (e) e.textContent = S.fmt((Date.now() - t0) / 1000); }, 300); } });
    clearInterval(iv); let res; try { res = await rec.stop(); } catch (e) { S.toast('ریکارڈنگ نہیں ہو سکی', 'Recording failed'); return; }
    p.voice = p.voice.filter(v => v.clip !== c.id); const v = { id: S.uid(), text: '🎤', buf: res.buf, blob: res.blob, vol: 1, clip: c.id }; p.voice.push(v); VREG[v.id] = v; A.fitVoices(p); commit(); paintAll(); S.toast('آواز لگ گئی', 'Voice added');
  }

  /* ---- format ---- */
  function pnFmt(pn) {
    pn.innerHTML = '<h4>' + tt('شکل', 'Shape') + '</h4>' + chips([['9:16', '9:16 ' + tt('ریل', 'Reel')], ['16:9', '16:9 ' + tt('یوٹیوب', 'YouTube')], ['1:1', '1:1'], ['4:5', '4:5']], p.fmt, 'ft') +
      '<h4>' + tt('ایکسپورٹ کوالٹی', 'Export quality') + '</h4>' + chips([[720, '720p'], [1080, '1080p']], p.res, 'rs') + sw('cr', tt('آخر میں "Developed by SMAA"', 'Show "Developed by SMAA" at the end'), p.credit) +
      '<div class="acts" style="margin-top:12px"><button id="rw">🔁 ' + tt('نئے انداز سے دوبارہ آٹو ایڈٹ', 'Re-run auto edit with another style') + '</button></div><div class="mut">' + tt('یہ آپ کی موجودہ ایڈیٹنگ کی جگہ نئی بنائے گا۔', 'This replaces your current edits with a fresh one.') + '</div>';
    $$('[data-ft]', pn).forEach(b => b.onclick = () => { p.fmt = b.dataset.ft; E.size(); commit(); paintPanel(); });
    $$('[data-rs]', pn).forEach(b => b.onclick = () => { p.res = +b.dataset.rs; commit(); paintPanel(); });
    $('#cr').onchange = e => { p.credit = e.target.checked; commit(); };
    $('#rw').onclick = async () => { if (await S.confirm(tt('دوبارہ ایڈٹ؟', 'Re-edit?'), tt('موجودہ تبدیلیاں ختم ہو جائیں گی۔', 'Your current changes will be replaced.'))) { E.destroy(); E = null; p = null; app.go('wizard'); } };
  }

  /* ---------- save / leave ---------- */
  async function saveProject() {
    let name = p.name, inp = null; const r = await S.dialog({ onOpen: w => { inp = $('#pnm', w); }, title: '💾 ' + tt('پروجیکٹ محفوظ کریں', 'Save project'), html: '<input class="inp" id="pnm" value="' + esc(p.name || new Date().toLocaleDateString()) + '"><div class="mut" style="margin-top:6px">' + tt('فوٹو/ویڈیو کی نقل بھی محفوظ ہوگی، اس لیے جگہ لگے گی۔', 'A copy of the photos/videos is stored too, so it takes space.') + '</div>', buttons: [[tt('محفوظ', 'Save'), true], [tt('منسوخ', 'Cancel'), false, 'sec']] });
    if (!r) return; name = (inp ? inp.value : name).trim() || tt('پروجیکٹ', 'Project'); p.name = name; $('#nm') && ($('#nm').textContent = name);
    S.toast('محفوظ ہو رہا ہے…', 'Saving…', 3000);
    try {
      const blobs = P.blobsOf(p), keys = Object.keys(blobs); let old = null; try { old = await S.db.get('proj', p.id); } catch (e) { /* none */ }
      if (old) for (const k of old.blobKeys) if (keys.indexOf(k) < 0) await S.db.del('media', p.id + ':' + k);
      for (const k of keys) await S.db.put('media', p.id + ':' + k, blobs[k]);
      await S.db.put('proj', p.id, { json: snap(), blobKeys: keys, meta: { name, date: Date.now(), n: p.clips.length, dur: p.dur } });
      dirty = false; saved = true; S.toast('✅ محفوظ ہو گیا', '✅ Saved'); S.stat('save');
    } catch (e) { S.toast('محفوظ نہیں ہو سکا (جگہ کم ہو سکتی ہے)', 'Could not save (storage may be full)', 4500); }
  }
  async function leave() {
    if (E && E.playing) E.pause();
    if (dirty) { const r = await S.dialog({ title: tt('باہر جائیں؟', 'Leave?'), text: tt('بدلاؤ محفوظ نہیں ہوئے۔', 'Your changes are not saved.'), buttons: [[tt('محفوظ کر کے', 'Save'), 'save'], [tt('بغیر محفوظ', 'Discard'), 'drop', 'sec'], [tt('رکیں', 'Stay'), false, 'sec']] }); if (!r) return; if (r === 'save') { await saveProject(); if (dirty) return; } }
    E.destroy(); E = null; p = null; app.arg = null; app.go('home');
  }

  /* ---------- export ---------- */
  async function exportUI() {
    if (E.playing) E.pause(); E.layoutAll(); const dur = E.dur; let res = p.res || S.get('res', 720);
    const w = document.createElement('div'); w.className = 'dlg'; document.body.appendChild(w);
    const mime = S.Engine.mime();
    const paintStart = () => {
      w.innerHTML = '<div class="dbox"><h3>📤 ' + tt('ایکسپورٹ', 'Export') + '</h3><div class="dbody">' + tt('لمبائی ', 'Length ') + S.fmt(dur) + '. ' + tt('ایکسپورٹ میں تقریباً اتنا ہی وقت لگے گا اور اس دوران ایپ کھلی اور اسکرین چالو رہنی چاہیے۔', 'Export takes about as long as the video and the app must stay open with the screen on.') + '<div class="lbl">' + tt('کوالٹی', 'Quality') + '</div>' + chips([[720, '720p'], [1080, '1080p']], res, 'xr') + (mime ? (mime.indexOf('mp4') >= 0 ? '<div class="mut">MP4</div>' : '<div class="mut">⚠️ ' + tt('اس فون پر WebM بنے گا (کچھ ایپس میں نہیں چلتا)', 'This phone makes WebM (some apps cannot play it)') + '</div>') : '<div class="mut">⚠️ ' + tt('اس فون میں ویڈیو ریکارڈر نہیں', 'This phone has no video recorder') + '</div>') + '</div><div class="dbtn"><button id="xg" class="pri"' + (mime ? '' : ' disabled') + '>' + tt('شروع', 'Start') + '</button><button id="xc" class="sec">' + tt('منسوخ', 'Cancel') + '</button></div></div>';
      $$('[data-xr]', w).forEach(b => b.onclick = () => { res = +b.dataset.xr; paintStart(); }); $('#xc').onclick = () => w.remove(); $('#xg').onclick = run;
    };
    const run = async () => {
      const t0 = Date.now(); let cancelled = false;
      w.innerHTML = '<div class="dbox"><h3>⏳ ' + tt('ویڈیو بن رہی ہے', 'Making the video') + '</h3><div class="dbody"><div id="xm">…</div><div class="bar"><i id="xb"></i></div><div class="mut">' + tt('ایپ بند نہ کریں', 'Do not close the app') + '</div></div><div class="dbtn"><button id="xs" class="sec">' + tt('روکیں', 'Cancel') + '</button></div></div>';
      $('#xs').onclick = () => { cancelled = true; E.cancelExport(); };
      if (S.native() && S.native().keepAwake) S.native().keepAwake({ on: true }).catch(() => { });
      let out;
      try {
        out = await E.exportVideo({ res, onProgress: f => { const el = (Date.now() - t0) / 1000; const xb = $('#xb'); if (xb) xb.style.width = Math.round(f * 100) + '%'; const m = $('#xm'); if (m) m.textContent = Math.round(f * 100) + '% · ' + tt('باقی ', 'left ') + S.fmt(Math.max(0, el / Math.max(.02, f) - el)); } });
      } catch (e) { if (S.native() && S.native().keepAwake) S.native().keepAwake({ on: false }).catch(() => { }); w.remove(); if (!cancelled) S.toast('ایکسپورٹ نہیں ہو سکی: ' + (e.message || e), 'Export failed: ' + (e.message || e), 5000); paintAll(); return; }
      if (S.native() && S.native().keepAwake) S.native().keepAwake({ on: false }).catch(() => { });
      S.stat('export'); finishExport(w, out, dur); paintAll();
    };
    paintStart();
  }
  async function finishExport(w, out, dur) {
    const name = 'Cleanova-Studio-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.' + out.ext;
    w.innerHTML = '<div class="dbox"><h3>💾 ' + tt('محفوظ ہو رہی ہے', 'Saving') + '</h3><div class="dbody"><div class="bar"><i id="xb" style="width:5%"></i></div></div></div>';
    let uri = '', where = '';
    try {
      const nat = S.native();
      if (nat && nat.saveBegin) {
        await nat.saveBegin({ name, mime: out.mime }); const CH = 1536 * 1024; let off = 0;
        while (off < out.blob.size) { const b64 = await S.blobToB64(out.blob.slice(off, off + CH)); await nat.saveChunk({ data: b64 }); off += CH; const xb = $('#xb'); if (xb) xb.style.width = Math.round(Math.min(1, off / out.blob.size) * 100) + '%'; }
        const r = await nat.saveEnd(); uri = r.uri; where = r.where;
      } else { const a = document.createElement('a'); a.href = URL.createObjectURL(out.blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { a.remove(); }, 2000); where = tt('ڈاؤن لوڈ', 'Downloads'); }
    } catch (e) { w.remove(); S.toast('گیلری میں محفوظ نہیں ہو سکی: ' + (e.message || e), 'Could not save to Gallery: ' + (e.message || e), 6000); return; }
    const L = S.get('videos', []); L.unshift({ name, date: Date.now(), uri, mime: out.mime, dur, size: out.blob.size, where }); S.set('videos', L.slice(0, 60));
    w.innerHTML = '<div class="dbox"><h3>✅ ' + tt('ویڈیو تیار ہے', 'Your video is ready') + '</h3><div class="dbody">' + (uri ? tt('گیلری میں محفوظ: ', 'Saved in Gallery: ') + esc(where) : tt('ڈاؤن لوڈ ہو گئی', 'Downloaded')) + '<br><span class="mut">' + esc(name) + ' · ' + (out.blob.size / 1048576).toFixed(1) + ' MB</span></div><div class="dbtn">' + (uri ? '<button id="xsh" class="pri">📤 ' + tt('شیئر', 'Share') + '</button><button id="xop">▶️ ' + tt('کھولیں', 'Open') + '</button>' : '') + '<button id="xd" class="sec">' + tt('ٹھیک', 'Done') + '</button></div></div>';
    $('#xd').onclick = () => w.remove();
    if (uri) { $('#xsh').onclick = () => S.native().shareFile({ uri, mime: out.mime }).catch(() => S.toast('شیئر نہیں ہو سکی', 'Could not share')); $('#xop').onclick = () => S.native().openFile({ uri, mime: out.mime }).catch(() => S.toast('فائل نہیں کھل سکی', 'Could not open')); }
  }
  app.editorState = () => ({ p, E });
})();
