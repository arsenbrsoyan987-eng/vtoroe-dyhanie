/*
 * Мобильная проверка: переполнение по горизонтали, размеры тап-зон и шрифтов,
 * скриншоты ключевых страниц в /tmp/mobile-shots.
 *
 * Запуск: npm run build && npm run preview -- --port 5199, затем
 *         node scripts/check-mobile.cjs
 */
const fs = require('fs');
const puppeteer = require('puppeteer-core');

const BASE = 'http://localhost:5199';
const OUT = '/tmp/mobile-shots';
const ROUTES = ['/', '/trainers', '/trainers/trainer-1', '/schedule', '/directions/running', '/events', '/news'];
const DEVICES = [
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'iphone-14', width: 390, height: 844 },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox'],
  });

  const problems = [];

  for (const device of DEVICES) {
    const page = await browser.newPage();
    await page.setViewport({
      width: device.width,
      height: device.height,
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    });

    for (const route of ROUTES) {
      await page.goto(BASE + route, { waitUntil: 'networkidle2' });
      await new Promise((r) => setTimeout(r, 400));

      const res = await page.evaluate(() => {
        const docW = document.documentElement.clientWidth;
        const overflow = [];
        const smallText = [];
        const smallTap = [];

        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;

          if (r.right > docW + 1 || r.left < -1) {
            const style = getComputedStyle(el);
            // Декоративные пятна с отрицательными отступами и обрезкой — не баг
            if (style.position !== 'absolute') {
              overflow.push(`${el.tagName.toLowerCase()}.${(el.className || '').toString().slice(0, 50)}`);
            }
          }

          const text = (el.textContent || '').trim();
          if (text && el.children.length === 0) {
            const size = parseFloat(getComputedStyle(el).fontSize);
            if (size < 12) smallText.push(`${Math.round(size)}px: ${text.slice(0, 40)}`);
          }

          if (el.tagName === 'A' || el.tagName === 'BUTTON') {
            if (r.height < 40) smallTap.push(`${Math.round(r.height)}px: ${(text || el.getAttribute('aria-label') || '').slice(0, 30)}`);
          }
        }

        return {
          docW,
          scrollW: document.documentElement.scrollWidth,
          overflow: overflow.slice(0, 5),
          smallText: [...new Set(smallText)].slice(0, 5),
          smallTap: [...new Set(smallTap)].slice(0, 5),
        };
      });

      const horizontal = res.scrollW > res.docW;
      if (horizontal) problems.push(`${device.name} ${route}: горизонтальная прокрутка ${res.scrollW} > ${res.docW}`);
      if (res.overflow.length) problems.push(`${device.name} ${route}: вылезает ${res.overflow.join(' | ')}`);

      console.log(
        `${device.name.padEnd(10)} ${route.padEnd(22)} ${horizontal ? 'ПЕРЕПОЛНЕНИЕ' : 'ok'}  шрифт<12px: ${res.smallText.length}  тап<40px: ${res.smallTap.length}`
      );
      if (res.smallText.length) console.log('   мелкий текст:', res.smallText);
      if (res.smallTap.length) console.log('   мелкие кнопки:', res.smallTap);

      if (device.name === 'iphone-14') {
        const file = `${OUT}/${route.replace(/\//g, '_') || '_root'}.png`;
        await page.screenshot({ path: file, fullPage: false });
      }
    }

    await page.close();
  }

  await browser.close();

  console.log(`\nСкриншоты: ${OUT}`);
  if (problems.length) {
    console.log('\nПроблемы:');
    problems.forEach((p) => console.log(' - ' + p));
  } else {
    console.log('\nГоризонтальной прокрутки нет ни на одной проверенной странице.');
  }
})();
