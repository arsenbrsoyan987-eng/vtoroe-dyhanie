/*
 * Проверяет доступность ключевых ресурсов задеплоенного сайта.
 * SITE_URL — адрес сайта (по умолчанию боевой домен).
 * SITE_IP  — необязательный IP: позволяет проверить сайт в обход
 *            локального DNS-кэша, который после переезда домена
 *            ещё какое-то время отдаёт адрес парковки регистратора.
 */
const { execFileSync } = require('node:child_process');
const { readdirSync } = require('node:fs');

const SITE = process.env.SITE_URL || 'https://vtoroe-dyhanie.ru';
const SITE_IP = process.env.SITE_IP || '';
const { hostname, protocol } = new URL(SITE);
const port = protocol === 'https:' ? '443' : '80';

const assets = readdirSync('./dist/assets');
const js = assets.find((f) => f.endsWith('.js'));
const css = assets.find((f) => f.endsWith('.css'));

const paths = [
  ['index', '/'],
  ['404.html (SPA fallback)', '/404.html'],
  ['redirect /schedule → /schedule/', '/schedule'],
  ['spa /schedule/', '/schedule/'],
  ['spa /trainers/trainer-2/', '/trainers/trainer-2/'],
  ['spa /cabinet/', '/cabinet/'],
  [`assets/${js}`, `/assets/${js}`],
  [`assets/${css}`, `/assets/${css}`],
  ['images/hero.svg', '/images/hero.svg'],
  ['images/trainer.svg', '/images/trainer.svg'],
  ['logo.jpg', '/logo.jpg'],
  ['icon-192.png', '/icon-192.png'],
  ['og-image.jpg', '/og-image.jpg'],
  ['manifest.json', '/manifest.json'],
  ['sitemap.xml', '/sitemap.xml'],
  ['sw.js', '/sw.js'],
];

function request(path) {
  const args = ['-s', '--max-time', '25', '--http1.1'];
  // Подменяем только адрес подключения: TLS-проверка и Host остаются по домену
  if (SITE_IP) args.push('--resolve', `${hostname}:${port}:${SITE_IP}`);
  args.push('-w', '\n%{http_code}', `${SITE}${path}`);
  const out = execFileSync('curl', args, { encoding: 'utf8', maxBuffer: 8 << 20 });
  const cut = out.lastIndexOf('\n');
  return { body: out.slice(0, cut), status: Number(out.slice(cut + 1)) };
}

let bad = 0;
for (const [name, path] of paths) {
  try {
    const { status, body } = request(path);
    // GitHub Pages отдаёт каталог со слэшем: /schedule → 301 /schedule/,
    // а для SPA-роутов без готового HTML — 404 с содержимым index.html.
    // И то и другое нормально, важно что браузер получает приложение.
    const ok =
      status === 200 ||
      (name.startsWith('redirect') && status === 301) ||
      (name.startsWith('spa') && status === 404);
    if (!ok) bad++;
    console.log(`${ok ? 'OK ' : 'BAD'} ${status} ${name}`);

    if (name === 'index') {
      // По адресу может отдаваться парковка регистратора с кодом 200,
      // поэтому проверяем, что это действительно наше приложение.
      const ours = body.includes('id="root"');
      if (!ours) bad++;
      console.log(`    это наш сайт: ${ours ? 'ДА' : 'НЕТ — отдаётся не приложение'}`);
    }
    if (name.startsWith('spa')) {
      // Пререндеренные страницы содержат готовый HTML с h1, а не пустой root
      const rendered = /<h1[^>]*>[^<]+<\/h1>/.test(body);
      console.log(
        `    готовый HTML: ${rendered ? 'ДА' : 'НЕТ — только SPA-оболочка'}`,
      );
    }
    if (name === 'sitemap.xml') {
      const count = (body.match(/<url>/g) || []).length;
      console.log(`    адресов в карте сайта: ${count}`);
      if (count !== 14) bad++;
    }
  } catch (e) {
    bad++;
    const reason = e.stderr ? String(e.stderr).trim() : e.message;
    console.log(`BAD ERR ${name}: ${reason || `curl exit ${e.status}`}`);
  }
}

process.exitCode = bad ? 1 : 0;