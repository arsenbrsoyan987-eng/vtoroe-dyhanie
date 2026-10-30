/*
 * Публикация правок из админки одной командой.
 *
 * Владелец нажимает в кабинете «Опубликовать» — браузер скачивает
 * published.json в папку «Загрузки». Этот скрипт забирает файл, переносит
 * данные и фото в проект, пересобирает сайт, пререндерит страницы и пушит
 * в main: GitHub Actions публикует обновление, и правки видят все.
 *
 * Запуск: npm run publish
 *         npm run publish -- путь/к/published.json
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_SOURCE = path.join(process.env.HOME || '', 'Downloads', 'published.json');

const GIT_AUTHOR = ['-c', 'user.name=Arsen Brsoyan', '-c', 'user.email=arsen.brsoyan987@gmail.com'];

function run(command, args, label) {
  process.stdout.write(`\n▸ ${label}\n`);
  execFileSync(command, args, { cwd: ROOT, stdio: 'inherit' });
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

/** Свежий файл важнее старого: если в «Загрузках» несколько копий, берём последнюю */
function pickSource() {
  const arg = process.argv[2];
  if (arg) return path.resolve(arg.replace(/^~/, process.env.HOME || ''));

  const dir = path.dirname(DEFAULT_SOURCE);
  if (!fs.existsSync(dir)) return DEFAULT_SOURCE;

  const candidates = fs
    .readdirSync(dir)
    .filter((name) => /^published.*\.json$/i.test(name))
    .map((name) => path.join(dir, name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  return candidates[0] ?? DEFAULT_SOURCE;
}

function fail(message) {
  console.error(`\n✖ ${message}`);
  process.exit(1);
}

/**
 * Сравнивает выгрузку с тем, что уже в репозитории, не считая отметку времени.
 * Проверяем ДО записи в проект: иначе повторный запуск оставлял бы
 * изменённый published.json и лишний коммит.
 */
function alreadyPublished(source) {
  let head;
  try {
    head = git(['show', 'HEAD:src/data/published.json']);
  } catch {
    return false;
  }

  const strip = (raw) => {
    try {
      const parsed = JSON.parse(raw);
      delete parsed.updatedAt;
      return JSON.stringify(parsed);
    } catch {
      return raw;
    }
  };

  try {
    return strip(head) === strip(fs.readFileSync(source, 'utf8'));
  } catch {
    return false;
  }
}

const source = pickSource();
if (!fs.existsSync(source)) {
  fail(
    `Не нашёл ${source}\n` +
      '  Откройте админку → «Опубликовать» и повторите, либо укажите путь:\n' +
      '  npm run publish -- ~/Downloads/published.json'
  );
}

console.log(`Источник: ${source}`);

if (alreadyPublished(source)) {
  console.log('\n✓ Эти данные уже на сайте — публиковать нечего.');
  process.exit(0);
}

run('node', ['scripts/publish-data.cjs', source], 'Переношу данные и фото в проект');
run('npm', ['run', 'build'], 'Собираю сайт');
run('npm', ['run', 'prerender'], 'Готовлю HTML для всех страниц');

const changed = git(['status', '--porcelain']);
if (!changed) {
  console.log('\n✓ На сайте уже эти данные — публиковать нечего.');
  process.exit(0);
}

const stamp = new Date().toLocaleString('ru-RU', { dateStyle: 'long', timeStyle: 'short' });
const message = `chore(data): публикация правок из админки\n\nВыгрузка ${stamp}.`;
const messageFile = path.join(ROOT, '.git', 'PUBLISH_MSG');
fs.writeFileSync(messageFile, `${message}\n`, 'utf8');

try {
  run('git', ['add', '-A'], 'Добавляю изменения в git');
  run('git', [...GIT_AUTHOR, 'commit', '-F', messageFile], 'Коммичу');
} finally {
  fs.rmSync(messageFile, { force: true });
}

run('git', ['push', 'origin', 'main'], 'Отправляю на GitHub');

console.log(
  '\n✓ Готово. GitHub Actions соберёт сайт за пару минут,\n' +
    '  правки появятся на https://vtoroe-dyhanie.ru для всех посетителей.'
);
