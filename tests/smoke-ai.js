const { chromium } = require('playwright'); const fs=require('fs');
const M='/tmp/claude-0/st/media/';
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream'] });
  const ctx = await b.newContext({ viewport: { width: 400, height: 820 }, acceptDownloads: true, permissions: ['microphone'] });
  const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push('PAGEERR ' + e.message)); pg.on('console', m => { if (m.type() === 'error' && !/404|TUNNEL|net::ERR/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  const reqs = [];
  await pg.route('https://generativelanguage.googleapis.com/**', async route => {
    const r = route.request(); const url = r.url();
    if (r.method() === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ models: [{ name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'] }, { name: 'models/gemini-3.8-flash-tts', supportedGenerationMethods: ['generateContent'] }, { name: 'models/embedding-1', supportedGenerationMethods: ['embedContent'] }] }) });
    const body = JSON.parse(r.postData()); reqs.push({ url, hasImg: JSON.stringify(body).includes('inline_data'), tts: !!(body.generationConfig && body.generationConfig.responseModalities) });
    if (body.generationConfig && body.generationConfig.responseModalities) {
      const n = 24000 * 1.2, buf = Buffer.alloc(n * 2); for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.sin(i / 20) * 9000), i * 2);
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ candidates: [{ content: { parts: [{ inlineData: { mimeType: 'audio/L16;codec=pcm;rate=24000', data: buf.toString('base64') } }] } }] }) });
    }
    const txt = JSON.stringify(body);
    let out;
    if (txt.includes('Write a short script')) out = { lines: ['Hamari Hunza ki safar', 'Pahadon ke beech subah', 'Bachon ki hansi', 'Dosto ke saath chai', 'Shukriya Hunza'] };
    else out = { style: 'safar', mood: 'travel', clips: [{ i: 0, desc: 'colour bars' }], assign: [1, 2, 3], note: 'Lagta hai safar ki video hai' };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(out) }] } }] }) });
  });
  await pg.goto('http://localhost:8150/index.html'); await pg.waitForSelector('#nw');
  // settings: check key
  await pg.click('#gear'); await pg.waitForSelector('#key'); await pg.fill('#key', 'AIzaFAKEKEY123'); await pg.click('#kc'); await pg.waitForFunction(() => /✅/.test(document.querySelector('#km').textContent), null, { timeout: 8000 });
  console.log('key msg:', await pg.textContent('#km'));
  await pg.click('#bk'); await pg.waitForSelector('#nw');
  await pg.click('#nw'); await pg.waitForSelector('#fi', { state: 'attached' });
  await pg.setInputFiles('#fi', ['v1.webm','v2.webm','i1.jpg','i2.jpg','i3.jpg'].map(f => M + f));
  await pg.waitForFunction(() => document.querySelectorAll('.tile[data-i]').length === 5 && !document.querySelector('.spin'), null, { timeout: 60000 });
  // AI write script
  await pg.click('#aiw'); await pg.waitForSelector('#tp'); await pg.fill('#tp', 'Hunza trip'); await pg.click('.dbtn .pri'); await pg.waitForFunction(() => document.querySelector('#scr') && document.querySelector('#scr').value.includes('Hunza'), null, { timeout: 8000 });
  console.log('script:', JSON.stringify(await pg.inputValue('#scr')));
  // music file + gemini voice
  await pg.setInputFiles('#fm', M + 'song.wav'); await pg.waitForSelector('[data-voi="gemini"]');
  await pg.click('[data-voi="gemini"]'); await pg.click('#go'); await pg.waitForSelector('#cv', { timeout: 60000 }); await pg.waitForTimeout(800);
  const info = await pg.evaluate(() => { const p = Studio.engine.p; return { dur: +p.dur.toFixed(1), voice: p.voice.map(v => [v.at || v.clip, +v.buf.duration.toFixed(1), v._t && +v._t.toFixed(1)]), music: p.music.kind, style: p.style, texts: p.texts.map(t => [t.at || (t.clip ? 'clip' : '-'), t.text]), capClips: p.texts.filter(t => t.clip).map(t => p.clips.findIndex(c => c.id === t.clip)) }; });
  console.log(JSON.stringify(info));
  console.log('requests', JSON.stringify(reqs.map(r => [r.hasImg, r.tts])));
  // play with voice+music
  await pg.click('#pl'); await pg.waitForTimeout(2000); await pg.click('#pl');
  // record own voice
  await pg.click('#tabs [data-t="voi"]'); await pg.click('#vrc'); await pg.waitForTimeout(1500); await pg.click('.dbtn button'); await pg.waitForTimeout(1500);
  console.log('voices after record', await pg.evaluate(() => Studio.engine.p.voice.length));
  // save project
  await pg.click('#sv'); await pg.waitForSelector('#pnm'); await pg.fill('#pnm', 'Test proj'); await pg.click('.dbtn .pri'); await pg.waitForTimeout(1200);
  await pg.click('#bk'); await pg.waitForSelector('#nw');
  await pg.click('#pj'); await pg.waitForSelector('[data-op]'); console.log('projects listed', await pg.$$eval('[data-op]', e => e.length));
  await pg.click('[data-op]'); await pg.waitForSelector('#cv', { timeout: 20000 }); await pg.waitForTimeout(1000);
  console.log('restored', JSON.stringify(await pg.evaluate(() => { const p = Studio.engine.p; return { clips: p.clips.length, hasFile: p.clips.every(c => !!c.file), voice: p.voice.length, music: p.music.kind, hasMusicFile: !!p.music.file, name: p.name }; })));
  await pg.screenshot({ path: '/tmp/claude-0/st/restored.png' });
  // English toggle on home
  await pg.click('#bk'); await pg.waitForSelector('.lang'); await pg.click('.lang [data-l="en"]'); await pg.waitForTimeout(200); await pg.screenshot({ path: '/tmp/claude-0/st/home_en.png' });
  console.log('ERRS', JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
