const { chromium } = require('playwright'); const fs=require('fs');
const M='/tmp/claude-0/st/media/';
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const pg = await b.newPage({ viewport: { width: 400, height: 820 }, deviceScaleFactor: 1 });
  const errs = []; pg.on('pageerror', e => errs.push('PAGEERR ' + e.message)); pg.on('console', m => { if (m.type() === 'error' && !/404|TUNNEL/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await pg.goto('http://localhost:8150/index.html'); await pg.waitForSelector('#nw');
  await pg.click('#nw'); await pg.waitForSelector('#fi', { state: 'attached' });
  await pg.setInputFiles('#fi', ['v1.webm','v2.webm','i1.jpg','i2.jpg','i3.jpg'].map(f => M + f));
  await pg.waitForFunction(() => document.querySelectorAll('.tile[data-i]').length === 5 && !document.querySelector('.spin'), null, { timeout: 60000 });
  await pg.click('[data-sty="shadi"]'); await pg.waitForTimeout(200);
  await pg.fill('#scr', 'شادی مبارک\nدولہا دلہن کی جوڑی\nخوشیوں بھرا دن\nاللہ سلامت رکھے');
  await pg.click('#go'); await pg.waitForSelector('#cv', { timeout: 60000 }); await pg.waitForTimeout(800);
  const px = async (label) => { const r = await pg.evaluate(() => { const E=Studio.engine, c=E.cv.getContext('2d'); const d=c.getImageData(0,0,E.W,E.H).data; let s=0; for(let i=0;i<d.length;i+=4*97) s+=d[i]+d[i+1]+d[i+2]; return {t:+E.t.toFixed(2), s}; }); console.log(label, JSON.stringify(r)); };
  // play
  await pg.click('#pl'); await pg.waitForTimeout(2500); await px('playing'); await pg.screenshot({ path: '/tmp/claude-0/st/play.png' }); await pg.click('#pl');
  // seek to title time
  await pg.evaluate(() => Studio.engine.seek(1.2)); await pg.waitForTimeout(400); await pg.screenshot({ path: '/tmp/claude-0/st/title.png' });
  for (const t of ['text','stk','fx','mus','voi','fmt']) { await pg.click('#tabs [data-t="'+t+'"]'); await pg.waitForTimeout(250); await pg.screenshot({ path: '/tmp/claude-0/st/tab_'+t+'.png' }); }
  // ops: add text, sticker, filter, overlay
  await pg.click('#tabs [data-t="text"]'); await pg.click('#tadd'); await pg.waitForTimeout(300);
  await pg.fill('#ttx', 'Test text 123'); await pg.waitForTimeout(200); await pg.screenshot({ path: '/tmp/claude-0/st/text_edit.png' });
  await pg.click('#tabs [data-t="stk"]'); await pg.click('[data-add="e:❤️"]'); await pg.waitForTimeout(300); await pg.click('[data-sg="v"]'); await pg.click('[data-add="v:crescent"]'); await pg.waitForTimeout(300);
  await pg.click('#tabs [data-t="fx"]'); await pg.click('[data-fl="golden"]'); await pg.click('[data-ov="confetti"]'); await pg.waitForTimeout(300);
  await pg.screenshot({ path: '/tmp/claude-0/st/ops.png' });
  const st = await pg.evaluate(() => { const p=Studio.engine.p; return {texts:p.texts.length, stk:p.stickers.length, filter:p.filter, ov:p.overlay}; }); console.log(JSON.stringify(st));
  await pg.click('#un'); await pg.click('#un'); await pg.waitForTimeout(200);
  const st2 = await pg.evaluate(() => { const p=Studio.engine.p; return {texts:p.texts.length, stk:p.stickers.length, filter:p.filter, ov:p.overlay}; }); console.log('after undo', JSON.stringify(st2));
  await pg.click('#rd'); await pg.click('#rd');
  // transitions panel
  await pg.click('#tabs [data-t="clips"]'); await pg.click('.tr >> nth=1'); await pg.waitForTimeout(400); await pg.screenshot({ path: '/tmp/claude-0/st/trans.png' });
  // all transitions render without errors
  const trerr = await pg.evaluate(() => { const E=Studio.engine, p=E.p, out=[]; const c1=p.clips[1]; for (const k of Studio.fx.TR_LIST) { c1.trans.type=k; c1.trans.dur=.8; E.layoutAll(); try { E.prepare(c1.t0+.4); E.render(c1.t0+.4); } catch(e) { out.push(k+':'+e.message); } } return out; });
  console.log('trans errors', JSON.stringify(trerr));
  const ov = await pg.evaluate(() => { const E=Studio.engine, out=[]; for (const k of Studio.fx.OVL_LIST) { E.p.overlay=k; try { E.render(3); } catch(e) { out.push(k+':'+e.message); } } for (const k of Studio.fx.FILTER_LIST) { E.p.filter=k; try { E.render(3); } catch(e) { out.push(k+':'+e.message); } } return out; });
  console.log('ovl/filter errors', JSON.stringify(ov));
  console.log('ERRS', JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
