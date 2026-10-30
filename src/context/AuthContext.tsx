import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { describeError, isSupabaseConfigured, supabase } from '../lib/supabase';
import { passwordIssues } from '../lib/crypto';
import { canDeleteUser } from '../lib/permissions';
import {
  isoDate,
  normalizePhone,
  phoneIssue,
  toUser,
  type Notification,
  type PersonalResult,
  type ProfileRow,
  type TrainingRegistration,
  type User,
} from '../store/database';

export type { User } from '../store/database';

export type LoginResult = { ok: true } | { ok: false; error: string };

interface SignUpInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthContextType {
  currentUser: User | null;
  ready: boolean;
  /** Supabase не настроен — показать подсказку вместо форм */
  configured: boolean;
  /** Email зарегистрирован, но ссылка из письма ещё не открыта */
  pendingEmail: string | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  signUp: (input: SignUpInput) => Promise<LoginResult>;
  changePassword: (currentPassword: string, nextPassword: string) => Promise<LoginResult>;
  updateProfile: (patch: { name?: string; phone?: string; photo?: string }) => Promise<LoginResult>;
  registrations: TrainingRegistration[];
  notifications: Notification[];
  personalResults: PersonalResult[];
  register: (trainingId: string, capacity: number) => Promise<'confirmed' | 'waitlist' | 'already' | 'error'>;
  cancelRegistration: (regId: string) => Promise<void>;
  markAttended: (regId: string) => Promise<void>;
  addPersonalResult: (r: Omit<PersonalResult, 'id'>) => Promise<void>;
  removePersonalResult: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  addNotification: (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => Promise<void>;
  /** Перечитывает записи, уведомления и результаты */
  refresh: () => void;
  /** Мягкое удаление аккаунта: доступно только администратору */
  deleteUser: (id: string) => Promise<LoginResult>;
  /** Отправляет письмо со ссылкой на восстановление пароля */
  sendPasswordReset: (email: string) => Promise<LoginResult>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PROFILE_COLUMNS =
  'id,email,name,phone,role,trainer_id,photo,must_change_password,created_at,deleted_at';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<TrainingRegistration[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [personalResults, setPersonalResults] = useState<PersonalResult[]>([]);
  const [reloadToken, setReloadToken] = useState(0);

  const userId = currentUser?.id ?? null;
  // Сессия нужна, чтобы не перезагружать данные после разлогина
  const sessionRef = useRef<Session | null>(null);

  /** Читает профиль по сессии. null — аккаунт удалён или профиль отсутствует. */
  const loadProfile = useCallback(async (session: Session | null): Promise<User | null> => {
    if (!session?.user) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return toUser(data as ProfileRow);
  }, []);

  // Восстановление сессии и реакция на вход/выход/обновление токена
  useEffect(() => {
    let active = true;

    const apply = async (session: Session | null) => {
      sessionRef.current = session;
      if (!session?.user) {
        if (active) {
          setCurrentUser(null);
          setReady(true);
        }
        return;
      }

      try {
        const profile = await loadProfile(session);
        if (!active) return;

        if (!profile) {
          // Профиля нет: аккаунт удалён администратором либо ещё не создан
          await supabase.auth.signOut();
          if (!active) return;
          setCurrentUser(null);
        } else {
          setCurrentUser(profile);
        }
      } catch {
        if (active) setCurrentUser(null);
      } finally {
        if (active) setReady(true);
      }
    };

    supabase.auth.getSession().then(({ data }) => apply(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        sessionRef.current = null;
        setCurrentUser(null);
        setReady(true);
        return;
      }
      void apply(session);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  // Записи, уведомления и результаты: RLS отдаёт свои строки,
  // администратору — все, тренеру — записи на его тренировки
  useEffect(() => {
    if (!userId) {
      setRegistrations([]);
      setNotifications([]);
      setPersonalResults([]);
      return;
    }

    let active = true;

    const load = async () => {
      const [regs, notifs, results] = await Promise.all([
        supabase
          .from('registrations')
          .select('id,user_id,training_id,status,attended,created_at')
          .order('created_at', { ascending: false }),
        supabase
          .from('notifications')
          .select('id,user_id,title,message,type,read,link,created_at')
          .order('created_at', { ascending: false }),
        supabase
          .from('results')
          .select('id,user_id,training_id,date,distance,time,notes,rating')
          .order('date', { ascending: false }),
      ]);

      if (!active) return;

      if (!regs.error) {
        setRegistrations(
          (regs.data as Record<string, unknown>[]).map((r) => ({
            id: String(r.id),
            userId: String(r.user_id),
            trainingId: String(r.training_id),
            status: r.status as TrainingRegistration['status'],
            registeredAt: isoDate(r.created_at as string),
            attended: Boolean(r.attended),
          }))
        );
      }

      if (!notifs.error) {
        setNotifications(
          (notifs.data as Record<string, unknown>[]).map((n) => ({
            id: String(n.id),
            userId: String(n.user_id),
            title: String(n.title),
            message: String(n.message ?? ''),
            type: n.type as Notification['type'],
            read: Boolean(n.read),
            createdAt: isoDate(n.created_at as string),
            ...(n.link ? { link: String(n.link) } : {}),
          }))
        );
      }

      if (!results.error) {
        setPersonalResults(
          (results.data as Record<string, unknown>[]).map((r) => ({
            id: String(r.id),
            userId: String(r.user_id),
            trainingId: String(r.training_id ?? ''),
            date: isoDate(r.date as string),
            ...(r.distance ? { distance: String(r.distance) } : {}),
            ...(r.time ? { time: String(r.time) } : {}),
            ...(r.notes ? { notes: String(r.notes) } : {}),
            ...(r.rating ? { rating: Number(r.rating) } : {}),
          }))
        );
      }
    };

    void load();

    const channel = supabase
      .channel(`cabinet-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'results' }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [userId, reloadToken]);

  const refresh = useCallback(() => setReloadToken((n) => n + 1), []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) return { ok: false, error: describeError(error) };

    const profile = await loadProfile(data.session);
    if (!profile) {
      await supabase.auth.signOut();
      return { ok: false, error: 'Аккаунт удалён или недоступен — обратитесь в клуб' };
    }

    setCurrentUser(profile);
    setPendingEmail(null);
    return { ok: true };
  }, [loadProfile]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  }, []);

  const signUp = useCallback(
    async (input: SignUpInput): Promise<LoginResult> => {
      const email = input.email.trim().toLowerCase();
      const name = input.name.trim();

      if (!name) return { ok: false, error: 'Укажите имя и фамилию' };
      const phoneError = phoneIssue(input.phone);
      if (phoneError) return { ok: false, error: phoneError };

      const issues = passwordIssues(input.password);
      if (issues.length > 0) {
        return { ok: false, error: `Пароль слишком простой: нужен ${issues.join(', ')}` };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password: input.password,
        options: {
          // Телефон и имя попадают в профиль через триггер handle_new_user
          data: { name, phone: normalizePhone(input.phone) },
          emailRedirectTo: `${window.location.origin}/cabinet`,
        },
      });

      if (error) return { ok: false, error: describeError(error) };

      // Подтверждение email включено: сессии ещё нет, ждём перехода по ссылке
      if (!data.session) {
        setPendingEmail(email);
        return { ok: true };
      }

      const profile = await loadProfile(data.session);
      setCurrentUser(profile);
      return { ok: true };
    },
    [loadProfile]
  );

  const changePassword = useCallback(
    async (currentPassword: string, nextPassword: string): Promise<LoginResult> => {
      if (!currentUser) return { ok: false, error: 'Требуется вход в аккаунт' };

      const issues = passwordIssues(nextPassword);
      if (issues.length > 0) {
        return { ok: false, error: `Пароль слишком простой: нужен ${issues.join(', ')}` };
      }

      // Supabase меняет пароль без старого, поэтому сначала проверяем его входом
      const check = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: currentPassword,
      });
      if (check.error) return { ok: false, error: 'Текущий пароль указан неверно' };

      const { error } = await supabase.auth.updateUser({ password: nextPassword });
      if (error) return { ok: false, error: describeError(error) };

      await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', currentUser.id);

      setCurrentUser((prev) => (prev ? { ...prev, mustChangePassword: false } : prev));
      return { ok: true };
    },
    [currentUser]
  );

  const updateProfile = useCallback(
    async (patch: { name?: string; phone?: string; photo?: string }): Promise<LoginResult> => {
      if (!currentUser) return { ok: false, error: 'Требуется вход в аккаунт' };

      if (patch.phone !== undefined) {
        const phoneError = phoneIssue(patch.phone);
        if (phoneError) return { ok: false, error: phoneError };
      }

      const update: Record<string, unknown> = {};
      if (patch.name !== undefined && patch.name.trim()) update.name = patch.name.trim();
      if (patch.phone !== undefined) update.phone = normalizePhone(patch.phone);
      if (patch.photo !== undefined) update.photo = patch.photo;

      if (Object.keys(update).length === 0) return { ok: true };

      const { error } = await supabase
        .from('profiles')
        .update(update)
        .eq('id', currentUser.id);

      if (error) return { ok: false, error: describeError(error) };

      setCurrentUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          ...(update.name ? { name: String(update.name) } : {}),
          ...(update.phone !== undefined ? { phone: String(update.phone) } : {}),
          ...(update.photo !== undefined ? { photo: String(update.photo) } : {}),
        };
      });
      return { ok: true };
    },
    [currentUser]
  );

  const addNotification = useCallback(
    async (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
      const { error } = await supabase.from('notifications').insert({
        user_id: n.userId,
        title: n.title,
        message: n.message,
        type: n.type,
        link: n.link ?? null,
      });
      if (!error) refresh();
    },
    [refresh]
  );

  const register = useCallback(
    async (trainingId: string, capacity: number): Promise<'confirmed' | 'waitlist' | 'already' | 'error'> => {
      if (!currentUser) return 'error';

      const mine = registrations.find(
        (r) =>
          r.userId === currentUser.id &&
          r.trainingId === trainingId &&
          r.status !== 'cancelled'
      );
      if (mine) return 'already';

      const taken = registrations.filter(
        (r) => r.trainingId === trainingId && r.status === 'confirmed'
      ).length;
      const status: TrainingRegistration['status'] =
        taken < capacity ? 'confirmed' : 'waitlist';

      const { error } = await supabase.from('registrations').insert({
        user_id: currentUser.id,
        training_id: trainingId,
        status,
      });
      if (error) return 'error';

      await addNotification({
        userId: currentUser.id,
        title: status === 'confirmed' ? 'Запись подтверждена' : 'Вы в листе ожидания',
        message:
          status === 'confirmed'
            ? 'Ждём вас на тренировке. Подробности в разделе «Мои записи».'
            : 'Мест нет, но мы сообщим, если кто-то отменит запись.',
        type: status === 'confirmed' ? 'success' : 'warning',
        link: '/cabinet/registrations',
      });

      refresh();
      return status;
    },
    [currentUser, registrations, addNotification, refresh]
  );

  const cancelRegistration = useCallback(
    async (regId: string) => {
      const target = registrations.find((r) => r.id === regId);
      if (!target) return;

      await supabase.from('registrations').update({ status: 'cancelled' }).eq('id', regId);

      // Освободилось место — подтверждаем первого из листа ожидания
      if (target.status === 'confirmed') {
        const promoted = registrations.find(
          (r) => r.trainingId === target.trainingId && r.status === 'waitlist'
        );
        if (promoted) {
          await supabase
            .from('registrations')
            .update({ status: 'confirmed' })
            .eq('id', promoted.id);

          await addNotification({
            userId: promoted.userId,
            title: 'Вы записаны на тренировку',
            message: 'Освободилось место — ваша запись подтверждена.',
            type: 'success',
            link: '/cabinet/registrations',
          });
        }
      }

      refresh();
    },
    [registrations, addNotification, refresh]
  );

  const markAttended = useCallback(
    async (regId: string) => {
      const target = registrations.find((r) => r.id === regId);
      if (!target) return;
      await supabase
        .from('registrations')
        .update({ attended: !target.attended })
        .eq('id', regId);
      refresh();
    },
    [registrations, refresh]
  );

  const addPersonalResult = useCallback(
    async (r: Omit<PersonalResult, 'id'>) => {
      if (!currentUser) return;
      await supabase.from('results').insert({
        user_id: currentUser.id,
        training_id: r.trainingId || null,
        date: r.date,
        distance: r.distance ?? null,
        time: r.time ?? null,
        notes: r.notes ?? null,
        rating: r.rating ?? null,
      });
      refresh();
    },
    [currentUser, refresh]
  );

  const removePersonalResult = useCallback(
    async (id: string) => {
      await supabase.from('results').delete().eq('id', id);
      refresh();
    },
    [refresh]
  );

  const markNotificationRead = useCallback(
    async (id: string) => {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      refresh();
    },
    [refresh]
  );

  const deleteUser = useCallback(
    async (id: string): Promise<LoginResult> => {
      const target = { id, email: '' };
      const check = canDeleteUser(currentUser, target);
      if (!check.ok) return { ok: false, error: check.error };

      // Мягкое удаление: строки остаются для истории, но доступ закрыт
      const { error } = await supabase
        .from('profiles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) return { ok: false, error: describeError(error) };
      refresh();
      return { ok: true };
    },
    [currentUser, refresh]
  );

  const sendPasswordReset = useCallback(async (email: string): Promise<LoginResult> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/login?reset=1`,
    });
    if (error) return { ok: false, error: describeError(error) };
    return { ok: true };
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      currentUser,
      ready,
      configured: isSupabaseConfigured,
      pendingEmail,
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
      refresh,
      deleteUser,
      sendPasswordReset,
    }),
    [
      currentUser,
      ready,
      pendingEmail,
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
      refresh,
      deleteUser,
      sendPasswordReset,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth должен использоваться внутри AuthProvider');
  return ctx;
}