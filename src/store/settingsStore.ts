import { useSyncExternalStore } from 'react';
import { supabase } from '../lib/supabase';
import { CLUB } from '../data/club';
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION, STATIC_SEO, DIRECTION_SEO } from '../lib/seo';

/**
 * Настройки сайта: ключ → значение.
 *
 * Раньше названия школы, контакты и тексты секций были зашиты в коде
 * (club.ts, index.html, компоненты Hero/About/CTA). Любое изменение
 * требовало коммита и пересборки. Теперь администратор может править
 * всё из кабинета, и изменения видны сразу.
 */

type SettingKey = keyof typeof CLUB
  | 'siteName'
  | 'siteTitle'
  | 'siteDescription'
  | 'heroTitle'
  | 'heroSubtitle'
  | 'aboutTitle'
  | 'aboutSubtitle'
  | 'ctaTitle'
  | 'ctaSubtitle'
  | 'ogImage'
  | 'favicon';

interface SettingRow {
  key: string;
  value: string;
}

const COLUMNS = 'key,value';

function getDefaultValue(key: SettingKey): string {
  if (key in CLUB) return (CLUB as Record<string, unknown>)[key] as string;
  if (key === 'siteName') return CLUB.name;
  if (key === 'siteTitle') return DEFAULT_TITLE;
  if (key === 'siteDescription') return DEFAULT_DESCRIPTION;
  if (key === 'heroTitle') return 'Второе дыхание — больше, чем спорт';
  if (key === 'heroSubtitle') return 'Бегаем, крутим педали, исследуем новые маршруты и становимся сильнее вместе';
  if (key === 'aboutTitle') return 'Движение — это жизнь';
  if (key === 'aboutSubtitle') return 'О школе';
  if (key === 'ctaTitle') return 'Стань частью нашей школы';
  if (key === 'ctaSubtitle') return 'Присоединяйся к тренировкам, находи новых друзей и достигай целей вместе с нами. Первое занятие — бесплатно.';
  if (key === 'ogImage') return '/og-image.jpg';
  if (key === 'favicon') return '/favicon.ico';
  return '';
}

const listeners = new Set<() => void>();
let cache: Record<string, string> | null = null;
let started = false;
let channel: ReturnType<typeof supabase.channel> | null = null;

function getCache(): Record<string, string> {
  if (!cache) {
    cache = {};
    const keys = Object.keys(CLUB) as SettingKey[];
    keys.push('siteName', 'siteTitle', 'siteDescription', 'heroTitle', 'heroSubtitle', 'aboutTitle', 'aboutSubtitle', 'ctaTitle', 'ctaSubtitle', 'ogImage', 'favicon');
    for (const key of keys) {
      cache[key] = getDefaultValue(key);
    }
  }
  return cache;
}

function emit() {
  listeners.forEach((l) => l());
}

export async function reloadSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('site_settings')
    .select(COLUMNS);

  if (error) throw error;
  cache = {};
  for (const row of (data as SettingRow[])) {
    cache[row.key] = row.value;
  }
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
  update: async (key: SettingKey, value: string): Promise<void> => {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value })
      .eq('key', key);
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
