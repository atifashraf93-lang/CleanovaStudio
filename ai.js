/* Cleanova Studio - AI mode (Google Gemini with the user's own key) and voice-over helpers. Developed by SMAA */
(function () {
  'use strict';
  const S = window.Studio, P = S.proj;
  const AI = S.ai = {};
  const BASE = 'https://generativelanguage.googleapis.com/v1beta/';
  const PREF = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];
  const PREF_TTS = ['gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts', 'gemini-3.1-flash-tts-preview', 'gemini-2.5-flash-preview-tts'];

  AI.key = () => (S.get('aikey', '') || '').trim();
  AI.enabled = () => !!AI.key() && S.get('aion', true) !== false;
  AI.models = () => { const m = S.get('aimodels', null); return m && m.length ? m : PREF; };
  AI.ttsModels = () => { const m = S.get('aittsm', null); return m && m.length ? m : PREF_TTS; };

  function err(kind, msg) { const e = new Error(msg || kind); e.kind = kind; return e; }
  async function post(model, body, signal) {
    let r;
    try {
      r = await fetch(BASE + 'models/' + model + ':generateContent', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': AI.key() }, body: JSON.stringify(body), signal });
    } catch (e) { throw err('net', 'network'); }
    if (r.ok) return r.json();
    let msg = ''; try { const j = await r.json(); msg = (j.error && j.error.message) || ''; } catch (e) { /* ignore */ }
    if (r.status === 400 && /api key/i.test(msg)) throw err('key', msg);
    if (r.status === 401 || r.status === 403) throw err('key', msg);
    if (r.status === 404) throw err('model', msg);
    if (r.status === 429) throw err('limit', msg);
    throw err('http', r.status + ' ' + msg);
  }
  async function gen(body, models, signal) {
    let last = null;
    for (const m of models) {
      try { return await post(m, body, signal); } catch (e) { last = e; if (e.kind !== 'model') throw e; }
    }
    throw last || err('model');
  }
  /* read the models this key can use and remember the best ones */
  AI.check = async function (key) {
    let r;
    try { r = await fetch(BASE + 'models?pageSize=200', { headers: { 'x-goog-api-key': key } }); } catch (e) { throw err('net'); }
    if (!r.ok) { if (r.status === 400 || r.status === 401 || r.status === 403) throw err('key'); throw err('http', String(r.status)); }
    const j = await r.json(), names = (j.models || []).filter(m => (m.supportedGenerationMethods || []).indexOf('generateContent') >= 0).map(m => m.name.replace(/^models\//, ''));
    const text = names.filter(n => /^gemini/.test(n) && !/tts|image|embedding|live|audio|robotics|computer|thinking-exp/.test(n));
    const tts = names.filter(n => /tts/.test(n));
    const rank = (n, list) => { const i = list.indexOf(n); return i < 0 ? 99 : i; };
    text.sort((a, b) => rank(a, PREF) - rank(b, PREF) || (b > a ? 1 : -1)); tts.sort((a, b) => rank(a, PREF_TTS) - rank(b, PREF_TTS));
    S.set('aimodels', text.slice(0, 6)); S.set('aittsm', tts.slice(0, 4));
    return { text: text.slice(0, 6), tts: tts.slice(0, 4) };
  };
  function parseJson(t) {
    t = String(t || '').replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    try { return JSON.parse(t); } catch (e) { const a = t.indexOf('{'), b = t.lastIndexOf('}'); if (a >= 0 && b > a) return JSON.parse(t.slice(a, b + 1)); throw err('parse'); }
  }
  const textOf = j => { const c = j.candidates && j.candidates[0]; const parts = c && c.content && c.content.parts; return parts ? parts.map(x => x.text || '').join('') : ''; };

  /* look at the clips and the script: which clip fits which line, which style and music mood */
  AI.plan = async function (o, signal) {
    const clips = o.clips.slice(0, 24), moods = Object.keys(S.music.MOODS), styles = Object.keys(S.auto.STYLES);
    const parts = [{ text: 'You are the assistant of a video editor app. Below are ' + clips.length + ' clips (photos or videos), each shown with 1 to 3 small frames in time order. Task: (1) describe each clip in at most 8 English words; (2) choose the editing style and the music mood that fit the whole set and the script; (3) for every CAPTION line decide which clip it belongs to. ' +
      'Rules: clip indexes are zero-based as given. Assign captions in the order of the script and keep the clip indexes non-decreasing. Several captions may not share one clip unless there are fewer clips than captions. Use null only if nothing fits. ' +
      'Styles: ' + styles.join(', ') + '. Moods: ' + moods.join(', ') + '. ' +
      'Return JSON only: {"style":"","mood":"","clips":[{"i":0,"desc":""}],"assign":[0,1,...],"note":"one short sentence in ' + (S.lang === 'ur' ? 'Urdu' : 'English') + ' about what you noticed"}. ' +
      'The caption lines (the first line of the script is the title and the last one is the ending, they are not listed here):\n' + (o.captions.length ? o.captions.map((t, i) => i + ': ' + t).join('\n') : '(none)') }];
    clips.forEach((c, i) => { parts.push({ text: 'Clip ' + i + (c.kind === 'v' ? ' (video ' + Math.round(c.dur) + 's)' : ' (photo)') + ':' }); (c.frames || []).forEach(f => parts.push({ inline_data: { mime_type: 'image/jpeg', data: f.split(',')[1] } })); });
    const j = await gen({ contents: [{ parts }], generationConfig: { responseMimeType: 'application/json', temperature: .3 } }, AI.models(), signal);
    const r = parseJson(textOf(j));
    if (r.style && styles.indexOf(r.style) < 0) r.style = null; if (r.mood && moods.indexOf(r.mood) < 0) r.mood = null;
    r.assign = (Array.isArray(r.assign) ? r.assign : []).map(v => (typeof v === 'number' && v >= 0 && v < clips.length ? Math.floor(v) : null));
    return r;
  };
  AI.writeScript = async function (o, signal) {
    const lang = o.lang === 'en' ? 'English' : o.lang === 'roman' ? 'Roman Urdu (Urdu written in Latin letters)' : 'Urdu (written in Urdu script)';
    const p = 'Write a short script for a ' + (o.seconds || 30) + ' second social video. Topic: ' + o.topic + '. Language: ' + lang + '. Tone: ' + (o.tone || 'warm and emotional') + '. Exactly ' + o.n + ' lines: the first line is a title, the last line is a closing line, the lines in between are captions that follow the story. Each line at most 10 words, no numbering, no emojis, no quotation marks. Return JSON only: {"lines":["..."]}';
    const j = await gen({ contents: [{ parts: [{ text: p }] }], generationConfig: { responseMimeType: 'application/json', temperature: .9 } }, AI.models(), signal);
    const r = parseJson(textOf(j)); const l = (r.lines || []).map(s => String(s).trim()).filter(Boolean);
    if (!l.length) throw err('parse'); return l;
  };

  /* =============== voice =============== */
  AI.VOICES = [['Kore', 'Kore'], ['Puck', 'Puck'], ['Charon', 'Charon'], ['Aoede', 'Aoede']];
  function pcmBuffer(b64, rate) {
    const bytes = S.b64ToBytes(b64), n = bytes.length >> 1, dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const ab = new OfflineAudioContext(1, 1, rate).createBuffer(1, n, rate), ch = ab.getChannelData(0);
    for (let i = 0; i < n; i++) ch[i] = dv.getInt16(i * 2, true) / 32768; return ab;
  }
  AI.geminiTts = async function (text, voice, signal) {
    const body = { contents: [{ parts: [{ text }] }], generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice || 'Kore' } } } } };
    let j, tries = 0;
    for (;;) {
      try { j = await gen(body, AI.ttsModels(), signal); break; } catch (e) { if (e.kind === 'limit' && tries++ < 2) { await S.sleep(5000); continue; } throw e; }
    }
    const c = j.candidates && j.candidates[0], part = c && c.content && c.content.parts && c.content.parts.find(x => x.inlineData || x.inline_data);
    if (!part) throw err('parse', 'no audio'); const d = part.inlineData || part.inline_data, m = /rate=(\d+)/.exec(d.mimeType || d.mime_type || '');
    return pcmBuffer(d.data, m ? +m[1] : 24000);
  };
  AI.phoneInfo = async function () { const n = S.native(); if (!n || !n.ttsInfo) return { ok: false, none: true }; try { return await n.ttsInfo(); } catch (e) { return { ok: false }; } };
  AI.phoneTts = async function (text, rate) {
    const n = S.native(); if (!n || !n.ttsSynth) throw err('nonative', 'The phone voice works only inside the app');
    const lang = S.isRTL(text) ? 'ur' : 'en'; let r;
    try { r = await n.ttsSynth({ text, lang, rate: rate || 1 }); } catch (e) { throw err(/lang-missing/.test(String(e && (e.message || e))) ? 'lang' : 'tts', String(e && e.message || e)); }
    const ab = S.b64ToBytes(r.wav).buffer; return new Promise((res, rej) => new OfflineAudioContext(1, 1, 44100).decodeAudioData(ab, res, rej));
  };
  /* make voice-overs for the title, captions and ending of project p */
  AI.makeVoices = async function (p, mode, opt, onProg, signal) {
    p.voice = []; const items = p.texts.filter(t => t.text && (t.at || t.clip)); let i = 0;
    for (const it of items) {
      if (signal && signal.aborted) throw err('cancelled');
      if (onProg) onProg(i++, items.length);
      let buf;
      if (mode === 'gemini') buf = await AI.geminiTts(it.text.replace(/\n/g, ' '), opt.voice, signal); else buf = await AI.phoneTts(it.text.replace(/\n/g, ' '), opt.rate);
      const v = { id: S.uid(), text: it.text, buf, blob: P.bufToWav(buf), vol: 1 };
      if (it.at) v.at = it.at; else v.clip = it.clip; p.voice.push(v);
      if (mode === 'gemini') await S.sleep(400);
    }
    if (onProg) onProg(items.length, items.length);
    S.auto.fitVoices(p);
  };
  AI.recordVoice = async function () {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    const rec = new MediaRecorder(stream), ch = []; rec.ondataavailable = e => { if (e.data.size) ch.push(e.data); };
    const stopped = new Promise(res => { rec.onstop = res; }); rec.start();
    return { stop: async () => { rec.stop(); await stopped; stream.getTracks().forEach(t => t.stop()); const blob = new Blob(ch, { type: rec.mimeType || 'audio/webm' }); const ab = await blob.arrayBuffer(); const buf = await new Promise((res, rej) => new OfflineAudioContext(1, 1, 44100).decodeAudioData(ab, res, rej)); return { buf, blob: P.bufToWav(buf) }; } };
  };
  AI.errText = function (e) {
    const k = e && e.kind;
    if (k === 'key') return S.tt('AI کی (key) درست نہیں یا اس کی اجازت نہیں', 'The AI key is not valid or not allowed');
    if (k === 'limit') return S.tt('AI کی مفت حد پوری ہو گئی، کچھ دیر بعد کوشش کریں', 'AI free limit reached, try again in a while');
    if (k === 'net') return S.tt('انٹرنیٹ نہیں مل رہا', 'No internet connection');
    if (k === 'model') return S.tt('AI ماڈل نہیں ملا، Settings میں کی دوبارہ جانچیں', 'AI model not found, re-check the key in Settings');
    if (k === 'parse') return S.tt('AI کا جواب سمجھ نہیں آیا', 'Could not understand the AI answer');
    if (k === 'lang') return S.tt('فون میں اردو آواز نہیں ہے', 'The phone has no Urdu voice');
    if (k === 'nonative') return S.tt('فون کی آواز صرف ایپ میں چلتی ہے', 'Phone voice works only inside the app');
    return S.tt('خرابی: ', 'Error: ') + String(e && e.message || e).slice(0, 140);
  };
})();
