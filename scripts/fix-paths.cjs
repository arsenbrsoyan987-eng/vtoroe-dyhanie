/*
 * Одноразовый скрипт: чинит пути к локальным SVG (после замены Unsplash
 * остались «хвосты» вида .svg-abc123?w=600) и переводит все абсолютные
 * пути на базовый путь проекта /vtoroe-dyhanie/ для GitHub Pages.
 */
const { readFileSync, writeFileSync, readdirSync, statSync } = require('fs');
const path = require('path');

const BASE = '/vtoroe-dyhanie';

function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const files = [...walk('./src'), './index.html', './public/manifest.json', './public/sw.js', './src/main.tsx'];
let total = 0;

for (const f of [...new Set(files)]) {
  if (!/\.(ts|tsx|html|json|js)$/.test(f)) continue;
  const src = readFileSync(f, 'utf8');
  let out = src;

  // 1. битые svg-пути: /images/xxx.svg-остаток?w=... -> /images/xxx.svg
  out = out.replace(/\/images\/([a-z-]+)\.svg[^"'`\s)]*/g, `${BASE}/images/$1.svg`);

  // 2. прочие абсолютные пути публичных ресурсов
  out = out
    .replace(/"(\/logo\.jpg)"/g, `"${BASE}$1"`)
    .replace(/"(\/manifest\.json)"/g, `"${BASE}$1"`)
    .replace(/'(\/sw\.js)'/g, `'${BASE}$1'`)
    .replace(/"(\/privacy)"/g, `"${BASE}$1"`)
    .replace(/"(\/login)"/g, `"${BASE}$1"`);

  // 3. start_url в манифесте
  out = out.replace(/"start_url": "\/"/, `"start_url": "${BASE}/"`);
  // 4. PRECACHE в service worker
  out = out.replace(
    /\[\/index\.html, \/manifest\.json, \/logo\.jpg\]/g,
    `[${BASE}/index.html, ${BASE}/manifest.json, ${BASE}/logo.jpg]`
  );

  if (out !== src) {
    writeFileSync(f, out);
    const n = (src.match(/\/images\/|\/logo\.jpg|\/sw\.js|\/manifest\.json|\/privacy|\/login/g) || []).length;
    total += n;
    console.log('patched:', f);
  }
}
console.log('total refs patched:', total);
