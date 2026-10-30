/*
 * Переносит данные из src/data/published.json в Supabase.
 *
 * Расписание и новости переехали в базу: записи спортсменов ссылаются на id
 * тренировки, а тренер видит только свои занятия (RLS). Скрипт нужен при
 * переходе и потом — если данные правили файлом, а не через админку.
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

const trainingRows = (Array.isArray(data.trainings) ? data.trainings : []).map((t) => ({
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

const newsRows = (Array.isArray(data.news) ? data.news : []).map((n) => ({
  id: n.id,
  title: n.title,
  summary: n.summary || '',
  content: n.content || '',
  date: (n.date || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
  category: n.category || 'Клуб',
  image: n.image || '',
  author_name: n.authorName || '',
}));

const campRows = (Array.isArray(data.camps) ? data.camps : []).map((c) => ({
  id: c.id,
  name: c.name,
  location: c.location || '',
  start_date: (c.startDate || '').slice(0, 10),
  end_date: c.endDate ? c.endDate.slice(0, 10) : null,
  description: c.description || '',
  full_description: c.fullDescription || '',
  price: c.price || '',
  program: Array.isArray(c.program) ? c.program : [],
  includes: Array.isArray(c.includes) ? c.includes : [],
  image: c.image || '',
  images: Array.isArray(c.images) ? c.images : [],
  registration_open: c.registrationOpen !== false,
  contact: c.contact || '',
  published: c.published !== false,
}));

/** Вставляет строки пачками: PostgREST не любит гигантские тела запросов */
async function upsert(table, rows) {
  if (rows.length === 0) {
    console.log(`${table}: нечего переносить`);
    return;
  }

  const res = await fetch(`${URL_BASE}/rest/v1/${table}?on_conflict=id`, {
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
    console.error(`${table}: ошибка ${res.status} — ${await res.text()}`);
    process.exitCode = 1;
    return;
  }

  console.log(`${table}: перенесено ${rows.length}`);
}

(async () => {
  await upsert('trainings', trainingRows);
  await upsert('news', newsRows);
  await upsert('camps', campRows);
})();