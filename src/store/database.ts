/**
 * Типы данных клуба и мапперы из строк Supabase.
 * Источник правды — таблицы public.* (см. supabase/schema.sql).
 * Локального хранилища аккаунтов больше нет: все пользователи общие.
 */

export type Role = 'athlete' | 'trainer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  photo?: string;
  /** Дата регистрации, YYYY-MM-DD */
  created: string;
  /** true — пароль выдал администратор, пользователь ещё не сменил его */
  mustChangePassword?: boolean;
  /** id профиля тренера из `data/trainers` — связывает аккаунт с тренировками */
  trainerId?: string;
  /** Аккаунт удалён администратором: вход запрещён */
  deleted?: boolean;
}

export interface TrainingRegistration {
  id: string;
  userId: string;
  trainingId: string;
  status: 'confirmed' | 'waitlist' | 'cancelled';
  registeredAt: string;
  attended: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'event';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface PersonalResult {
  id: string;
  userId: string;
  trainingId: string;
  date: string;
  distance?: string;
  time?: string;
  notes?: string;
  rating?: number;
}

/** Владелец клуба — единственный, кому выдаётся роль администратора */
export const OWNER_EMAIL = 'arsenbrsoyan@yandex.ru';

/** Строка таблицы public.profiles */
export interface ProfileRow {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  role: Role;
  trainer_id: string | null;
  photo: string | null;
  must_change_password: boolean | null;
  created_at: string;
  deleted_at?: string | null;
}

export function toUser(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name?.trim() || row.email?.split('@')[0] || 'Без имени',
    email: row.email ?? '',
    phone: row.phone ?? '',
    role: row.role,
    ...(row.photo ? { photo: row.photo } : {}),
    created: (row.created_at ?? '').slice(0, 10),
    ...(row.must_change_password ? { mustChangePassword: true } : {}),
    ...(row.trainer_id ? { trainerId: row.trainer_id } : {}),
    ...(row.deleted_at ? { deleted: true } : {}),
  };
}

/** Только дата: в интерфейсе везде YYYY-MM-DD */
export function isoDate(value: string | null | undefined): string {
  return (value ?? '').slice(0, 10);
}

/** Телефон в формате +7XXXXXXXXXX — единый вид для базы и поиска */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    return '+7' + digits.slice(1);
  }
  if (digits.length === 10 && digits.startsWith('9')) return '+7' + digits;
  return digits.startsWith('7') ? '+' + digits : '+' + digits;
}

/** Телефон обязателен: 11 цифр, российский номер */
export function phoneIssue(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  if (!digits) return 'Укажите телефон — по нему тренер свяжется со спортсменом';
  if (digits.length !== 11 || !(digits.startsWith('7') || digits.startsWith('8'))) {
    return 'Телефон в формате +7 900 000-00-00';
  }
  return null;
}
