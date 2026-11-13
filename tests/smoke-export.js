const { chromium } = require('playwright'); const fs=require('fs');
const M='/tmp/claude-0/st/media/';
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const pg = await b.newPage({ viewport: { width: 400, height: 820 } });
  const errs = []; pg.on('pageerror', e => errs.push('PAGEERR ' + e.message)); pg.on('console', m => { if (m.type() === 'error' && !/404|TUNNEL/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await pg.goto('http://localhost:8150/index.html'); await pg.waitForSelector('#nw');
  await pg.click('#nw'); await pg.waitForSelector('#fi', { state: 'attached' });
  await pg.setInputFiles('#fi', ['v1.webm','v2.webm','i1.jpg','i2.jpg'].map(f => M + f));
  await pg.waitForFunction(() => document.querySelectorAll('.tile[data-i]').length === 4 && !document.querySelector('.spin'), null, { timeout: 60000 });
  await pg.click('[data-fmt="16:9"]'); await pg.click('[data-tg="15"]');
  await pg.fill('#scr', 'Our family day\nKids at play\nSweet memories\nThank you all');
  await pg.click('#go'); await pg.waitForSelector('#cv', { timeout: 60000 }); await pg.waitForTimeout(800);
  console.log('dur', await pg.evaluate(() => Studio.engine.dur));
  const t0 = Date.now();
  const res = await pg.evaluate(async () => {
    const E = Studio.engine; const prog=[]; const o = await E.exportVideo({ res: 720, onProgress: f => { if (prog.length<1 || f-prog[prog.length-1]>.25) prog.push(+f.toFixed(2)); } });
    const b64 = await Studio.blobToB64(o.blob); return { mime: o.mime, ext: o.ext, size: o.blob.size, b64, prog, W:E.W, H:E.H };
  });
  console.log('export took', ((Date.now()-t0)/1000).toFixed(1), 's', res.mime, res.size, res.prog.join(','), res.W+'x'+res.H);
  fs.writeFileSync('/tmp/claude-0/st/out.'+res.ext, Buffer.from(res.b64, 'base64'));
  console.log('ERRS', JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
