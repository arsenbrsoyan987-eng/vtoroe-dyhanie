import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Клиент Supabase — единственный источник данных приложения.
 * Ключи берутся из .env.local (локально) и GitHub Secrets (деплой).
 * Publishable/anon key публичный: доступ ограничен политиками RLS.
 */
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

export const isSupabaseConfigured = Boolean(url && key);

/** Пререндер собирает статические страницы без обращений к сети */
export const isPrerender = Boolean(
  (globalThis as { __PRERENDER__?: boolean }).__PRERENDER__
);

export const supabase: SupabaseClient = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: { params: { eventsPerSecond: 5 } },
  }
);

/** Понятное сообщение вместо «Failed to fetch» */
export function describeError(error: unknown): string {
  if (!error) return 'Неизвестная ошибка';
  if (!isSupabaseConfigured) {
    return 'База данных не подключена: задайте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY';
  }
  const message = typeof error === 'string' ? error : (error as { message?: string }).message;
  if (!message) return 'Не удалось выполнить запрос';
  if (/invalid login credentials/i.test(message)) return 'Неверный email или пароль';
  if (/email not confirmed/i.test(message)) return 'Подтвердите email — мы отправили письмо со ссылкой';
  if (/user already registered/i.test(message)) return 'Аккаунт с таким email уже существует';
  if (/password should be at least/i.test(message)) return 'Пароль слишком короткий';
  if (/rate limit|too many requests/i.test(message)) return 'Слишком много попыток — попробуйте позже';
  if (/failed to fetch|network/i.test(message)) return 'Нет связи с сервером — проверьте интернет';
  return message;
}
