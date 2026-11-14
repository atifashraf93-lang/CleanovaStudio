const { chromium } = require('playwright'); const fs=require('fs');
const LANG = process.argv[2]||'en', ONLY=process.argv[3];
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 400, height: 820 } });
  const errs = []; pg.on('pageerror', e => errs.push('PAGEERR ' + e.message)); pg.on('console', m => { if (m.type() === 'error' && !/build.js|tunnel|ERR_/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await pg.goto('http://localhost:8150/index.html'); await pg.waitForSelector('#nw');
  await pg.evaluate(l => Studio.setLang && Studio.setLang(l), LANG);
  const ids = await pg.evaluate(() => Studio.tpl.LIST.map(t => t.id));
  for (const id of ids) { if (ONLY && id!==ONLY) continue;
    const url = await pg.evaluate(async id => {
      const S = Studio, t = S.tpl.get(id); const p = S.tpl.build(t, {person:'Dr. Ahmed', role:'Speaker'}, { fmt: '9:16', res: 540, music: 'none', brandOn: true, brand:{name:'SMAA Academy', header:'FREE WORKSHOP', footer:'SMAA ACADEMY · 0300-1234567'} });
      p.clips.forEach(c => { if (c.kind === 'c') c.thumb = S.cards.thumb(c, p, {}); });
      const cv = document.createElement('canvas'); cv.width = 270; cv.height = 480; const E = new S.Engine(cv); E.setProject(p); E.size && E.size();
      const n = p.clips.length, W = E.W, H = E.H; const sheet = document.createElement('canvas'); sheet.width = n * (W + 6); sheet.height = H;
      const sc = sheet.getContext('2d'); sc.fillStyle = '#333'; sc.fillRect(0, 0, sheet.width, H);
      for (let i = 0; i < n; i++) { const c = p.clips[i]; const tt = c.t0 + c.d + Math.min(c.len * .62, 4.6); E.prepare(tt); await new Promise(r => setTimeout(r, 60)); E.prepare(tt); E.render(tt); sc.drawImage(cv, i * (W + 6), 0); }
      return sheet.toDataURL('image/png');
    }, id);
    fs.writeFileSync(`/tmp/claude-0/st/sheets/${LANG}_${id}.png`, Buffer.from(url.split(',')[1], 'base64'));
  }
  console.log('ERRS', JSON.stringify(errs).slice(0,1500)); await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
