import { OWNER_EMAIL, type User } from '../store/database';

/** Роль «администратор» есть только у владельца клуба */
export function isAdmin(user: User | null | undefined): boolean {
  return user?.role === 'admin';
}

/** Владелец клуба — единственный, кого нельзя удалить или понизить */
export function isOwner(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.id === 'u-admin' || user.email.toLowerCase() === OWNER_EMAIL;
}

export type UserActionCheck = { ok: true } | { ok: false; error: string };

/** Может ли текущий пользователь удалить указанный аккаунт */
export function canDeleteUser(
  actor: User | null | undefined,
  target: User | null | undefined
): UserActionCheck {
  if (!isAdmin(actor)) {
    return { ok: false, error: 'Удалять пользователей может только администратор' };
  }
  if (!target) return { ok: false, error: 'Пользователь не найден' };
  if (target.id === actor?.id) return { ok: false, error: 'Нельзя удалить собственный аккаунт' };
  if (isOwner(target)) return { ok: false, error: 'Аккаунт владельца удалить нельзя' };
  return { ok: true };
}
