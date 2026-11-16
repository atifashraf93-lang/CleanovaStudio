const { chromium } = require('playwright'); const M='/tmp/claude-0/st/media/';
const plan={name:'Day 2 Recap',org:'',theme:'neon',mood:'epic',media_style:'full',ticker:'',timeline:[
 {kind:'card',type:'title',data:{badge:'',l1:'DAY 2',l2:'THE JOURNEY CONTINUES!',l3:'',tag:'SOCIAL MEDIA UNLOCKED'}},
 {kind:'clip',i:0,moment:1,len:4,motion:'none',fx:'slow',caption:{text:'Learn Today. Lead Tomorrow.',pos:'bottom'}},
 {kind:'clip',i:1,len:3,motion:'kenburns',fx:'none',caption:{text:'Digital Marketing',pos:'center'}},
 {kind:'clip',i:2,len:3,motion:'slowzoom',fx:'punch'},
 {kind:'card',type:'outro',data:{name:'Dr. A.Q. Khan Tech Space',tag:'An Initiative of TMC Gulberg'}}],
 checklist:[{req:'Opening text',how:'title scene'},{req:'Speed ramping',how:'not possible; used slow motion'}]};
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:400,height:820}});
const errs=[];pg.on('pageerror',e=>errs.push(e.message));let sent=null;
await pg.route('**/generativelanguage.googleapis.com/**',r=>{sent=JSON.parse(r.request().postData());r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify(plan)}]}}]})});});
await pg.goto('http://localhost:8150/index.html');await pg.evaluate(()=>localStorage.setItem('cs.aikey','"K"'));await pg.reload();await pg.waitForSelector('#av');
await pg.click('#av');await pg.waitForSelector('#avp');
await pg.fill('#avp','Recap video. Opening "DAY 2 - THE JOURNEY CONTINUES!" Quotes: "Learn Today. Lead Tomorrow." and "Turning Knowledge into Opportunities." 60-90 seconds.');
await pg.setInputFiles('#tfm',['v1.webm','i1.jpg','i2.jpg','i3.jpg','i4.jpg'].map(f=>M+f));
await pg.waitForFunction(()=>document.querySelectorAll('#tm canvas').length===5&&!document.querySelector('#tm .spin'),null,{timeout:60000});
await pg.click('#avgo');await pg.waitForSelector('#cv',{timeout:40000});await pg.waitForTimeout(1500);
const parts=sent.contents[0].parts;console.log('parts',parts.length,'images',parts.filter(x=>x.inline_data).length);
console.log(JSON.stringify(await pg.evaluate(()=>{const p=Studio.app.editorState().p;return {dur:+p.dur.toFixed(1),fit:p.fit,clips:p.clips.map(c=>c.kind+(c.card?':'+c.card.type:'')+':'+c.len.toFixed(1)+(c.speed&&c.speed!==1?'@'+c.speed:'')),texts:p.texts.map(t=>t.text)};})));
console.log(await pg.textContent('.dbody'));
await pg.screenshot({path:'/tmp/claude-0/st/d1.png'});
await pg.click('.dbtn button');await pg.waitForTimeout(300);
await pg.evaluate(()=>{const E=Studio.engine,p=E.p;const c=p.clips[1];E.seek(c.t0+c.d+1.5);});await pg.waitForTimeout(800);
await pg.screenshot({path:'/tmp/claude-0/st/d2.png'});
console.log('ERRS',JSON.stringify(errs));await b.close();})().catch(e=>{console.error('FAIL',e);process.exit(1)});
