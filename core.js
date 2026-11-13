/* Cleanova Studio - core helpers (language, storage, dialogs, native bridge). Developed by SMAA */
(function () {
  'use strict';
  const S = window.Studio = window.Studio || {};
  const PFX = 'cs.';

  S.lang = (function () { try { return localStorage.getItem(PFX + 'lang') || 'ur'; } catch (e) { return 'ur'; } })();
  S.tt = (u, e) => (S.lang === 'ur' ? u : e);
  S.setLang = function (l) { S.lang = l; try { localStorage.setItem(PFX + 'lang', l); } catch (e) { /* ignore */ } document.documentElement.lang = l; document.documentElement.dir = l === 'ur' ? 'rtl' : 'ltr'; document.body.classList.toggle('en', l !== 'ur'); };
  S.get = function (k, d) { try { const v = localStorage.getItem(PFX + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  S.set = function (k, v) { try { localStorage.setItem(PFX + k, JSON.stringify(v)); } catch (e) { /* storage off */ } };
  S.$ = (s, r) => (r || document).querySelector(s);
  S.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  S.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  S.uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
  S.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  S.fmt = function (t) { t = Math.max(0, t || 0); const m = Math.floor(t / 60), s = Math.floor(t % 60); return m + ':' + (s < 10 ? '0' : '') + s; };
  S.sleep = ms => new Promise(r => setTimeout(r, ms));
  S.isRTL = s => /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/.test(s || '');
  S.dur = t => (t < 10 ? t.toFixed(1) : Math.round(t)) + 's';

  /* ---------- toast ---------- */
  S.toast = function (ur, en, ms) {
    const t = typeof en === 'string' ? S.tt(ur, en) : ur;
    let d = S.$('#toast');
    if (!d) { d = document.createElement('div'); d.id = 'toast'; d.setAttribute('role', 'status'); document.body.appendChild(d); }
    d.textContent = t; d.classList.add('on');
    clearTimeout(S._tt); S._tt = setTimeout(() => d.classList.remove('on'), ms || 2800);
  };

  /* ---------- simple dialog ---------- */
  S.dialog = function (o) {
    return new Promise(res => {
      const w = document.createElement('div'); w.className = 'dlg';
      const btns = (o.buttons || [[S.tt('ٹھیک ہے', 'OK'), true]]).map((b, i) => '<button data-i="' + i + '" class="' + (b[2] || (i === 0 ? 'pri' : '')) + '">' + S.esc(b[0]) + '</button>').join('');
      w.innerHTML = '<div class="dbox"><h3>' + S.esc(o.title || '') + '</h3><div class="dbody">' + (o.html || S.esc(o.text || '')) + '</div><div class="dbtn">' + btns + '</div></div>';
      document.body.appendChild(w);
      const done = v => { w.remove(); res(v); };
      S.$$('button', w).forEach(b => { b.onclick = () => { const x = (o.buttons || [[0, true]])[+b.dataset.i]; done(x ? x[1] : true); }; });
      w.addEventListener('click', e => { if (e.target === w && o.cancel !== false) done(null); });
      if (o.onOpen) o.onOpen(w);
    });
  };
  S.confirm = (title, text, yes, no) => S.dialog({ title, text, buttons: [[yes || S.tt('ہاں', 'Yes'), true], [no || S.tt('نہیں', 'No'), false, 'sec']] });

  /* ---------- native bridge ---------- */
  S.native = function () { return window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Studio; };
  S.isApp = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

  /* ---------- IndexedDB (projects + media blobs) ---------- */
  let dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      try {
        const r = indexedDB.open('cleanova-studio', 1);
        r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('proj')) d.createObjectStore('proj'); if (!d.objectStoreNames.contains('media')) d.createObjectStore('media'); };
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
      } catch (e) { rej(e); }
    });
    return dbp;
  }
  function tx(store, mode, fn) {
    return db().then(d => new Promise((res, rej) => {
      const t = d.transaction(store, mode); const st = t.objectStore(store); const r = fn(st);
      t.oncomplete = () => res(r && r.result !== undefined ? r.result : undefined);
      t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
    }));
  }
  S.db = {
    put: (store, key, val) => tx(store, 'readwrite', st => st.put(val, key)),
    get: (store, key) => tx(store, 'readonly', st => st.get(key)),
    del: (store, key) => tx(store, 'readwrite', st => st.delete(key)),
    keys: store => tx(store, 'readonly', st => st.getAllKeys()),
    all: store => tx(store, 'readonly', st => st.getAll())
  };

  /* ---------- anonymous stats (counts only) ---------- */
  S.stat = function (ev, n) { try { if (window.StudioStats) window.StudioStats.track(ev, n); } catch (e) { /* ignore */ } };

  /* ---------- helpers for media ---------- */
  S.loadImage = function (url) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('image')); i.src = url; }); };
  S.blobToB64 = function (blob) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = () => rej(r.error); r.readAsDataURL(blob); }); };
  S.b64ToBytes = function (b64) { const bin = atob(b64); const a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return a; };

  document.addEventListener('DOMContentLoaded', () => { S.setLang(S.lang); });
})();
