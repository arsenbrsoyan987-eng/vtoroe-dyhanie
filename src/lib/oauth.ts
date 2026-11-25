import type { Provider } from '@supabase/supabase-js';
import { supabaseAnonKey, supabaseUrl } from './supabase';

/**
 * Вход через внешние сервисы.
 *
 * Google и Apple — штатные провайдеры Supabase. Яндекс подключается как
 * кастомный OIDC-провайдер с идентификатором `yandex`, поэтому в запросе
 * уходит `custom:yandex`.
 */
export type OAuthKey = 'yandex' | 'google' | 'apple';

export interface OAuthProviderInfo {
  key: OAuthKey;
  /** Имя, которое ждёт Supabase */
  provider: Provider;
  /** Ключ в ответе /auth/v1/settings */
  settingsKey: string;
  label: string;
  /** Короткая подпись под кнопкой */
  hint: string;
}

export const OAUTH_PROVIDERS: OAuthProviderInfo[] = [
  {
    key: 'yandex',
    provider: 'custom:yandex',
    settingsKey: 'yandex',
    label: 'Яндекс',
    hint: 'Почта и ID Яндекса',
  },
  {
    key: 'google',
    provider: 'google',
    settingsKey: 'google',
    label: 'Google',
    hint: 'Аккаунт Google',
  },
  {
    key: 'apple',
    provider: 'apple',
    settingsKey: 'apple',
    label: 'Apple',
    hint: 'Apple ID',
  },
];

export function providerInfo(key: OAuthKey): OAuthProviderInfo {
  return OAUTH_PROVIDERS.find((p) => p.key === key) ?? OAUTH_PROVIDERS[0];
}

const LABELS: Record<string, string> = {
  yandex: 'Яндекс',
  google: 'Google',
  apple: 'Apple',
  email: 'Email и пароль',
  phone: 'Телефон',
};

/** Человеческое имя провайдера по значению из identities */
export function providerLabel(provider: string): string {
  const clean = provider.replace(/^custom:/, '');
  return LABELS[clean] ?? clean;
}

let cache: { enabled: Set<string>; at: number } | null = null;

/**
 * Какие внешние провайдеры включены в проекте Supabase.
 *
 * Запрос публичный (ключ anon и так лежит в бандле), ответ кешируется на
 * пять минут: на странице входа это единственный сетевой вызов.
 * Если запрос не удался — считаем, что провайдеров нет, и не показываем
 * кнопки, которые заведомо приведут к ошибке.
 */
export async function enabledProviders(): Promise<Set<string>> {
  if (cache && Date.now() - cache.at < 5 * 60 * 1000) return cache.enabled;

  const empty = new Set<string>();
  if (!supabaseUrl || !supabaseAnonKey) return empty;

  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
    });
    if (!res.ok) return empty;

    const json = (await res.json()) as { external?: Record<string, boolean> };
    const external = json.external ?? {};

    const enabled = new Set<string>();
    for (const item of OAUTH_PROVIDERS) {
      const on =
        external[item.settingsKey] === true ||
        external[`custom:${item.settingsKey}`] === true;
      if (on) enabled.add(item.key);
    }

    cache = { enabled, at: Date.now() };
    return enabled;
  } catch {
    return empty;
  }
}

/** Ошибка OAuth приходит в hash после редиректа — показываем её по-русски */
export function oauthErrorFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const code = params.get('error');
  if (!code) return null;

  const description = params.get('error_description') ?? '';
  if (/denied|access_denied|cancel/i.test(`${code} ${description}`)) {
    return 'Вход отменён — попробуйте снова или войдите по паролю';
  }
  if (/provider is not enabled|unsupported provider/i.test(`${code} ${description}`)) {
    return 'Этот способ входа пока не подключён — используйте email и пароль';
  }
  return 'Не удалось войти через внешний сервис — попробуйте ещё раз';
}
