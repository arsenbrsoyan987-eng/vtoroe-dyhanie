/*
 * Переносит расписание из src/data/published.json в таблицу public.trainings.
 *
 * Расписание переехало в базу: записи спортсменов ссылаются на id тренировки,
 * а тренер видит только свои занятия (RLS). Скрипт нужен один раз при переходе
 * и потом — если расписание правили файлом, а не через админку.
 *
 * Запуск:
 *   SUPABASE_URL=https://xxx.supabase.co SUPABASE_SECRET_KEY=sb_secret_... \
 *     node scripts/seed-supabase.cjs
 */
const fs = require('fs');
const path = require('path');

const URL_BASE = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SECRET = process.env.SUPABASE_SECRET_KEY || '';

if (!URL_BASE || !SECRET) {
  console.error(
    'Нужны переменные окружения SUPABASE_URL и SUPABASE_SECRET_KEY\n' +
      'Ключ берётся в Supabase → Project Settings → API Keys (secret).'
  );
  process.exit(1);
}

const file = path.join(__dirname, '..', 'src', 'data', 'published.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const trainings = Array.isArray(data.trainings) ? data.trainings : [];

if (trainings.length === 0) {
  console.log('В published.json нет тренировок — переносить нечего.');
  process.exit(0);
}

const rows = trainings.map((t) => ({
  id: t.id,
  name: t.name,
  direction_id: t.directionId || 'running',
  direction_name: t.directionName || '',
  date: (t.date || '').slice(0, 10),
  time: t.time || '00:00',
  location: t.location || '',
  trainer_id: t.trainerId || '',
  trainer_name: t.trainer || 'Не назначен',
  duration: t.duration || '60 мин',
  level: t.level || 'Все уровни',
  capacity: Number(t.spotsAvailable) || 12,
  description: t.description || '',
  equipment: Array.isArray(t.equipment) ? t.equipment : [],
  image: t.image || '',
}));

(async () => {
  const res = await fetch(`${URL_BASE}/rest/v1/trainings?on_conflict=id`, {
    method: 'POST',
    headers: {
      apikey: SECRET,
      Authorization: `Bearer ${SECRET}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    console.error(`Ошибка ${res.status}: ${await res.text()}`);
    process.exit(1);
  }

  console.log(`Перенесено тренировок: ${rows.length}`);
})();
