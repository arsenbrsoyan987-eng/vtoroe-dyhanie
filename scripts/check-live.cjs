/* Проверяет доступность ключевых ресурсов задеплоенного сайта. */
const BASE = 'https://arsenbrsoyan987-eng.github.io/vtoroe-dyhanie';
const { readdirSync } = require('fs');

const assets = readdirSync('./dist/assets');
const js = assets.find((f) => f.endsWith('.js'));
const css = assets.find((f) => f.endsWith('.css'));

const urls = [
  ['index', `${BASE}/`],
  ['404.html (SPA fallback)', `${BASE}/404.html`],
  ['spa /schedule', `${BASE}/schedule`],
  ['spa /cabinet', `${BASE}/cabinet`],
  [`assets/${js}`, `${BASE}/assets/${js}`],
  [`assets/${css}`, `${BASE}/assets/${css}`],
  ['images/hero.svg', `${BASE}/images/hero.svg`],
  ['images/trainer.svg', `${BASE}/images/trainer.svg`],
  ['logo.jpg', `${BASE}/logo.jpg`],
  ['manifest.json', `${BASE}/manifest.json`],
  ['sw.js', `${BASE}/sw.js`],
];

(async () => {
  let bad = 0;
  for (const [name, url] of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      const code = res.status;
      // Для SPA-роутов GitHub Pages отдаёт 404 со контентом index.html —
      // это ожидаемо: браузер получит HTML и роутер отработает.
      const ok = code === 200 || (name.startsWith('spa') && code === 404);
      if (!ok) bad++;
      console.log(`${ok ? 'OK ' : 'BAD'} ${String(code)} ${name}`);
      if (name.startsWith('spa') && code === 404) {
        const body = await res.text();
        console.log(`    контент index: ${body.includes('id="root"') ? 'ДА (SPA работает)' : 'НЕТ'}`);
      }
    } catch (e) {
      bad++;
      console.log(`BAD ERR ${name}: ${e.message}`);
    }
  }
  process.exit(bad ? 1 : 0);
})();
