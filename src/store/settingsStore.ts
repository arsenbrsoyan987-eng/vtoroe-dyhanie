import { useSyncExternalStore } from 'react';
import { supabase } from '../lib/supabase';
import { CLUB } from '../data/club';
import { FALLBACK_TITLE, FALLBACK_DESCRIPTION, setSiteIdentity } from '../lib/seo';

/**
 * Настройки сайта: ключ → значение.
 *
 * Раньше названия школы, контакты и тексты секций были зашиты в коде
 * (club.ts, index.html, компоненты Hero/About/CTA). Любое изменение
 * требовало коммита и пересборки. Теперь администратор может править
 * всё из кабинета, и изменения видны сразу.
 */

/** Из CLUB настраиваются только текстовые поля: массивы и объект владельца — нет */
const CLUB_TEXT_KEYS = Object.keys(CLUB).filter(
  (k) => typeof CLUB[k as keyof typeof CLUB] === 'string'
) as (keyof typeof CLUB)[];

const EXTRA_KEYS = [
  'siteName',
  'siteTitle',
  'siteDescription',
  'heroTitle',
  'heroSubtitle',
  'aboutTitle',
  'aboutSubtitle',
  'aboutText1',
  'aboutText2',
  'ctaTitle',
  'ctaSubtitle',
  'phones',
  'ogImage',
  'favicon',
  'ownerName',
  'ownerRole',
  'ownerEmail',
  'ownerPhone',
] as const;

export type SettingKey = (typeof CLUB_TEXT_KEYS)[number] | (typeof EXTRA_KEYS)[number];

/** Все известные ключи — и те, что ещё не записаны в базу */
export const SETTING_KEYS: SettingKey[] = [...CLUB_TEXT_KEYS, ...EXTRA_KEYS];

interface SettingRow {
  key: string;
  value: string;
}

const COLUMNS = 'key,value';

/** Тексты блока «О школе» — их правит администратор, в коде это только отправная точка */
const ABOUT_TEXT_1 =
  '«Второе дыхание» — это спортивная школа, объединяющая людей, которые любят движение. Мы верим, что спорт — это не только результаты на соревнованиях, но и свобода, общение, преодоление себя и открытие новых горизонтов.';
const ABOUT_TEXT_2 =
  'Наша школа основана на принципах взаимной поддержки, постоянных тренировок и активного отдыха на природе. Мы бегаем по городским паркам и горным тропам, крутим педали по пригородным дорогам, ходим в походы и тренируемся функционально — в зале и на улице.';

function getDefaultValue(key: SettingKey): string {
  if (key === 'phones') return CLUB.phones.join('\n');
  if (CLUB_TEXT_KEYS.includes(key as keyof typeof CLUB)) {
    return CLUB[key as keyof typeof CLUB] as string;
  }
  if (key === 'siteName') return CLUB.name;
  if (key === 'siteTitle') return FALLBACK_TITLE;
  if (key === 'siteDescription') return FALLBACK_DESCRIPTION;
  if (key === 'heroTitle') return 'Второе дыхание — больше, чем спорт';
  if (key === 'heroSubtitle') return 'Бегаем, крутим педали, исследуем новые маршруты и становимся сильнее вместе';
  if (key === 'aboutTitle') return 'Движение — это жизнь';
  if (key === 'aboutSubtitle') return 'О школе';
  if (key === 'ctaTitle') return 'Стань частью нашей школы';
  if (key === 'ctaSubtitle') return 'Присоединяйся к тренировкам, находи новых друзей и достигай целей вместе с нами. Первое занятие — бесплатно.';
  if (key === 'aboutText1') return ABOUT_TEXT_1;
  if (key === 'aboutText2') return ABOUT_TEXT_2;
  if (key === 'ownerName') return CLUB.owner.name;
  if (key === 'ownerRole') return CLUB.owner.role;
  if (key === 'ownerEmail') return CLUB.owner.email;
  if (key === 'ownerPhone') return CLUB.owner.phone;
  if (key === 'ogImage') return '/og-image.jpg';
  if (key === 'favicon') return '/favicon.ico';
  return '';
}

const listeners = new Set<() => void>();
let cache: Record<string, string> | null = null;
let started = false;
let channel: ReturnType<typeof supabase.channel> | null = null;

function defaultMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const key of SETTING_KEYS) map[key] = getDefaultValue(key);
  return map;
}

function getCache(): Record<string, string> {
  if (!cache) cache = defaultMap();
  return cache;
}

function emit() {
  listeners.forEach((l) => l());
}

/**
 * Переносит название и SEO-тексты в lib/seo: метатеги строятся именно там,
 * а дублировать формулы заголовка в двух местах нельзя.
 */
function syncSeoFromSettings(values: Record<string, string>) {
  setSiteIdentity(
    values.siteName ?? CLUB.name,
    values.siteTitle ?? FALLBACK_TITLE,
    values.siteDescription ?? FALLBACK_DESCRIPTION
  );
}

/**
 * Читает настройки из базы. Ключ, которого в базе нет, остаётся со значением
 * из кода: иначе пустая таблица обнулила бы все тексты на сайте.
 */
export async function reloadSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('site_settings')
    .select(COLUMNS);

  if (error) throw error;
  cache = defaultMap();
  for (const row of (data as SettingRow[])) {
    cache[row.key] = row.value;
  }
  syncSeoFromSettings(cache);
  emit();
  return cache;
}

function ensureStarted() {
  if (started) return;
  started = true;

  void reloadSettings().catch(() => {
    /* нет сети — используем значения по умолчанию */
  });

  channel = supabase
    .channel('settings-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => {
      void reloadSettings().catch(() => {});
    })
    .subscribe();
}

function subscribe(listener: () => void) {
  ensureStarted();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSettings(): Record<string, string> {
  ensureStarted();
  return getCache();
}

export const settingsStore = {
  get: getSettings,
  getOne: (key: SettingKey): string => getCache()[key] ?? getDefaultValue(key),
  /**
   * `key` — первичный ключ таблицы, поэтому upsert сам решает, вставлять
   * строку или обновлять: отдельный фильтр здесь не нужен и ломал бы запрос.
   */
  update: async (key: SettingKey, value: string): Promise<void> => {
    const { error } = await supabase.from('site_settings').upsert({ key, value });
    if (error) throw error;
    await reloadSettings();
  },
  reset: () => {
    if (channel) supabase.removeChannel(channel);
    channel = null;
    started = false;
    cache = null;
    emit();
  },
};

export function useSettings(): Record<string, string> {
  return useSyncExternalStore(subscribe, getSettings, getSettings);
}

export function useSetting(key: SettingKey): string {
  const settings = useSettings();
  return settings[key] ?? getDefaultValue(key);
}

/**
 * Многострочное значение (телефоны) как список для `.map()`.
 *
 * Пустая строка в базе означает «списка нет» — тогда берём значение из кода,
 * иначе футер остался бы без контактов до первого сохранения в админке.
 */
export function useSettingList(key: SettingKey): string[] {
  const settings = useSettings();
  const raw = settings[key] ?? getDefaultValue(key);
  const items = raw.split('\n').map((s) => s.trim()).filter(Boolean);
  return items.length > 0 ? items : [];
}
