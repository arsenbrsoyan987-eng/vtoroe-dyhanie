/*
 * Скриншоты ключевых страниц для визуальной проверки.
 * Запуск: npm run build && npm run preview -- --port 5199,
 *         затем node scripts/shots.cjs
 */
const path = require('path');
const puppeteer = require('puppeteer-core');

const BASE = 'http://localhost:5199';
const OUT = path.resolve(__dirname, '..', 'shots');
const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const PAGES = [
  { name: 'home-desktop', route: '/', width: 1440, height: 900, full: true },
  { name: 'home-mobile', route: '/', width: 390, height: 844, full: true },
  { name: 'trainers-mobile', route: '/trainers', width: 390, height: 844, full: false },
  { name: 'schedule-desktop', route: '/schedule', width: 1440, height: 900, full: false },
];

(async () => {
  const fs = require('fs');
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox'],
  });

  for (const p of PAGES) {
    const page = await browser.newPage();
    await page.setViewport({ width: p.width, height: p.height });
    await page.goto(BASE + p.route, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 700));
    const file = path.join(OUT, `${p.name}.png`);
    await page.screenshot({ path: file, fullPage: p.full });
    console.log(`${p.name}.png — ${p.route} ${p.width}×${p.height}`);
    await page.close();
  }

  await browser.close();
})();
