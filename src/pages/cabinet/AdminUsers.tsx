import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useProfiles } from '../../store/profilesStore';
import { supabase } from '../../lib/supabase';
import type { User } from '../../store/database';
import { canDeleteUser, isAdmin, isOwner } from '../../lib/permissions';
import { useTrainers } from '../../store/trainersStore';
import Button from '../../components/ui/Button';
import { Check, Copy, Download, Mail, Plus, Radio, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import { fieldClass, labelClass } from '../../components/cabinet/ui';
import { countNoun } from '../../lib/plural';
import { downloadCsv } from '../../lib/export';

const ROLE_LABEL: Record<User['role'], string> = {
  athlete: 'Спортсмен',
  trainer: 'Тренер',
  admin: 'Администратор',
};

const ROLE_STYLE: Record<User['role'], string> = {
  athlete: 'bg-navy/10 text-navy',
  trainer: 'bg-emerald-500/10 text-emerald-700',
  admin: 'bg-brand/10 text-brand',
};

const formatDate = (iso: string) =>
  iso
    ? new Date(`${iso}T12:00:00`).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

export default function AdminUsers() {
  const { currentUser, registrations, deleteUser } = useAuth();
  const { toast } = useToast();

  // Список приходит из общей базы и обновляется по realtime:
  // регистрация с телефона появляется здесь без перезагрузки
  const profiles = useProfiles();
  const trainers = useTrainers();

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | User['role']>('all');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'athlete' as Exclude<User['role'], 'admin'>,
    trainerId: '',
  });
  const [invited, setInvited] = useState<{ email: string; role: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const users = useMemo(() => profiles.filter((p) => !p.deleted), [profiles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        ROLE_LABEL[u.role].toLowerCase().includes(q)
      );
    });
  }, [users, query, roleFilter]);

  const athletes = users.filter((u) => u.role === 'athlete').length;

  /** Выгрузка текущей выборки: то, что видно на экране, попадает в файл */
  const exportUsers = () => {
    const rows: (string | number)[][] = [
      ['Имя', 'Email', 'Телефон', 'Роль', 'Записей', 'В школе с'],
    ];
    for (const u of filtered) {
      rows.push([
        u.name,
        u.email,
        u.phone,
        ROLE_LABEL[u.role],
        registrations.filter((r) => r.userId === u.id && r.status !== 'cancelled').length,
        u.created,
      ]);
    }
    downloadCsv(`users-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    toast(`Выгружено ${filtered.length} ${countNoun(filtered.length, 'аккаунт', 'аккаунта', 'аккаунтов')}`);
  };

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const email = form.email.trim().toLowerCase();
    if (!email) return;
    if (users.some((u) => u.email.toLowerCase() === email)) {
      toast('Пользователь с таким email уже зарегистрирован', 'error');
      return;
    }

    setBusy(true);
    const { error } = await supabase.from('invitations').upsert(
      {
        email,
        name: form.name.trim(),
        role: form.role,
        trainer_id: form.role === 'trainer' && form.trainerId ? form.trainerId : null,
      },
      { onConflict: 'email' }
    );
    setBusy(false);

    if (error) {
      toast(error.message, 'error');
      return;
    }

    setInvited({ email, role: ROLE_LABEL[form.role] });
    setOpen(false);
    setForm({ name: '', email: '', role: 'athlete', trainerId: '' });
    toast('Приглашение сохранено — отправьте человеку ссылку на регистрацию');
  };

  const changeRole = async (id: string, role: User['role']) => {
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

    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) {
      toast(error.message, 'error');
      return;
    }
    toast('Роль обновлена');
  };

  const copyRegisterLink = async (email?: string) => {
    const link = `${window.location.origin}/register${email ? `?email=${encodeURIComponent(email)}` : ''}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast('Ссылка на регистрацию скопирована');
    } catch {
      toast('Не удалось скопировать ссылку', 'error');
    }
  };

  const removeUser = async (id: string, name: string) => {
    const target = users.find((u) => u.id === id) ?? null;
    const check = canDeleteUser(currentUser, target);
    if (!check.ok) {
      setConfirmId(null);
      toast(check.error, 'error');
      return;
    }

    const result = await deleteUser(id);
    if (!result.ok) {
      setConfirmId(null);
      toast(result.error, 'error');
      return;
    }

    setConfirmId(null);
    toast(`Аккаунт удалён: ${name}`, 'info');
  };

  const regCountOf = (id: string) =>
    registrations.filter((r) => r.userId === id && r.status !== 'cancelled').length;

  const roleControl = (u: User) => {
    if (isOwner(u)) {
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-semibold ${ROLE_STYLE.admin}`}
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
          className={`inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-semibold ${ROLE_STYLE.admin}`}
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
        className={`cursor-pointer rounded-xl border-0 px-2 py-1 text-xs font-semibold ${ROLE_STYLE[u.role]}`}
        aria-label={`Роль пользователя ${u.name}`}
      >
        <option value="athlete">Спортсмен</option>
        <option value="trainer">Тренер</option>
      </select>
    );
  };

  const rowActions = (u: User) => {
    if (!isAdmin(currentUser)) return null;
    if (u.id === currentUser?.id) {
      return <p className="text-right text-[11px] text-graphite/70">Это вы</p>;
    }
    if (confirmId === u.id) {
      return (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="text-[11px] text-graphite">Удалить аккаунт?</span>
          <button
            onClick={() => removeUser(u.id, u.name)}
            className="rounded-xl bg-brand/10 px-2 py-1 text-[11px] font-semibold text-brand transition-colors hover:bg-brand/15"
          >
            Да, удалить
          </button>
          <button
            onClick={() => setConfirmId(null)}
            className="rounded-xl px-2 py-1 text-[11px] text-graphite transition-colors hover:text-ink"
          >
            Отмена
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => copyRegisterLink(u.email)}
          className="rounded-xl p-1.5 text-graphite transition-colors hover:bg-mist hover:text-navy"
          aria-label={`Ссылка на регистрацию для ${u.name}`}
          title="Скопировать ссылку на регистрацию"
        >
          <Mail className="h-4 w-4" />
        </button>
        <button
          onClick={() => setConfirmId(u.id)}
          className="flex items-center gap-1.5 rounded-xl border border-brand/30 px-2.5 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand/10 hover:text-brand"
          aria-label={`Удалить ${u.name}`}
          title="Удалить аккаунт"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Удалить
        </button>
      </div>
    );
  };

  if (!isAdmin(currentUser)) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-line bg-paper shadow-card p-6 text-center">
        <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-graphite" />
        <h1 className="mb-1 text-lg font-semibold text-ink">Доступ только администратору</h1>
        <p className="text-sm text-graphite">
          Управлять пользователями школы может только владелец аккаунта.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 display text-2xl text-ink">Пользователи</h1>
          <p className="text-sm text-graphite">
            {countNoun(users.length, 'аккаунт', 'аккаунта', 'аккаунтов')} ·{' '}
            {countNoun(athletes, 'спортсмен', 'спортсмена', 'спортсменов')}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700">
            <Radio className="h-3 w-3 animate-pulse" />
            Список обновляется в реальном времени — новые регистрации появляются сами
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportUsers} variant="outline" size="sm">
            <Download className="mr-1.5 h-4 w-4" /> Экспорт
          </Button>
          <Button onClick={() => setOpen((v) => !v)} variant={open ? 'outline' : 'primary'} size="sm">
            {open ? (
              <>
                <X className="mr-1.5 h-4 w-4" /> Отмена
              </>
            ) : (
              <>
                <Plus className="mr-1.5 h-4 w-4" /> Пригласить
              </>
            )}
          </Button>
        </div>
      </div>

      {open && (
        <form onSubmit={invite} className="mb-6 space-y-4 rounded-2xl border border-line bg-paper shadow-card p-6">
          <h2 className="font-semibold text-ink">Приглашение</h2>
          <p className="text-xs leading-relaxed text-graphite">
            Укажите email, с которым человек зарегистрируется. Роль и привязка к тренеру
            применятся автоматически — пароль он придумает сам, письмо с подтверждением
            придёт на почту.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="nu-name" className={labelClass}>Имя и фамилия</label>
              <input id="nu-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldClass} placeholder="Иван Петров" />
            </div>
            <div>
              <label htmlFor="nu-email" className={labelClass}>Email *</label>
              <input id="nu-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={fieldClass} placeholder="ivan@example.ru" />
            </div>
            <div>
              <label htmlFor="nu-role" className={labelClass}>Роль</label>
              <select id="nu-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'athlete' | 'trainer' })} className={fieldClass}>
                <option value="athlete">Спортсмен</option>
                <option value="trainer">Тренер</option>
              </select>
              <p className="mt-1 text-xs text-graphite/70">
                Права администратора закреплены за владельцем школы.
              </p>
            </div>
            {form.role === 'trainer' && (
              <div>
                <label htmlFor="nu-trainer" className={labelClass}>Профиль тренера на сайте</label>
                <select
                  id="nu-trainer"
                  value={form.trainerId}
                  onChange={(e) => setForm({ ...form, trainerId: e.target.value })}
                  className={fieldClass}
                >
                  <option value="">Не привязан</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <Button type="submit" variant="primary" size="sm" disabled={busy}>
            {busy ? 'Сохраняем…' : 'Сохранить приглашение'}
          </Button>
        </form>
      )}

      {invited && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-emerald-800">
                Приглашение для {invited.email}
              </p>
              <p className="mt-0.5 text-xs text-emerald-700/70">
                Роль: {invited.role} · применится при регистрации с этим email
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyRegisterLink(invited.email)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-500/20"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Скопировано' : 'Ссылка на регистрацию'}
              </button>
              <button
                onClick={() => setInvited(null)}
                className="text-xs text-emerald-700/70 hover:text-emerald-800"
              >
                Закрыть
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-emerald-700/70">
            Отправьте человеку ссылку. После регистрации и подтверждения почты он появится
            в этом списке автоматически.
          </p>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[16rem] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по имени, email, телефону или роли"
            className={`${fieldClass} pl-10`}
            aria-label="Поиск пользователей"
          />
        </div>

        <div className="inline-flex flex-wrap gap-1 rounded-full border border-line bg-paper p-1">
          {(
            [
              { value: 'all', label: 'Все' },
              { value: 'athlete', label: 'Спортсмены' },
              { value: 'trainer', label: 'Тренеры' },
            ] as const
          ).map((item) => {
            const count =
              item.value === 'all'
                ? users.length
                : users.filter((u) => u.role === item.value).length;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setRoleFilter(item.value)}
                aria-pressed={roleFilter === item.value}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  roleFilter === item.value
                    ? 'bg-ink text-white'
                    : 'text-graphite hover:text-ink'
                }`}
              >
                {item.label} · {count}
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-line sm:block">
        <table className="w-full min-w-[34rem] text-sm">
          <thead className="bg-paper">
            <tr className="border-b border-line">
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-graphite">Пользователь</th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium text-graphite md:table-cell">Телефон</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-graphite">Роль</th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium text-graphite sm:table-cell">Записей</th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium text-graphite lg:table-cell">В школе с</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-graphite">
                <span className="sr-only">Действия</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-line bg-mist transition-colors last:border-0 hover:bg-mist">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">
                    {u.name}
                    {u.id === currentUser?.id && (
                      <span className="ml-2 text-xs text-graphite">(вы)</span>
                    )}
                  </p>
                  <p className="text-xs text-graphite">{u.email}</p>
                </td>
                <td className="hidden px-4 py-3 text-graphite md:table-cell">{u.phone || '—'}</td>
                <td className="px-4 py-3">{roleControl(u)}</td>
                <td className="hidden px-4 py-3 text-graphite sm:table-cell">{regCountOf(u.id)}</td>
                <td className="hidden px-4 py-3 text-graphite lg:table-cell">{formatDate(u.created)}</td>
                <td className="px-4 py-3">{rowActions(u)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="bg-mist px-4 py-10 text-center text-sm text-graphite">
                  {users.length === 0 ? 'Загрузка списка…' : 'Ничего не найдено'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Мобильные карточки: на узких экранах таблица не помещается */}
      <ul className="space-y-3 sm:hidden">
        {filtered.map((u) => (
          <li key={u.id} className="rounded-2xl border border-line bg-paper shadow-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">
                  {u.name}
                  {u.id === currentUser?.id && (
                    <span className="ml-2 text-xs text-graphite">(вы)</span>
                  )}
                </p>
                <p className="truncate text-xs text-graphite">{u.email}</p>
                {u.phone && <p className="mt-0.5 text-xs text-graphite/70">{u.phone}</p>}
              </div>
              <div className="shrink-0">{roleControl(u)}</div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
              <span className="text-xs text-graphite">{regCountOf(u.id)} записей</span>
              {rowActions(u)}
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-line bg-paper shadow-card px-4 py-10 text-center text-sm text-graphite">
            {users.length === 0 ? 'Загрузка списка…' : 'Ничего не найдено'}
          </li>
        )}
      </ul>
    </div>
  );
}