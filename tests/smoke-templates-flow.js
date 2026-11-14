const { chromium } = require('playwright'); const M='/tmp/claude-0/st/media/';
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const pg = await b.newPage({ viewport: { width: 400, height: 820 } });
  const errs = []; pg.on('pageerror', e => errs.push('PAGEERR ' + e.message)); pg.on('console', m => { if (m.type() === 'error' && !/404|tunnel|ERR_/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await pg.goto('http://localhost:8150/index.html'); await pg.waitForSelector('#np');
  await pg.screenshot({ path: '/tmp/claude-0/st/h1.png' });
  await pg.click('#np'); await pg.waitForSelector('.tpl');
  await pg.screenshot({ path: '/tmp/claude-0/st/h2.png' });
  await pg.click('[data-cat=event]'); await pg.click('[data-t=workshop]'); await pg.waitForSelector('#tgo');
  await pg.fill('#v_title', 'AI Video Workshop'); await pg.fill('#v_person','Dr. Ahmed'); await pg.fill('#v_org','SMAA Academy');
  await pg.setInputFiles('#tfm', ['v1.webm','i1.jpg','i2.jpg'].map(f => M + f));
  await pg.waitForFunction(() => document.querySelectorAll('#tm canvas').length === 3 && !document.querySelector('#tm .spin'), null, { timeout: 60000 });
  await pg.screenshot({ path: '/tmp/claude-0/st/h3.png', fullPage: true });
  await pg.click('#tgo'); await pg.waitForSelector('#cv', { timeout: 60000 }); await pg.waitForTimeout(1200);
  const info = await pg.evaluate(() => { const s = Studio.app.editorState(); return { dur: +s.p.dur.toFixed(1), clips: s.p.clips.map(c => [c.kind, c.card && c.card.type, +c.t0.toFixed(1), +c.len.toFixed(1), !!(c.hl && c.hl.on)]), lowers: s.p.lowers.length }; });
  console.log(JSON.stringify(info));
  // select the highlight clip, view
  const hl = await pg.evaluate(() => { const s = Studio.app.editorState(); const c = s.p.clips.find(c => c.hl && c.hl.on); return c.id; });
  await pg.click('.tc[data-id="' + hl + '"]'); await pg.waitForTimeout(900);
  await pg.fill('#hltitle', 'Hands-on session'); await pg.fill('#hlchips', '3 | HOURS\n40 | SEATS'); await pg.keyboard.press('Tab'); await pg.waitForTimeout(500);
  await pg.screenshot({ path: '/tmp/claude-0/st/h4.png' });
  // card edit
  const cid = await pg.evaluate(() => Studio.app.editorState().p.clips.find(c => c.card && c.card.type === 'details').id);
  await pg.click('.tc[data-id="' + cid + '"]'); await pg.waitForTimeout(700);
  await pg.fill('#f_title', 'EVENT INFO'); await pg.keyboard.press('Tab'); await pg.waitForTimeout(400);
  await pg.screenshot({ path: '/tmp/claude-0/st/h5.png' });
  await pg.click('#tabs [data-t=scn]'); await pg.waitForTimeout(300);
  await pg.screenshot({ path: '/tmp/claude-0/st/h6.png' });
  await pg.click('[data-ns=countdown]'); await pg.waitForTimeout(700);
  await pg.screenshot({ path: '/tmp/claude-0/st/h7.png' });
  // undo/redo + save
  await pg.click('#un'); await pg.click('#sv').catch(()=>{}); await pg.waitForTimeout(600);
  console.log('ERRS', JSON.stringify(errs).slice(0,1500)); await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
