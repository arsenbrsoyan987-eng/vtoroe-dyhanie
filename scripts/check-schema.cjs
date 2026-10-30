/*
 * Проверка supabase/schema.sql до вставки в SQL Editor.
 *
 * Ошибка в схеме откатывает ВСЮ транзакцию в Supabase: создаётся впечатление,
 * что «ничего не применилось», а причина — одна испорченная строка. Чаще всего
 * это долларовая кавычка: `$$` случайно становится одиночным `$`, и Postgres
 * читает функцию до конца файла.
 *
 * Что проверяем:
 *  1. Теги долларовых кавычек парные и не пустые.
 *  2. Внутри тега нет одиночного `$` в начале строки.
 *  3. У каждой таблицы/политики/функции есть завершающая точка с запятой.
 *  4. Файл читается как UTF-8 без символа замены (битая кодировка ломает
 *     русские имена политик).
 *
 * Запуск: node scripts/check-schema.cjs
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'supabase', 'schema.sql');

if (!fs.existsSync(FILE)) {
  console.error(`Нет файла ${path.relative(process.cwd(), FILE)}`);
  process.exit(1);
}

const raw = fs.readFileSync(FILE, 'utf8');
const problems = [];

if (raw.includes('\uFFFD')) {
  problems.push('В файле есть символ замены (U+FFFD): файл пересохранён в другой кодировке');
}

// 1. Долларовые кавычки
const tags = [...raw.matchAll(/\$[a-zA-Z_]*\$/g)].map((m) => m[0]);
const counts = new Map();
for (const tag of tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);

for (const [tag, count] of counts) {
  if (count % 2 !== 0) {
    problems.push(`Тег ${tag} встречается ${count} раз — должно быть чётное число`);
  }
}

// 2. Одиночный `$` на отдельной строке — почти всегда потерянная кавычка
const lines = raw.split('\n');
lines.forEach((line, index) => {
  if (/^\s*\$\s*;?\s*$/.test(line)) {
    problems.push(`Строка ${index + 1}: одиночный «$» вместо «$$» — ${line.trim()}`);
  }
});

// 3. Непустые тела функций
const emptyBody = /as\s+\$[a-zA-Z_]*\$\s*\$[a-zA-Z_]*\$/g;
if (emptyBody.test(raw)) {
  problems.push('Найдена функция с пустым телом');
}

// 4. Каждый оператор заканчивается точкой с запятой
const STATEMENT = /^(create|alter|drop|insert|update|delete|do|grant|revoke)\b/i;
let insideBody = null;

lines.forEach((line, index) => {
  const trimmed = line.trim();

  // Внутри тела функции/DO-блока проверять точки с запятой не нужно
  if (insideBody) {
    if (new RegExp(`^\\${insideBody}$`).test(trimmed) || trimmed.endsWith(insideBody)) {
      insideBody = null;
    }
    return;
  }

  const tag = trimmed.match(/\$[a-zA-Z_]*\$$/);
  if (tag && /^as\s|^do\s/.test(trimmed)) {
    // Однострочное тело ($$ ... $$;) закрывается в той же строке
    if ((trimmed.match(/\$[a-zA-Z_]*\$/g) ?? []).length === 1) insideBody = tag[0];
    return;
  }

  if (!STATEMENT.test(trimmed)) return;
  // Оператор может занимать несколько строк — проверяем, что где-то ниже есть `;`
  const rest = lines.slice(index).join('\n');
  const stop = rest.search(/;\s*(\n|$)/);
  if (stop === -1) {
    problems.push(`Строка ${index + 1}: оператор без завершающей «;» — ${trimmed.slice(0, 60)}`);
  }
});

const policies = (raw.match(/create policy/gi) ?? []).length;
const tables = (raw.match(/create table if not exists/gi) ?? []).length;
const functions = (raw.match(/create or replace function/gi) ?? []).length;

if (problems.length > 0) {
  console.error('Схема содержит ошибки — SQL Editor откатит весь скрипт:\n');
  problems.forEach((p) => console.error(`  ! ${p}`));
  process.exit(1);
}

console.log(
  `Схема в порядке: ${tables} таблиц, ${functions} функций, ${policies} политик, ` +
    `${path.relative(process.cwd(), FILE)} (${(raw.length / 1024).toFixed(1)} КБ).`
);
