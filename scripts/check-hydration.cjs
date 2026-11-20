/*
 * Проверка, что пререндеренные страницы «оживают»: React монтируется поверх
 * готового HTML, ссылки работают, ошибок в консоли нет.
 *
 * Запуск: npm run build && npm run prerender && npm run preview -- --port 5199,
 *         затем node scripts/check-hydration.cjs
 */
const puppeteer = require('puppeteer-core');

const BASE = 'http://localhost:5199';
const ROUTES = ['/', '/trainers/trainer-2', '/schedule/training-3', '/directions/trail', '/events/event-2', '/camps'];

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

    // Проверяем переход по внутренней ссылке (SPA-навигация).
    // В шапке часть ссылок лежит в выпадающем меню и не видна — кликаем только по видимым.
    const navigated = await page.evaluate(() => {
      const candidates = [
        ...document.querySelectorAll('a[href^="/schedule"], a[href^="/trainers"]'),
        ...document.querySelectorAll('a[href^="/"]'),
      ];
      const link = candidates.find((a) => {
        const r = a.getBoundingClientRect();
        const href = a.getAttribute('href');
        return (
          href &&
          href !== location.pathname &&
          r.width > 0 &&
          r.height > 0 &&
          r.top >= 0 &&
          r.bottom <= window.innerHeight
        );
      });
      if (!link) return 'нет видимой ссылки';
      link.click();
      return new Promise((resolve) =>
        setTimeout(
          () => resolve(`${location.pathname} (h1: ${document.querySelector('h1')?.innerText.trim().slice(0, 30) ?? ''})`),
          800
        )
      );
    });

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
