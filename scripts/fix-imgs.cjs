/* Одноразовый скрипт: заменяет внешние ссылки Unsplash на локальные SVG. */
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');

const MAP = {
  '1461896836934': '/images/hero.svg',
  '1552674605': '/images/running.svg',
  '1483728642387': '/images/trail.svg',
  '1541625602330': '/images/cycling.svg',
  '1551632811': '/images/hiking.svg',
  '1517963879433': '/images/functional.svg',
  '1528605248644': '/images/about.svg',
  '1571003123894': '/images/cta.svg',
  '1568602471124': '/images/trainer.svg',
  '1571019613454': '/images/trainer.svg',
  '1583454110551': '/images/trainer.svg',
  '1594381898411': '/images/trainer.svg',
  '1609899537878': '/images/trainer.svg',
  '1517836357463': '/images/trainer.svg',
  '1513593771559': '/images/event.svg',
  '1507003211169': '/images/testimonial.svg',
  '1494790108377': '/images/testimonial.svg',
  '1500648767791': '/images/testimonial.svg',
  '1476480862126': '/images/route.svg',
};

function walk(dir, acc = []) {
  const { readdirSync, statSync } = require('fs');
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(ts|tsx)$/.test(e)) acc.push(p);
  }
  return acc;
}

let total = 0;
for (const f of walk('./src')) {
  const src = readFileSync(f, 'utf8');
  const out = src.replace(
    /https:\/\/images\.unsplash\.com\/photo-([0-9a-z]+)/g,
    (m, id) => {
      const hit = MAP[id];
      if (!hit) {
        console.warn('NO MAP:', m);
        return m;
      }
      total++;
      return hit;
    }
  );
  if (out !== src) writeFileSync(f, out);
}
console.log('replaced:', total);
