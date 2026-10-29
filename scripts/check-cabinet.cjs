/*
 * Проверка страниц входа и кабинета: они грузятся отдельными чанками (lazy),
 * поэтому важно убедиться, что чанк доезжает, форма рендерится и в консоли нет
 * ошибок. Заодно проверяем, что гость с /cabinet/ уводится на /login/.
 *
 * Запуск: npm run build && npm run prerender && npm run preview -- --port 5199,
 *         затем node scripts/check-cabinet.cjs
 */
const puppeteer = require('puppeteer-core');

const BASE = 'http://localhost:5199';
const ROUTES = [
  { path: '/login', expect: 'форма входа', selector: 'input[type="email"]' },
  { path: '/register', expect: 'форма регистрации', selector: 'input[type="email"]' },
  { path: '/cabinet', expect: 'редирект на /login', redirectTo: '/login' },
];

const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox'],
  });

  let errors = 0;

  for (const route of ROUTES) {
    const page = await browser.newPage();
    const logs = [];
    page.on('console', (m) => {
      if (m.type() === 'error') logs.push(m.text());
    });
    page.on('pageerror', (e) => logs.push('pageerror: ' + e.message));
    page.on('requestfailed', (r) => logs.push('requestfailed: ' + r.url()));

    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(BASE + route.path, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 700));

    const info = await page.evaluate((sel) => ({
      pathname: location.pathname,
      hasSelector: sel ? Boolean(document.querySelector(sel)) : null,
      h1: document.querySelector('h1')?.innerText.trim() ?? '',
      rootNodes: document.getElementById('root')?.querySelectorAll('*').length ?? 0,
    }), route.selector);

    const redirected = route.redirectTo
      ? info.pathname.replace(/\/$/, '') === route.redirectTo
      : true;
    const rendered = route.selector ? info.hasSelector : true;
    const ok = redirected && rendered && info.rootNodes > 20 && logs.length === 0;
    if (!ok) errors += 1;

    console.log(
      `${ok ? 'ok  ' : 'FAIL'} ${route.path} — ${route.expect}` +
        `, путь ${info.pathname}, узлов ${info.rootNodes}, ошибок ${logs.length}`
    );
    if (info.h1) console.log(`     h1: ${info.h1.slice(0, 60)}`);
    if (logs.length) logs.slice(0, 3).forEach((l) => console.log('     ! ' + l));

    await page.close();
  }

  await browser.close();
  console.log(
    errors === 0
      ? '\nВход и кабинет работают, lazy-чанки загружаются.'
      : `\nПроблемных страниц: ${errors}`
  );
  if (errors) process.exit(1);
})();
