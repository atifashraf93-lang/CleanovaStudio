/* Cleanova Studio - shell, home, wizard (pick media, style, script), settings, lists. Developed by SMAA */
(function () {
  'use strict';
  const S = window.Studio, A = S.auto, AI = S.ai, P = S.proj, FX = S.fx;
  const tt = S.tt, esc = S.esc, $ = S.$, $$ = S.$$;
  const app = S.app = {}; const SCR = app.SCR = {}; let cur = 'home';
  const root = () => $('#app');
  app.go = (name, arg) => { cur = name; app.arg = arg; (SCR[name] || SCR.home)(arg); };
  const langBox = () => '<div class="lang"><button data-l="ur" class="' + (S.lang === 'ur' ? 'on' : '') + '">اردو</button><button data-l="en" class="' + (S.lang === 'en' ? 'on' : '') + '">EN</button></div>';
  const bindLang = () => $$('.lang button').forEach(b => { b.onclick = () => { S.setLang(b.dataset.l); app.go(cur, app.arg); }; });
  app.langBox = langBox; app.bindLang = bindLang;
  const chips = (items, on, attr) => '<div class="chips">' + items.map(i => '<button class="chip' + (String(i[0]) === String(on) ? ' on' : '') + '" data-' + (attr || 'v') + '="' + esc(i[0]) + '">' + esc(i[1]) + '</button>').join('') + '</div>';
  app.chips = chips;
  const top = (title, back, extra) => '<div class="top">' + (back ? '<button class="ib" id="bk">' + (S.lang === 'ur' ? '→' : '←') + '</button>' : '<img class="logo" src="icon-192.png" alt="">') + '<h1>' + title + '</h1>' + (extra || '') + '</div>';
  app.top = top;

  /* ============ HOME ============ */
  SCR.home = function () {
    const nv = S.get('videos', []).length, aiOn = AI.enabled();
    root().innerHTML = '<div class="scr">' + top('Cleanova Studio<small>Developed by SMAA</small>', false, langBox() + '<button class="ib" id="gear" aria-label="Settings">⚙️</button>') + '<div class="body">' +
      '<button class="big" id="nw"><span class="ico">🎬</span><div><b>' + tt('نئی ویڈیو، خود بخود ایڈٹ', 'New video, edited for you') + '</b><span>' + tt('فوٹو اور ویڈیو چنیں، باقی کام ایپ کرے گی', 'Pick photos and videos, the app does the rest') + '</span></div></button>' +
      '<button class="big alt" id="ns"><span class="ico">✍️</span><div><b>' + tt('اسکرپٹ سے ویڈیو', 'Video from a script') + '</b><span>' + tt('اپنی لکھی لائنیں دیں، ہر لائن ایک سین بنے گی', 'Give your lines, each line becomes a scene') + '</span></div></button>' +
      '<button class="big alt3" id="av"><span class="ico">✨</span><div><b>' + tt('پرامپٹ لکھیں، ویڈیو تیار', 'Write a prompt, get a video') + '</b><span>' + tt('بس بتائیں کیا چاہیے، AI سین، آواز اور موسیقی خود بنا دے گا', 'Just describe it; the AI builds scenes, voice and music') + '</span></div></button>' +
      '<button class="big alt2" id="np"><span class="ico">📣</span><div><b>' + tt('پروموشن · ایونٹ · سوشل · آگاہی', 'Promo · Event · Social · Awareness') + '</b><span>' + tt('تیار ٹیمپلیٹس: شادی، ورکشاپ، سیل، خبر، اپیل اور بہت کچھ', 'Ready templates: wedding, workshop, sale, news, appeal and more') + '</span></div></button>' +
      '<div class="row" style="margin-top:12px"><button class="mini" id="pj"><span class="ico">📁</span><span>' + tt('میرے پروجیکٹ', 'My projects') + '</span></button><button class="mini" id="mv"><span class="ico">🎞️</span><span>' + tt('میری ویڈیوز', 'My videos') + (nv ? ' (' + nv + ')' : '') + '</span></button></div>' +
      '<div class="card"><h3>' + (aiOn ? '🤖 ' + tt('AI موڈ چالو ہے', 'AI mode is on') : '🤖 ' + tt('AI موڈ بند ہے', 'AI mode is off')) + '</h3><div class="mut">' + (aiOn ? tt('AI کلپس دیکھ کر اسکرپٹ کی ہر لائن صحیح کلپ پر لگائے گی۔', 'AI will look at your clips and put each script line on the right clip.') : tt('بغیر AI بھی سب چلتا ہے۔ AI کے لیے Settings میں اپنی مفت key ڈالیں۔', 'Everything works without AI. For AI, add your own free key in Settings.')) + '</div></div>' +
      '<div class="credit">Developed by SMAA</div></div></div>';
    bindLang(); $('#gear').onclick = () => app.go('settings');
    $('#nw').onclick = () => { resetWiz(); app.go('wizard'); S.stat('wizard'); };
    $('#ns').onclick = () => { resetWiz(); W.focusScript = true; app.go('wizard'); S.stat('wizard'); };
    $('#av').onclick = () => app.go('aivid');
    $('#np').onclick = () => { app.go('tpls'); S.stat('tpls'); };
    $('#pj').onclick = () => app.go('projects'); $('#mv').onclick = () => app.go('videos');
  };

  /* ============ SETTINGS ============ */
  SCR.settings = async function () {
    const info = await AI.phoneInfo();
    root().innerHTML = '<div class="scr">' + top(tt('سیٹنگز', 'Settings'), true, langBox()) + '<div class="body">' +
      '<div class="card"><h3>🤖 ' + tt('AI موڈ (اختیاری)', 'AI mode (optional)') + '</h3><div class="mut">' + tt('Google Gemini کی اپنی مفت key ڈالیں (aistudio.google.com/apikey پر بغیر کارڈ بنتی ہے)۔ key صرف آپ کے فون میں رہتی ہے۔ فوٹو/ویڈیو کے چھوٹے فریم اور اسکرپٹ Google کو جاتے ہیں۔ مفت سروس میں Google انہیں اپنی سروس بہتر کرنے کے لیے استعمال کر سکتا ہے، اس لیے نجی چیزوں کے لیے AI بند رکھیں۔', 'Add your own free Google Gemini key (made at aistudio.google.com/apikey, no card). The key stays on this phone. Small frames of your clips and the script are sent to Google. On the free tier Google may use them to improve its services, so keep AI off for private things.') + '</div>' +
      '<input class="inp" id="key" type="password" autocomplete="off" placeholder="AIza..." value="' + esc(AI.key()) + '" style="direction:ltr;margin-top:8px">' +
      '<div class="acts"><button id="kc">' + tt('جانچیں اور محفوظ کریں', 'Check and save') + '</button><button id="kx">' + tt('key ہٹائیں', 'Remove key') + '</button></div><div class="mut" id="km"></div>' +
      '<label class="sw"><span>' + tt('AI استعمال کریں (key ہو تو)', 'Use AI (when a key is saved)') + '</span><input type="checkbox" id="aion"' + (S.get('aion', true) !== false ? ' checked' : '') + '></label></div>' +
      '<div class="card"><h3>🗣️ ' + tt('فون کی آواز', 'Phone voice') + '</h3><div class="mut" id="tv">' + (info.none ? tt('فون کی آواز صرف ایپ کے اندر چلتی ہے۔', 'Phone voice works only inside the app.') : !info.ok ? tt('فون میں text-to-speech نہیں ملا۔', 'No text-to-speech engine found on this phone.') : tt('اردو: ', 'Urdu: ') + (info.ur ? '✅' : '❌') + '  ·  ' + tt('ہندی: ', 'Hindi: ') + (info.hi ? '✅' : '❌') + '  ·  English: ' + (info.en ? '✅' : '❌')) + '</div>' +
      (S.native() ? '<div class="acts"><button id="tts">' + tt('فون کی آواز کی سیٹنگ کھولیں', 'Open phone voice settings') + '</button></div>' : '') + '</div>' +
      '<div class="card"><h3>🎬 ' + tt('ڈیفالٹ', 'Defaults') + '</h3><div class="lbl">' + tt('ایکسپورٹ کوالٹی', 'Export quality') + '</div>' + chips([[720, '720p'], [1080, '1080p']], S.get('res', 720), 'res') +
      '<label class="sw"><span>' + tt('آخر میں "Developed by SMAA" دکھائیں', 'Show "Developed by SMAA" at the end') + '</span><input type="checkbox" id="cr"' + (S.get('credit', true) !== false ? ' checked' : '') + '></label></div>' +
      '<div class="card"><h3>🔄 ' + tt('ایپ اپڈیٹ', 'App update') + '</h3><div class="mut" id="um">' + tt('ایپ ورژن: ', 'App build: ') + (window.SMAA_BUILD || '-') + '</div><div class="acts"><button id="ub">🔄 ' + tt('اپڈیٹ چیک کریں', 'Check for update') + '</button></div></div>' +
      '<div class="card"><h3>📊 ' + tt('گمنام گنتی', 'Anonymous counts') + '</h3><div class="mut">' + tt('صرف ایپ کھلنے اور فیچر کی گنتی جاتی ہے۔ آپ کی فوٹو، ویڈیو، اسکرپٹ، key یا لوکیشن کبھی نہیں۔', 'Only app-open and feature counts are sent. Never your photos, videos, scripts, key or location.') + '</div><label class="sw"><span>' + tt('گنتی بھیجیں', 'Send counts') + '</span><input type="checkbox" id="st"' + (window.StudioStats && window.StudioStats.on() ? ' checked' : '') + '></label></div>' +
      '<div class="credit">Cleanova Studio · build ' + (window.SMAA_BUILD || 'dev') + '<br>Developed by SMAA</div></div></div>';
    bindLang(); $('#bk').onclick = () => app.go('home');
    $('#ub').onclick = async () => { const m = $('#um'); if (!window.SMAAUpd) { m.textContent = tt('اپڈیٹ صرف انسٹال شدہ ایپ میں چلتی ہے', 'Updates work only in the installed app'); return; } m.textContent = '…'; const r = await window.SMAAUpd.check(); m.textContent = tt('آپ کا ورژن ', 'Your build ') + r.build + ' · ' + tt('تازہ ترین ', 'latest ') + (r.latest || '?') + (r.latest > r.build ? ' ⬆️ ' + tt('نیا ورژن ملا، اوپر کارڈ دیکھیں', 'new build found, see the card on top') : r.latest ? ' ✅ ' + tt('آپ تازہ ترین پر ہیں', 'you are up to date') : '') + (r.err ? ' ⚠️ ' + r.err.slice(0, 80) : ''); };
    $('#aion').onchange = e => S.set('aion', e.target.checked); $('#cr').onchange = e => S.set('credit', e.target.checked); $('#st').onchange = e => window.StudioStats && window.StudioStats.set(e.target.checked);
    $$('[data-res]').forEach(b => b.onclick = () => { S.set('res', +b.dataset.res); app.go('settings'); });
    $('#kx').onclick = () => { S.set('aikey', ''); S.set('aimodels', null); S.set('aittsm', null); app.go('settings'); };
    $('#kc').onclick = async () => {
      const k = $('#key').value.trim(); if (!k) { S.toast('پہلے key ڈالیں', 'Enter the key first'); return; }
      $('#km').innerHTML = '<span class="spin"></span> ' + tt('جانچ ہو رہی ہے…', 'Checking…');
      try { const r = await AI.check(k); S.set('aikey', k); $('#km').textContent = '✅ ' + tt('key درست ہے۔ ماڈل: ', 'Key is valid. Model: ') + (r.text[0] || '-') + (r.tts[0] ? ' · TTS: ' + r.tts[0] : ''); }
      catch (e) { $('#km').textContent = '⚠️ ' + AI.errText(e); }
    };
    if ($('#tts')) $('#tts').onclick = () => S.native().ttsSettings().catch(() => { });
  };

  /* ============ MY VIDEOS ============ */
  SCR.videos = function () {
    const L = S.get('videos', []);
    root().innerHTML = '<div class="scr">' + top(tt('میری ویڈیوز', 'My videos'), true) + '<div class="body">' + (L.length ? L.map((v, i) => '<div class="vitem"><span class="ico">🎞️</span><div class="t"><b>' + esc(v.name) + '</b><span class="mut">' + new Date(v.date).toLocaleString() + ' · ' + S.fmt(v.dur) + ' · ' + (v.size / 1048576).toFixed(1) + ' MB</span></div><button class="ib" data-sh="' + i + '">📤</button><button class="ib" data-op="' + i + '">▶️</button><button class="ib" data-rm="' + i + '">🗑</button></div>').join('') + '<div class="mut" style="margin-top:12px">' + tt('ویڈیوز گیلری میں Movies ▸ Cleanova Studio میں ہیں۔', 'Videos are in your Gallery under Movies ▸ Cleanova Studio.') + '</div>' : '<div class="empty">' + tt('ابھی کوئی ویڈیو ایکسپورٹ نہیں ہوئی', 'No exported videos yet') + '</div>') + '</div></div>';
    $('#bk').onclick = () => app.go('home');
    $$('[data-sh]').forEach(b => b.onclick = () => { const v = L[+b.dataset.sh]; if (S.native() && v.uri) S.native().shareFile({ uri: v.uri, mime: v.mime }).catch(() => S.toast('شیئر نہیں ہو سکی', 'Could not share')); else S.toast('صرف ایپ میں', 'App only'); });
    $$('[data-op]').forEach(b => b.onclick = () => { const v = L[+b.dataset.op]; if (S.native() && v.uri) S.native().openFile({ uri: v.uri, mime: v.mime }).catch(() => S.toast('فائل نہیں کھل سکی (شاید گیلری سے ہٹا دی گئی)', 'Could not open (maybe removed from Gallery)')); else S.toast('صرف ایپ میں', 'App only'); });
    $$('[data-rm]').forEach(b => b.onclick = () => { L.splice(+b.dataset.rm, 1); S.set('videos', L); app.go('videos'); });
  };

  /* ============ MY PROJECTS ============ */
  SCR.projects = async function () {
    root().innerHTML = '<div class="scr">' + top(tt('میرے پروجیکٹ', 'My projects'), true) + '<div class="body"><div class="empty"><span class="spin"></span></div></div></div>'; $('#bk').onclick = () => app.go('home');
    let items = []; try { const keys = await S.db.keys('proj'); items = (await S.db.all('proj')).map((v, i) => ({ id: keys[i], meta: v.meta })); } catch (e) { /* ignore */ }
    items.sort((a, b) => b.meta.date - a.meta.date);
    $('.body').innerHTML = items.length ? items.map(it => '<div class="vitem"><span class="ico">📁</span><div class="t"><b>' + esc(it.meta.name || '-') + '</b><span class="mut">' + new Date(it.meta.date).toLocaleString() + ' · ' + it.meta.n + ' ' + tt('کلپ', 'clips') + ' · ' + S.fmt(it.meta.dur) + '</span></div><button class="ib" data-op="' + it.id + '">✏️</button><button class="ib" data-rm="' + it.id + '">🗑</button></div>').join('') : '<div class="empty">' + tt('کوئی محفوظ پروجیکٹ نہیں', 'No saved projects') + '</div>';
    $$('[data-op]').forEach(b => b.onclick = async () => {
      S.toast('کھل رہا ہے…', 'Opening…'); try {
        const rec = await S.db.get('proj', b.dataset.op), blobs = {}; for (const k of rec.blobKeys) { const v = await S.db.get('media', b.dataset.op + ':' + k); if (v) blobs[k] = v; }
        const p = await P.restore(rec.json, blobs); app.go('editor', { p, saved: true });
      } catch (e) { S.toast('پروجیکٹ نہیں کھل سکا', 'Could not open the project'); }
    });
    $$('[data-rm]').forEach(b => b.onclick = async () => { if (await S.confirm(tt('حذف کریں؟', 'Delete?'), tt('یہ پروجیکٹ ہمیشہ کے لیے ہٹ جائے گا۔', 'This project will be removed for good.'))) { const rec = await S.db.get('proj', b.dataset.rm); for (const k of (rec && rec.blobKeys) || []) await S.db.del('media', b.dataset.rm + ':' + k); await S.db.del('proj', b.dataset.rm); app.go('projects'); } });
  };

  /* ============ TEMPLATES ============ */
  const TP = S.tpl, CD = S.cards; let TC = 'social', TF = null, MS = null;
  SCR.tpls = function () {
    const cats = TP.CATS.map(c => [c[0], c[2] + ' ' + c[1][S.lang === 'ur' ? 0 : 1]]);
    const list = TP.LIST.filter(t => t.cat === TC);
    root().innerHTML = '<div class="scr">' + top(tt('تیار ٹیمپلیٹس', 'Ready templates'), true, langBox()) + '<div class="body">' + chips(cats, TC, 'cat') +
      '<div class="tpls">' + list.map(t => { const th = CD.THEMES[t.theme]; return '<button class="tpl" data-t="' + t.id + '" style="background:linear-gradient(135deg,' + th.c2 + ',' + th.a1 + '88)"><i>' + t.e + '</i><span>' + TP.name(t) + '</span></button>'; }).join('') + '</div>' +
      '<div class="mut" style="margin-top:12px">' + tt('ہر ٹیمپلیٹ میں آپ سب متن، رنگ، لوگو اور تصاویر بدل سکتے ہیں۔ اعداد و شمار آپ خود دیتے ہیں، ایپ انہیں چیک نہیں کرتی۔', 'Every template lets you change all text, colours, logo and pictures. You supply the facts and numbers; the app does not verify them.') + '</div></div></div>';
    bindLang(); $('#bk').onclick = () => app.go('home');
    $$('[data-cat]').forEach(b => b.onclick = () => { TC = b.dataset.cat; SCR.tpls(); });
    $$('[data-t]').forEach(b => b.onclick = () => { newTF(TP.get(b.dataset.t)); app.go('tplform'); });
  };
  function newTF(t) {
    const br = TP.brand(), sv = S.get('wiz', {});
    TF = { t, vals: { org: br.name || '', date_iso: '' }, media: [], loading: 0, fmt: sv.fmt || '9:16', res: S.get('res', 720), music: 'auto', musicFile: null, voice: 'none', gvoice: 'Kore', brandOn: true, credit: S.get('credit', true) !== false };
  }
  async function addTplMedia(files) {
    files = Array.from(files || []); if (!files.length) return; MS.loading += files.length; paintTM();
    for (const f of files) { try { const c = await A.loadFile(f, false); c.adj = A.adjFor(c); MS.media.push(c); } catch (e) { S.toast('فائل نہیں کھلی', 'Could not open a file'); } MS.loading--; paintTM(); }
  }
  function paintTM() {
    const box = $('#tm'); if (!box) return;
    box.innerHTML = '<div class="grid">' + MS.media.map(c => '<div class="tile"><canvas data-th="' + c.id + '"></canvas><button class="x" data-x="' + c.id + '">✕</button><span class="k">' + (c.kind === 'v' ? '🎥' : '📷') + '</span></div>').join('') + '<button class="tile add" id="tadd">' + (MS.loading ? '<span class="spin"></span>' : '＋') + '</button></div>';
    MS.media.forEach(c => { const cv = box.querySelector('[data-th="' + c.id + '"]'); if (cv && c.thumb) { cv.width = c.thumb.width; cv.height = c.thumb.height; cv.getContext('2d').drawImage(c.thumb, 0, 0); } });
    $$('[data-x]', box).forEach(b => b.onclick = () => { MS.media = MS.media.filter(c => c.id !== b.dataset.x); paintTM(); });
    $('#tadd').onclick = () => $('#tfm').click();
  }
  SCR.tplform = async function () {
    if (!TF) { SCR.tpls(); return; } MS = TF;
    const t = TF.t, aiOn = AI.enabled(), br = TP.brand(); const info = TF.voice === 'phone' ? await AI.phoneInfo() : null;
    const moodItems = [['auto', tt('خود', 'Auto')]].concat(S.music.list.map(m => [m, S.music.MOODS[m].n[S.lang === 'ur' ? 0 : 1]])).concat([['file', TF.musicFile ? '🎵 ' + TF.musicFile.name.slice(0, 14) : tt('میرا گانا', 'My own song')], ['none', tt('بغیر موسیقی', 'No music')]]);
    const pk = v => (Array.isArray(v) ? v[S.lang === 'ur' ? 0 : 1] : v);
    const fields = t.ask.map(k => { const a = TP.ASK[k], lab = pk(a[0]), ph = k === 'date' ? '' : (t.def[k] ? pk(t.def[k]) : pk(a[1])), v = TF.vals[k] || '';
      if (k === 'date') return '<div class="lbl">' + lab + '</div><input class="inp" type="date" id="v_date" value="' + esc(TF.vals.date_iso || '') + '"><div class="mut">' + tt('خالی چھوڑیں تو ٹیمپلیٹ کی مثال تاریخ رہے گی', 'Leave empty to keep the sample date') + '</div>';
      return '<div class="lbl">' + lab + '</div>' + (k === 'points' ? '<textarea id="v_' + k + '" rows="4" placeholder="' + esc(ph) + '">' + esc(v) + '</textarea>' : '<input class="inp" type="text" id="v_' + k + '" value="' + esc(v) + '" placeholder="' + esc(ph) + '">'); }).join('');
    root().innerHTML = '<div class="scr">' + top(t.e + ' ' + TP.name(t), true) + '<div class="body">' +
      '<div class="card"><h3>1️⃣ ' + tt('تفصیلات', 'Details') + '</h3><div class="mut">' + tt('جو خالی چھوڑیں گے اس کی جگہ مثال کا متن آئے گا، بعد میں ایڈیٹر میں بدل سکتے ہیں۔', 'Empty fields keep the sample text. You can change everything later in the editor.') + '</div>' + fields + '</div>' +
      '<div class="card"><h3>2️⃣ ' + tt('لوگو اور برانڈ', 'Logo and brand') + '</h3><label class="sw"><span>' + tt('برانڈ پٹی لگائیں', 'Add the brand bar') + '</span><input type="checkbox" id="tbr"' + (TF.brandOn ? ' checked' : '') + '></label><div class="acts"><button id="tlg">🖼️ ' + (br.logo ? tt('محفوظ لوگو موجود ہے', 'Saved logo in use') : tt('لوگو چنیں', 'Pick logo')) + '</button></div><div class="mut">' + tt('لوگو اور نام ایک بار محفوظ ہو جاتا ہے، آئندہ خود آ جائے گا۔', 'Your logo and name are saved once and reused next time.') + '</div></div>' +
      '<div class="card"><h3>3️⃣ ' + tt('اپنی تصاویر / ویڈیو (اختیاری)', 'Your photos / videos (optional)') + '</h3><div class="mut">' + tt('یہ نیون فریم والے ہائی لائٹ سین بنیں گے۔', 'They become highlighted scenes inside the neon frame.') + '</div><div id="tm"></div><input type="file" id="tfm" accept="image/*,video/*" multiple hidden></div>' +
      '<div class="card"><h3>4️⃣ ' + tt('موسیقی اور آواز', 'Music and voice') + '</h3><div class="lbl">' + tt('موسیقی', 'Music') + '</div>' + chips(moodItems, TF.music, 'mus') + '<input type="file" id="tmf" accept="audio/*" hidden>' +
      '<div class="lbl">' + tt('وائس اوور', 'Voice-over') + '</div>' + chips([['none', tt('نہیں', 'None')], ['phone', tt('فون کی آواز', 'Phone voice')], ['gemini', tt('AI آواز', 'AI voice')]], TF.voice, 'voi') +
      (TF.voice === 'gemini' ? chips(AI.VOICES, TF.gvoice, 'gv') + (aiOn ? '' : '<div class="mut">⚠️ ' + tt('Settings میں key ڈالیں', 'Add the AI key in Settings') + '</div>') : '') +
      (TF.voice === 'phone' ? '<div class="mut">' + (!S.native() ? '⚠️ ' + tt('فون کی آواز صرف ایپ کے اندر', 'Phone voice only works inside the app') : info && info.ok ? tt('اردو آواز: ', 'Urdu voice: ') + (info.ur ? '✅' : '❌') : '⚠️ ' + tt('فون میں text-to-speech نہیں', 'No text-to-speech on this phone')) + '</div>' : '') + '</div>' +
      '<div class="card"><h3>5️⃣ ' + tt('فارمیٹ', 'Format') + '</h3>' + chips(FMT(), TF.fmt, 'fmt') + chips([[720, '720p'], [1080, '1080p']], TF.res, 'res') + '</div>' +
      '<button class="pri big2" id="tgo">🎬 ' + tt('ویڈیو بنائیں', 'Make the video') + '</button><div class="credit">Developed by SMAA</div></div></div>';
    $('#bk').onclick = () => app.go('tpls'); paintTM();
    t.ask.forEach(k => { const el = $('#v_' + k); if (!el) return; el.oninput = () => { if (k === 'date') TF.vals.date_iso = el.value; else TF.vals[k] = el.value; }; });
    $('#tbr').onchange = e => { TF.brandOn = e.target.checked; };
    $('#tlg').onclick = () => { const fi = document.createElement('input'); fi.type = 'file'; fi.accept = 'image/*'; fi.onchange = async () => { if (!fi.files[0]) return; try { const b = TP.brand(); b.logo = await TP.logoFromFile(fi.files[0]); if (TF.vals.org) b.name = TF.vals.org; TP.saveBrand(b); S.toast('لوگو محفوظ ہو گیا', 'Logo saved'); SCR.tplform(); } catch (e) { S.toast('لوگو نہیں کھلا', 'Could not open the logo'); } }; fi.click(); };
    $('#tfm').onchange = e => { addTplMedia(e.target.files); e.target.value = ''; };
    $('#tmf').onchange = e => { const f = e.target.files[0]; if (f) { TF.musicFile = f; TF.music = 'file'; SCR.tplform(); } };
    $$('[data-mus]').forEach(b => b.onclick = () => { if (b.dataset.mus === 'file') { $('#tmf').click(); return; } TF.music = b.dataset.mus; SCR.tplform(); });
    $$('[data-voi]').forEach(b => b.onclick = () => { TF.voice = b.dataset.voi; SCR.tplform(); }); $$('[data-gv]').forEach(b => b.onclick = () => { TF.gvoice = b.dataset.gv; SCR.tplform(); });
    $$('[data-fmt]').forEach(b => b.onclick = () => { TF.fmt = b.dataset.fmt; SCR.tplform(); }); $$('[data-res]').forEach(b => b.onclick = () => { TF.res = +b.dataset.res; SCR.tplform(); });
    $('#tgo').onclick = makeFromTpl;
  };
  async function makeFromTpl() {
    if (TF.loading) { S.toast('تصاویر ابھی لوڈ ہو رہی ہیں', 'Media is still loading'); return; }
    const ac = new AbortController(); S.stat('tpl_' + TF.t.id);
    const dlg = document.createElement('div'); dlg.className = 'dlg'; dlg.innerHTML = '<div class="dbox"><h3>🎬 ' + tt('ویڈیو بن رہی ہے', 'Building the video') + '</h3><div class="dbody" id="pm">…</div><div class="bar"><i id="pb"></i></div><div class="dbtn"><button id="pc" class="sec">' + tt('منسوخ', 'Cancel') + '</button></div></div>'; document.body.appendChild(dlg);
    const msg = (m, q) => { const e = $('#pm'); if (e) e.textContent = m; if (q !== undefined && $('#pb')) $('#pb').style.width = Math.round(q * 100) + '%'; };
    $('#pc').onclick = () => { ac.abort(); dlg.remove(); };
    try {
      if (TF.vals.org && TF.vals.org.trim()) { const b = TP.brand(); if (!b.name) { b.name = TF.vals.org.trim(); TP.saveBrand(b); } }
      msg(tt('سین بنا رہا ہوں…', 'Designing scenes…'), .2); await S.sleep(30);
      const p = TP.build(TF.t, TF.vals, { fmt: TF.fmt, res: TF.res, music: TF.music, musicFile: TF.musicFile, media: TF.media.slice(), credit: TF.credit, brandOn: TF.brandOn });
      p.clips.forEach(c => { if (c.kind === 'c') c.thumb = CD.thumb(c, p, { logo: p.brand.logo }); });
      let note = '';
      if (TF.voice !== 'none') {
        msg(tt('آواز بنا رہا ہوں…', 'Making the voice-over…'), .4);
        try { await TP.makeVoices(p, TF.voice, { voice: TF.gvoice }, (i, n) => msg(tt('آواز بن رہی ہے ', 'Voice ') + i + '/' + n, .4 + .45 * i / Math.max(1, n)), ac.signal); }
        catch (e) { if (ac.signal.aborted) return; p.voice = []; note += AI.errText(e) + ' · ' + tt('بغیر آواز', 'no voice') + '. '; }
      }
      if (p.music.kind === 'synth') { msg(tt('موسیقی بنا رہا ہوں…', 'Composing the music…'), .92); try { await S.music.get(p.music.mood, 1); } catch (e) { p.music.kind = 'none'; } }
      if (ac.signal.aborted) return; dlg.remove(); P.layout(p);
      app.go('editor', { p, fresh: true, note });
    } catch (e) { dlg.remove(); if (!ac.signal.aborted) S.toast('خرابی: ' + (e.message || e), 'Error: ' + (e.message || e), 5000); }
  }

  /* ============ PROMPT -> VIDEO ============ */
  let AV = null;
  const AV_EX = [['🎓', 'ورکشاپ', 'Workshop', 'ہمارے اسکول میں 13 اور 14 نومبر کو شام 6 سے 8 بجے مفت ڈیجیٹل مارکیٹنگ ورکشاپ ہے، مقام ابو تراب اسکول کراچی، رابطہ 0300-1234567', 'Free digital marketing workshop at our school on 13 and 14 November, 6 to 8 PM, Abu Turab School Karachi, call 0300-1234567'],
    ['💍', 'ولیمہ', 'Walima', 'احمد اور سارہ کے ولیمہ کی دعوت، ہفتہ 20 دسمبر شام 7 بجے، رائل ہال لاہور', 'Walima invitation for Ahmed and Sara, Saturday 20 December at 7 PM, Royal Hall Lahore'],
    ['🛍️', 'سیل', 'Sale', 'ہماری کپڑوں کی دکان پر 40 فیصد سیل، ہفتے تک، دکان مین بازار سیالکوٹ', 'Clothes shop 40% off sale until Sunday, Main Bazaar Sialkot'],
    ['🚨', 'آگاہی', 'Awareness', 'ہماری گلی میں پانی کی قلت کا مسئلہ، دو ہفتے سے پانی نہیں آ رہا، انتظامیہ سے مطالبہ ہے کہ فوری حل کرے', 'Water shortage in our street, no water for two weeks, we demand the authorities fix it urgently']];
  function newAV() { const br = TP.brand(), sv = S.get('wiz', {}); AV = { prompt: '', lang: S.lang === 'ur' ? 'ur' : 'en', size: 'mid', media: [], loading: 0, fmt: sv.fmt || '9:16', res: S.get('res', 720), music: 'auto', musicFile: null, voice: 'none', gvoice: 'Kore', brandOn: true, credit: S.get('credit', true) !== false }; }
  SCR.aivid = async function () {
    if (!AV) newAV(); MS = AV; const aiOn = AI.enabled();
    const moodItems = [['auto', tt('خود', 'Auto')]].concat(S.music.list.map(m => [m, S.music.MOODS[m].n[S.lang === 'ur' ? 0 : 1]])).concat([['file', AV.musicFile ? '🎵 ' + AV.musicFile.name.slice(0, 14) : tt('میرا گانا', 'My own song')], ['none', tt('بغیر موسیقی', 'No music')]]);
    root().innerHTML = '<div class="scr">' + top('✨ ' + tt('پرامپٹ سے ویڈیو', 'Video from a prompt'), true, langBox()) + '<div class="body">' +
      (aiOn ? '' : '<div class="card warn"><b>⚠️ ' + tt('AI key ضروری ہے', 'AI key needed') + '</b><div class="mut">' + tt('یہ فیچر انٹرنیٹ اور آپ کی اپنی مفت Gemini key سے چلتا ہے۔ Settings میں key ڈالیں۔', 'This feature needs internet and your own free Gemini key. Add it in Settings.') + '</div><div class="acts"><button id="avset">⚙️ ' + tt('Settings کھولیں', 'Open Settings') + '</button></div></div>') +
      '<div class="card"><h3>1️⃣ ' + tt('کیسی ویڈیو چاہیے؟ لکھیں', 'Describe the video you want') + '</h3><textarea id="avp" rows="6" dir="auto" placeholder="' + esc(tt('مثال: ہماری ورکشاپ 13 نومبر کو شام 6 بجے ابو تراب اسکول میں ہے، مفت ہے، رابطہ 0300-1234567', 'Example: Our workshop is on 13 November at 6 PM at Abu Turab School, it is free, call 0300-1234567')) + '">' + esc(AV.prompt) + '</textarea>' +
      '<div class="mut">' + tt('جتنی تفصیل (نام، تاریخ، جگہ، فون) دیں گے ویڈیو اتنی درست بنے گی۔ جو نہیں بتائیں گے وہ ایپ خود نہیں گھڑے گی۔', 'The more detail you give (names, date, place, phone) the better. Anything you leave out is not invented.') + '</div>' +
      '<div class="lbl">' + tt('مثالیں (چھو کر بھریں)', 'Examples (tap to fill)') + '</div><div class="chips">' + AV_EX.map((x, i) => '<button class="chip" data-ex="' + i + '">' + x[0] + ' ' + x[S.lang === 'ur' ? 1 : 2] + '</button>').join('') + '</div></div>' +
      '<div class="card"><h3>2️⃣ ' + tt('زبان اور لمبائی', 'Language and length') + '</h3>' + chips([['ur', 'اردو'], ['roman', 'Roman Urdu'], ['en', 'English']], AV.lang, 'lng') + chips([['short', tt('چھوٹی', 'Short')], ['mid', tt('درمیانی', 'Medium')], ['long', tt('لمبی', 'Long')]], AV.size, 'siz') + '</div>' +
      '<div class="card"><h3>3️⃣ ' + tt('اپنی تصاویر / ویڈیو (اختیاری)', 'Your photos / videos (optional)') + '</h3><div id="tm"></div><input type="file" id="tfm" accept="image/*,video/*" multiple hidden></div>' +
      '<div class="card"><h3>4️⃣ ' + tt('موسیقی، آواز، فارمیٹ', 'Music, voice, format') + '</h3>' + chips(moodItems, AV.music, 'mus') + '<input type="file" id="tmf" accept="audio/*" hidden>' +
      '<div class="lbl">' + tt('وائس اوور', 'Voice-over') + '</div>' + chips([['none', tt('نہیں', 'None')], ['phone', tt('فون کی آواز', 'Phone voice')], ['gemini', tt('AI آواز', 'AI voice')]], AV.voice, 'voi') + (AV.voice === 'gemini' ? chips(AI.VOICES, AV.gvoice, 'gv') : '') +
      chips(FMT(), AV.fmt, 'fmt') + chips([[720, '720p'], [1080, '1080p']], AV.res, 'res') + '<label class="sw"><span>' + tt('لوگو / برانڈ پٹی لگائیں', 'Add logo / brand bar') + '</span><input type="checkbox" id="tbr"' + (AV.brandOn ? ' checked' : '') + '></label></div>' +
      '<button class="pri big2" id="avgo">✨ ' + tt('ویڈیو تیار کریں', 'Create the video') + '</button><div class="credit">Developed by SMAA</div></div></div>';
    bindLang(); $('#bk').onclick = () => app.go('home'); paintTM();
    if ($('#avset')) $('#avset').onclick = () => app.go('settings');
    $('#avp').oninput = e => { AV.prompt = e.target.value; };
    $$('[data-ex]').forEach(b => b.onclick = () => { const x = AV_EX[+b.dataset.ex]; AV.prompt = x[S.lang === 'ur' ? 3 : 4]; AV.lang = S.lang === 'ur' ? 'ur' : 'en'; SCR.aivid(); });
    $$('[data-lng]').forEach(b => b.onclick = () => { AV.lang = b.dataset.lng; SCR.aivid(); }); $$('[data-siz]').forEach(b => b.onclick = () => { AV.size = b.dataset.siz; SCR.aivid(); });
    $('#tfm').onchange = e => { addTplMedia(e.target.files); e.target.value = ''; };
    $('#tmf').onchange = e => { const f = e.target.files[0]; if (f) { AV.musicFile = f; AV.music = 'file'; SCR.aivid(); } };
    $$('[data-mus]').forEach(b => b.onclick = () => { if (b.dataset.mus === 'file') { $('#tmf').click(); return; } AV.music = b.dataset.mus; SCR.aivid(); });
    $$('[data-voi]').forEach(b => b.onclick = () => { AV.voice = b.dataset.voi; SCR.aivid(); }); $$('[data-gv]').forEach(b => b.onclick = () => { AV.gvoice = b.dataset.gv; SCR.aivid(); });
    $$('[data-fmt]').forEach(b => b.onclick = () => { AV.fmt = b.dataset.fmt; SCR.aivid(); }); $$('[data-res]').forEach(b => b.onclick = () => { AV.res = +b.dataset.res; SCR.aivid(); });
    $('#tbr').onchange = e => { AV.brandOn = e.target.checked; };
    $('#avgo').onclick = makeFromPrompt;
  };
  async function makeFromPrompt() {
    if (AV.loading) { S.toast('تصاویر ابھی لوڈ ہو رہی ہیں', 'Media is still loading'); return; }
    if (AV.prompt.trim().length < 8) { S.toast('پہلے ویڈیو کے بارے میں لکھیں', 'Write what the video is about first'); return; }
    if (!AI.enabled()) { S.toast('پہلے Settings میں AI key ڈالیں', 'Add the AI key in Settings first', 4000); return; }
    if (AV.voice === 'gemini' && !AI.enabled()) return;
    const ac = new AbortController(); S.stat('prompt_video');
    const dlg = document.createElement('div'); dlg.className = 'dlg'; dlg.innerHTML = '<div class="dbox"><h3>✨ ' + tt('ویڈیو تیار ہو رہی ہے', 'Creating your video') + '</h3><div class="dbody" id="pm">…</div><div class="bar"><i id="pb"></i></div><div class="dbtn"><button id="pc" class="sec">' + tt('منسوخ', 'Cancel') + '</button></div></div>'; document.body.appendChild(dlg);
    const msg = (m, q) => { const e = $('#pm'); if (e) e.textContent = m; if (q !== undefined && $('#pb')) $('#pb').style.width = Math.round(q * 100) + '%'; };
    $('#pc').onclick = () => { ac.abort(); dlg.remove(); };
    try {
      msg(tt('AI آپ کی بات سمجھ کر سین بنا رہا ہے…', 'The AI is planning your scenes…'), .15);
      const r = await AI.makeVideo({ prompt: AV.prompt.trim(), lang: AV.lang, size: AV.size }, ac.signal); if (ac.signal.aborted) return;
      msg(tt('ڈیزائن بنا رہا ہوں…', 'Designing…'), .5); await S.sleep(30);
      const p = TP.buildAI(r, { prompt: AV.prompt, fmt: AV.fmt, res: AV.res, music: AV.music, musicFile: AV.musicFile, media: AV.media.slice(), credit: AV.credit, brandOn: AV.brandOn }); let note = '';
      if (AV.voice !== 'none') {
        msg(tt('آواز بنا رہا ہوں…', 'Making the voice-over…'), .6);
        try { await TP.makeVoices(p, AV.voice, { voice: AV.gvoice }, (i, n) => msg(tt('آواز بن رہی ہے ', 'Voice ') + i + '/' + n, .6 + .3 * i / Math.max(1, n)), ac.signal); }
        catch (e) { if (ac.signal.aborted) return; p.voice = []; note += AI.errText(e) + ' · ' + tt('بغیر آواز', 'no voice') + '. '; }
      }
      if (p.music.kind === 'synth') { msg(tt('موسیقی بنا رہا ہوں…', 'Composing the music…'), .94); try { await S.music.get(p.music.mood, 1); } catch (e) { p.music.kind = 'none'; } }
      if (ac.signal.aborted) return; dlg.remove(); P.layout(p); AV.media = []; app.go('editor', { p, fresh: true, note });
    } catch (e) { dlg.remove(); if (!ac.signal.aborted) S.dialog({ title: '⚠️ ' + tt('ویڈیو نہیں بن سکی', 'Could not create the video'), text: AI.errText(e) + (e && e.message && e.message !== e.kind ? '\n\n(' + String(e.message).slice(0, 160) + ')' : '') }); }
  }

  /* ============ WIZARD ============ */
  let W = null;
  function resetWiz() {
    if (W && W.clips) W.clips.forEach(c => { try { URL.revokeObjectURL(c.url); } catch (e) { /* ignore */ } });
    const sv = S.get('wiz', {});
    W = { clips: [], loading: 0, total: 0, failed: 0, script: '', style: sv.style || 'auto', fmt: sv.fmt || '9:16', target: sv.target || 0, music: sv.music || 'auto', musicFile: null, voice: 'none', gvoice: 'Kore', dedupe: sv.dedupe !== false, ai: true, order: sv.order || 'date', res: S.get('res', 720), credit: S.get('credit', true) !== false, focusScript: false };
  }
  app.resetWiz = resetWiz;
  const saveWiz = () => S.set('wiz', { style: W.style, fmt: W.fmt, target: W.target, music: W.music === 'file' ? 'auto' : W.music, dedupe: W.dedupe, order: W.order });
  const FMT = () => [['9:16', tt('ریل / اسٹوری 9:16', 'Reel / Story 9:16')], ['16:9', tt('یوٹیوب 16:9', 'YouTube 16:9')], ['1:1', tt('چوکور 1:1', 'Square 1:1')], ['4:5', tt('پوسٹ 4:5', 'Post 4:5')]];

  async function addFiles(files) {
    files = Array.from(files || []); if (!files.length) return; W.total += files.length; W.loading += files.length; paintMedia();
    const wantFrames = AI.enabled();
    for (const f of files) {
      try { const c = await A.loadFile(f, wantFrames); W.clips.push(c); } catch (e) { W.failed++; }
      W.loading--; paintMedia();
    }
    if (W.failed) { S.toast(W.failed + ' فائلیں نہیں کھل سکیں (جیسے HEIC فوٹو)', W.failed + ' files could not be opened (e.g. HEIC photos)', 4200); W.failed = 0; }
  }
  function paintMedia() {
    const box = $('#media'); if (!box) return;
    const sorted = W.order === 'date' ? W.clips.slice().sort((a, b) => a.date - b.date) : W.clips;
    box.innerHTML = '<div class="grid">' + sorted.map((c, i) => '<div class="tile" data-i="' + c.id + '"><canvas data-th="' + c.id + '"></canvas><button class="x" data-x="' + c.id + '">✕</button><span class="k">' + (c.kind === 'v' ? '🎥 ' + S.dur(c.dur) : '📷') + '</span></div>').join('') + '<button class="tile add" id="addm">' + (W.loading ? '<span class="spin"></span>' : '＋') + '</button></div>' +
      (W.loading ? '<div class="mut" style="margin-top:8px">' + tt('کلپس کو پرکھ رہا ہوں… ', 'Analysing clips… ') + (W.total - W.loading) + '/' + W.total + '</div>' : '') +
      (W.clips.length ? '<div class="mut" style="margin-top:8px">' + W.clips.length + ' ' + tt('فائلیں', 'files') + '</div>' : '');
    sorted.forEach(c => { const cv = box.querySelector('[data-th="' + c.id + '"]'); if (cv && c.thumb) { cv.width = c.thumb.width; cv.height = c.thumb.height; cv.getContext('2d').drawImage(c.thumb, 0, 0); } });
    $('#addm').onclick = () => $('#fi').click();
    $$('[data-x]', box).forEach(b => b.onclick = e => { e.stopPropagation(); const i = W.clips.findIndex(c => c.id === b.dataset.x); if (i >= 0) { try { URL.revokeObjectURL(W.clips[i].url); } catch (er) { /* ignore */ } W.clips.splice(i, 1); paintMedia(); paintGo(); } });
    paintGo();
  }
  function paintGo() { const g = $('#go'); if (g) g.disabled = !W.clips.length || W.loading > 0; }

  SCR.wizard = async function () {
    if (!W) resetWiz();
    const info = W.voice === 'phone' ? await AI.phoneInfo() : null; const aiOn = AI.enabled();
    const sc = $('.body') ? $('.body').scrollTop : 0;
    const moodItems = [['auto', tt('خود', 'Auto')]].concat(S.music.list.map(m => [m, S.music.MOODS[m].n[S.lang === 'ur' ? 0 : 1]])).concat([['file', W.musicFile ? '🎵 ' + W.musicFile.name.slice(0, 14) : tt('میرا گانا', 'My own song')], ['none', tt('بغیر موسیقی', 'No music')]]);
    root().innerHTML = '<div class="scr">' + top(tt('نئی ویڈیو', 'New video'), true, langBox()) +
      '<div class="body"><input type="file" id="fi" accept="image/*,video/*" multiple hidden><input type="file" id="fm" accept="audio/*" hidden>' +
      '<div class="card"><h3>1️⃣ ' + tt('فوٹو اور ویڈیو', 'Photos and videos') + '</h3><div id="media"></div>' +
      '<div class="lbl">' + tt('ترتیب', 'Order') + '</div>' + chips([['date', tt('تاریخ کے مطابق', 'By date')], ['picked', tt('جیسے چنی', 'As picked')]], W.order, 'ord') + '</div>' +
      '<div class="card"><h3>2️⃣ ' + tt('انداز (اسٹائل)', 'Style') + '</h3><div class="styles">' +
      [['auto', { n: ['خود چنیں', 'Auto'], e: '🪄', g: ['#8b7cff', '#ff6fb5'], d: ['اسکرپٹ/AI دیکھ کر', 'From script / AI'] }]].concat(A.STYLE_LIST.map(k => [k, A.STYLES[k]])).map(([k, s]) => '<button class="sty' + (W.style === k ? ' on' : '') + '" data-sty="' + k + '" style="background:linear-gradient(135deg,' + s.g[0] + ',' + s.g[1] + ')"><span class="e">' + s.e + '</span><b>' + s.n[S.lang === 'ur' ? 0 : 1] + '</b><small>' + (s.d[S.lang === 'ur' ? 0 : 1]) + '</small></button>').join('') + '</div></div>' +
      '<div class="card"><h3>3️⃣ ' + tt('اسکرپٹ (اختیاری)', 'Script (optional)') + '</h3><div class="mut">' + tt('ہر لائن الگ لکھیں۔ پہلی لائن عنوان، آخری لائن اختتام، بیچ کی لائنیں کلپس پر کیپشن بنیں گی۔', 'One line per row. First line is the title, last line is the ending, the lines between become captions on the clips.') + '</div>' +
      '<textarea id="scr" rows="6" placeholder="' + esc(tt('ہماری مری کی سیر\nصبح کی ٹھنڈی ہوا\nبچوں کی مستی\nاللہ کا شکر ہے', 'Our trip to Murree\nCold morning air\nThe kids having fun\nThank God for everything')) + '" style="margin-top:8px">' + esc(W.script) + '</textarea>' +
      '<div class="acts"><button id="aiw"' + (aiOn ? '' : ' style="opacity:.55"') + '>✨ ' + tt('AI سے لکھوائیں', 'Write with AI') + '</button><button id="scl">' + tt('صاف کریں', 'Clear') + '</button></div></div>' +
      '<div class="card"><h3>4️⃣ ' + tt('موسیقی اور آواز', 'Music and voice') + '</h3><div class="lbl">' + tt('موسیقی', 'Music') + '</div>' + chips(moodItems, W.music, 'mus') +
      '<div class="lbl">' + tt('وائس اوور (اسکرپٹ بول کر)', 'Voice-over (reads the script)') + '</div>' + chips([['none', tt('نہیں', 'None')], ['phone', tt('فون کی آواز', 'Phone voice')], ['gemini', tt('AI آواز', 'AI voice')]], W.voice, 'voi') +
      (W.voice === 'gemini' ? chips(AI.VOICES, W.gvoice, 'gv') + (aiOn ? '' : '<div class="mut">⚠️ ' + tt('AI آواز کے لیے Settings میں key ڈالیں', 'Add the AI key in Settings for AI voice') + '</div>') : '') +
      (W.voice === 'phone' ? '<div class="mut">' + (!S.native() ? '⚠️ ' + tt('فون کی آواز صرف ایپ کے اندر', 'Phone voice only works inside the app') : info && info.ok ? tt('اردو آواز: ', 'Urdu voice: ') + (info.ur ? '✅' : '❌ ' + tt('(اردو کے لیے Roman Urdu لکھیں یا Settings سے اردو آواز لگائیں)', '(write Roman Urdu or install an Urdu voice in Settings)')) : '⚠️ ' + tt('فون میں text-to-speech نہیں', 'No text-to-speech on this phone')) + '</div>' : '') + '</div>' +
      '<div class="card"><h3>5️⃣ ' + tt('فارمیٹ اور لمبائی', 'Format and length') + '</h3>' + chips(FMT(), W.fmt, 'fmt') +
      '<div class="lbl">' + tt('لمبائی', 'Length') + '</div>' + chips([[0, tt('خود', 'Auto')], [15, '15s'], [30, '30s'], [60, '60s']], W.target, 'tg') +
      '<div class="lbl">' + tt('کوالٹی', 'Quality') + '</div>' + chips([[720, '720p'], [1080, '1080p']], W.res, 'res') +
      '<label class="sw"><span>' + tt('ملتی جلتی فوٹو ہٹائیں', 'Remove near-identical photos') + '</span><input type="checkbox" id="dd"' + (W.dedupe ? ' checked' : '') + '></label>' +
      '<label class="sw"><span>' + tt('آخر میں "Developed by SMAA"', 'Show "Developed by SMAA" at the end') + '</span><input type="checkbox" id="cr"' + (W.credit ? ' checked' : '') + '></label>' +
      '<label class="sw"><span>🤖 ' + tt('AI استعمال کریں', 'Use AI') + (aiOn ? '' : ' <small class="mut">(' + tt('key نہیں', 'no key') + ')</small>') + '</span><input type="checkbox" id="uai"' + (W.ai && aiOn ? ' checked' : '') + (aiOn ? '' : ' disabled') + '></label></div>' +
      '</div><div class="foot"><button class="pri" id="go">🎬 ' + tt('آٹو ایڈٹ', 'Auto edit') + '</button></div></div>';
    bindLang(); $('.body').scrollTop = sc; paintMedia();
    $('#bk').onclick = () => app.go('home');
    $('#fi').onchange = e => { addFiles(e.target.files); e.target.value = ''; };
    $('#fm').onchange = e => { const f = e.target.files[0]; if (f) { W.musicFile = f; W.music = 'file'; SCR.wizard(); } };
    $$('[data-ord]').forEach(b => b.onclick = () => { W.order = b.dataset.ord; saveWiz(); SCR.wizard(); });
    $$('[data-sty]').forEach(b => b.onclick = () => { W.style = b.dataset.sty; saveWiz(); SCR.wizard(); });
    $('#scr').oninput = e => { W.script = e.target.value; };
    $('#scl').onclick = () => { W.script = ''; SCR.wizard(); };
    $$('[data-mus]').forEach(b => b.onclick = () => { if (b.dataset.mus === 'file') { $('#fm').click(); return; } W.music = b.dataset.mus; saveWiz(); SCR.wizard(); });
    $$('[data-voi]').forEach(b => b.onclick = () => { W.voice = b.dataset.voi; SCR.wizard(); });
    $$('[data-gv]').forEach(b => b.onclick = () => { W.gvoice = b.dataset.gv; SCR.wizard(); });
    $$('[data-fmt]').forEach(b => b.onclick = () => { W.fmt = b.dataset.fmt; saveWiz(); SCR.wizard(); });
    $$('[data-tg]').forEach(b => b.onclick = () => { W.target = +b.dataset.tg; saveWiz(); SCR.wizard(); });
    $$('[data-res]').forEach(b => b.onclick = () => { W.res = +b.dataset.res; SCR.wizard(); });
    $('#dd').onchange = e => { W.dedupe = e.target.checked; saveWiz(); }; $('#cr').onchange = e => { W.credit = e.target.checked; };
    $('#uai').onchange = e => { W.ai = e.target.checked; };
    $('#aiw').onclick = () => { if (!aiOn) { S.toast('پہلے Settings میں AI key ڈالیں', 'Add the AI key in Settings first', 3400); return; } aiWrite(); };
    $('#go').onclick = runAuto;
    if (W.focusScript) { W.focusScript = false; setTimeout(() => { const t = $('#scr'); if (t) { t.scrollIntoView({ block: 'center' }); t.focus(); } }, 50); }
  };

  async function aiWrite() {
    let lang = 'ur', n = 6, tpEl = null;
    const r = await S.dialog({
      title: '✨ ' + tt('AI سے اسکرپٹ', 'Script with AI'), html: '<input class="inp" id="tp" placeholder="' + esc(tt('موضوع، جیسے: مری کا تین دن کا سفر', 'Topic, e.g. a 3 day trip to Murree')) + '"><div class="lbl">' + tt('زبان', 'Language') + '</div><div class="chips" id="lg"><button class="chip on" data-v="ur">اردو</button><button class="chip" data-v="roman">Roman Urdu</button><button class="chip" data-v="en">English</button></div><div class="lbl">' + tt('لائنیں', 'Lines') + '</div><div class="chips" id="nn"><button class="chip" data-v="4">4</button><button class="chip on" data-v="6">6</button><button class="chip" data-v="8">8</button></div>',
      buttons: [[tt('لکھو', 'Write'), true], [tt('منسوخ', 'Cancel'), false, 'sec']],
      onOpen: w => { tpEl = $('#tp', w); $$('#lg .chip', w).forEach(b => b.onclick = () => { lang = b.dataset.v; $$('#lg .chip', w).forEach(x => x.classList.toggle('on', x === b)); }); $$('#nn .chip', w).forEach(b => b.onclick = () => { n = +b.dataset.v; $$('#nn .chip', w).forEach(x => x.classList.toggle('on', x === b)); }); }
    });
    if (!r) return; const topic = (tpEl ? tpEl.value : '').trim() || tt('ہماری خوبصورت یادیں', 'our beautiful memories');
    S.toast('AI لکھ رہی ہے…', 'AI is writing…', 6000);
    try { const lines = await AI.writeScript({ topic, lang, n, seconds: W.target || 30 }); W.script = lines.join('\n'); S.stat('ai_script'); SCR.wizard(); }
    catch (e) { S.toast(AI.errText(e), undefined, 4500); }
  }

  /* ---------- run the automatic edit ---------- */
  async function runAuto() {
    if (!W.clips.length) return; const ac = new AbortController(); S.stat('autoedit');
    const dlg = document.createElement('div'); dlg.className = 'dlg';
    dlg.innerHTML = '<div class="dbox"><h3>🎬 ' + tt('ایڈٹ ہو رہا ہے', 'Editing') + '</h3><div class="dbody" id="pm">…</div><div class="bar"><i id="pb"></i></div><div class="dbtn"><button id="pc" class="sec">' + tt('منسوخ', 'Cancel') + '</button></div></div>'; document.body.appendChild(dlg);
    const msg = (t, p) => { const m = $('#pm'); if (m) m.textContent = t; if (p !== undefined && $('#pb')) $('#pb').style.width = Math.round(p * 100) + '%'; };
    $('#pc').onclick = () => { ac.abort(); dlg.remove(); };
    try {
      msg(tt('کلپس ترتیب دے رہا ہوں…', 'Ordering clips…'), .05);
      let clips = W.clips.slice(); if (W.order === 'date') clips.sort((a, b) => a.date - b.date);
      let note = '';
      if (W.dedupe) { const r = A.dedupe(clips); clips = r.kept; if (r.dropped.length) note = tt(r.dropped.length + ' ملتی جلتی فوٹو ہٹائیں۔ ', r.dropped.length + ' near-identical photos removed. '); }
      const lines = A.cleanLines(W.script), caps = lines.length >= 3 ? lines.slice(1, -1) : [];
      let style = W.style, mood = null, assign = null;
      if (AI.enabled() && W.ai && (lines.length || W.style === 'auto')) {
        msg(tt('AI کلپس دیکھ رہی ہے…', 'AI is looking at your clips…'), .2);
        try { const pl = await AI.plan({ clips, captions: caps }, ac.signal); if (style === 'auto' && pl.style) style = pl.style; mood = pl.mood; assign = pl.assign; if (pl.note) note += pl.note; S.stat('ai_plan'); }
        catch (e) { if (ac.signal.aborted) return; note += AI.errText(e) + ' · ' + tt('بغیر AI جاری', 'continuing without AI') + '. '; }
      }
      if (style === 'auto' || !A.STYLES[style]) { const d = A.detect(lines.join(' ')); style = d.style || 'family'; }
      msg(tt('ویڈیو بنا رہا ہوں…', 'Building the video…'), .45);
      await S.sleep(30);
      const mus = W.music === 'none' ? { kind: 'none' } : W.music === 'file' && W.musicFile ? { kind: 'file', file: W.musicFile, mood: 'calm' } : { kind: 'synth', mood: W.music === 'auto' ? (mood || A.STYLES[style].mood) : W.music };
      const p = A.build(clips, { style, fmt: W.fmt, res: W.res, lines, music: mus, target: W.target, credit: W.credit, assign, order: 'picked', name: (lines[0] || '').slice(0, 40) });
      p.styleAuto = W.style === 'auto';
      if (W.voice !== 'none' && lines.length) {
        msg(tt('آواز بنا رہا ہوں…', 'Making the voice-over…'), .6);
        try { await AI.makeVoices(p, W.voice, { voice: W.gvoice }, (i, n) => msg(tt('آواز بن رہی ہے ', 'Voice ') + i + '/' + n, .6 + .3 * i / Math.max(1, n)), ac.signal); S.stat('voice_' + W.voice); }
        catch (e) { if (ac.signal.aborted) return; p.voice = []; note += AI.errText(e) + ' · ' + tt('بغیر آواز', 'no voice') + '. '; }
      }
      if (p.music.kind === 'synth') { msg(tt('موسیقی بنا رہا ہوں…', 'Composing the music…'), .93); try { await S.music.get(p.music.mood, 1); } catch (e) { p.music.kind = 'none'; } }
      if (ac.signal.aborted) return; dlg.remove();
      app.go('editor', { p, fresh: true, note });
    } catch (e) { dlg.remove(); if (!ac.signal.aborted) S.toast('خرابی: ' + (e.message || e), 'Error: ' + (e.message || e), 5000); }
  }
  app.runAuto = runAuto;
  app.getWiz = () => W;

  /* ---------- Android back button ---------- */
  (function () {
    const App = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if (!App || !App.addListener) return;
    App.addListener('backButton', () => {
      const d = $('.dlg'); if (d) { d.click(); return; }
      const bk = $('#bk'); if (bk) { bk.click(); return; }
      if (App.exitApp) App.exitApp();
    });
  })();

  /* ---------- start ---------- */
  document.addEventListener('DOMContentLoaded', () => { resetWiz(); app.go('home'); });
  window.addEventListener('error', e => { try { if (S.get('dbg')) S.toast('JS: ' + e.message); } catch (x) { /* ignore */ } });
})();
