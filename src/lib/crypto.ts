/**
 * Единый механизм хеширования паролей.
 * Использует PBKDF2 (Web Crypto API) с уникальной солью на каждый пароль.
 * ВАЖНО: этот модуль — единственный источник правды для паролей в приложении.
 * При подключении бэкенда логика переезжает на сервер (bcrypt/argon2).
 */

const ITERATIONS = 120_000;
const KEY_LENGTH = 32;

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function randomSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toHex(bytes.buffer);
}

async function derive(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = new Uint8Array(
    saltHex.match(/.{2}/g)!.map((h) => parseInt(h, 16))
  );

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    KEY_LENGTH * 8
  );

  return toHex(bits);
}

/** Возвращает строку вида `pbkdf2$<соль>$<хеш>` */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomSalt();
  const hash = await derive(password, salt);
  return `pbkdf2$${salt}$${hash}`;
}

/** Проверяет пароль, устойчиво к timing-атакам по длине */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored) return false;
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'pbkdf2') return false;

  const [, salt, expected] = parts;
  try {
    const actual = await derive(password, salt);
    if (actual.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < actual.length; i++) {
      diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

/** Проверка надёжности пароля: возвращает список невыполненных требований */
export function passwordIssues(password: string): string[] {
  const issues: string[] = [];
  if (password.length < 8) issues.push('минимум 8 символов');
  if (!/[a-zа-я]/.test(password)) issues.push('хотя бы одна буква');
  if (!/[0-9]/.test(password)) issues.push('хотя бы одна цифра');
  return issues;
}
