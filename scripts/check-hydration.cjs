/*
 * Проверка, что пререндеренные страницы «оживают»: React монтируется поверх
 * готового HTML, ссылки работают, ошибок в консоли нет.
 *
 * Запуск: npm run build && npm run prerender && npm run preview -- --port 5199,
 *         затем node scripts/check-hydration.cjs
 */
const puppeteer = require('puppeteer-core');

const BASE = 'http://localhost:5199';
const ROUTES = ['/', '/trainers/trainer-2', '/schedule/training-3', '/directions/trail', '/events/event-2'];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
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

    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(BASE + route, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 500));

    const info = await page.evaluate(() => ({
      h1: document.querySelector('h1')?.innerText.trim() ?? '',
      // Сколько узлов внутри #root: если React смонтировался, их много
      rootNodes: document.getElementById('root')?.querySelectorAll('*').length ?? 0,
      title: document.title,
    }));

    // Проверяем переход по внутренней ссылке (SPA-навигация)
    const link = await page.$('a[href^="/schedule"], a[href^="/trainers"]');
    let navigated = 'нет ссылки';
    if (link) {
      await link.click();
      await new Promise((r) => setTimeout(r, 800));
      const after = await page.evaluate(() => ({ url: location.pathname, h1: document.querySelector('h1')?.innerText.trim() ?? '' }));
      navigated = `${after.url} (h1: ${after.h1.slice(0, 30)})`;
    }

    const ok = info.rootNodes > 20 && logs.length === 0;
    if (!ok) errors += 1;

    console.log(
      `${ok ? 'ok  ' : 'FAIL'} ${route} — h1 "${info.h1.slice(0, 40)}", узлов ${info.rootNodes}, ошибок ${logs.length}`
    );
    console.log(`     переход по ссылке: ${navigated}`);
    if (logs.length) logs.slice(0, 3).forEach((l) => console.log('     ! ' + l));

    await page.close();
  }

  await browser.close();
  console.log(errors === 0 ? '\nВсе страницы монтируются без ошибок.' : `\nПроблемных страниц: ${errors}`);
  if (errors) process.exit(1);
})();
