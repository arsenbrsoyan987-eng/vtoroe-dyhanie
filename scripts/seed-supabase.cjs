/*
 * Переносит данные из файлов src/data/*.json в Supabase.
 *
 * Расписание, новости, кэмпы и фото тренировок сохраняются сразу
 * в базу: записи спортсменов ссылаются на id тренировки,
 * а тренер видит только свои занятия (RLS). Скрипт нужен при
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

const root = path.join(__dirname, '..');

/** Читаем JSON из src/data */
function readJson(name) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', name), 'utf8'));
  } catch {
    console.log(`${name}: файл не найден, пропускаем`);
    return null;
  }
}

const published = readJson('published.json');
const directions = readJson('directions.json');

// --- trainings ---
const trainingRows = (Array.isArray(published?.trainings) ? published.trainings : []).map((t) => ({
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

// --- news ---
const newsRows = (Array.isArray(published?.news) ? published.news : []).map((n) => ({
  id: n.id,
  title: n.title,
  summary: n.summary || '',
  content: n.content || '',
  date: (n.date || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
  category: n.category || 'Школа',
  image: n.image || '',
  author_name: n.authorName || '',
}));

// --- camps ---
const campRows = (Array.isArray(published?.camps) ? published.camps : []).map((c) => ({
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

// --- trainers ---
const trainerRows = (Array.isArray(published?.trainers) ? published.trainers : []).map((t) => ({
  id: t.id,
  name: t.name || '',
  photo: t.photo || '',
  specialization: t.specialization || '',
  experience: t.experience || '',
  biography: t.biography || '',
  directions: Array.isArray(t.directions) ? t.directions : [],
  certifications: Array.isArray(t.certifications) ? t.certifications : [],
  phone: t.phone || '',
  email: t.email || '',
}));

// --- events ---
const eventRows = (Array.isArray(published?.events) ? published.events : []).map((e) => ({
  id: e.id,
  name: e.name || '',
  category: e.category || 'competition',
  date: (e.date || '').slice(0, 10),
  time: e.time || '',
  location: e.location || '',
  description: e.description || '',
  full_description: e.fullDescription || '',
  images: Array.isArray(e.images) ? e.images : [],
  registration_open: e.registrationOpen !== false,
  registration_deadline: e.registrationDeadline ? e.registrationDeadline.slice(0, 10) : null,
  price: e.price || '',
  requirements: Array.isArray(e.requirements) ? e.requirements : [],
}));

// --- testimonials ---
const testimonialRows = (Array.isArray(published?.testimonials) ? published.testimonials : []).map((t) => ({
  id: t.id,
  name: t.name || '',
  photo: t.photo || '',
  text: t.text || '',
  achievement: t.achievement || '',
  direction: t.direction || '',
}));

// --- sport_results ---
const sportResultRows = (Array.isArray(published?.results) ? published.results : []).map((r) => ({
  id: r.id,
  athlete_name: r.athleteName || '',
  event: r.event || '',
  date: (r.date || '').slice(0, 10),
  discipline: r.discipline || '',
  result: r.result || '',
  place: r.place || '',
  protocol_url: r.protocolUrl || '',
}));

// --- directions ---
const directionRows = (Array.isArray(directions) ? directions : []).map((d, i) => ({
  id: d.id,
  name: d.name || '',
  name_short: d.nameShort || d.name || '',
  description: d.description || '',
  full_description: d.fullDescription || '',
  icon: d.icon || '🏃',
  image_url: d.imageUrl || '',
  suitable_for: Array.isArray(d.suitableFor) ? d.suitableFor : [],
  required_equipment: Array.isArray(d.requiredEquipment) ? d.requiredEquipment : [],
  level: d.level || 'Все уровни',
  sort_order: i,
}));

// --- routes ---
const routeRows = (Array.isArray(readJson('routes.json')) ? readJson('routes.json') : []).map(
  (r, i) => ({
    id: r.id,
    name: r.name || '',
    type: r.type || 'running',
    image: r.image || '',
    distance: r.distance || '',
    elevation: r.elevation || '',
    duration: r.duration || '',
    difficulty: r.difficulty || 'easy',
    description: r.description || '',
    start_point: r.startPoint || '',
    map_url: r.mapUrl || '',
    gpx_url: r.gpxUrl || '',
    sort_order: i,
  })
);

// --- site_settings ---
/**
 * club.json — уже есть как JSON, поэтому парсим напрямую:
 * вложенный объект owner и массив phones не ломают парсер.
 */
const clubData = readJson('club.json');
let siteSettingsRows = [];
if (clubData) {
  const c = clubData;
  siteSettingsRows = [
    { key: 'siteName', value: c.name || '' },
    { key: 'siteTitle', value: '' },  // пусто — подставится fallback из кода
    { key: 'siteDescription', value: '' },
    { key: 'heroTitle', value: '' },
    { key: 'heroSubtitle', value: '' },
    { key: 'aboutTitle', value: '' },
    { key: 'aboutSubtitle', value: '' },
    { key: 'ctaTitle', value: '' },
    { key: 'ctaSubtitle', value: '' },
    { key: 'fullName', value: c.fullName || '' },
    { key: 'city', value: c.city || '' },
    { key: 'phones', value: Array.isArray(c.phones) ? c.phones.join('\n') : '' },
    { key: 'email', value: c.email || '' },
    { key: 'telegram', value: c.telegram || '' },
    { key: 'telegramLabel', value: c.telegramLabel || '' },
    { key: 'addressNote', value: c.addressNote || '' },
    { key: 'ownerName', value: c.owner?.name || '' },
    { key: 'ownerRole', value: c.owner?.role || '' },
    { key: 'ownerEmail', value: c.owner?.email || '' },
    { key: 'ownerPhone', value: c.owner?.phone || '' },
  ];
} else {
  console.log('site_settings: club.json не найден — пропустим');
}

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
  await upsert('trainers', trainerRows);
  await upsert('events', eventRows);
  await upsert('testimonials', testimonialRows);
  await upsert('sport_results', sportResultRows);
  await upsert('directions', directionRows);
  await upsert('routes', routeRows);
  // site_settings использует уникальный ключ, поэтому не нужно on_conflict
  if (siteSettingsRows.length > 0) {
    const res = await fetch(`${URL_BASE}/rest/v1/site_settings`, {
      method: 'POST',
      headers: {
        apikey: SECRET,
        Authorization: `Bearer ${SECRET}`,
        'Content-Type': 'application/json',
        'On-Conflict': 'key',
      },
      body: JSON.stringify(siteSettingsRows),
    });
    if (res.ok) {
      console.log(`site_settings: вставлено ${siteSettingsRows.length}`);
    } else {
      console.error(`site_settings: ошибка ${res.status} — ${await res.text()}`);
      process.exitCode = 1;
    }
  }
})();
