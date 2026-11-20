/*
 * Разовая миграция классов кабинета на светлую палитру витрины.
 * Скрипт держим в репозитории, чтобы правки были воспроизводимы и проверяемы:
 * после прогона смотрим git diff, собираем проект и снимаем скриншоты.
 *
 * Запуск: node scripts/migrate-cabinet-classes.cjs
 */
const fs = require('fs');
const path = require('path');

const DIR = path.resolve(__dirname, '..', 'src', 'pages', 'cabinet');

/** Пары, которые нельзя разбирать по одному классу: сначала контекст */
const PAIRS = [
  // Кнопки и активные состояния: белый текст остаётся белым на красном
  [/bg-accent-red(\/[0-9]+)? text-white/g, (m, a) => `bg-brand${a || ''} text-white`],
  [/hover:bg-accent-red-hover/g, 'hover:bg-brand-dark'],
  [/hover:bg-accent-blue-hover/g, 'hover:bg-navy-soft'],
  // Модальные подложки остаются тёмными
  [/bg-black\/70/g, 'bg-ink/70'],
  [/bg-black\/60/g, 'bg-ink/60'],
];

const MAP = [
  // Поверхности
  [/\bbg-surface\/95\b/g, 'bg-paper/95'],
  [/\bbg-surface\/60\b/g, 'bg-mist'],
  [/\bbg-surface\/50\b/g, 'bg-mist'],
  [/\bbg-surface\b/g, 'bg-paper'],
  [/\bbg-primary\/50\b/g, 'bg-mist/60'],
  [/\bbg-primary\b/g, 'bg-mist'],
  [/\bbg-black\/30\b/g, 'bg-mist'],
  [/\bbg-white\/5\b/g, 'bg-mist'],
  [/\bbg-white\/10\b/g, 'bg-line'],
  [/\bbg-white\/20\b/g, 'bg-line'],
  [/\bhover:bg-white\/5\b/g, 'hover:bg-mist'],
  [/\bhover:bg-white\/10\b/g, 'hover:bg-line'],
  [/\bhover:bg-white\/20\b/g, 'hover:bg-line'],
  [/\bhover:bg-gray-100\b/g, 'hover:bg-mist'],
  [/\bbg-gray-600\b/g, 'bg-graphite'],

  // Границы
  [/\bborder-white\/20\b/g, 'border-line'],
  [/\bborder-white\/10\b/g, 'border-line'],
  [/\bborder-white\/5\b/g, 'border-line'],
  [/\bhover:border-white\/40\b/g, 'hover:border-ink/25'],
  [/\bhover:border-white\/20\b/g, 'hover:border-ink/25'],
  [/\bhover:border-white\/10\b/g, 'hover:border-line'],

  // Текст
  [/\btext-white\b/g, 'text-ink'],
  [/\btext-gray-300\b/g, 'text-ink/80'],
  [/\btext-gray-400\b/g, 'text-graphite'],
  [/\btext-gray-500\b/g, 'text-graphite'],
  [/\btext-gray-600\b/g, 'text-graphite/70'],
  [/\bhover:text-white\b/g, 'hover:text-ink'],
  [/\bhover:text-gray-300\b/g, 'hover:text-ink/80'],
  [/\bplaceholder:text-gray-600\b/g, 'placeholder-graphite/60'],

  // Акценты
  [/\btext-accent-red\b/g, 'text-brand'],
  [/\btext-accent-blue\b/g, 'text-navy'],
  [/\bbg-accent-red\b/g, 'bg-brand'],
  [/\bbg-accent-blue\b/g, 'bg-navy'],
  [/\bborder-accent-red\/30\b/g, 'border-brand/30'],
  [/\bborder-accent-red\b/g, 'border-brand'],
  [/\bborder-accent-blue\/30\b/g, 'border-navy/30'],
  [/\bfocus:border-accent-red\b/g, 'focus:border-brand'],
  [/\bfocus:ring-accent-red\b/g, 'focus:ring-brand'],
  [/\bfocus:ring-accent-blue\b/g, 'focus:ring-navy'],
  [/\bgroup-hover:text-accent-red\b/g, 'group-hover:text-brand'],
  [/\bgroup-hover:text-accent-blue\b/g, 'group-hover:text-navy'],
  [/\bhover:text-accent-red\b/g, 'hover:text-brand'],
  [/\bhover:text-accent-blue\b/g, 'hover:text-navy'],

  // Смысловые статусы: на белом нужны тёмные оттенки
  [/\btext-green-400\b/g, 'text-emerald-700'],
  [/\btext-green-300\b/g, 'text-emerald-700'],
  [/\btext-green-500\b/g, 'text-emerald-600'],
  [/\btext-green-200\/70\b/g, 'text-emerald-700/70'],
  [/\btext-green-200\b/g, 'text-emerald-800'],
  [/\btext-green-100\b/g, 'text-emerald-800'],
  [/\bhover:text-green-300\b/g, 'hover:text-emerald-600'],
  [/\bhover:text-green-100\b/g, 'hover:text-emerald-900'],
  [/\bbg-green-500\/20\b/g, 'bg-emerald-500/10'],
  [/\bbg-green-500\/15\b/g, 'bg-emerald-500/10'],
  [/\bbg-green-500\/30\b/g, 'bg-emerald-500/20'],
  [/\bbg-green-500\/10\b/g, 'bg-emerald-500/10'],
  [/\bborder-green-500\/30\b/g, 'border-emerald-500/30'],
  [/\bhover:bg-green-500\/30\b/g, 'hover:bg-emerald-500/20'],
  [/\bhover:bg-green-500\/20\b/g, 'hover:bg-emerald-500/20'],

  [/\btext-yellow-400\b/g, 'text-amber-700'],
  [/\btext-yellow-300\b/g, 'text-amber-700'],
  [/\btext-yellow-200\b/g, 'text-amber-800'],
  [/\bbg-yellow-500\/20\b/g, 'bg-amber-500/15'],
  [/\bbg-yellow-500\/15\b/g, 'bg-amber-500/15'],
  [/\bbg-yellow-500\/10\b/g, 'bg-amber-500/10'],
  [/\bborder-yellow-500\/30\b/g, 'border-amber-500/40'],
  [/\bhover:bg-yellow-500\/30\b/g, 'hover:bg-amber-500/25'],

  [/\btext-red-400\b/g, 'text-brand'],
  [/\btext-red-300\b/g, 'text-brand'],
  [/\bhover:text-red-400\b/g, 'hover:text-brand'],
  [/\bhover:text-red-300\b/g, 'hover:text-brand-dark'],
  [/\bbg-red-500\/30\b/g, 'bg-brand/15'],
  [/\bbg-red-500\/20\b/g, 'bg-brand/10'],
  [/\bbg-red-500\/15\b/g, 'bg-brand/10'],
  [/\bborder-red-500\/30\b/g, 'border-brand/30'],
  [/\bhover:bg-red-500\/30\b/g, 'hover:bg-brand/20'],
  [/\bhover:bg-red-500\/15\b/g, 'hover:bg-brand/10'],

  [/\btext-blue-400\b/g, 'text-navy'],
  [/\btext-blue-300\b/g, 'text-navy'],
  [/\btext-blue-200\b/g, 'text-navy'],
  [/\bhover:text-blue-300\b/g, 'hover:text-navy'],
  [/\bbg-blue-500\/20\b/g, 'bg-navy/10'],
  [/\bbg-blue-500\/15\b/g, 'bg-navy/10'],
  [/\bbg-blue-500\/10\b/g, 'bg-navy/10'],
  [/\bbg-blue-500\/5\b/g, 'bg-navy/5'],
  [/\bborder-blue-500\/20\b/g, 'border-navy/20'],
  [/\bhover:bg-accent-blue\/20\b/g, 'hover:bg-navy/15'],

  [/\btext-purple-300\b/g, 'text-navy'],
  [/\bbg-purple-500\/15\b/g, 'bg-navy/10'],
  [/\btext-orange-400\b/g, 'text-amber-700'],
  [/\bbg-orange-500\/20\b/g, 'bg-amber-500/15'],
  [/\bbg-gray-500\/20\b/g, 'bg-mist'],
  [/\bbg-gray-500\/15\b/g, 'bg-mist'],

  // Радиусы и тени
  [/\brounded-sm\b/g, 'rounded-xl'],
  [/\bring-offset-black\b/g, 'ring-offset-paper'],
];

const SOLID_BG = /\bbg-(?:brand|brand-dark|navy|navy-soft|ink)(?![\w/-])/;

/**
 * Насыпная замена text-white → text-ink сделала часть надписей на цветных
 * кнопках нечитаемой. Второй проход возвращает белый текст там, где фон
 * остался насыщенным, и только там.
 */
function fixContrast(code) {
  return code.replace(/(['"`])([^'"`\n]*)\1/g, (whole, quote, body) => {
    if (!SOLID_BG.test(body) || !/\btext-ink\b/.test(body)) return whole;
    return quote + body.replace(/\btext-ink\b/g, 'text-white') + quote;
  });
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.tsx'));
let changed = 0;

for (const file of files) {
  const full = path.join(DIR, file);
  const before = fs.readFileSync(full, 'utf8');
  let after = before;

  for (const [re, to] of PAIRS) after = after.replace(re, to);
  for (const [re, to] of MAP) after = after.replace(re, to);
  after = fixContrast(after);

  if (after !== before) {
    fs.writeFileSync(full, after);
    changed += 1;
    console.log(`~ ${file}`);
  }
}

console.log(`\nФайлов изменено: ${changed} из ${files.length}`);
