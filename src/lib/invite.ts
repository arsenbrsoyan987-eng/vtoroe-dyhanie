import type { User } from '../store/database';

/**
 * Ссылка-приглашение переносит аккаунт в браузер тренера.
 * Данные клуба хранятся в localStorage, поэтому аккаунт, созданный
 * на одном устройстве, не виден на другом. Ссылка решает эту проблему:
 * при открытии она добавляет аккаунт в хранилище этого браузера.
 *
 * В ссылке нет открытого пароля — только его хеш (PBKDF2), поэтому
 * без знания пароля войти всё равно нельзя.
 */

const INVITE_VERSION = 1;

export interface InvitePayload {
  v: number;
  id: string;
  name: string;
  email: string;
  phone: string;
  role: User['role'];
  trainerId?: string;
  passwordHash: string;
  created: string;
  mustChangePassword?: boolean;
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Кодирует аккаунт в строку для ссылки */
export function encodeInvite(user: User): string {
  const payload: InvitePayload = {
    v: INVITE_VERSION,
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    trainerId: user.trainerId,
    passwordHash: user.passwordHash,
    created: user.created,
    mustChangePassword: user.mustChangePassword,
  };
  return toBase64Url(JSON.stringify(payload));
}

/** Декодирует строку приглашения. Возвращает null, если данные повреждены. */
export function decodeInvite(raw: string): User | null {
  try {
    const data = JSON.parse(fromBase64Url(raw)) as InvitePayload;
    if (!data || data.v !== INVITE_VERSION) return null;
    if (!data.email || !data.passwordHash || !data.name) return null;
    // Через ссылку нельзя получить права администратора
    if (data.role === 'admin') return null;
    if (!data.passwordHash.startsWith('pbkdf2$')) return null;

    return {
      id: data.id || 'u-' + Date.now(),
      name: data.name,
      email: data.email.trim().toLowerCase(),
      phone: data.phone ?? '',
      role: data.role === 'trainer' ? 'trainer' : 'athlete',
      ...(data.trainerId ? { trainerId: data.trainerId } : {}),
      passwordHash: data.passwordHash,
      created: data.created || new Date().toISOString().split('T')[0],
      mustChangePassword: data.mustChangePassword,
    };
  } catch {
    return null;
  }
}

/** Готовая ссылка для передачи тренеру */
export function inviteLink(user: User, origin: string): string {
  return `${origin}/login?invite=${encodeInvite(user)}`;
}
