/* Сопоставляем названия зон с их изображениями на странице goldfinchteam.com/zones */
const fs = require('fs');
const puppeteer = require('puppeteer-core');

function findChrome() {
  const c = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ].filter(Boolean);
  return c.find((p) => fs.existsSync(p));
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: 'new',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
  );
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('https://goldfinchteam.com/zones', { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 3000));

  // Ищем каждый заголовок зоны (верхний регистр) и находим ближайшее изображение
  const result = await page.evaluate(() => {
    const norm = (s) => s.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
    // Все текстовые узлы-заголовки зон — ищем элементы, чей текст совпадает с названием зоны
    const wanted = [
      'алешкинский лес', 'бг мгу, воробьевы горы', 'воробьевы горы', 'кант',
      'красногорск, стадион зоркий', 'крылатское', 'лужники', 'мещерский парк',
      'парк победы', 'ромашковский лес', 'одинцовский парк',
    ];
    const all = [...document.querySelectorAll('*')];
    const out = {};
    for (const w of wanted) {
      // элемент, у которого непосредственный текст == название
      const el = all.find((e) => {
        const t = norm(e.textContent || '');
        return t === w && e.children.length <= 1;
      });
      if (!el) { out[w] = null; continue; }
      // идём вверх до контейнера-карточки, ищем там img
      let node = el;
      let img = null;
      for (let up = 0; up < 6 && node; up++) {
        img = node.querySelector('img');
        if (img) break;
        node = node.parentElement;
      }
      out[w] = img ? (img.currentSrc || img.src) : 'NO_IMG_IN_CARD';
    }
    return out;
  });

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();