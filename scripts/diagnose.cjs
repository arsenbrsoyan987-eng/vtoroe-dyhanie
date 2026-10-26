const puppeteer = require('puppeteer-core');
const BASE = 'http://localhost:5199';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  // --- 1. Мобильное переполнение ---
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1200));

  const offenders = await page.evaluate(() => {
    const docW = document.documentElement.clientWidth;
    const out = [];
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > docW + 1 || r.left < -1) {
        out.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || '').toString().slice(0, 90),
          left: Math.round(r.left),
          right: Math.round(r.right),
          w: Math.round(r.width),
        });
      }
    });
    return out.slice(0, 12);
  });
  console.log('=== Мобильное переполнение (390px) ===');
  console.log(offenders);

  // --- 2. Вход тренера ---
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 800));
  await page.type('#email', 'trainer@vtoroe-dyhanie.ru');
  await page.type('#password', 'Vtoroe#Coach2026');
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 2500));
  console.log('\n=== После входа тренером ===');
  console.log('url:', page.url());
  console.log((await page.evaluate(() => document.body.innerText)).slice(0, 400));

  await browser.close();
})();
