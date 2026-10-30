/*
 * Пререндер: превращает SPA-маршруты в готовые HTML-файлы.
 *
 * GitHub Pages отдаёт 404.html со статусом 404 на любой глубокий адрес.
 * Поисковики считают такие страницы несуществующими, а Яндекс ещё и плохо
 * исполняет JavaScript. Поэтому после сборки мы открываем каждый адрес из
 * sitemap.xml в браузере и сохраняем готовую страницу в dist/<путь>/index.html:
 * статус становится 200, в HTML уже есть заголовок, описание и текст.
 *
 * Заодно пересобирается sitemap.xml: страницы с `noindex` (кабинет, заглушки)
 * из карты сайта убираются, чтобы не просить краулер обходить закрытое.
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
const SITE_URL = 'https://vtoroe-dyhanie.ru';

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

/**
 * Адреса вне карты сайта, которым всё равно нужен код 200.
 * Без пререндера GitHub Pages отдаёт их через 404.html — форма входа
 * открывается, но со статусом «страница не найдена».
 */
const EXTRA_ROUTES = ['/login/', '/register/', '/cabinet/'];

/**
 * Адреса карточек из опубликованных данных.
 *
 * sitemap.xml в public/ — статический файл, а тренеров и тренировки владелец
 * добавляет через админку. Без этого новые записи не попадали в карту сайта
 * (а удалённые оставались в ней навсегда).
 */
function routesFromPublished() {
  const file = path.join(__dirname, '..', 'src', 'data', 'published.json');
  if (!fs.existsSync(file)) return [];

  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const routes = [];
  const add = (prefix, list) => {
    for (const item of Array.isArray(list) ? list : []) {
      if (item && item.id) routes.push(`/${prefix}/${item.id}/`);
    }
  };
  add('trainers', data.trainers);
  add('schedule', data.trainings);
  add('events', data.events);
  add('news', data.news);
  add('camps', data.camps);
  return routes;
}

/** Оставляет в карте сайта только страницы, которые мы разрешили индексировать */
function rewriteSitemap(noindexRoutes, extraRoutes) {
  const file = path.join(DIST, 'sitemap.xml');
  const xml = fs.readFileSync(file, 'utf8');
  const blocked = new Set(noindexRoutes);

  const kept = [...xml.matchAll(/<url>[\s\S]*?<\/url>/g)]
    .map((m) => m[0])
    .filter((block) => {
      const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1];
      if (!loc) return false;
      const route = new URL(loc).pathname;
      return !blocked.has(route) && !blocked.has(route.replace(/\/$/, ''));
    });

  const known = new Set(
    kept.map((block) => new URL(block.match(/<loc>(.*?)<\/loc>/)[1]).pathname)
  );
  for (const route of extraRoutes) {
    if (blocked.has(route) || known.has(route)) continue;
    kept.push(`  <url>\n    <loc>${SITE_URL}${route}</loc>\n    <priority>0.6</priority>\n  </url>`);
    known.add(route);
  }

  const head = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  fs.writeFileSync(file, `${head}${kept.join('\n')}\n</urlset>\n`, 'utf8');
  return { total: kept.length, removed: blocked.size };
}

(async () => {
  const indexPath = path.join(DIST, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('Нет dist/index.html — сначала выполните npm run build');
    process.exit(1);
  }

  // Карточки из админки могут отсутствовать в статическом sitemap.xml —
  // добавляем их, иначе новый тренер не получит готовую страницу
  const publishedRoutes = routesFromPublished();
  const routes = [...new Set([...routesFromSitemap(), ...publishedRoutes, ...EXTRA_ROUTES])];

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
  const noindexRoutes = [];

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
      const robots = await page.evaluate(
        () => document.head.querySelector('meta[name="robots"]')?.getAttribute('content') || ''
      );

      const dir = path.join(DIST, route);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');

      if (!title) throw new Error('пустой title');

      // Страницу всё равно публикуем (ссылки из меню должны работать),
      // но из карты сайта убираем — краулеру там делать нечего
      if (robots.includes('noindex')) {
        noindexRoutes.push(route);
        ok += 1;
        console.log(`  ok  ${route} — закрыта от индексации`);
        continue;
      }

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

  const sitemap = rewriteSitemap(noindexRoutes, publishedRoutes);
  console.log(`\nКарта сайта: ${sitemap.total} адресов (убрано ${sitemap.removed}).`);
  console.log(`Пререндер: ${ok} страниц готово, ${failed} с ошибкой.`);
  // Полный провал — повод остановить деплой. Частичный не блокирует сайт:
  // непрорендеренные адреса откроются как обычно, через 404.html.
  if (ok === 0) process.exit(1);
})();
