import { dateFromToday } from '../lib/date';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'athlete' | 'trainer' | 'admin';
  passwordHash: string;
  photo?: string;
  created: string;
  /** true — пользователь ещё не сменил стартовый пароль */
  mustChangePassword?: boolean;
  /**
   * id профиля тренера из `data/trainers` — связывает аккаунт
   * с тренировками, чтобы тренер видел только свои занятия.
   */
  trainerId?: string;
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

const KEYS = {
  version: 'db_schema_version',
  users: 'db_users',
  registrations: 'db_registrations',
  notifications: 'db_notifications',
  results: 'db_personal_results',
};

/** При изменении состава/паролей стартовых аккаунтов увеличьте версию. */
const SCHEMA_VERSION = '6';

/** Единственный владелец клуба. Все прочие аккаунты с ролью admin удаляются. */
export const OWNER_EMAIL = 'arsenbrsoyan@yandex.ru';

/**
 * Стартовые аккаунты.
 * В коде хранятся ТОЛЬКО хеши паролей (PBKDF2-SHA256, 120 000 итераций,
 * уникальная соль). Открытых паролей в исходниках нет.
 * Владелец клуба — единственный администратор: эта роль никому не выдаётся.
 */
const SEED_ACCOUNTS: User[] = [
  {
    id: 'u-admin',
    name: 'Брсоян Арсен Арменович',
    email: 'arsenbrsoyan@yandex.ru',
    phone: '+7 987 719-40-42',
    role: 'admin',
    created: '2025-11-01',
    mustChangePassword: false,
    passwordHash:
      'pbkdf2$291631359f2da4238b70f2ba6d701d43$6e1751746467d2d85e22a5f8dc7e83613f2b35f978fab572f304af38554329a5',
  },
  {
    id: 'u-trainer',
    name: 'Тренер клуба',
    email: 'trainer@vtoroe-dyhanie.ru',
    phone: '',
    role: 'trainer',
    trainerId: 'trainer-1',
    created: '2025-12-01',
    mustChangePassword: true,
    passwordHash:
      'pbkdf2$c3797ecdd34b9ed98367874b912d7477$02067c512d5d5b0f8dd020feccb7b72ecea5376cf2741cab1f888a6c763958e7',
  },
  {
    id: 'u-athlete',
    name: 'Спортсмен (демо)',
    email: 'athlete@vtoroe-dyhanie.ru',
    phone: '',
    role: 'athlete',
    created: '2026-01-15',
    mustChangePassword: true,
    passwordHash:
      'pbkdf2$bc1191f63f54cb76720cf7cfe67a4016$2a3c205e45174ccb60090a6a875da030edf261025f1fe18a5533f2c4347b0533',
  },
];

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Инициализирует локальное хранилище при старте приложения.
 * ВАЖНО: при смене версии схемы данные пользователей НЕ удаляются —
 * выполняется миграция, которая только добавляет недостающие стартовые
 * аккаунты. Демо-данные создаются лишь при самом первом запуске.
 */
let seeding: Promise<void> | null = null;

export function ensureSeed(): Promise<void> {
  if (!seeding) {
    seeding = runSeed().finally(() => {
      seeding = null;
    });
  }
  return seeding;
}

async function runSeed(): Promise<void> {
  if (localStorage.getItem(KEYS.version) === SCHEMA_VERSION) return;

  const existing = getUsers();

  if (existing.length === 0) {
    saveUsers(SEED_ACCOUNTS.map((acc) => ({ ...acc })));

    saveRegistrations([
      { id: 'r1', userId: 'u-athlete', trainingId: 'training-1', status: 'confirmed', registeredAt: dateFromToday(-4), attended: false },
      { id: 'r2', userId: 'u-athlete', trainingId: 'training-5', status: 'confirmed', registeredAt: dateFromToday(-6), attended: true },
    ]);
    saveNotifications([
      {
        id: 'n1',
        userId: 'u-athlete',
        title: 'Завтра тренировка',
        message: 'Утренний бег в парке начинается в 07:00. Возьмите удобную обувь и воду.',
        type: 'info',
        read: false,
        createdAt: dateFromToday(0),
        link: '/cabinet/registrations',
      },
    ]);
    savePersonalResults([
      { id: 'pr1', userId: 'u-athlete', trainingId: 'training-1', date: dateFromToday(-7), distance: '5 км', time: '28:34', notes: 'Ровный темп, хорошая погода', rating: 5 },
      { id: 'pr2', userId: 'u-athlete', trainingId: 'training-5', date: dateFromToday(-14), distance: '3 км', time: '18:12', notes: 'Первая функциональная тренировка', rating: 4 },
    ]);
  } else {
    // Миграция существующей установки: аккаунты и данные сохраняем
    const users = [...existing];
    let changed = false;

    for (const acc of SEED_ACCOUNTS) {
      // Аккаунт владельца ищем по id или по роли: у старых установок
      // другой email, но это тот же человек — переименовываем, а не дублируем.
      const found =
        acc.role === 'admin'
          ? users.find((u) => u.id === acc.id) ??
            users.find((u) => u.role === 'admin')
          : users.find((u) => u.email.toLowerCase() === acc.email.toLowerCase());

      if (!found) {
        users.push({ ...acc });
        changed = true;
        continue;
      }

      if (acc.role === 'admin') {
        Object.assign(found, acc);
        changed = true;
      } else if (acc.trainerId && found.role === 'trainer' && !found.trainerId) {
        found.trainerId = acc.trainerId;
        changed = true;
      }
    }

    if (changed) saveUsers(users);
  }

  removeExtraAdmins();

  localStorage.setItem(KEYS.version, SCHEMA_VERSION);
}

/**
 * Оставляет ровно одного администратора — владельца клуба.
 * Устаревшие/демо-аккаунты с ролью admin (например, admin@club.ru)
 * удаляются вместе со связанными записями, уведомлениями и результатами.
 */
function removeExtraAdmins(): void {
  const users = getUsers();
  const admins = users.filter((u) => u.role === 'admin');
  if (admins.length <= 1) return;

  const owner =
    admins.find((u) => u.email.toLowerCase() === OWNER_EMAIL) ??
    admins.find((u) => u.id === 'u-admin');
  // Если владельца не нашли — ничего не трогаем, чтобы не остаться без доступа
  if (!owner) return;

  const removedIds = admins.filter((u) => u.id !== owner.id).map((u) => u.id);
  saveUsers(users.filter((u) => !removedIds.includes(u.id)));
  saveRegistrations(getRegistrations().filter((r) => !removedIds.includes(r.userId)));
  saveNotifications(getNotifications().filter((n) => !removedIds.includes(n.userId)));
  savePersonalResults(getPersonalResults().filter((r) => !removedIds.includes(r.userId)));
}

export function getUsers(): User[] {
  return read<User[]>(KEYS.users, []);
}

export const getStoredUsers = getUsers;

export function saveUsers(users: User[]) {
  localStorage.setItem(KEYS.users, JSON.stringify(users));
}

export function getRegistrations(): TrainingRegistration[] {
  return read<TrainingRegistration[]>(KEYS.registrations, []);
}

export const getStoredRegistrations = getRegistrations;

export function saveRegistrations(regs: TrainingRegistration[]) {
  localStorage.setItem(KEYS.registrations, JSON.stringify(regs));
}

export function getNotifications(): Notification[] {
  return read<Notification[]>(KEYS.notifications, []);
}

export const getStoredNotifications = getNotifications;

export function saveNotifications(notifs: Notification[]) {
  localStorage.setItem(KEYS.notifications, JSON.stringify(notifs));
}

export function getPersonalResults(): PersonalResult[] {
  return read<PersonalResult[]>(KEYS.results, []);
}

export const getStoredPersonalResults = getPersonalResults;

export function savePersonalResults(results: PersonalResult[]) {
  localStorage.setItem(KEYS.results, JSON.stringify(results));
}
