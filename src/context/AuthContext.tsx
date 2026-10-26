import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { hashPassword, verifyPassword, passwordIssues } from '../lib/crypto';
import { canDeleteUser } from '../lib/permissions';
import { decodeInvite } from '../lib/invite';
import {
  ensureSeed,
  getUsers,
  saveUsers,
  getRegistrations,
  saveRegistrations,
  getNotifications,
  saveNotifications,
  getPersonalResults,
  savePersonalResults,
  type User,
  type TrainingRegistration,
  type Notification,
  type PersonalResult,
} from '../store/database';

export type { User } from '../store/database';

const SESSION_KEY = 'session_user_id';

export type LoginResult =
  | { ok: true }
  | { ok: false; error: string };

interface AuthContextType {
  currentUser: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  signUp: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<LoginResult>;
  changePassword: (currentPassword: string, nextPassword: string) => Promise<LoginResult>;
  updateProfile: (patch: { name?: string; phone?: string; photo?: string }) => void;
  registrations: TrainingRegistration[];
  notifications: Notification[];
  personalResults: PersonalResult[];
  register: (trainingId: string, capacity: number) => 'confirmed' | 'waitlist' | 'already';
  cancelRegistration: (regId: string) => void;
  markAttended: (regId: string) => void;
  addPersonalResult: (r: Omit<PersonalResult, 'id'>) => void;
  removePersonalResult: (id: string) => void;
  markNotificationRead: (id: string) => void;
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  /** Перечитывает записи, уведомления и результаты из хранилища */
  refresh: () => void;
  /** Удаляет аккаунт вместе со связанными данными. Доступно только администратору. */
  deleteUser: (id: string) => LoginResult;
  /**
   * Добавляет аккаунт из ссылки-приглашения в этот браузер.
   * Нужно, потому что данные хранятся локально и не видны на других устройствах.
   */
  importAccount: (raw: string) => { ok: true; email: string } | { ok: false; error: string };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [registrations, setRegistrations] = useState<TrainingRegistration[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [personalResults, setPersonalResults] = useState<PersonalResult[]>([]);

  const hydrate = useCallback(() => {
    setRegistrations(getRegistrations());
    setNotifications(getNotifications());
    setPersonalResults(getPersonalResults());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await ensureSeed();
      if (cancelled) return;
      hydrate();
      const savedId = localStorage.getItem(SESSION_KEY);
      if (savedId) {
        const user = getUsers().find((u) => u.id === savedId) ?? null;
        setCurrentUser(user);
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  const startSession = useCallback((user: User) => {
    localStorage.setItem(SESSION_KEY, user.id);
    setCurrentUser(user);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      const user = getUsers().find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );
      // Одинаковое сообщение для несуществующего email и неверного пароля
      const failure: LoginResult = {
        ok: false,
        error: 'Неверный email или пароль',
      };
      if (!user) return failure;
      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) return failure;
      startSession(user);
      return { ok: true };
    },
    [startSession]
  );

  const signUp = useCallback(
    async (input: {
      name: string;
      email: string;
      phone: string;
      password: string;
    }): Promise<LoginResult> => {
      const email = input.email.trim().toLowerCase();
      const issues = passwordIssues(input.password);
      if (issues.length > 0) {
        return { ok: false, error: `Пароль слишком простой: нужен ${issues.join(', ')}` };
      }
      if (getUsers().some((u) => u.email.toLowerCase() === email)) {
        return { ok: false, error: 'Аккаунт с таким email уже существует' };
      }

      const user: User = {
        id: 'u-' + Date.now(),
        name: input.name.trim(),
        email,
        phone: input.phone.trim(),
        // Самостоятельная регистрация доступна только спортсменам.
        // Роли «тренер» и «администратор» выдаёт администратор клуба.
        role: 'athlete',
        passwordHash: await hashPassword(input.password),
        created: new Date().toISOString().split('T')[0],
      };

      saveUsers([...getUsers(), user]);
      startSession(user);
      return { ok: true };
    },
    [startSession]
  );

  const changePassword = useCallback(
    async (currentPassword: string, nextPassword: string): Promise<LoginResult> => {
      if (!currentUser) return { ok: false, error: 'Требуется вход в аккаунт' };
      const valid = await verifyPassword(currentPassword, currentUser.passwordHash);
      if (!valid) return { ok: false, error: 'Текущий пароль указан неверно' };
      const issues = passwordIssues(nextPassword);
      if (issues.length > 0) {
        return { ok: false, error: `Пароль слишком простой: нужен ${issues.join(', ')}` };
      }
      const updated: User = {
        ...currentUser,
        passwordHash: await hashPassword(nextPassword),
        mustChangePassword: false,
      };
      saveUsers(getUsers().map((u) => (u.id === updated.id ? updated : u)));
      setCurrentUser(updated);
      return { ok: true };
    },
    [currentUser]
  );

  const updateProfile = useCallback(
    (patch: { name?: string; phone?: string; photo?: string }) => {
      if (!currentUser) return;
      const updated: User = {
        ...currentUser,
        name: patch.name?.trim() || currentUser.name,
        phone: patch.phone?.trim() ?? currentUser.phone,
        photo: patch.photo ?? currentUser.photo,
      };
      saveUsers(getUsers().map((u) => (u.id === updated.id ? updated : u)));
      setCurrentUser(updated);
    },
    [currentUser]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  }, []);

  const addNotification = useCallback(
    (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
      const next: Notification[] = [
        ...getNotifications(),
        {
          ...n,
          id: 'n-' + Date.now() + Math.random().toString(16).slice(2, 6),
          read: false,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ];
      saveNotifications(next);
      setNotifications(next);
    },
    []
  );

  const register = useCallback(
    (trainingId: string, capacity: number): 'confirmed' | 'waitlist' | 'already' => {
      if (!currentUser) return 'already';
      const all = getRegistrations();
      const mine = all.find(
        (r) =>
          r.userId === currentUser.id &&
          r.trainingId === trainingId &&
          r.status !== 'cancelled'
      );
      if (mine) return 'already';

      const taken = all.filter(
        (r) => r.trainingId === trainingId && r.status === 'confirmed'
      ).length;
      const status: TrainingRegistration['status'] =
        taken < capacity ? 'confirmed' : 'waitlist';

      const next = [
        ...all,
        {
          id: 'r-' + Date.now(),
          userId: currentUser.id,
          trainingId,
          status,
          registeredAt: new Date().toISOString().split('T')[0],
          attended: false,
        },
      ];
      saveRegistrations(next);
      setRegistrations(next);

      addNotification({
        userId: currentUser.id,
        title: status === 'confirmed' ? 'Запись подтверждена' : 'Вы в листе ожидания',
        message:
          status === 'confirmed'
            ? 'Ждём вас на тренировке. Подробности в разделе «Записи».'
            : 'Мест нет, но мы сообщим, если кто-то отменит запись.',
        type: status === 'confirmed' ? 'success' : 'warning',
        link: '/cabinet/registrations',
      });

      return status;
    },
    [currentUser, addNotification]
  );

  const cancelRegistration = useCallback((regId: string) => {
    const all = getRegistrations();
    const target = all.find((r) => r.id === regId);
    if (!target) return;

    let next = all.map((r) =>
      r.id === regId ? { ...r, status: 'cancelled' as const } : r
    );

    // Освободилось место — поднимаем первого из листа ожидания
    if (target.status === 'confirmed') {
      const promoted = next.find(
        (r) => r.trainingId === target.trainingId && r.status === 'waitlist'
      );
      if (promoted) {
        next = next.map((r) =>
          r.id === promoted.id ? { ...r, status: 'confirmed' as const } : r
        );
        addNotification({
          userId: promoted.userId,
          title: 'Вы записаны на тренировку',
          message: 'Освободилось место — ваша запись подтверждена.',
          type: 'success',
          link: '/cabinet/registrations',
        });
      }
    }

    saveRegistrations(next);
    setRegistrations(next);
  }, [addNotification]);

  const deleteUser = useCallback(
    (id: string): LoginResult => {
      const target = getUsers().find((u) => u.id === id);
      const check = canDeleteUser(currentUser, target);
      if (!check.ok) return { ok: false, error: check.error };

      saveUsers(getUsers().filter((u) => u.id !== id));
      saveRegistrations(getRegistrations().filter((r) => r.userId !== id));
      saveNotifications(getNotifications().filter((n) => n.userId !== id));
      savePersonalResults(getPersonalResults().filter((r) => r.userId !== id));

      hydrate();
      return { ok: true };
    },
    [currentUser, hydrate]
  );

  const importAccount = useCallback(
    (raw: string): { ok: true; email: string } | { ok: false; error: string } => {
      const incoming = decodeInvite(raw);
      if (!incoming) {
        return { ok: false, error: 'Ссылка-приглашение повреждена или устарела' };
      }

      const users = getUsers();
      const existing = users.find(
        (u) => u.email.toLowerCase() === incoming.email.toLowerCase()
      );

      if (existing) {
        // Обновляем пароль и профиль, но не даём понизить/повысить роль владельца
        if (existing.role === 'admin') {
          return { ok: false, error: 'Этот email принадлежит владельцу клуба' };
        }
        saveUsers(
          users.map((u) =>
            u.id === existing.id
              ? { ...u, passwordHash: incoming.passwordHash, mustChangePassword: true }
              : u
          )
        );
      } else {
        saveUsers([...users, incoming]);
      }

      return { ok: true, email: incoming.email };
    },
    []
  );

  const markAttended = useCallback((regId: string) => {
    const next = getRegistrations().map((r) =>
      r.id === regId ? { ...r, attended: !r.attended } : r
    );
    saveRegistrations(next);
    setRegistrations(next);
  }, []);

  const addPersonalResult = useCallback((r: Omit<PersonalResult, 'id'>) => {
    const next = [...getPersonalResults(), { ...r, id: 'pr-' + Date.now() }];
    savePersonalResults(next);
    setPersonalResults(next);
  }, []);

  const removePersonalResult = useCallback((id: string) => {
    const next = getPersonalResults().filter((r) => r.id !== id);
    savePersonalResults(next);
    setPersonalResults(next);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    const next = getNotifications().map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    saveNotifications(next);
    setNotifications(next);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      currentUser,
      ready,
      login,
      logout,
      signUp,
      changePassword,
      updateProfile,
      registrations,
      notifications,
      personalResults,
      register,
      cancelRegistration,
      markAttended,
      addPersonalResult,
      removePersonalResult,
      markNotificationRead,
      addNotification,
      refresh: hydrate,
      deleteUser,
      importAccount,
    }),
    [
      currentUser,
      ready,
      login,
      logout,
      signUp,
      changePassword,
      updateProfile,
      registrations,
      notifications,
      personalResults,
      register,
      cancelRegistration,
      markAttended,
      addPersonalResult,
      removePersonalResult,
      markNotificationRead,
      addNotification,
      hydrate,
      deleteUser,
      importAccount,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth должен использоваться внутри AuthProvider');
  return ctx;
}
