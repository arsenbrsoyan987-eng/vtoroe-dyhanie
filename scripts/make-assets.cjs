/*
 * Генерация иконок и OG-картинки из логотипа клуба.
 * Логотип — растровый JPEG с белым фоном, поэтому на тёмной вкладке он
 * «выжигает» глаз: подкладываем его в белую скруглённую плашку.
 *
 * Запуск: node scripts/make-assets.cjs
 * Результат: public/icon-512.png, icon-192.png, apple-touch-icon.png,
 *            favicon-32.png, og-image.jpg
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const logo = fs.readFileSync(path.join(PUBLIC, 'logo.jpg')).toString('base64');
const logoSrc = `data:image/jpeg;base64,${logo}`;

/** Иконка: тёмный фон + логотип в белой плашке */
function iconHtml(size) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{width:${size}px;height:${size}px;background:#0a0a0a;display:flex;align-items:center;justify-content:center}
    .plate{width:${Math.round(size * 0.84)}px;height:${Math.round(size * 0.84)}px;background:#fff;
      border-radius:${Math.round(size * 0.2)}px;display:flex;align-items:center;justify-content:center;overflow:hidden}
    img{width:100%;height:100%;object-fit:contain}
  </style></head><body><div class="plate"><img src="${logoSrc}"></div></body></html>`;
}

/**
 * Maskable-иконка: Android обрезает её по своей маске (круг, «капля»),
 * поэтому логотип держим в пределах 60% — это гарантированная safe zone.
 */
function maskableHtml(size) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{width:${size}px;height:${size}px;background:#0a0a0a;display:flex;align-items:center;justify-content:center}
    .plate{width:${Math.round(size * 0.6)}px;height:${Math.round(size * 0.6)}px;background:#fff;
      border-radius:50%;display:flex;align-items:center;justify-content:center;overflow:hidden}
    img{width:100%;height:100%;object-fit:contain}
  </style></head><body><div class="plate"><img src="${logoSrc}"></div></body></html>`;
}

/** OG-картинка 1200×630: логотип + название и направления */
function ogHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{width:1200px;height:630px;background:#0a0a0a;position:relative;overflow:hidden;
      font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;display:flex;align-items:center}
    .glow{position:absolute;border-radius:50%;filter:blur(120px)}
    .glow.red{width:640px;height:640px;background:rgba(220,38,38,.55);left:-160px;top:-120px}
    .glow.blue{width:520px;height:520px;background:rgba(37,99,235,.35);right:-140px;bottom:-160px}
    .content{position:relative;display:flex;align-items:center;gap:56px;padding:0 80px;width:100%}
    .plate{width:340px;height:340px;background:#fff;border-radius:56px;flex:0 0 auto;
      display:flex;align-items:center;justify-content:center;overflow:hidden;
      box-shadow:0 24px 80px rgba(0,0,0,.6)}
    .plate img{width:100%;height:100%;object-fit:contain}
    .text{display:flex;flex-direction:column;gap:22px}
    h1{color:#fff;font-size:82px;line-height:1.02;letter-spacing:-2px;font-weight:800}
    h1 span{color:#ef4444}
    p{color:#d1d5db;font-size:32px;line-height:1.35;font-weight:500}
    .url{color:#9ca3af;font-size:26px;letter-spacing:.5px}
  </style></head><body>
    <div class="glow red"></div><div class="glow blue"></div>
    <div class="content">
      <div class="plate"><img src="${logoSrc}"></div>
      <div class="text">
        <h1>Второе<br><span>дыхание</span></h1>
        <p>Бег · Трейл · Вело · Походы · ОФП</p>
        <div class="url">vtoroe-dyhanie.ru</div>
      </div>
    </div>
  </body></html>`;
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--force-device-scale-factor=1'],
  });

  async function shoot(html, width, height, file, type = 'png', quality) {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'load' });
    // Ждём декодирования встроенного логотипа, иначе снимем пустую плашку
    await page.evaluate(async () => {
      const img = document.querySelector('img');
      if (img && !img.complete) await new Promise((r) => (img.onload = r));
      await document.fonts?.ready;
    });
    const out = path.join(PUBLIC, file);
    await page.screenshot({ path: out, type, quality, clip: { x: 0, y: 0, width, height } });
    await page.close();
    const size = fs.statSync(out).size;
    console.log(`${file} — ${width}×${height}, ${(size / 1024).toFixed(1)} КБ`);
  }

  await shoot(iconHtml(512), 512, 512, 'icon-512.png');
  await shoot(iconHtml(192), 192, 192, 'icon-192.png');
  await shoot(maskableHtml(512), 512, 512, 'icon-maskable-512.png');
  await shoot(iconHtml(180), 180, 180, 'apple-touch-icon.png');
  await shoot(iconHtml(32), 32, 32, 'favicon-32.png');
  await shoot(ogHtml(), 1200, 630, 'og-image.jpg', 'jpeg', 90);

  await browser.close();
})();
