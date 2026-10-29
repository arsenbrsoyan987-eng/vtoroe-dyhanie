/*
 * Пререндер: превращает SPA-маршруты в готовые HTML-файлы.
 *
 * GitHub Pages отдаёт 404.html со статусом 404 на любой глубокий адрес.
 * Поисковики считают такие страницы несуществующими, а Яндекс ещё и плохо
 * исполняет JavaScript. Поэтому после сборки мы открываем каждый адрес из
 * sitemap.xml в браузере и сохраняем готовую страницу в dist/<путь>/index.html:
 * статус становится 200, в HTML уже есть заголовок, описание и текст.
 *
 * Запуск: npm run build && npm run prerender
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer-core');

const DIST = path.resolve(__dirname, '..', 'dist');
const PORT = 5200;
const ORIGIN = `http://127.0.0.1:${PORT}`;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

/** Chrome в macOS, Linux и GitHub Actions */
function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/opt/google/chrome/chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ].filter(Boolean);
  return candidates.find((p) => fs.existsSync(p));
}

function startServer() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    let file = path.join(DIST, urlPath);

    if (urlPath.endsWith('/')) file = path.join(file, 'index.html');
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(DIST, 'index.html');
    }

    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(PORT, '127.0.0.1', () => resolve(server)));
}

function routesFromSitemap() {
  const xml = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

(async () => {
  const indexPath = path.join(DIST, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('Нет dist/index.html — сначала выполните npm run build');
    process.exit(1);
  }

  const routes = routesFromSitemap();

  // 404.html делаем из пустого шаблона: GitHub Pages отдаст его для любого
  // неизвестного адреса, а маршрут нарисует уже React.
  fs.copyFileSync(indexPath, path.join(DIST, '404.html'));

  const executablePath = findChrome();

  if (!executablePath) {
    console.warn(
      `Chrome не найден — пререндер пропущен, ${routes.length} адресов останутся SPA-роутами.`
    );
    process.exit(0);
  }

  const server = await startServer();
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  let ok = 0;
  let failed = 0;

  for (const route of routes) {
    const page = await browser.newPage();
    // Service worker в пререндере не нужен и мешает получать свежий HTML
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'serviceWorker', { get: () => undefined });
    });
    await page.setViewport({ width: 1280, height: 900 });

    try {
      await page.goto(ORIGIN + route, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise((r) => setTimeout(r, 250));

      const html = await page.content();
      const title = await page.title();

      const dir = path.join(DIST, route);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');

      if (!title) throw new Error('пустой title');
      ok += 1;
      console.log(`  ok  ${route} — ${title}`);
    } catch (err) {
      failed += 1;
      console.error(`  fail ${route}: ${err.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();

  console.log(`\nПререндер: ${ok} страниц готово, ${failed} с ошибкой.`);
  // Полный провал — повод остановить деплой. Частичный не блокирует сайт:
  // непрорендеренные адреса откроются как обычно, через 404.html.
  if (ok === 0) process.exit(1);
})();
