import clubJson from './club.json';

/**
 * Контактные данные школы — единый источник для футера, политики и контактов.
 *
 * Значения лежат в `club.json`: их читают и приложение (как запасной вариант
 * настроек), и `scripts/seed-supabase.cjs`, переносящий контакты в таблицу
 * site_settings. Одна копия на TS и скрипт исключает расхождение текстов.
 *
 * Править контакты лучше из админки («Настройки сайта») — тогда менять
 * файл и пересобирать сайт не нужно.
 */
export const CLUB = clubJson as {
  name: string;
  fullName: string;
  city: string;
  addressNote: string;
  phones: string[];
  email: string;
  telegram: string;
  telegramLabel: string;
  owner: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
};

/** `tel:`-ссылка из человекочитаемого номера */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}