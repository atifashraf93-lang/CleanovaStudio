/* Cleanova Studio - ready templates (social, issue, promotion, events) and project builder. Developed by SMAA */
(function () {
  'use strict';
  const S = window.Studio, P = S.proj, C = S.cards;
  const TP = S.tpl = {};
  const b = (u, e) => [u, e];
  const pk = v => (Array.isArray(v) ? v[S.lang === 'ur' ? 0 : 1] : v);

  TP.CATS = [['social', b('سوشل میڈیا', 'Social media'), '📱'], ['issue', b('مسئلہ / آگاہی', 'Issue / awareness'), '📣'], ['promo', b('پروموشن', 'Promotion'), '🛍️'], ['event', b('تقریبات', 'Events'), '🎉']];
  TP.ASK = {
    title: [b('عنوان', 'Title'), b('پروگرام / موضوع کا نام', 'Name of the event / topic')], sub: [b('ذیلی لائن / بات', 'Sub line / message'), b('ایک مختصر جملہ', 'One short sentence')],
    date: [b('تاریخ', 'Date'), ''], place: [b('مقام', 'Venue'), b('جگہ کا نام اور شہر', 'Venue name and city')], contact: [b('رابطہ / ہینڈل', 'Contact / handle'), b('فون یا @ہینڈل', 'Phone or @handle')],
    org: [b('ادارے / آپ کا نام', 'Your name / organisation'), ''], points: [b('نکات (ہر لائن الگ)', 'Points (one per line)'), ''], big: [b('بڑا نمبر / لفظ', 'Big number / word'), b('جیسے 70% یا 50% OFF', 'e.g. 70% or 50% OFF')],
    done: [b('مکمل منصوبے (ہر لائن الگ)', 'Completed projects (one per line)'), ''], going: [b('جاری منصوبے (ہر لائن الگ)', 'Ongoing projects (one per line)'), ''], next: [b('آنے والے منصوبے (ہر لائن الگ)', 'Upcoming projects (one per line)'), ''], figs: [b('اعداد: بڑا | چھوٹا (ہر لائن)', 'Key figures: BIG | small (one per line)'), b('جیسے 12 | منصوبے', 'e.g. 12 | PROJECTS')],
    price: [b('قیمت', 'Price'), ''], goal: [b('ہدف رقم', 'Goal amount'), ''], raised: [b('اب تک جمع', 'Raised so far'), ''], person: [b('مقرر / مہمان کا نام (نام پٹی)', 'Speaker / guest name (name tag)'), ''], role: [b('اس کا عہدہ', 'Their role'), '']
  };

  /* template: id, cat, emoji, names, theme, mood, ask tokens, defaults, scenes, flags */
  const L = [];
  const add = (cat, id, e, n, theme, mood, ask, def, scenes, f) => L.push(Object.assign({ cat, id, e, n, theme, mood, ask, def, scenes }, f || {}));

  /* ---------------- social ---------------- */
  add('social', 'dyk', '💡', b('کیا آپ جانتے ہیں؟', 'Did you know?'), 'social', 'happy', ['title', 'big', 'sub', 'org', 'contact'],
    { title: b('کیا آپ جانتے ہیں؟', 'DID YOU KNOW?'), big: b('70%', '70%'), sub: b('یہاں اپنی بات لکھیں', 'Write your fact here'), org: b('آپ کا نام', 'Your Name'), contact: b('@آپ_کا_نام', '@yourname') },
    [['hook', { kicker: b('ذرا رکیں', 'WAIT A SECOND'), title: '{title}', sub: '', items: '', emoji: '🤔', cta: '' }, 3.6], ['fact', { kicker: '{title}', big: '{big}', text: '{sub}' }, 5.5], ['outro', { name: '{org}', handle: '{contact}' }, 3.6]]);
  add('social', 'top5', '🏆', b('ٹاپ 5 / فہرست', 'Top 5 list'), 'social', 'happy', ['title', 'points', 'org', 'contact'],
    { title: b('5 بہترین مشورے', 'TOP 5 TIPS'), points: b('پہلا مشورہ\nدوسرا مشورہ\nتیسرا مشورہ\nچوتھا مشورہ\nپانچواں مشورہ', 'First tip\nSecond tip\nThird tip\nFourth tip\nFifth tip'), org: b('آپ کا نام', 'Your Name'), contact: b('@آپ_کا_نام', '@yourname') },
    [['hook', { kicker: b('دیکھتے رہیں', 'WATCH TILL THE END'), title: '{title}', sub: '', items: '', emoji: '👇', cta: '' }, 3.2], ['list', { title: '{title}', items: '{points}', numbered: '1' }, 8], ['outro', { name: '{org}', handle: '{contact}' }, 3.4]]);
  add('social', 'tips', '🪜', b('طریقہ / مرحلے', 'How-to steps'), 'ocean', 'travel', ['title', 'points', 'org', 'contact'],
    { title: b('یہ کیسے کریں', 'HOW TO DO IT'), points: b('پہلا مرحلہ\nدوسرا مرحلہ\nتیسرا مرحلہ\nچوتھا مرحلہ', 'Step one\nStep two\nStep three\nStep four'), org: b('آپ کا نام', 'Your Name'), contact: b('@آپ_کا_نام', '@yourname') },
    [['title', { badge: b('آسان طریقہ', 'EASY GUIDE'), l1: '', l2: '{title}', l3: '', tag: '' }, 3.4], ['list', { title: '{title}', items: '{points}', numbered: '1' }, 8], ['cta', { title: b('پسند آیا؟', 'LIKED IT?'), rows: b('❤️ | لائک\n🔁 | شیئر\n➕ | فالو', '❤️ | Like\n🔁 | Share\n➕ | Follow'), handle: '{contact}', note: '' }, 4.4], ['outro', { name: '{org}', handle: '{contact}' }, 3]]);
  add('social', 'ba', '↔️', b('پہلے اور بعد', 'Before / After'), 'social', 'epic', ['title', 'points', 'org', 'contact'],
    { title: b('فرق دیکھیں', 'SEE THE DIFFERENCE'), points: b('پہلے کی حالت\nاب کی حالت', 'How it was\nHow it is now'), org: b('آپ کا نام', 'Your Name'), contact: b('@آپ_کا_نام', '@yourname') },
    [['hook', { kicker: b('یقین نہیں آئے گا', 'YOU WON\'T BELIEVE'), title: '{title}', sub: '', items: '', emoji: '😮', cta: '' }, 3], ['ba', { title: '{title}', btext: '{p1}', atext: '{p2}' }, 6], ['outro', { name: '{org}', handle: '{contact}' }, 3.4]], { media: 'ba' });
  add('social', 'quote', '❝', b('اقتباس / حدیث / شعر', 'Quote / Hadith / Poetry'), 'gold', 'emotional', ['sub', 'title', 'org'],
    { sub: b('جو لوگ کوشش کرتے ہیں وہ کبھی ناکام نہیں ہوتے', 'Success is the sum of small efforts repeated day in and day out'), title: b('— نام', '— Author'), org: b('آپ کا نام', 'Your Name') },
    [['quote', { text: '{sub}', author: '{title}' }, 7], ['outro', { name: '{org}', handle: '', tag: b('شیئر کریں', 'Share if it touched you') }, 3.4]]);
  add('social', 'story', '📖', b('کہانی / اسٹوری ٹائم', 'Story time'), 'rose', 'emotional', ['title', 'points', 'org'],
    { title: b('ایک سچی کہانی', 'A TRUE STORY'), points: b('پہلا حصہ\nدوسرا حصہ\nتیسرا حصہ', 'Part one\nPart two\nPart three'), org: b('آپ کا نام', 'Your Name') },
    [['title', { badge: b('اسٹوری ٹائم', 'STORY TIME'), l1: '', l2: '{title}', l3: '', tag: '' }, 3.6], ['text', { title: '{p1}', sub: '' }, 4.2], ['text', { title: '{p2}', sub: '' }, 4.2], ['text', { title: '{p3}', sub: '' }, 4.2], ['outro', { name: '{org}', handle: '', tag: b('اگلا حصہ جلد', 'Next part soon') }, 3.2]]);
  add('social', 'countdown', '⏳', b('الٹی گنتی', 'Countdown'), 'neon', 'party', ['title', 'date', 'org', 'contact'],
    { title: b('بہت جلد آ رہا ہے', 'COMING SOON'), org: b('آپ کا نام', 'Your Name'), contact: b('@آپ_کا_نام', '@yourname') },
    [['hook', { kicker: '', title: '{title}', sub: '', items: '', emoji: '🔥', cta: '' }, 3], ['countdown', { title: '{title}', date: '{iso}', datetext: '{date}', label: b('دن باقی', 'DAYS TO GO') }, 5.5], ['outro', { name: '{org}', handle: '{contact}' }, 3.4]], { dateReq: true });
  add('social', 'meet', '🙋', b('تعارف / میں کون ہوں', 'Meet the creator'), 'social', 'happy', ['title', 'sub', 'points', 'org', 'contact', 'person', 'role'],
    { title: b('میرا نام', 'MY NAME'), sub: b('میں کیا کرتا ہوں', 'What I do'), points: b('100K | فالوورز\n5 | سال\n200 | ویڈیوز', '100K | FOLLOWERS\n5 | YEARS\n200 | VIDEOS'), org: b('آپ کا نام', 'Your Name'), contact: b('@آپ_کا_نام', '@yourname') },
    [['title', { badge: b('ملیں', 'MEET'), l1: '', l2: '{title}', l3: '{sub}', tag: '{contact}' }, 4], ['stats', { title: b('ایک نظر میں', 'AT A GLANCE'), chips: '{points}', foot: '' }, 5], ['outro', { name: '{org}', handle: '{contact}' }, 3.4]], { lower: true });

  /* ---------------- local bodies development update ---------------- */
  add('issue', 'devwork', '🏗️', b('بلدیاتی ترقیاتی کام کی اپڈیٹ', 'Local bodies development update'), 'ocean', 'epic', ['title', 'sub', 'figs', 'done', 'going', 'next', 'person', 'role', 'contact', 'org'],
    { title: b('ترقیاتی کاموں کی اپڈیٹ', 'DEVELOPMENT WORK UPDATE'), sub: b('عوام کی خدمت، مستقبل کی تعمیر', 'Serving the Community. Building the Future.'), figs: b('12 | منصوبے\n8 | مکمل\n4 | جاری', '12 | PROJECTS\n8 | COMPLETED\n4 | ONGOING'), done: b('گلی کی پختگی\nنکاسی آب کی لائن\nپارک کی بحالی', 'Street paving\nSewerage line\nPark renovation'), going: b('سڑک کی تعمیر\nواٹر سپلائی لائن', 'Road construction\nWater supply line'), next: b('اسکول کی مرمت\nاسٹریٹ لائٹس', 'School repair\nStreet lights'), person: b('چیئرمین / ناظم کا نام', 'Chairman / Nazim Name'), role: b('ٹاؤن / یونین کونسل', 'Town / Union Council'), contact: b('0300-0000000', '0300-0000000'), org: b('ٹاؤن / یونین کونسل', 'Town / Union Council') },
    [['title', { badge: b('اپڈیٹ', 'UPDATE'), l1: '', l2: '{title}', l3: '', tag: '{sub}' }, 4.2], ['stats', { title: b('ایک نظر میں', 'AT A GLANCE'), chips: '{figs}', foot: '{org}' }, 5], ['list', { title: b('✅ مکمل منصوبے', 'COMPLETED PROJECTS'), items: '{done}', numbered: '0' }, 6.4], ['list', { title: b('🚧 جاری کام', 'WORK IN PROGRESS'), items: '{going}', numbered: '0' }, 5.6], ['list', { title: b('🗓️ آنے والے منصوبے', 'COMING NEXT'), items: '{next}', numbered: '0' }, 5.6], ['cta', { title: b('شکایت یا تجویز', 'FEEDBACK / COMPLAINTS'), rows: '📞 | {contact}', handle: '{person}', note: '{sub}' }, 4.6], ['outro', { name: '{org}', handle: '{contact}', tag: '{sub}' }, 3.4]], { media: 'event', mediaAt: 2, lower: true, chip: b('کام کی جھلک', 'ON SITE') });

  /* ---------------- issue ---------------- */
  add('issue', 'breaking', '🚨', b('بریکنگ نیوز انداز', 'Breaking-news style'), 'news', 'epic', ['title', 'sub', 'org', 'points', 'contact'],
    { title: b('یہاں خبر کی سرخی لکھیں', 'Write the headline here'), sub: b('خبر کی مختصر تفصیل', 'A short summary of the story'), org: b('آپ کا نام', 'Your Name'), points: b('مسئلہ | یہاں مسئلہ لکھیں\nوجہ | اس کی وجہ\nاثر | کس پر کیا اثر\nمطالبہ | ہم کیا چاہتے ہیں', 'PROBLEM | Describe the problem\nCAUSE | Why it is happening\nIMPACT | Who it affects\nDEMAND | What we want'), contact: b('@آپ_کا_نام', '@yourname') },
    [['headline', { tag: b('اہم خبر', 'BREAKING NEWS'), headline: '{title}', sub: '{sub}', source: '{org}', ticker: '{sub}', tickerLabel: b('لائیو', 'LIVE') }, 6], ['issue', { title: b('تفصیل', 'THE DETAILS'), rows: '{points}' }, 8], ['cta', { title: b('آواز اٹھائیں', 'RAISE YOUR VOICE'), rows: '📞 | {contact}', handle: '{contact}', note: b('شیئر کریں تاکہ بات پہنچے', 'Share so it reaches the right people') }, 4.6], ['outro', { name: '{org}', handle: '{contact}' }, 3]], { ticker: true });
  add('issue', 'problem', '⚠️', b('مسئلہ کارڈ', 'Problem card'), 'news', 'epic', ['title', 'points', 'org', 'contact'],
    { title: b('ہمارا مسئلہ', 'OUR PROBLEM'), points: b('مسئلہ | یہاں مسئلہ لکھیں\nوجہ | وجہ لکھیں\nاثر | اثر لکھیں\nحل | حل لکھیں', 'PROBLEM | Describe the problem\nCAUSE | The cause\nIMPACT | The impact\nSOLUTION | The solution'), org: b('آپ کا نام', 'Your Name'), contact: b('@آپ_کا_نام', '@yourname') },
    [['hook', { kicker: b('توجہ دیں', 'PLEASE NOTICE'), title: '{title}', sub: '', items: '', emoji: '⚠️', cta: '' }, 3.2], ['issue', { title: '{title}', rows: '{points}' }, 8.5], ['outro', { name: '{org}', handle: '{contact}' }, 3.2]]);
  add('issue', 'facts', '📊', b('اہم اعداد و شمار', 'Key facts'), 'news', 'calm', ['title', 'points', 'big', 'sub', 'org'],
    { title: b('اہم حقائق', 'KEY FACTS'), points: b('70% | لوگ\n3 | ملین\n12 | سال', '70% | PEOPLE\n3M | AFFECTED\n12 | YEARS'), big: b('70%', '70%'), sub: b('یہ اعداد کسی معتبر ذریعے سے لیں', 'Use numbers from a source you trust'), org: b('آپ کا نام', 'Your Name') },
    [['hook', { kicker: '', title: '{title}', sub: '', items: '', emoji: '📊', cta: '' }, 3], ['stats', { title: '{title}', chips: '{points}', foot: '{sub}' }, 6], ['fact', { kicker: '{title}', big: '{big}', text: '{sub}' }, 5.5], ['outro', { name: '{org}', handle: '' }, 3]]);
  add('issue', 'timeline', '🕒', b('ٹائم لائن', 'Timeline'), 'news', 'calm', ['title', 'points', 'org'],
    { title: b('کب کیا ہوا', 'WHAT HAPPENED WHEN'), points: b('2020 | آغاز\n2022 | اگلا قدم\n2024 | بڑا موڑ\n2026 | آج', '2020 | The beginning\n2022 | Next step\n2024 | Turning point\n2026 | Today'), org: b('آپ کا نام', 'Your Name') },
    [['hook', { kicker: '', title: '{title}', sub: '', items: '', emoji: '🕒', cta: '' }, 3], ['timeline', { title: '{title}', events: '{points}' }, 8], ['outro', { name: '{org}', handle: '' }, 3]]);
  add('issue', 'appeal', '🤝', b('اپیل / چندہ', 'Fundraising appeal'), 'green', 'emotional', ['title', 'sub', 'goal', 'raised', 'points', 'org', 'contact'],
    { title: b('مدد کی اپیل', 'HELP US REACH OUR GOAL'), sub: b('ہر ایک روپیہ فرق ڈالتا ہے', 'Every contribution makes a difference'), goal: '500000', raised: '320000', points: b('جاز کیش: 0300-0000000\nبینک اکاؤنٹ: یہاں لکھیں', 'JazzCash: 0300-0000000\nBank account: write here'), org: b('آپ کا نام', 'Your Name'), contact: b('@آپ_کا_نام', '@yourname') },
    [['hook', { kicker: b('آپ کی مدد درکار ہے', 'WE NEED YOUR HELP'), title: '{title}', sub: '{sub}', items: '', emoji: '🤲', cta: '' }, 4], ['appeal', { title: '{title}', goal: '{goal}', raised: '{raised}', unit: b('روپے', 'Rs'), how: '{points}', note: '{sub}' }, 7], ['outro', { name: '{org}', handle: '{contact}' }, 3.4]]);
  add('issue', 'cta', '📢', b('کال ٹو ایکشن', 'Call to action'), 'promo', 'epic', ['title', 'sub', 'points', 'contact', 'org'],
    { title: b('آج ہی ساتھ دیں', 'JOIN US TODAY'), sub: b('آپ کا ساتھ ہماری طاقت ہے', 'Your support is our strength'), points: b('📞 | 0300-0000000\n🌐 | www.example.com\n📍 | آپ کا پتہ', '📞 | 0300-0000000\n🌐 | www.example.com\n📍 | Your address'), contact: b('@آپ_کا_نام', '@yourname'), org: b('آپ کا نام', 'Your Name') },
    [['hook', { kicker: '', title: '{title}', sub: '{sub}', items: '', emoji: '📢', cta: '' }, 3.6], ['cta', { title: '{title}', rows: '{points}', handle: '{contact}', note: '{sub}' }, 6], ['outro', { name: '{org}', handle: '{contact}' }, 3]]);

  /* ---------------- promotion ---------------- */
  add('promo', 'product', '🛍️', b('پروڈکٹ پروموشن', 'Product promo'), 'promo', 'party', ['title', 'price', 'points', 'org', 'contact'],
    { title: b('پروڈکٹ کا نام', 'Product name'), price: 'Rs 1,999', points: b('پہلی خوبی\nدوسری خوبی\nتیسری خوبی', 'First feature\nSecond feature\nThird feature'), org: b('آپ کا نام', 'Your Name'), contact: b('0300-0000000', '0300-0000000') },
    [['hook', { kicker: b('نیا آ گیا', 'JUST LAUNCHED'), title: '{title}', sub: '', items: '', emoji: '🔥', cta: '' }, 3], ['product', { badge: b('نیا', 'NEW'), name: '{title}', price: '{price}', old: '', features: '{points}' }, 6.4], ['cta', { title: b('آرڈر کریں', 'ORDER NOW'), rows: '📞 | {contact}', handle: '{contact}', note: '' }, 4.2], ['outro', { name: '{org}', handle: '{contact}' }, 3]], { media: 'product' });
  add('promo', 'sale', '🏷️', b('سیل / رعایت', 'Sale / Offer'), 'promo', 'party', ['title', 'big', 'sub', 'date', 'org', 'contact'],
    { title: b('بڑی سیل', 'MEGA SALE'), big: b('50٪ رعایت', '50% OFF'), sub: b('تمام اشیا پر', 'On everything in store'), org: b('آپ کا نام', 'Your Name'), contact: b('0300-0000000', '0300-0000000'), date: b('اس ہفتے تک', 'this Sunday') },
    [['offer', { kicker: '{title}', big: '{big}', sub: '{sub}', code: '', till: '{date}' }, 6], ['product', { badge: b('پیشکش', 'DEAL'), name: '{sub}', price: '{big}', old: '', features: '' }, 5], ['cta', { title: b('آج ہی آئیں', 'VISIT TODAY'), rows: '📞 | {contact}', handle: '{contact}', note: '' }, 4], ['outro', { name: '{org}', handle: '{contact}' }, 3]], { media: 'product' });
  add('promo', 'shopopen', '🎊', b('دکان / افتتاح', 'Shop opening'), 'promo', 'party', ['title', 'date', 'place', 'contact', 'org'],
    { title: b('آپ کی دکان', 'YOUR SHOP'), date: b('ہفتہ، 20 دسمبر', 'Saturday, 20 December'), place: b('مین بازار، شہر', 'Main Bazaar, City'), contact: b('0300-0000000', '0300-0000000'), org: b('آپ کا نام', 'Your Name') },
    [['title', { badge: b('شاندار', 'GRAND'), l1: b('افتتاح', 'OPENING'), l2: '{title}', l3: '', tag: b('سب کو دعوت', 'EVERYONE IS INVITED') }, 4], ['details', { title: b('افتتاح کی تفصیل', 'OPENING DETAILS'), rows: b('📅 | {date}\n📍 | {place}\n📞 | {contact}', '📅 DATE | {date}\n📍 VENUE | {place}\n📞 CALL | {contact}'), big: b('خوش آمدید', 'ALL WELCOME'), foot: '' }, 6], ['place', { title: b('مقام', 'FIND US'), name: '{org}', address: '{place}', hint: '' }, 4], ['outro', { name: '{org}', handle: '{contact}' }, 3]], { media: 'product' });
  add('promo', 'service', '💼', b('سروس / کاروبار', 'Service / business'), 'ocean', 'travel', ['title', 'sub', 'points', 'contact', 'org'],
    { title: b('ہماری سروسز', 'OUR SERVICES'), sub: b('معیار، اعتماد، وقت کی پابندی', 'Quality, trust, on-time delivery'), points: b('پہلی سروس\nدوسری سروس\nتیسری سروس\nچوتھی سروس', 'First service\nSecond service\nThird service\nFourth service'), contact: b('0300-0000000', '0300-0000000'), org: b('آپ کا کاروبار', 'Your Business') },
    [['hook', { kicker: '', title: '{org}', sub: '{sub}', items: '', emoji: '💼', cta: '' }, 3.4], ['list', { title: '{title}', items: '{points}', numbered: '0' }, 7], ['cta', { title: b('رابطہ کریں', 'GET IN TOUCH'), rows: '📞 | {contact}', handle: '{contact}', note: '{sub}' }, 4.2], ['outro', { name: '{org}', handle: '{contact}' }, 3]], { media: 'product' });
  add('promo', 'app', '📲', b('ایپ پروموشن', 'App promo'), 'neon', 'epic', ['title', 'sub', 'points', 'contact', 'org'],
    { title: b('ہماری نئی ایپ', 'OUR NEW APP'), sub: b('ایک ایپ، بے شمار آسانیاں', 'One app, endless convenience'), points: b('تیز اور آسان\nمکمل مفت\nبغیر اشتہار', 'Fast and simple\nCompletely free\nNo ads'), contact: b('ڈاؤن لوڈ لنک یہاں', 'Download link here'), org: b('آپ کا نام', 'Your Name') },
    [['title', { badge: b('نیا', 'NEW'), l1: '', l2: '{title}', l3: '', tag: '{sub}' }, 3.8], ['list', { title: b('خصوصیات', 'FEATURES'), items: '{points}', numbered: '0' }, 6.4], ['cta', { title: b('ابھی ڈاؤن لوڈ کریں', 'DOWNLOAD NOW'), rows: '📲 | {contact}', handle: '{contact}', note: '' }, 4.2], ['outro', { name: '{org}', handle: '' }, 3]], { media: 'product' });
  add('promo', 'hiring', '👔', b('نوکری / بھرتی', 'We are hiring'), 'ocean', 'calm', ['title', 'points', 'date', 'contact', 'org'],
    { title: b('عہدے کا نام', 'JOB TITLE'), points: b('پہلی شرط\nدوسری شرط\nتیسری شرط', 'First requirement\nSecond requirement\nThird requirement'), date: b('آخری تاریخ: 30 دسمبر', 'Apply by 30 December'), contact: b('jobs@example.com', 'jobs@example.com'), org: b('آپ کا ادارہ', 'Your Company') },
    [['title', { badge: b('بھرتی جاری', 'NOW HIRING'), l1: b('ہمیں چاہیے', 'WE NEED A'), l2: '{title}', l3: '', tag: '{org}' }, 3.8], ['list', { title: b('شرائط', 'REQUIREMENTS'), items: '{points}', numbered: '0' }, 6], ['cta', { title: b('اپلائی کریں', 'APPLY NOW'), rows: '✉️ | {contact}\n📅 | {date}', handle: '{contact}', note: '' }, 4.4], ['outro', { name: '{org}', handle: '' }, 3]]);
  add('promo', 'review', '⭐', b('گاہک کی رائے', 'Customer reviews'), 'promo', 'happy', ['title', 'sub', 'person', 'role', 'contact', 'org'],
    { title: b('ہمارے گاہک کیا کہتے ہیں', 'WHAT CUSTOMERS SAY'), sub: b('بہت شاندار سروس، میں نے دوسروں کو بھی مشورہ دیا۔', 'Amazing service. I have recommended it to everyone I know.'), person: b('گاہک کا نام', 'Customer Name'), role: b('خوش گاہک', 'Happy customer'), contact: b('0300-0000000', '0300-0000000'), org: b('آپ کا نام', 'Your Name') },
    [['hook', { kicker: '', title: '{title}', sub: '', items: '', emoji: '⭐', cta: '' }, 3], ['testimonial', { text: '{sub}', name: '{person}', role: '{role}', stars: '5' }, 6], ['cta', { title: b('آپ بھی آزمائیں', 'TRY IT TOO'), rows: '📞 | {contact}', handle: '{contact}', note: '' }, 4], ['outro', { name: '{org}', handle: '{contact}' }, 3]]);

  /* ---------------- events ---------------- */
  const evCommon = { date: b('13 تا 14 نومبر 2026', '13–14 November 2026'), place: b('اسکول / ہال کا نام، شہر', 'School / Hall name, City'), contact: b('0300-0000000', '0300-0000000'), org: b('آپ کا ادارہ', 'Your Organisation') };
  add('event', 'workshop', '🎓', b('ورکشاپ / سیمینار', 'Workshop / Seminar'), 'neon', 'epic', ['title', 'sub', 'points', 'date', 'place', 'contact', 'org', 'person', 'role'],
    Object.assign({ title: b('ڈیجیٹل مارکیٹنگ ورکشاپ', 'DIGITAL MARKETING WORKSHOP'), sub: b('سوشل میڈیا کھولیں', 'SOCIAL MEDIA UNLOCKED'), points: b('اسکرپٹنگ\nایڈیٹنگ\nاے آئی ٹولز', 'Scripting\nEditing\nAI Tools') }, evCommon),
    [['hook', { kicker: b('کیا آپ جانتے ہیں', 'EVER WONDERED HOW'), title: '{title}', sub: '{sub}', items: '{points}', emoji: '🤔', cta: b('آئیے سیکھیں', "LET'S LEARN") }, 6], ['title', { badge: b('دو دن · مفت', '2-DAY · 100% FREE'), l1: '', l2: '{title}', l3: '', tag: '{sub}' }, 4.2], ['details', { title: b('پروگرام کی تفصیل', 'EVENT DETAILS'), rows: b('📅 | {date}\n📍 | {place}\n🏛️ | {org}\n📞 | {contact}', '📅 DATES | {date}\n📍 VENUE | {place}\n🏛️ ORGANISED BY | {org}\n📞 CALL | {contact}'), big: b('رجسٹر کریں', 'REGISTER NOW'), foot: '' }, 6.4], ['outro', { name: '{org}', handle: '{contact}' }, 3.6]], { media: 'event', lower: true, chip: b('جھلکیاں', 'HIGHLIGHT') });
  const invite = (id, e, n, kick, theme, def2) => add('event', id, e, n, theme, 'emotional', ['title', 'sub', 'date', 'place', 'person', 'role', 'contact', 'org'],
    Object.assign({ title: b('دولہا', 'Groom Name'), sub: b('دلہن', 'Bride Name'), date: b('ہفتہ، 20 دسمبر 2026', 'Saturday, 20 December 2026'), place: b('شادی ہال، شہر', 'Wedding Hall, City'), person: b('وقت', '7:00 PM'), role: '', contact: b('0300-0000000', '0300-0000000'), org: b('خاندان', 'The Family') }, def2 || {}),
    [['invite', { kicker: kick, name1: '{title}', name2: '{sub}', date: '{date}', time: '{person}', venue: '{place}', note: b('آپ کی آمد ہماری خوشی ہے', 'Your presence will be our honour') }, 8], ['place', { title: b('مقام', 'VENUE'), name: '{place}', address: '{place}', hint: '{date}' }, 4.4], ['cta', { title: b('رابطہ', 'RSVP'), rows: '📞 | {contact}', handle: '{contact}', note: '' }, 4], ['outro', { name: '{org}', handle: '', tag: b('دعا کی درخواست', 'Your prayers and blessings') }, 3.2]], { media: 'event', chip: b('یادگار لمحے', 'MEMORIES') });
  invite('mehndi', '🌿', b('مہندی', 'Mehndi'), b('مہندی کی دعوت', 'MEHNDI INVITATION'), 'rose');
  invite('barat', '🐎', b('بارات', 'Barat'), b('بارات کی دعوت', 'BARAT INVITATION'), 'gold');
  invite('walima', '🍽️', b('ولیمہ', 'Walima'), b('ولیمہ کی دعوت', 'WALIMA INVITATION'), 'gold');
  invite('dawat', '💌', b('دعوت نامہ (عمومی)', 'Dawat-nama (general)'), b('دعوت نامہ', 'YOU ARE INVITED'), 'rose', { title: b('میزبان کا نام', 'Host Name'), sub: b('موقع', 'The Occasion') });
  add('event', 'milad', '🕌', b('نعت / میلاد / درس', 'Naat / Milad / Dars'), 'green', 'islamic', ['title', 'sub', 'date', 'place', 'person', 'role', 'contact', 'org'],
    { title: b('محفلِ میلاد', 'MEHFIL-E-MILAD'), sub: b('اللہ اور اس کے رسول ﷺ کا ذکر', 'In remembrance of the Prophet ﷺ'), date: b('جمعہ، بعد نمازِ عشاء', 'Friday, after Isha prayer'), place: b('مسجد کا نام، علاقہ', 'Masjid name, area'), person: b('قاری / نعت خواں کا نام', 'Speaker / Naat khwan'), role: b('خصوصی مہمان', 'Special guest'), contact: b('0300-0000000', '0300-0000000'), org: b('منتظمین', 'Organisers') },
    [['title', { badge: '', l1: b('بسم اللہ الرحمن الرحیم', 'BISMILLAH'), l2: '{title}', l3: '', tag: '{sub}' }, 4.4], ['details', { title: b('پروگرام', 'PROGRAMME'), rows: b('📅 | {date}\n📍 | {place}\n🎙️ | {person}\n📞 | {contact}', '📅 WHEN | {date}\n📍 WHERE | {place}\n🎙️ GUEST | {person}\n📞 CALL | {contact}'), big: b('سب کو دعوت', 'ALL ARE WELCOME'), foot: '' }, 6.4], ['outro', { name: '{org}', handle: '', tag: b('جزاک اللہ', 'JazakAllah Khair') }, 3.4]], { media: 'event', lower: true });
  const fest = (id, e, n, theme, titleD, subD, mood) => add('event', id, e, n, theme, mood || 'happy', ['title', 'sub', 'org', 'contact'], { title: titleD, sub: subD, org: b('آپ کا نام', 'Your Name'), contact: b('@آپ_کا_نام', '@yourname') },
    [['text', { title: '{title}', sub: '{sub}' }, 4.8], ['quote', { text: '{sub}', author: '{org}' }, 5], ['outro', { name: '{org}', handle: '{contact}', tag: '{title}' }, 3.6]], { media: 'event', mediaAt: 1, chip: b('یادیں', 'MEMORIES') });
  fest('eid', '🌙', b('عید مبارک', 'Eid Mubarak'), 'sunset', b('عید مبارک', 'EID MUBARAK'), b('اللہ آپ کی خوشیاں دوگنی کرے', 'May Allah double your joy'));
  fest('ramzan', '🌟', b('رمضان کریم', 'Ramadan Kareem'), 'green', b('رمضان مبارک', 'RAMADAN KAREEM'), b('اللہ ہمارے روزے قبول فرمائے', 'May Allah accept our fasts'), 'islamic');
  fest('aug14', '🇵🇰', b('14 اگست / جشنِ آزادی', '14 August / Independence Day'), 'green', b('جشنِ آزادی مبارک', 'HAPPY INDEPENDENCE DAY'), b('پاکستان زندہ باد', 'Pakistan Zindabad'), 'epic');
  add('event', 'birthday', '🎂', b('سالگرہ', 'Birthday'), 'rose', 'party', ['title', 'sub', 'date', 'place', 'org', 'contact'],
    { title: b('نام', 'Name'), sub: b('سالگرہ مبارک', 'Many happy returns'), date: b('ہفتہ، شام 7 بجے', 'Saturday, 7 PM'), place: b('گھر / ہال', 'Home / Hall'), org: b('خاندان', 'The Family'), contact: b('0300-0000000', '0300-0000000') },
    [['title', { badge: b('سالگرہ', 'BIRTHDAY'), l1: b('سالگرہ مبارک', 'HAPPY BIRTHDAY'), l2: '{title}', l3: '', tag: '{sub}' }, 4.6], ['details', { title: b('دعوت', 'PARTY DETAILS'), rows: b('📅 | {date}\n📍 | {place}\n📞 | {contact}', '📅 WHEN | {date}\n📍 WHERE | {place}\n📞 CALL | {contact}'), big: b('آپ کا انتظار ہے', 'SEE YOU THERE'), foot: '' }, 5.6], ['outro', { name: '{org}', handle: '', tag: b('خوشیاں بانٹیں', 'Let us celebrate') }, 3.2]], { media: 'event', mediaAt: 1, chip: b('یادگار لمحے', 'MEMORIES') });
  add('event', 'school', '🏫', b('اسکول / سالانہ تقریب', 'School annual day'), 'neon', 'epic', ['title', 'sub', 'date', 'place', 'points', 'person', 'role', 'org', 'contact'],
    { title: b('سالانہ تقریب', 'ANNUAL DAY 2026'), sub: b('طلبہ کی کارکردگی', 'Celebrating our students'), date: b('جمعہ، صبح 9 بجے', 'Friday, 9 AM'), place: b('اسکول گراؤنڈ', 'School Ground'), points: b('تقریری مقابلہ\nخاکے\nانعامات', 'Speech contest\nSkits\nPrize distribution'), person: b('مہمانِ خصوصی', 'Chief Guest'), role: b('عہدہ', 'Title'), org: b('اسکول کا نام', 'School Name'), contact: b('0300-0000000', '0300-0000000') },
    [['title', { badge: b('دعوت', 'INVITATION'), l1: '', l2: '{title}', l3: '', tag: '{sub}' }, 4], ['list', { title: b('پروگرام', 'PROGRAMME'), items: '{points}', numbered: '0' }, 5.6], ['details', { title: b('تفصیل', 'DETAILS'), rows: b('📅 | {date}\n📍 | {place}\n🎖️ | {person}', '📅 WHEN | {date}\n📍 WHERE | {place}\n🎖️ CHIEF GUEST | {person}'), big: '', foot: '' }, 5], ['outro', { name: '{org}', handle: '{contact}' }, 3.2]], { media: 'event', lower: true });
  add('event', 'sports', '🏆', b('کھیل / نتائج', 'Sports / Results'), 'news', 'epic', ['title', 'points', 'sub', 'org'],
    { title: b('فائنل نتیجہ', 'FINAL RESULTS'), points: b('ٹیم اے | 3\nٹیم بی | 1\nٹیم سی | 0', 'Team A | 3\nTeam B | 1\nTeam C | 0'), sub: b('سب کھلاڑیوں کو مبارک', 'Congratulations to all players'), org: b('آپ کا نام', 'Your Name') },
    [['hook', { kicker: b('ٹورنامنٹ', 'TOURNAMENT'), title: '{title}', sub: '', items: '', emoji: '🏆', cta: '' }, 3], ['table', { title: '{title}', rows: '{points}', foot: '{sub}' }, 6.5], ['outro', { name: '{org}', handle: '' }, 3]], { media: 'event', mediaAt: 1, chip: b('میچ', 'MATCH') });

  TP.LIST = L; TP.get = id => L.find(t => t.id === id);
  TP.name = t => pk(t.n);
  TP.fmtDate = iso => { if (!iso) return ''; const d = new Date(String(iso).replace(/-/g, '/')); if (isNaN(d)) return iso; try { return d.toLocaleDateString(S.lang === 'ur' ? 'ur-PK' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return iso; } };

  /* ---------------- brand kit ---------------- */
  TP.brand = () => Object.assign({ on: true, name: '', header: '', footer: '', logo: '', theme: '' }, S.get('brand', {}));
  TP.saveBrand = b0 => S.set('brand', b0);
  TP.logoFromFile = file => new Promise((res, rej) => {
    const im = new Image(), u = URL.createObjectURL(file);
    im.onload = () => { const k = 256 / Math.max(im.width, im.height, 1), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(im.width * Math.min(1, k))); c.height = Math.max(1, Math.round(im.height * Math.min(1, k))); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); res(c.toDataURL('image/png')); };
    im.onerror = () => { URL.revokeObjectURL(u); rej(new Error('logo')); }; im.src = u;
  });

  /* ---------------- builder ---------------- */
  const TRS = ['fade', 'slideL', 'zoomIn', 'dissolve', 'wipeL', 'pushL'];
  TP.sub = (v, vals, t) => {
    if (Array.isArray(v)) v = pk(v);
    return String(v).replace(/\{(\w+)\}/g, (m, k) => {
      const pm = /^p([1-9])$/.exec(k); if (pm) { const ls = String(vals.points || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean); return ls[+pm[1] - 1] || ''; }
      return vals[k] === undefined ? '' : vals[k];
    });
  };
  /* vals: user's tokens (blank = use template default). o: {fmt,res,music,media:[loaded clips],credit,brandOn} */
  TP.build = function (t, userVals, o) {
    o = o || {}; userVals = userVals || {}; const vals = {};
    Object.keys(t.def).forEach(k => { vals[k] = pk(t.def[k]); });
    Object.keys(userVals).forEach(k => { if (String(userVals[k] || '').trim()) vals[k] = String(userVals[k]).trim(); });
    if (userVals.date_iso) { vals.iso = userVals.date_iso; vals.date = TP.fmtDate(userVals.date_iso); } else if (t.dateReq) { const d = new Date(Date.now() + 30 * 864e5); vals.iso = d.toISOString().slice(0, 10); vals.date = TP.fmtDate(vals.iso); }
    vals.iso = vals.iso || '2026-12-25';
    const p = P.newProject(); p.fmt = o.fmt || '9:16'; p.res = o.res || 720; p.theme = o.theme || t.theme; p.credit = o.credit !== false; p.fit = 'fit'; p.autoColor = true; p.styleAuto = false; p.style = 'cinema'; p.kind = 'promo'; p.tpl = t.id;
    p.name = (vals.title || TP.name(t)).slice(0, 40);
    const br = Object.assign(TP.brand(), o.brand || {}); const orgTxt = userVals.org && String(userVals.org).trim() || br.name || '';
    p.brand = { on: o.brandOn !== false && !!(orgTxt || br.logo || br.header || br.footer), name: orgTxt, header: br.header || '', footer: br.footer || orgTxt, logo: br.logo || '' };
    if (userVals.org) vals.org = String(userVals.org).trim(); else if (br.name) vals.org = br.name;
    let idx = 0; const cards = [];
    const mk = ([type, over, len]) => { const ov = {}; Object.keys(over).forEach(k => { ov[k] = TP.sub(over[k], vals, t); }); const c = P.newCard(type, ov, len); c.trans = { type: TRS[idx++ % TRS.length], dur: .5 }; return c; };
    t.scenes.forEach(sc => cards.push(mk(sc)));
    /* media clips become highlight scenes */
    const media = (o.media || []).filter(Boolean); const at = t.mediaAt === undefined ? Math.min(2, cards.length - 1) : t.mediaAt; let mc = [];
    media.forEach((m, i) => {
      const c = m; c.hl = { on: true, chip: t.chip ? pk(t.chip) : '', title: '', num: t.media === 'product' || t.media === 'event' ? 0 : i + 1, sub: '', chips: '' };
      if (c.kind === 'v') { const w = S.auto.window(c, Math.min(c.dur, 5)); c.in = w[0]; c.out = Math.min(c.dur, w[0] + Math.min(5, c.dur)); if (c.out - c.in < .5) { c.in = 0; c.out = c.dur; } c.len = c.out - c.in; } else c.len = 3.4;
      c.trans = { type: TRS[(idx++) % TRS.length], dur: .45 }; c.anim = { in: 'none', mid: i % 2 ? 'zoomOut' : 'zoomIn', out: 'none' }; mc.push(c);
    });
    p.clips = cards.slice(0, at).concat(mc, cards.slice(at));
    if (t.ticker) { p.ticker = { on: true, label: S.lang === 'ur' ? 'تازہ' : 'LIVE', text: vals.sub || vals.title }; }
    if (t.lower && userVals.person && String(userVals.person).trim()) { const first = mc[0] || p.clips[Math.min(1, p.clips.length - 1)]; p.lowers = [P.newLower({ name: vals.person, role: vals.role || '', clip: first.id })]; }
    const m = o.music || 'auto'; p.music = m === 'none' ? { kind: 'none' } : m === 'file' && o.musicFile ? { kind: 'file', file: o.musicFile, mood: 'calm', vol: .5, start: 0, duck: true } : { kind: 'synth', mood: m === 'auto' ? t.mood : m, seed: 1, vol: .5, start: 0, duck: true };
    P.layout(p); return p;
  };

  /* ---------------- build from an AI plan ---------------- */
  TP.buildAI = function (r, o) {
    o = o || {}; const p = P.newProject(), TY = C.TYPES;
    p.fmt = o.fmt || '9:16'; p.res = o.res || 720; p.credit = o.credit !== false; p.fit = 'fit'; p.autoColor = true; p.style = 'cinema'; p.kind = 'promo'; p.tpl = 'ai';
    p.theme = C.THEMES[r.theme] ? r.theme : 'neon'; p.name = String(r.name || o.prompt || 'Video').slice(0, 40);
    const br = Object.assign(TP.brand(), o.brand || {}), org = String(r.org || '').trim() || br.name || '';
    p.brand = { on: o.brandOn !== false && !!(org || br.logo || br.header || br.footer), name: org, header: br.header || '', footer: br.footer || org, logo: br.logo || '' };
    const TRS2 = ['fade', 'slideL', 'zoomIn', 'dissolve', 'wipeL', 'pushL']; let idx = 0; const cards = [];
    (r.scenes || []).slice(0, 10).forEach(sc => {
      const type = String(sc.type || ''); if (!TY[type]) return; const ok = {}; C.fields(type).forEach(f => { ok[f.k] = 1; }); const ov = {};
      Object.keys(sc.data || {}).forEach(k => { if (ok[k] && sc.data[k] !== undefined && sc.data[k] !== null) ov[k] = String(sc.data[k]).replace(/\\n/g, '\n'); });
      const base = C.makeData(type); Object.keys(ok).forEach(k => { if (ov[k] === undefined && !/^img/.test(k)) base[k] = ''; });
      if (type === 'countdown' && !/^\d{4}-\d{2}-\d{2}$/.test(ov.date || '')) ov.date = '';
      const c = P.newCard(type, ov); Object.keys(ok).forEach(k => { if (ov[k] === undefined && !/^img/.test(k)) c.card.data[k] = ''; });
      if (type === 'countdown' && !c.card.data.date) c.card.data.date = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
      if (type === 'list' && !c.card.data.numbered) c.card.data.numbered = '1';
      c.card.data.say = String(sc.say || '').trim(); c.trans = { type: TRS2[idx++ % TRS2.length], dur: .5 };
      const text = Object.values(c.card.data).join(' ').length; c.len = Math.max(3.4, Math.min(8.5, c.len * .6 + text / 60)); cards.push(c);
    });
    if (!cards.length) throw new Error('no scenes');
    if (cards[cards.length - 1].card.type !== 'outro' && (org || br.logo)) { const c = P.newCard('outro', { name: org, tag: '', handle: '' }); c.trans = { type: 'fade', dur: .5 }; cards.push(c); }
    const media = (o.media || []).filter(Boolean), mc = [];
    media.forEach((c, i) => {
      c.hl = { on: true, chip: '', title: '', num: 0, sub: '', chips: '' };
      if (c.kind === 'v') { const w = S.auto.window(c, Math.min(c.dur, 5)); c.in = w[0]; c.out = Math.min(c.dur, w[0] + Math.min(5, c.dur)); if (c.out - c.in < .5) { c.in = 0; c.out = c.dur; } c.len = c.out - c.in; } else c.len = 3.4;
      c.trans = { type: TRS2[idx++ % TRS2.length], dur: .45 }; c.anim = { in: 'none', mid: i % 2 ? 'zoomOut' : 'zoomIn', out: 'none' }; mc.push(c);
    });
    const at = Math.min(1, cards.length - 1); p.clips = cards.slice(0, at).concat(mc, cards.slice(at));
    if (r.ticker && String(r.ticker).trim()) p.ticker = { on: true, label: S.lang === 'ur' ? 'تازہ' : 'LIVE', text: String(r.ticker).trim() };
    const m = o.music || 'auto'; const moods = ['calm', 'happy', 'travel', 'emotional', 'islamic', 'epic', 'party'];
    p.music = m === 'none' ? { kind: 'none' } : m === 'file' && o.musicFile ? { kind: 'file', file: o.musicFile, mood: 'calm', vol: .5, start: 0, duck: true } : { kind: 'synth', mood: m === 'auto' ? (moods.indexOf(r.mood) >= 0 ? r.mood : 'happy') : m, seed: 1, vol: .5, start: 0, duck: true };
    P.layout(p); p.clips.forEach(c => { if (c.kind === 'c') c.thumb = C.thumb(c, p, { logo: p.brand.logo }); }); return p;
  };

  /* ---------------- AI Director: build the timeline from the plan ---------------- */
  const norm = t => String(t || '').toLowerCase().replace(/[\u{1F000}-\u{1FFFF}☀-➿️]/gu, '').replace(/[^\p{L}\p{N}]+/gu, '');
  TP.quotesOf = txt => { const out = [], re = /[“"«]([^”"»\n]{6,140})[”"»]/g; let m; while ((m = re.exec(txt))) out.push(m[1].trim()); return out; };
  TP.targetSeconds = (txt, size) => { const m = /(\d{2,3})\s*(?:[-–to]+\s*(\d{2,3}))?\s*(?:seconds|second|secs|sec|سیکنڈ|s\b)/i.exec(txt); if (m) { const a = +m[1], b = m[2] ? +m[2] : a; return Math.max(15, Math.min(120, Math.round((a + b) / 2))); } return size === 'short' ? 30 : size === 'long' ? 75 : 50; };
  function cloneClip(c) {
    const d = JSON.parse(JSON.stringify(c, (k, v) => (['file', 'url', 'el', 'bmp', 'thumb', 'frames', 'frameT', 'an', 'cfiles', 'cbmp', 'node', 'gain'].indexOf(k) >= 0 ? undefined : v)));
    return Object.assign(d, { id: S.uid(), file: c.file, url: c.url, thumb: c.thumb, an: c.an, frames: c.frames, frameT: c.frameT });
  }
  TP.buildDirector = function (r, o) {
    o = o || {}; const media = (o.media || []).slice(0, 24), CX = C.THEMES;
    const p = P.newProject(); p.fmt = o.fmt || '9:16'; p.res = o.res || 720; p.credit = o.credit !== false; p.fit = 'blur'; p.autoColor = true; p.style = 'cinema'; p.kind = 'promo'; p.tpl = 'director';
    p.theme = CX[r.theme] ? r.theme : 'neon'; p.name = String(r.name || 'Video').slice(0, 40);
    const br = Object.assign(TP.brand(), o.brand || {}), org = String(r.org || '').trim() || br.name || '';
    p.brand = { on: o.brandOn !== false && !!(br.logo || br.header || br.footer || (org && r.media_style === 'frame')), name: org, header: br.header || '', footer: br.footer || org, logo: br.logo || '' };
    const moods = ['calm', 'happy', 'travel', 'emotional', 'islamic', 'epic', 'party']; const m = o.music || 'auto';
    p.music = m === 'none' ? { kind: 'none' } : m === 'file' && o.musicFile ? { kind: 'file', file: o.musicFile, mood: 'calm', vol: .5, start: 0, duck: true } : { kind: 'synth', mood: m === 'auto' ? (moods.indexOf(r.mood) >= 0 ? r.mood : 'epic') : m, seed: 1, vol: .5, start: 0, duck: true };
    const beat = p.music.kind === 'synth' ? 60 / S.music.bpm(p.music.mood) : 0, full = r.media_style !== 'frame';
    const TRS2 = full ? ['fade', 'dissolve', 'slideL', 'zoomIn', 'fade', 'pushL'] : ['fade', 'slideL', 'zoomIn', 'dissolve', 'wipeL', 'pushL']; let ti = 0;
    const used = {}, items = [], texts = [], allText = []; const MOT = { kenburns: 'kenburns', slowzoom: 'slowzoom', pulse: 'pulse', sway: 'sway' };
    const mkCard = sc => {
      const type = String(sc.type || ''); if (!C.TYPES[type]) return null; const ok = {}; C.fields(type).forEach(f => { ok[f.k] = 1; }); const ov = {};
      Object.keys(sc.data || {}).forEach(k => { if (ok[k] && sc.data[k] != null) ov[k] = String(sc.data[k]).replace(/\\n/g, '\n'); });
      const c = P.newCard(type, ov); Object.keys(ok).forEach(k => { if (ov[k] === undefined && !/^img/.test(k)) c.card.data[k] = ''; });
      if (type === 'countdown' && !/^\d{4}-\d{2}-\d{2}$/.test(ov.date || '')) c.card.data.date = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
      if (type === 'list' && !c.card.data.numbered) c.card.data.numbered = '1';
      c.card.data.say = String(sc.say || '').trim(); const tl = Object.values(c.card.data).join(' ').length; c.len = Math.max(3, Math.min(7, c.len * .6 + tl / 70)); allText.push(Object.values(c.card.data).join(' ')); return c;
    };
    const mkClip = it => {
      const i = Math.floor(+it.i), src = media[i]; if (!src) return null; const first = !used[i]; used[i] = 1; const c = first ? src : cloneClip(src);
      let L = Math.max(1.6, Math.min(6, +it.len || 3)); const fx = it.fx === 'slow' || it.fx === 'punch' ? it.fx : 'none';
      c.anim = { in: 'none', mid: MOT[it.motion] || (c.kind === 'i' ? 'kenburns' : 'none'), out: 'none' }; c.vfx = fx === 'punch' ? 'punch' : 'none'; c.speed = 1;
      if (c.kind === 'v') {
        const ft = (c.frameT && c.frameT.length) ? c.frameT[Math.max(0, Math.min(c.frameT.length - 1, Math.floor(+it.moment) || 0))] : c.dur / 2; const sp = fx === 'slow' ? .6 : 1;
        L = Math.min(L, c.dur / sp); const span = L * sp; let a = Math.max(0, Math.min(c.dur - span, ft - span / 2)); c.in = a; c.out = Math.min(c.dur, a + span); c.speed = sp; c.mute = p.music.kind !== 'none'; c.len = (c.out - c.in) / sp;
      } else { c.len = Math.min(L, 4); }
      c.trans = { type: TRS2[ti++ % TRS2.length], dur: .5 };
      if (!full) { c.hl = { on: true, chip: '', title: '', num: 0, sub: '', chips: '' }; if (it.chip) c.hl.chip = String(it.chip); if (it.title) c.hl.title = String(it.title); }
      const cap = it.caption && String(it.caption.text || '').trim(); if (cap) { const pos = it.caption.pos === 'top' ? .2 : it.caption.pos === 'center' ? .5 : .78; texts.push({ clip: c.id, text: cap, y: pos }); allText.push(cap); }
      return c;
    };
    (r.timeline || []).slice(0, 40).forEach(it => { const c = it.kind === 'clip' ? mkClip(it) : mkCard(it); if (c) { if (c.kind === 'c') c.trans = { type: TRS2[ti++ % TRS2.length], dur: .5 }; items.push(c); } });
    /* coverage: every clip appears at least once */
    const unused = media.map((c, i) => i).filter(i => !used[i]); const added = unused.length;
    unused.forEach((i, k) => { const c = mkClip({ i, moment: 1, len: 2.6, motion: 'kenburns' }); const pos = Math.max(1, Math.min(items.length - 1, Math.round((k + 1) * items.length / (unused.length + 1)))); items.splice(pos, 0, c); });
    /* quoted lines of the direction must be on screen */
    const need = TP.quotesOf(o.prompt || ''), have = norm(allText.join(' ')), missing = need.filter(q => have.indexOf(norm(q)) < 0);
    missing.forEach(q => { const c = P.newCard('text', { title: q, sub: '' }, 3.6); c.trans = { type: 'fade', dur: .5 }; items.splice(Math.max(1, items.length - 1), 0, c); allText.push(q); });
    if (!items.length) throw new Error('no scenes');
    /* length to target, beat-snapped */
    const target = +o.target || 50, fixed = items.filter(c => c.kind === 'c').reduce((a, c) => a + c.len, 0), mv = items.filter(c => c.kind !== 'c');
    const tot = mv.reduce((a, c) => a + c.len, 0), room = Math.max(mv.length * 1.6, target - fixed), k = tot > room ? room / tot : Math.min(1.7, room / Math.max(tot, 1));
    items.forEach(c => {
      if (c.kind === 'c') { if (beat) c.len = Math.max(2, Math.round(c.len / beat)) * beat; return; }
      let v = Math.min(5.5, Math.max(1.4, c.len * k)); if (beat) v = Math.max(2, Math.round(v / beat)) * beat; if (c.kind === 'v') { v = Math.min(v, c.dur / c.speed); c.out = Math.min(c.dur, c.in + v * c.speed); c.len = (c.out - c.in) / c.speed; } else c.len = v;
    });
    p.clips = items; p.texts = texts.map(t => P.newText({ clip: t.clip, text: t.text, y: t.y, size: 6.2, bg: 'rgba(0,0,0,.42)', in: 'slideU', out: 'fade' }));
    if (r.ticker && String(r.ticker).trim()) p.ticker = { on: true, label: S.lang === 'ur' ? 'تازہ' : 'LIVE', text: String(r.ticker).trim() };
    P.layout(p); p.clips.forEach(c => { if (c.kind === 'c') c.thumb = C.thumb(c, p, { logo: p.brand.logo }); });
    const rep = []; const nu = Object.keys(used).length;
    rep.push('✅ ' + (S.lang === 'ur' ? 'تصاویر/ویڈیوز استعمال ہوئیں: ' : 'Clips used: ') + Math.min(media.length, nu + added) + '/' + media.length + (added ? ' (' + (S.lang === 'ur' ? 'باقی خود شامل کیں' : 'the rest were added automatically') + ')' : ''));
    if (need.length) rep.push((missing.length ? '⚠️' : '✅') + ' ' + (S.lang === 'ur' ? 'آپ کے اقتباس والی لائنیں: ' : 'Your quoted lines on screen: ') + (need.length - missing.length) + '/' + need.length + (missing.length ? ' (' + (S.lang === 'ur' ? 'باقی الگ سین میں ڈالیں' : 'the rest were added as text scenes') + ')' : ''));
    (r.checklist || []).slice(0, 14).forEach(x => { if (x && x.req) rep.push('• ' + String(x.req).slice(0, 60) + ' → ' + String(x.how || '').slice(0, 110)); });
    p.report = rep; return p;
  };
  /* voice-over: reads each card's "say" text (or its headline) */
  TP.cardSay = c => { const d = c.card && c.card.data; if (!d) return ''; if (d.say && d.say.trim()) return d.say.trim(); const k = ['headline', 'title', 'text', 'big', 'name'].find(x => d[x] && String(d[x]).trim()); return k ? String(d[k]).replace(/\s*\n\s*/g, '. ') : ''; };
  TP.makeVoices = async function (p, mode, opt, onProg, signal) {
    const AI = S.ai; p.voice = []; const items = p.clips.filter(c => c.kind === 'c' && TP.cardSay(c)); let i = 0;
    for (const c of items) {
      if (signal && signal.aborted) throw new Error('cancelled'); if (onProg) onProg(i++, items.length); const txt = TP.cardSay(c); let buf;
      if (mode === 'gemini') buf = await AI.geminiTts(txt, opt.voice, signal); else buf = await AI.phoneTts(txt, opt.rate);
      p.voice.push({ id: S.uid(), text: txt, buf, blob: P.bufToWav(buf), vol: 1, clip: c.id }); if (mode === 'gemini') await S.sleep(400);
    }
    /* extend card length so the voice finishes */
    p.voice.forEach(v => { const c = p.clips.find(x => x.id === v.clip); if (c && v.buf && c.len < v.buf.duration + .8) c.len = v.buf.duration + .8; });
    if (onProg) onProg(items.length, items.length); P.layout(p);
  };
})();
