/*
 * Генерация векторных заглушек для карточек и фонов.
 *
 * Раньше это были тёмные прямоугольники с эмодзи и подписью внутри SVG.
 * Подпись дублировала текст из разметки (на главной поверх героя читалось
 * «Второе дыхание» дважды), а эмодзи в системном шрифте рендерится по-разному
 * на каждой платформе. Здесь — только геометрия: цвет и силуэт направления,
 * текст остаётся в HTML, где его видят и поисковики, и скринридеры.
 *
 * Запуск: node scripts/make-placeholders.cjs
 */
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, '..', 'public', 'images');

/** Координаты с одним знаком после запятой: иначе в SVG уезжает 448.00000000000006 */
const n = (v) => Math.round(v * 10) / 10;

/**
 * Общая обёртка: градиентный фон, мягкая подсветка акцентным цветом
 * и слой фигур. Без подсветки тонкие линии на почти чёрном фоне
 * не видны — карточки выглядят пустыми.
 */
function svg(w, h, id, from, to, body, accent = '#ffffff') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
    <radialGradient id="${id}-glow" cx="0.5" cy="0.42" r="0.62">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.3"/>
      <stop offset="0.55" stop-color="${accent}" stop-opacity="0.09"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#${id})"/>
  <rect width="${w}" height="${h}" fill="url(#${id}-glow)"/>
${body}
</svg>
`;
}

/** Горы: два силуэта с разной прозрачностью */
function mountains(w, h, color) {
  const base = h * 0.78;
  const p1 = `M${w * 0.05} ${base} L${w * 0.3} ${h * 0.32} L${w * 0.46} ${base} Z`;
  const p2 = `M${w * 0.34} ${base} L${w * 0.62} ${h * 0.2} L${w * 0.95} ${base} Z`;
  return `  <path d="${p1}" fill="${color}" opacity="0.16"/>
  <path d="${p2}" fill="${color}" opacity="0.28"/>
  <path d="M${w * 0.62} ${h * 0.2} L${w * 0.72} ${h * 0.36} L${w * 0.52} ${h * 0.36} Z" fill="#ffffff" opacity="0.18"/>`;
}

/** Беговая дорожка: сходящиеся линии с разметкой */
function track(w, h, color) {
  const horizon = h * 0.42;
  return `  <path d="M0 ${n(h)} L${n(w * 0.44)} ${n(horizon)} M${n(w)} ${n(h)} L${n(w * 0.56)} ${n(horizon)}" stroke="${color}" stroke-width="3" opacity="0.35"/>
  <path d="M${n(w * 0.1)} ${n(h * 0.92)} L${n(w * 0.47)} ${n(horizon)} M${n(w * 0.9)} ${n(h * 0.92)} L${n(w * 0.53)} ${n(horizon)}" stroke="${color}" stroke-width="2" opacity="0.2"/>
  <path d="M${n(w * 0.5)} ${n(h * 0.55)} L${n(w * 0.5)} ${n(h * 0.62)}" stroke="#ffffff" stroke-width="4" opacity="0.25"/>
  <path d="M${n(w * 0.5)} ${n(h * 0.7)} L${n(w * 0.5)} ${n(h * 0.8)}" stroke="#ffffff" stroke-width="6" opacity="0.22"/>
  <path d="M${n(w * 0.5)} ${n(h * 0.88)} L${n(w * 0.5)} ${n(h)}" stroke="#ffffff" stroke-width="8" opacity="0.18"/>`;
}

/** Велосипед: два колеса и рама */
function wheels(w, h, color) {
  const cy = h * 0.58;
  const r = h * 0.17;
  const lx = w * 0.36;
  const rx = w * 0.64;
  return `  <circle cx="${lx}" cy="${cy}" r="${r}" stroke="${color}" stroke-width="3" opacity="0.3"/>
  <circle cx="${rx}" cy="${cy}" r="${r}" stroke="${color}" stroke-width="3" opacity="0.3"/>
  <path d="M${lx} ${cy} L${w * 0.5} ${h * 0.3} L${rx} ${cy} L${w * 0.46} ${cy} Z" stroke="${color}" stroke-width="3" opacity="0.22"/>
  <path d="M${w * 0.5} ${h * 0.3} L${w * 0.54} ${h * 0.22}" stroke="${color}" stroke-width="3" opacity="0.22"/>`;
}

/** Походы: ели и тропа */
function trees(w, h, color) {
  const tree = (x, scale) => {
    const top = h * 0.9 - 120 * scale;
    return `<path d="M${x} ${top} L${x + 26 * scale} ${top + 70 * scale} L${x - 26 * scale} ${top + 70 * scale} Z" fill="${color}" opacity="0.2"/>
  <path d="M${x} ${top + 30 * scale} L${x + 34 * scale} ${top + 110 * scale} L${x - 34 * scale} ${top + 110 * scale} Z" fill="${color}" opacity="0.26"/>
  <rect x="${x - 4 * scale}" y="${top + 108 * scale}" width="${8 * scale}" height="${14 * scale}" fill="${color}" opacity="0.3"/>`;
  };
  return `${tree(w * 0.24, 1)}
${tree(w * 0.52, 1.25)}
${tree(w * 0.78, 0.9)}
  <path d="M${w * 0.12} ${h * 0.95} Q${w * 0.4} ${h * 0.8} ${w * 0.6} ${h * 0.95}" stroke="#ffffff" stroke-width="2" opacity="0.12"/>`;
}

/** Функциональная подготовка: сетка и шестиугольник */
function grid(w, h, color) {
  const step = w / 8;
  let lines = '';
  for (let x = step; x < w; x += step) {
    lines += `  <path d="M${x} 0 L${x} ${h}" stroke="${color}" stroke-width="1" opacity="0.12"/>\n`;
  }
  for (let y = step; y < h; y += step) {
    lines += `  <path d="M0 ${y} L${w} ${y}" stroke="${color}" stroke-width="1" opacity="0.12"/>\n`;
  }
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.22;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return `${lines}  <polygon points="${pts}" stroke="${color}" stroke-width="3" opacity="0.3"/>`;
}

/** Маршрут: ломаная с точками */
function trail(w, h, color) {
  const d = `M${w * 0.08} ${h * 0.82} L${w * 0.28} ${h * 0.55} L${w * 0.46} ${h * 0.7} L${w * 0.66} ${h * 0.32} L${w * 0.9} ${h * 0.46}`;
  const dots = [
    [0.08, 0.82],
    [0.46, 0.7],
    [0.9, 0.46],
  ]
    .map(
      ([x, y]) =>
        `  <circle cx="${w * x}" cy="${h * y}" r="6" fill="#ffffff" opacity="0.5"/>`,
    )
    .join('\n');
  return `  <path d="${d}" stroke="${color}" stroke-width="3" stroke-dasharray="10 8" opacity="0.4"/>
${dots}`;
}

/** Аватар: нейтральный силуэт вместо пустого прямоугольника */
function avatar(w, h, color) {
  const cx = w / 2;
  return `  <circle cx="${cx}" cy="${h * 0.38}" r="${h * 0.14}" fill="${color}" opacity="0.28"/>
  <path d="M${cx - w * 0.2} ${h * 0.78} a${w * 0.2} ${h * 0.2} 0 0 1 ${w * 0.4} 0 Z" fill="${color}" opacity="0.28"/>
  <circle cx="${cx}" cy="${h * 0.5}" r="${h * 0.42}" stroke="${color}" stroke-width="2" opacity="0.14"/>`;
}

/** Событие: календарная сетка */
function calendar(w, h, color) {
  const x = w * 0.28;
  const y = h * 0.22;
  const cw = w * 0.44;
  const ch = h * 0.52;
  let cells = '';
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      cells += `  <rect x="${x + 12 + i * (cw / 3)}" y="${y + 44 + j * (ch / 4)}" width="${cw / 3 - 14}" height="${ch / 4 - 12}" rx="3" fill="${color}" opacity="0.18"/>\n`;
    }
  }
  return `  <rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="8" stroke="${color}" stroke-width="3" opacity="0.3"/>
  <path d="M${x} ${y + 30} L${x + cw} ${y + 30}" stroke="${color}" stroke-width="3" opacity="0.3"/>
${cells}`;
}

/** Новость: строки текста */
function article(w, h, color) {
  const x = w * 0.2;
  const widths = [0.6, 0.55, 0.6, 0.4];
  return widths
    .map(
      (k, i) =>
        `  <rect x="${x}" y="${h * 0.3 + i * h * 0.11}" width="${w * k}" height="${h * 0.045}" rx="3" fill="${color}" opacity="${0.28 - i * 0.04}"/>`,
    )
    .join('\n');
}

/** Тренировка: пульс */
function pulse(w, h, color) {
  const mid = h / 2;
  const d = `M${w * 0.06} ${mid} L${w * 0.28} ${mid} L${w * 0.36} ${mid - h * 0.18} L${w * 0.46} ${mid + h * 0.2} L${w * 0.56} ${mid - h * 0.1} L${w * 0.64} ${mid} L${w * 0.94} ${mid}`;
  return `  <path d="${d}" stroke="${color}" stroke-width="4" stroke-linejoin="round" opacity="0.38"/>`;
}

/** Герой: абстрактный фон без текста, поверх ложится H1 */
function heroBg(w, h) {
  let diagonals = '';
  for (let i = -2; i < 12; i++) {
    const x = (w / 10) * i;
    diagonals += `  <path d="M${x} ${h} L${x + w * 0.45} 0" stroke="#ffffff" stroke-width="1" opacity="0.05"/>\n`;
  }
  return `  <defs>
    <radialGradient id="glow-red" cx="0.28" cy="0.3" r="0.6">
      <stop offset="0" stop-color="#dc2626" stop-opacity="0.42"/>
      <stop offset="1" stop-color="#dc2626" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow-blue" cx="0.78" cy="0.78" r="0.55">
      <stop offset="0" stop-color="#2563eb" stop-opacity="0.3"/>
      <stop offset="1" stop-color="#2563eb" stop-opacity="0"/>
    </radialGradient>
  </defs>
${diagonals}  <rect width="${w}" height="${h}" fill="url(#glow-red)"/>
  <rect width="${w}" height="${h}" fill="url(#glow-blue)"/>
  <path d="M0 ${h * 0.86} Q${w * 0.3} ${h * 0.7} ${w * 0.55} ${h * 0.84} T${w} ${h * 0.78}" stroke="#ffffff" stroke-width="2" opacity="0.1"/>`;
}

const files = {
  'hero.svg': () => svg(1920, 1080, 'g', '#1a0a0a', '#0a0a0a', heroBg(1920, 1080), '#dc2626'),
  'about.svg': () => svg(800, 600, 'g', '#0f1a24', '#0a0a0a', grid(800, 600, '#2dd4bf'), '#14b8a6'),
  'cta.svg': () => svg(1920, 800, 'g', '#1a0a0a', '#0a0a0a', heroBg(1920, 800), '#dc2626'),
  'running.svg': () => svg(800, 600, 'g', '#0a1a0f', '#0a0a0a', track(800, 600, '#34d399'), '#22c55e'),
  'trail.svg': () => svg(800, 600, 'g', '#0a1020', '#0a0a0a', mountains(800, 600, '#60a5fa'), '#3b82f6'),
  'cycling.svg': () => svg(800, 600, 'g', '#1a160a', '#0a0a0a', wheels(800, 600, '#facc15'), '#eab308'),
  'hiking.svg': () => svg(800, 600, 'g', '#140a1a', '#0a0a0a', trees(800, 600, '#c084fc'), '#a855f7'),
  'functional.svg': () => svg(800, 600, 'g', '#1a0f0a', '#0a0a0a', grid(800, 600, '#fb923c'), '#f97316'),
  'route.svg': () => svg(600, 400, 'g', '#1a140a', '#0a0a0a', trail(600, 400, '#fcd34d'), '#fbbf24'),
  'event.svg': () => svg(800, 500, 'g', '#1a0a14', '#0a0a0a', calendar(800, 500, '#f9a8d4'), '#f472b6'),
  'news.svg': () => svg(600, 400, 'g', '#0a1a14', '#0a0a0a', article(600, 400, '#86efac'), '#4ade80'),
  'training.svg': () => svg(600, 400, 'g', '#1a0a0a', '#0a0a0a', pulse(600, 400, '#fca5a5'), '#f87171'),
  'trainer.svg': () => svg(400, 400, 'g', '#0f1420', '#0a0a0a', avatar(400, 400, '#93c5fd'), '#60a5fa'),
  'testimonial.svg': () => svg(150, 150, 'g', '#0f1420', '#0a0a0a', avatar(150, 150, '#93c5fd'), '#60a5fa'),
};

for (const [name, make] of Object.entries(files)) {
  const file = path.join(OUT, name);
  // Хвосты вида 448.00000000000006 в атрибутах путей никто не читает,
  // но они раздувают файл и выглядят как ошибка генератора.
  const markup = make().replace(/\d+\.\d{5,}/g, (m) => String(Math.round(Number(m) * 10) / 10));
  fs.writeFileSync(file, markup, 'utf8');
  const size = fs.statSync(file).size;
  console.log(`${name} — ${(size / 1024).toFixed(1)} КБ`);
}
