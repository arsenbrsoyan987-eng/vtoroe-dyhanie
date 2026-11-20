/*
 * Скриншоты произвольных маршрутов для визуальной проверки редизайна.
 * Запуск: npm run build && npm run preview -- --port 5199, затем
 *         node scripts/shots-pages.cjs /directions/running /directions
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const BASE = 'http://localhost:5199';
const OUT = path.resolve(__dirname, '..', 'shots');
const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const ROUTES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['/directions/running', '/directions', '/events', '/trainers', '/news', '/corporate'];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox'],
  });

  for (const route of ROUTES) {
    for (const [tag, w, h] of [
      ['desktop', 1440, 900],
      ['mobile', 390, 844],
    ]) {
      const page = await browser.newPage();
      await page.setViewport({ width: w, height: h });
      await page.goto(BASE + route, { waitUntil: 'networkidle2' });
      await new Promise((r) => setTimeout(r, 600));
      const name = `${route.replace(/\//g, '_') || '_'}-${tag}`;
      await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: tag === 'mobile' });
      console.log(`${name}.png`);
      await page.close();
    }
  }

  await browser.close();
})();
