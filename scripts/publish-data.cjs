/*
 * Публикация данных из админки.
 *
 * Владелец добавляет тренеров и тренировки в кабинете — они сохраняются
 * в localStorage его браузера и больше никому не видны. Кнопка
 * «Опубликовать» в админке скачивает published.json; этот скрипт кладёт
 * файл в src/data/ и переносит вставленные фото в public/images.
 *
 * Запуск: node scripts/publish-data.cjs путь/к/published.json
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TARGET = path.join(ROOT, 'src', 'data', 'published.json');
const IMAGES = path.join(ROOT, 'public', 'images', 'uploads');

const KEYS = ['trainers', 'trainings', 'events', 'news', 'testimonials', 'results', 'camps'];

/** Фото, загруженное через админку, лежит в JSON как data URL — раздувает бандл */
function isDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:image/');
}

/** Сохраняет data URL в файл и возвращает путь для сайта */
function saveDataUrl(dataUrl, name) {
  const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) return null;

  const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
  fs.mkdirSync(IMAGES, { recursive: true });

  const safe = name.replace(/[^\w-]+/g, '-').toLowerCase() || 'photo';
  const file = `${safe}.${ext}`;
  fs.writeFileSync(path.join(IMAGES, file), Buffer.from(match[2], 'base64'));

  return `/images/uploads/${file}`;
}

function extractImages(item, id) {
  const next = { ...item };
  for (const [key, value] of Object.entries(next)) {
    if (isDataUrl(value)) {
      next[key] = saveDataUrl(value, `${id}-${key}`) ?? value;
    } else if (Array.isArray(value) && value.some(isDataUrl)) {
      next[key] = value.map((v, i) =>
        isDataUrl(v) ? (saveDataUrl(v, `${id}-${key}-${i}`) ?? v) : v
      );
    }
  }
  return next;
}

const input = process.argv[2];
if (!input) {
  console.error('Укажите путь к файлу: node scripts/publish-data.cjs ~/Downloads/published.json');
  process.exit(1);
}

const source = path.resolve(input.replace(/^~/, process.env.HOME));
if (!fs.existsSync(source)) {
  console.error(`Файл не найден: ${source}`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(source, 'utf8'));
} catch (err) {
  console.error(`Не удалось прочитать JSON: ${err.message}`);
  process.exit(1);
}

const result = { updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString() };
let total = 0;
let images = 0;

for (const key of KEYS) {
  const list = Array.isArray(data[key]) ? data[key] : [];
  result[key] = list.map((item) => {
    const before = JSON.stringify(item);
    const after = extractImages(item, item.id || key);
    if (JSON.stringify(after) !== before) images += 1;
    return after;
  });
  total += list.length;
}

fs.writeFileSync(TARGET, `${JSON.stringify(result, null, 2)}\n`, 'utf8');

console.log(`Опубликовано записей: ${total}`);
console.log(`Фото перенесено в public/images/uploads: ${images}`);
for (const key of KEYS) {
  if (result[key].length) console.log(`  ${key}: ${result[key].length}`);
}
console.log(`\nЗаписано в ${path.relative(ROOT, TARGET)}`);
console.log('Дальше: npm run build && npm run prerender, затем git push');
