/*
 * Скриншоты кабинета под конкретной ролью.
 *
 * Логин и пароль берём из окружения — в репозитории их держать не нужно:
 *   CABINET_EMAIL=... CABINET_PASSWORD=... node scripts/shots-cabinet.cjs
 *
 * Запуск: npm run build && npx vite preview --port 5199, затем скрипт.
 * Маршруты по умолчанию — админские; свои можно передать аргументами.
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const BASE = 'http://localhost:5199';
const OUT = path.resolve(__dirname, '..', 'shots');
const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const EMAIL = process.env.CABINET_EMAIL;
const PASSWORD = process.env.CABINET_PASSWORD;

const ROUTES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['/cabinet', '/cabinet/admin/users', '/cabinet/admin/trainings', '/cabinet/settings'];

(async () => {
  if (!EMAIL || !PASSWORD) {
    console.error('Задайте CABINET_EMAIL и CABINET_PASSWORD');
    process.exit(1);
  }

  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Плашка «Установить приложение» перекрывает низ страницы на скриншотах
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('pwa_install_dismissed', '1');
  });

  await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
  await page.type('#email', EMAIL);
  await page.type('#password', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => location.pathname.startsWith('/cabinet'), { timeout: 20000 });

  for (const route of ROUTES) {
    for (const [tag, w, h] of [
      ['desktop', 1440, 900],
      ['mobile', 390, 844],
    ]) {
      await page.setViewport({ width: w, height: h });
      await page.goto(BASE + route, { waitUntil: 'networkidle2' });
      await new Promise((r) => setTimeout(r, 700));
      const name = `cabinet${route.replace(/\//g, '_')}-${tag}`;
      await page.screenshot({
        path: path.join(OUT, `${name}.png`),
        fullPage: tag === 'mobile',
      });
      console.log(`${name}.png`);
    }
  }

  await browser.close();
})();
