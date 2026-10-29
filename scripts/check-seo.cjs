/*
 * Проверка SEO-метаданных и мобильной вёрстки на собранной версии.
 * Запуск: npm run build && npm run preview -- --port 5199, затем
 *         node scripts/check-seo.cjs
 */
const puppeteer = require('puppeteer-core');

const BASE = 'http://localhost:5199';
const ROUTES = [
  '/',
  '/directions',
  '/directions/running',
  '/schedule',
  '/schedule/training-1',
  '/trainers',
  '/trainers/trainer-1',
  '/events',
  '/routes',
  '/news',
  '/results',
  '/privacy',
  '/login',
  '/cabinet',
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const rows = [];
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 400));
    const meta = await page.evaluate(() => {
      const get = (sel, attr = 'content') =>
        document.head.querySelector(sel)?.getAttribute(attr) ?? '';
      return {
        title: document.title,
        desc: get('meta[name="description"]'),
        canonical: get('link[rel="canonical"]', 'href'),
        robots: get('meta[name="robots"]'),
        h1: document.querySelector('h1')?.innerText.trim() ?? '',
      };
    });
    rows.push({ route, ...meta });
  }

  console.log('=== Метаданные ===');
  for (const r of rows) {
    console.log(
      `${r.route}\n  title: ${r.title} (${r.title.length})\n  desc: ${r.desc.slice(0, 80)}... (${r.desc.length})\n  canonical: ${r.canonical}\n  robots: ${r.robots || '-'}\n  h1: ${r.h1}`
    );
  }

  const titles = rows.filter((r) => !r.robots).map((r) => r.title);
  console.log('\nПовторы title:', titles.length - new Set(titles).size);
  console.log(
    'Длинные title (>70):',
    rows.filter((r) => r.title.length > 70).map((r) => r.route)
  );
  console.log(
    'Длинные desc (>180):',
    rows.filter((r) => r.desc.length > 180).map((r) => r.route)
  );
  console.log(
    'Без description:',
    rows.filter((r) => !r.desc).map((r) => r.route)
  );

  // --- Мобильная вёрстка ---
  console.log('\n=== Мобильная версия (390px) ===');
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  for (const route of ['/', '/trainers', '/trainers/trainer-1', '/schedule', '/directions/running']) {
    await page.goto(BASE + route, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 600));
    const res = await page.evaluate(() => {
      const docW = document.documentElement.clientWidth;
      const offenders = [];
      document.querySelectorAll('body *').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && (r.right > docW + 1 || r.left < -1)) {
          offenders.push(
            `${el.tagName.toLowerCase()}.${(el.className || '').toString().slice(0, 60)}`
          );
        }
      });
      return {
        docW,
        scrollW: document.documentElement.scrollWidth,
        viewport: document.head.querySelector('meta[name="viewport"]')?.content,
        offenders: offenders.slice(0, 5),
      };
    });
    console.log(
      `${route}: scrollWidth ${res.scrollW}/${res.docW} ${res.scrollW > res.docW ? 'ПЕРЕПОЛНЕНИЕ' : 'ok'}; viewport="${res.viewport}"`
    );
    if (res.offenders.length) console.log('  вылезает:', res.offenders);
  }

  await browser.close();
})();
