import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getUsers, saveUsers, type User } from '../../store/database';
import { canDeleteUser, isAdmin, isOwner } from '../../lib/permissions';
import { inviteLink } from '../../lib/invite';
import { hashPassword, passwordIssues } from '../../lib/crypto';
import { useTrainers } from '../../store/trainersStore';
import Button from '../../components/ui/Button';
import { Check, Copy, KeyRound, Link2, Plus, Search, ShieldCheck, Trash2, X } from 'lucide-react';

/** Временный пароль: читаемый, но соответствующий требованиям сложности */
function generateTempPassword(): string {
  const letters = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  let tail = '';
  for (let i = 0; i < 6; i++) {
    tail += letters[Math.floor(Math.random() * letters.length)];
  }
  tail += digits[Math.floor(Math.random() * digits.length)];
  tail += digits[Math.floor(Math.random() * digits.length)];
  return `Vtoroe-${tail}`;
}

const ROLE_LABEL: Record<User['role'], string> = {
  athlete: 'Спортсмен',
  trainer: 'Тренер',
  admin: 'Администратор',
};

const ROLE_STYLE: Record<User['role'], string> = {
  athlete: 'bg-blue-500/15 text-blue-400',
  trainer: 'bg-green-500/15 text-green-400',
  admin: 'bg-red-500/15 text-red-400',
};

export default function AdminUsers() {
  const { currentUser, registrations, deleteUser } = useAuth();
  const { toast } = useToast();

  const trainers = useTrainers();
  const [users, setUsers] = useState<User[]>(getUsers());
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'athlete' as User['role'],
    password: '',
    trainerId: '',
  });
  const [resetInfo, setResetInfo] = useState<{ name: string; email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const field =
    'w-full rounded-sm border border-white/10 bg-primary px-3 py-2.5 text-sm text-white transition-colors placeholder:text-gray-600 focus:border-accent-red focus:outline-none';
  const label = 'mb-1.5 block text-xs uppercase tracking-wider text-gray-400';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        ROLE_LABEL[u.role].toLowerCase().includes(q)
    );
  }, [users, query]);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const email = form.email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === email)) {
      toast('Пользователь с таким email уже существует', 'error');
      return;
    }
    const issues = passwordIssues(form.password);
    if (issues.length > 0) {
      toast(`Пароль слишком простой: нужен ${issues.join(', ')}`, 'error');
      return;
    }

    setBusy(true);
    const newUser: User = {
      id: 'u-' + Date.now(),
      name: form.name.trim(),
      email,
      phone: form.phone.trim(),
      role: form.role,
      ...(form.role === 'trainer' && form.trainerId ? { trainerId: form.trainerId } : {}),
      passwordHash: await hashPassword(form.password),
      created: new Date().toISOString().split('T')[0],
      mustChangePassword: true,
    };
    const next = [...users, newUser];
    saveUsers(next);
    setUsers(next);
    setBusy(false);
    setOpen(false);
    setForm({ name: '', email: '', phone: '', role: 'athlete', password: '', trainerId: '' });
    toast(`Аккаунт создан: ${newUser.name}`);
  };

  const changeRole = (id: string, role: User['role']) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    if (isOwner(target)) {
      toast('Права владельца изменить нельзя', 'error');
      return;
    }
    if (role === 'admin') {
      toast('Права администратора не выдаются', 'error');
      return;
    }
    const next = users.map((u) => (u.id === id ? { ...u, role } : u));
    saveUsers(next);
    setUsers(next);
    toast('Роль обновлена');
  };

  const resetPassword = async (user: User) => {
    const temp = generateTempPassword();
    const passwordHash = await hashPassword(temp);
    const next = users.map((u) =>
      u.id === user.id ? { ...u, passwordHash, mustChangePassword: true } : u
    );
    saveUsers(next);
    setUsers(next);
    setCopied(false);
    setResetInfo({ name: user.name, email: user.email, password: temp });
    toast('Пароль сброшен — передайте временный пароль', 'info');
  };

  const copyInvite = async (user: User) => {
    try {
      await navigator.clipboard.writeText(inviteLink(user, window.location.origin));
      toast('Ссылка для входа скопирована — отправьте её пользователю');
    } catch {
      toast('Не удалось скопировать ссылку', 'error');
    }
  };

  const copyResetPassword = async () => {
    if (!resetInfo) return;
    try {
      await navigator.clipboard.writeText(resetInfo.password);
      setCopied(true);
    } catch {
      toast('Не удалось скопировать — выделите пароль вручную', 'error');
    }
  };

  const removeUser = (id: string, name: string) => {
    const target = users.find((u) => u.id === id) ?? null;
    const check = canDeleteUser(currentUser, target);
    if (!check.ok) {
      setConfirmId(null);
      toast(check.error, 'error');
      return;
    }

    // Удаление выполняет защищённый метод контекста: он ещё раз проверяет права
    // и заодно чистит записи, уведомления и личные результаты.
    const result = deleteUser(id);
    if (!result.ok) {
      setConfirmId(null);
      toast(result.error, 'error');
      return;
    }

    setUsers(getUsers());
    setConfirmId(null);
    toast(`Аккаунт удалён: ${name}`, 'info');
  };

  const regCountOf = (id: string) =>
    registrations.filter((r) => r.userId === id && r.status !== 'cancelled').length;

  const roleControl = (u: User) => {
    if (isOwner(u)) {
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-semibold ${ROLE_STYLE.admin}`}
          title="Права владельца — не выдаются и не отзываются"
        >
          <ShieldCheck className="h-3 w-3" />
          Владелец
        </span>
      );
    }
    if (u.role === 'admin') {
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-semibold ${ROLE_STYLE.admin}`}
          title="Лишний администратор — его можно удалить"
        >
          Администратор
        </span>
      );
    }
    return (
      <select
        value={u.role}
        onChange={(e) => changeRole(u.id, e.target.value as User['role'])}
        className={`cursor-pointer rounded-sm border-0 px-2 py-1 text-xs font-semibold ${ROLE_STYLE[u.role]}`}
        aria-label={`Роль пользователя ${u.name}`}
      >
        <option value="athlete">Спортсмен</option>
        <option value="trainer">Тренер</option>
      </select>
    );
  };

  const rowActions = (u: User) => {
    // Удаление и сброс пароля доступны только администратору клуба
    if (!isAdmin(currentUser)) return null;
    if (u.id === currentUser?.id) {
      return <p className="text-right text-[11px] text-gray-600">Это вы</p>;
    }
    if (confirmId === u.id) {
      return (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="text-[11px] text-gray-400">Удалить аккаунт и его записи?</span>
          <button
            onClick={() => removeUser(u.id, u.name)}
            className="rounded-sm bg-red-500/20 px-2 py-1 text-[11px] font-semibold text-red-300 transition-colors hover:bg-red-500/30"
          >
            Да, удалить
          </button>
          <button
            onClick={() => setConfirmId(null)}
            className="rounded-sm px-2 py-1 text-[11px] text-gray-400 transition-colors hover:text-white"
          >
            Отмена
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => copyInvite(u)}
          className="rounded-sm p-1.5 text-gray-500 transition-colors hover:bg-white/5 hover:text-accent-blue"
          aria-label={`Ссылка для входа ${u.name}`}
          title="Скопировать ссылку для входа"
        >
          <Link2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => resetPassword(u)}
          className="rounded-sm p-1.5 text-gray-500 transition-colors hover:bg-white/5 hover:text-yellow-400"
          aria-label={`Сбросить пароль ${u.name}`}
          title="Сбросить пароль"
        >
          <KeyRound className="h-4 w-4" />
        </button>
        <button
          onClick={() => setConfirmId(u.id)}
          className="flex items-center gap-1.5 rounded-sm border border-red-500/30 px-2.5 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-300"
          aria-label={`Удалить ${u.name}`}
          title="Удалить аккаунт"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Удалить
        </button>
      </div>
    );
  };

  // Дополнительная защита: страница доступна только владельцу клуба
  if (!isAdmin(currentUser)) {
    return (
      <div className="mx-auto max-w-xl rounded-sm border border-white/10 bg-surface p-6 text-center">
        <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-gray-500" />
        <h1 className="mb-1 text-lg font-semibold text-white">Доступ только администратору</h1>
        <p className="text-sm text-gray-400">
          Управлять пользователями клуба может только владелец аккаунта.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-white">Пользователи</h1>
          <p className="text-sm text-gray-400">
            {users.length} аккаунтов · управление доступами и ролями
          </p>
          <p className="mt-1 max-w-xl text-xs text-gray-600">
            Кнопка «Удалить» стирает аккаунт вместе с записями на тренировки, уведомлениями
            и личными результатами. Аккаунт владельца удалить нельзя.
          </p>
        </div>
        <Button onClick={() => setOpen((v) => !v)} variant={open ? 'outline' : 'primary'} size="sm">
          {open ? (
            <>
              <X className="mr-1.5 h-4 w-4" /> Отмена
            </>
          ) : (
            <>
              <Plus className="mr-1.5 h-4 w-4" /> Новый пользователь
            </>
          )}
        </Button>
      </div>

      {open && (
        <form onSubmit={createUser} className="mb-6 space-y-4 rounded-sm border border-white/10 bg-surface p-6">
          <h2 className="font-semibold text-white">Новый аккаунт</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="nu-name" className={label}>Имя и фамилия</label>
              <input id="nu-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
            </div>
            <div>
              <label htmlFor="nu-email" className={label}>Email (логин)</label>
              <input id="nu-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={field} />
            </div>
            <div>
              <label htmlFor="nu-phone" className={label}>Телефон</label>
              <input id="nu-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={field} />
            </div>
            <div>
              <label htmlFor="nu-role" className={label}>Роль</label>
              <select id="nu-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as User['role'] })} className={field}>
                <option value="athlete">Спортсмен</option>
                <option value="trainer">Тренер</option>
              </select>
              <p className="mt-1 text-xs text-gray-600">
                Права администратора закреплены за владельцем клуба и не выдаются.
              </p>
            </div>
            {form.role === 'trainer' && (
              <div className="sm:col-span-2">
                <label htmlFor="nu-trainer" className={label}>Профиль тренера на сайте</label>
                <select
                  id="nu-trainer"
                  value={form.trainerId}
                  onChange={(e) => setForm({ ...form, trainerId: e.target.value })}
                  className={field}
                >
                  <option value="">Не привязан</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-600">
                  От профиля зависит, какие тренировки увидит тренер в кабинете.
                </p>
              </div>
            )}
            <div className="sm:col-span-2">
              <label htmlFor="nu-password" className={label}>Временный пароль</label>
              <input id="nu-password" type="text" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={field} placeholder="Передайте сотруднику лично" />
              <p className="mt-1 text-xs text-gray-600">
                Пароль хешируется при сохранении. Попросите сменить его после первого входа.
              </p>
            </div>
          </div>
          <Button type="submit" variant="primary" size="sm" disabled={busy}>
            {busy ? 'Создаём…' : 'Создать аккаунт'}
          </Button>
        </form>
      )}

      {resetInfo && (
        <div className="mb-4 rounded-sm border border-yellow-500/30 bg-yellow-500/10 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-yellow-200">
                Временный пароль для {resetInfo.name}
              </p>
              <p className="mt-0.5 text-xs text-yellow-200/70">
                Логин: {resetInfo.email} · показывается один раз
              </p>
              <code className="mt-2 block select-all break-all rounded-sm bg-black/40 px-3 py-2 font-mono text-sm text-white">
                {resetInfo.password}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyResetPassword}
                className="flex items-center gap-1.5 rounded-sm bg-yellow-500/20 px-3 py-1.5 text-xs font-semibold text-yellow-100 transition-colors hover:bg-yellow-500/30"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Скопировано' : 'Копировать'}
              </button>
              <button
                onClick={() => setResetInfo(null)}
                className="text-xs text-yellow-200/70 hover:text-yellow-100"
              >
                Закрыть
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-yellow-200/70">
            Передайте пароль лично. При входе пользователю будет предложено сменить его.
          </p>
        </div>
      )}

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по имени, email или роли"
          className={`${field} pl-10`}
          aria-label="Поиск пользователей"
        />
      </div>

      <div className="hidden overflow-x-auto rounded-sm border border-white/10 sm:block">
        <table className="w-full min-w-[34rem] text-sm">
          <thead className="bg-surface">
            <tr className="border-b border-white/10">
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400">Пользователь</th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium text-gray-400 md:table-cell">Телефон</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400">Роль</th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium text-gray-400 sm:table-cell">Записей</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-400">
                <span className="sr-only">Действия</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-white/5 bg-surface/50 transition-colors last:border-0 hover:bg-white/5">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">
                    {u.name}
                    {u.id === currentUser?.id && (
                      <span className="ml-2 text-xs text-gray-500">(вы)</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </td>
                <td className="hidden px-4 py-3 text-gray-400 md:table-cell">{u.phone || '—'}</td>
                <td className="px-4 py-3">{roleControl(u)}</td>
                <td className="hidden px-4 py-3 text-gray-400 sm:table-cell">{regCountOf(u.id)}</td>
                <td className="px-4 py-3">{rowActions(u)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="bg-surface/50 px-4 py-10 text-center text-sm text-gray-500">
                  Ничего не найдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Мобильные карточки: на узких экранах таблица не помещается */}
      <ul className="space-y-3 sm:hidden">
        {filtered.map((u) => (
          <li key={u.id} className="rounded-sm border border-white/10 bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-white">
                  {u.name}
                  {u.id === currentUser?.id && (
                    <span className="ml-2 text-xs text-gray-500">(вы)</span>
                  )}
                </p>
                <p className="truncate text-xs text-gray-500">{u.email}</p>
                {u.phone && <p className="mt-0.5 text-xs text-gray-600">{u.phone}</p>}
              </div>
              <div className="shrink-0">{roleControl(u)}</div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/5 pt-3">
              <span className="text-xs text-gray-500">{regCountOf(u.id)} записей</span>
              {rowActions(u)}
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="rounded-sm border border-white/10 bg-surface px-4 py-10 text-center text-sm text-gray-500">
            Ничего не найдено
          </li>
        )}
      </ul>
    </div>
  );
}
