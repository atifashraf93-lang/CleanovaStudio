const { chromium } = require('playwright'); const M='/tmp/claude-0/st/media/';
const plan = {name:'AI Workshop',org:'SMAA Academy',theme:'neon',mood:'epic',ticker:'',scenes:[
 {type:'hook',data:{kicker:'کیا آپ جانتے ہیں',title:'مفت ورکشاپ',sub:'ڈیجیٹل مارکیٹنگ',items:'اسکرپٹنگ\nایڈیٹنگ',emoji:'🤔',cta:'آئیے سیکھیں'},say:'مفت ڈیجیٹل مارکیٹنگ ورکشاپ'},
 {type:'bogus',data:{x:1}},
 {type:'details',data:{title:'تفصیل',rows:'📅 تاریخ | 13 نومبر\n📍 مقام | ابو تراب اسکول\n📞 رابطہ | 0300-1234567',big:'مفت'},say:'13 نومبر کو'},
 {type:'countdown',data:{title:'بس',date:'bad',label:'دن'}},
 {type:'outro',data:{name:'SMAA Academy',tag:'شکریہ'}}]};
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:400,height:820}});
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.route('**/generativelanguage.googleapis.com/**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify(plan)}]}}]})}));
await pg.goto('http://localhost:8150/index.html');await pg.evaluate(()=>{localStorage.setItem('cs.aikey','"TESTKEY"');});await pg.reload();await pg.waitForSelector('#av');
await pg.click('#av');await pg.waitForSelector('#avgo');await pg.click('[data-ex="0"]');await pg.waitForSelector('#avgo');
await pg.setInputFiles('#tfm',[M+'i1.jpg']);await pg.waitForFunction(()=>document.querySelectorAll('#tm canvas').length===1&&!document.querySelector('#tm .spin'));
await pg.screenshot({path:'/tmp/claude-0/st/a1.png',fullPage:true});
await pg.click('#avgo');await pg.waitForSelector('#cv',{timeout:30000});await pg.waitForTimeout(1000);
console.log(JSON.stringify(await pg.evaluate(()=>{const p=Studio.app.editorState().p;return {dur:+p.dur.toFixed(1),theme:p.theme,brand:p.brand.on,clips:p.clips.map(c=>c.kind+':'+(c.card?c.card.type:'')+':'+c.len.toFixed(1)+(c.card&&c.card.data.date?':'+c.card.data.date:''))};})));
await pg.screenshot({path:'/tmp/claude-0/st/a2.png'});
console.log('ERRS',JSON.stringify(errs));await b.close();})().catch(e=>{console.error('FAIL',e);process.exit(1)});
