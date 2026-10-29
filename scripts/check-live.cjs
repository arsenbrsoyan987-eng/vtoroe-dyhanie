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
  ['spa /schedule', '/schedule'],
  ['spa /cabinet', '/cabinet'],
  [`assets/${js}`, `/assets/${js}`],
  [`assets/${css}`, `/assets/${css}`],
  ['images/hero.svg', '/images/hero.svg'],
  ['images/trainer.svg', '/images/trainer.svg'],
  ['logo.jpg', '/logo.jpg'],
  ['manifest.json', '/manifest.json'],
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
    // Для SPA-роутов GitHub Pages отдаёт 404 с содержимым index.html —
    // это ожидаемо: браузер получит HTML и роутер отработает.
    const ok = status === 200 || (name.startsWith('spa') && status === 404);
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
      console.log(`    контент index: ${body.includes('id="root"') ? 'ДА (SPA работает)' : 'НЕТ'}`);
    }
  } catch (e) {
    bad++;
    const reason = e.stderr ? String(e.stderr).trim() : e.message;
    console.log(`BAD ERR ${name}: ${reason || `curl exit ${e.status}`}`);
  }
}

process.exitCode = bad ? 1 : 0;