import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTrainers, addTrainer, updateTrainer, removeTrainer } from '../../store/trainersStore';
import { useTrainings, saveTrainings } from '../../store/trainingsStore';
import { getUsers, saveUsers, type User } from '../../store/database';
import { hashPassword, passwordIssues } from '../../lib/crypto';
import { inviteLink } from '../../lib/invite';
import { directions } from '../../data/directions';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/ui/ImageUpload';
import {
  Check,
  Copy,
  KeyRound,
  Link2,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';

const emptyForm = {
  name: '',
  specialization: '',
  experience: '',
  biography: '',
  photo: '',
  phone: '',
  email: '',
  certifications: '',
  directions: [] as string[],
  createAccount: true,
  loginEmail: '',
  password: '',
};

type FormState = typeof emptyForm;

/** Читаемый временный пароль, проходящий проверку сложности */
function generatePassword(): string {
  const letters = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  let tail = '';
  for (let i = 0; i < 6; i++) tail += letters[Math.floor(Math.random() * letters.length)];
  tail += digits[Math.floor(Math.random() * digits.length)];
  tail += digits[Math.floor(Math.random() * digits.length)];
  return `Vtoroe-${tail}`;
}

export default function AdminTrainers() {
  const trainers = useTrainers();
  const trainings = useTrainings();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [credentials, setCredentials] = useState<{
    name: string;
    email: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const users = getUsers();

  const field =
    'w-full rounded-sm border border-white/10 bg-primary px-3 py-2.5 text-sm text-white transition-colors placeholder:text-gray-600 focus:border-accent-red focus:outline-none';
  const label = 'mb-1.5 block text-xs uppercase tracking-wider text-gray-400';

  const accountOf = (trainerId: string): User | undefined =>
    users.find((u) => u.trainerId === trainerId && u.role === 'trainer');

  const sorted = useMemo(
    () => [...trainers].sort((a, b) => a.name.localeCompare(b.name, 'ru')),
    [trainers]
  );

  const closeForm = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const startCreate = () => {
    setForm({ ...emptyForm, password: generatePassword() });
    setEditingId(null);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEdit = (id: string) => {
    const t = trainers.find((x) => x.id === id);
    if (!t) return;
    setForm({
      name: t.name,
      specialization: t.specialization,
      experience: t.experience,
      biography: t.biography,
      photo: t.photo,
      phone: t.phone,
      email: t.email,
      certifications: t.certifications.join('\n'),
      directions: t.directions,
      createAccount: false,
      loginEmail: accountOf(id)?.email ?? '',
      password: '',
    });
    setEditingId(id);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const name = form.name.trim();
    if (!name) {
      toast('Укажите имя тренера', 'error');
      return;
    }

    const profile = {
      name,
      specialization: form.specialization.trim(),
      experience: form.experience.trim(),
      biography: form.biography.trim(),
      photo: form.photo.trim() || '/images/trainer.svg',
      phone: form.phone.trim(),
      email: form.email.trim(),
      certifications: form.certifications
        .split('\n')
        .map((c) => c.trim())
        .filter(Boolean),
      directions: form.directions,
    };

    const loginEmail = form.loginEmail.trim().toLowerCase();
    const allUsers = getUsers();

    if (form.createAccount) {
      if (!loginEmail) {
        toast('Укажите email для входа тренера', 'error');
        return;
      }
      if (allUsers.some((u) => u.email.toLowerCase() === loginEmail)) {
        toast('Этот email уже занят другим аккаунтом', 'error');
        return;
      }
      const issues = passwordIssues(form.password);
      if (issues.length > 0) {
        toast(`Пароль слишком простой: нужен ${issues.join(', ')}`, 'error');
        return;
      }
    }

    setBusy(true);

    const trainerId = editingId ?? 'trainer-' + Date.now();

    if (editingId) {
      updateTrainer(editingId, profile);
      // Обновляем имя тренера в уже созданных тренировках
      saveTrainings(
        trainings.map((t) => (t.trainerId === editingId ? { ...t, trainer: name } : t))
      );
    } else {
      addTrainer({ id: trainerId, ...profile });
    }

    if (form.createAccount) {
      const newUser: User = {
        id: 'u-' + Date.now(),
        name,
        email: loginEmail,
        phone: form.phone.trim(),
        role: 'trainer',
        trainerId,
        passwordHash: await hashPassword(form.password),
        created: new Date().toISOString().split('T')[0],
        mustChangePassword: true,
      };
      saveUsers([...allUsers, newUser]);
      setCopied(false);
      setCredentials({ name, email: loginEmail, password: form.password });
      toast(`Тренер добавлен, аккаунт создан: ${name}`);
    } else {
      toast(editingId ? 'Профиль тренера обновлён' : `Тренер добавлен: ${name}`);
    }

    setBusy(false);
    closeForm();
  };

  const createAccountFor = async (trainerId: string, name: string) => {
    const email = window.prompt(
      `Email (логин) для ${name}:`,
      `${name.toLowerCase().replace(/[^a-zа-яё]/gi, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '')}@vtoroe-dyhanie.ru`
    );
    if (!email) return;

    const loginEmail = email.trim().toLowerCase();
    if (getUsers().some((u) => u.email.toLowerCase() === loginEmail)) {
      toast('Этот email уже занят', 'error');
      return;
    }

    const password = generatePassword();
    const newUser: User = {
      id: 'u-' + Date.now(),
      name,
      email: loginEmail,
      phone: '',
      role: 'trainer',
      trainerId,
      passwordHash: await hashPassword(password),
      created: new Date().toISOString().split('T')[0],
      mustChangePassword: true,
    };
    saveUsers([...getUsers(), newUser]);
    setCopied(false);
    setCredentials({ name, email: loginEmail, password });
    toast('Аккаунт тренера создан');
  };

  const resetPassword = async (user: User) => {
    const password = generatePassword();
    const passwordHash = await hashPassword(password);
    saveUsers(
      getUsers().map((u) =>
        u.id === user.id ? { ...u, passwordHash, mustChangePassword: true } : u
      )
    );
    setCopied(false);
    setCredentials({ name: user.name, email: user.email, password });
    toast('Пароль тренера сброшен', 'info');
  };

  /** Копирует ссылку, открыв которую тренер получит доступ на своём устройстве */
  const copyInviteLink = async (account: User) => {
    const link = inviteLink(account, window.location.origin);
    try {
      await navigator.clipboard.writeText(link);
      toast('Ссылка для входа скопирована — отправьте её тренеру');
    } catch {
      toast('Не удалось скопировать ссылку', 'error');
    }
  };

  const copyCredentials = async () => {
    if (!credentials) return;
    try {
      await navigator.clipboard.writeText(
        `Логин: ${credentials.email}\nПароль: ${credentials.password}\nВход: ${window.location.origin}/login`
      );
      setCopied(true);
    } catch {
      toast('Не удалось скопировать — выделите вручную', 'error');
    }
  };

  const remove = (id: string, name: string) => {
    removeTrainer(id);
    // Отвязываем аккаунт, чтобы он не остался без профиля
    saveUsers(
      getUsers().map((u) => (u.trainerId === id ? { ...u, trainerId: undefined } : u))
    );
    saveTrainings(
      trainings.map((t) =>
        t.trainerId === id ? { ...t, trainer: 'Не назначен', trainerId: '' } : t
      )
    );
    setConfirmId(null);
    toast(`Тренер удалён: ${name}`, 'info');
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-white">Тренеры</h1>
          <p className="text-sm text-gray-400">
            {trainers.length} профилей · профиль сразу появляется на сайте
          </p>
        </div>
        <Button onClick={() => (open ? closeForm() : startCreate())} variant={open ? 'outline' : 'primary'} size="sm">
          {open ? (
            <>
              <X className="mr-1.5 h-4 w-4" /> Отмена
            </>
          ) : (
            <>
              <Plus className="mr-1.5 h-4 w-4" /> Добавить тренера
            </>
          )}
        </Button>
      </div>

      {trainers.some((t) => t.name.startsWith('[')) && (
        <div className="mb-6 rounded-sm border border-accent-blue/30 bg-accent-blue/10 px-4 py-3">
          <p className="text-xs leading-relaxed text-blue-200">
            В списке остались демонстрационные профили (помечены «[Имя тренера]»).
            Отредактируйте их под своих тренеров или удалите — на сайте они исчезнут сразу.
          </p>
        </div>
      )}

      {credentials && (
        <div className="mb-6 rounded-sm border border-yellow-500/30 bg-yellow-500/10 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-yellow-200">
                Доступ для {credentials.name}
              </p>
              <p className="mt-0.5 text-xs text-yellow-200/70">
                Показывается один раз — передайте тренеру лично
              </p>
              <div className="mt-2 space-y-1">
                <code className="block select-all break-all rounded-sm bg-black/40 px-3 py-1.5 font-mono text-sm text-white">
                  {credentials.email}
                </code>
                <code className="block select-all break-all rounded-sm bg-black/40 px-3 py-1.5 font-mono text-sm text-white">
                  {credentials.password}
                </code>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyCredentials}
                className="flex items-center gap-1.5 rounded-sm bg-yellow-500/20 px-3 py-1.5 text-xs font-semibold text-yellow-100 transition-colors hover:bg-yellow-500/30"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Скопировано' : 'Копировать всё'}
              </button>
              <button
                onClick={() => setCredentials(null)}
                className="text-xs text-yellow-200/70 hover:text-yellow-100"
              >
                Закрыть
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-yellow-200/70">
            При первом входе тренер увидит баннер «Смените стартовый пароль».
          </p>
        </div>
      )}

      {open && (
        <form onSubmit={submit} className="mb-6 space-y-5 rounded-sm border border-white/10 bg-surface p-6">
          <h2 className="font-semibold text-white">
            {editingId ? 'Редактирование тренера' : 'Новый тренер'}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="tr-name" className={label}>Имя и фамилия *</label>
              <input id="tr-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} placeholder="Иван Петров" />
            </div>
            <div>
              <label htmlFor="tr-spec" className={label}>Специализация</label>
              <input id="tr-spec" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className={field} placeholder="Бег, подготовка к марафонам" />
            </div>
            <div>
              <label htmlFor="tr-exp" className={label}>Опыт</label>
              <input id="tr-exp" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className={field} placeholder="8 лет тренерского стажа" />
            </div>
            <div>
              <label htmlFor="tr-phone" className={label}>Телефон</label>
              <input id="tr-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={field} placeholder="+7 900 000-00-00" />
            </div>
            <div>
              <label htmlFor="tr-email" className={label}>Контактный email</label>
              <input id="tr-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={field} placeholder="тренер@vtoroe-dyhanie.ru" />
            </div>
            <div className="sm:col-span-2">
              <ImageUpload
                value={form.photo}
                onChange={(photo) => setForm({ ...form, photo })}
                label="Фото тренера"
                fallback={form.name.trim().charAt(0).toUpperCase() || '?'}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="tr-bio" className={label}>О тренере</label>
              <textarea id="tr-bio" rows={4} value={form.biography} onChange={(e) => setForm({ ...form, biography: e.target.value })} className={`${field} resize-none`} placeholder="Опыт, достижения, подход к тренировкам" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="tr-certs" className={label}>Сертификаты и квалификации</label>
              <textarea id="tr-certs" rows={3} value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} className={`${field} resize-none`} placeholder={'Каждый с новой строки\nКМС по лёгкой атлетике'} />
            </div>
            <div className="sm:col-span-2">
              <span className={label}>Направления</span>
              <div className="flex flex-wrap gap-2">
                {directions.map((d) => {
                  const active = form.directions.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          directions: active
                            ? form.directions.filter((x) => x !== d.id)
                            : [...form.directions, d.id],
                        })
                      }
                      className={`rounded-sm px-3 py-1.5 text-xs transition-colors ${
                        active
                          ? 'bg-accent-red text-white'
                          : 'bg-white/5 text-gray-400 hover:text-white'
                      }`}
                    >
                      {d.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {!editingId && (
            <div className="rounded-sm border border-white/10 bg-primary/50 p-4">
              <label className="flex items-center gap-2 text-sm text-white">
                <input
                  type="checkbox"
                  checked={form.createAccount}
                  onChange={(e) => setForm({ ...form, createAccount: e.target.checked })}
                  className="h-4 w-4 accent-accent-red"
                />
                Сразу создать аккаунт для входа в кабинет
              </label>

              {form.createAccount && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="tr-login" className={label}>Логин (email) *</label>
                    <input
                      id="tr-login"
                      type="email"
                      value={form.loginEmail}
                      onChange={(e) => setForm({ ...form, loginEmail: e.target.value })}
                      className={field}
                      placeholder="ivan@vtoroe-dyhanie.ru"
                    />
                  </div>
                  <div>
                    <label htmlFor="tr-pass" className={label}>Пароль *</label>
                    <div className="flex gap-2">
                      <input
                        id="tr-pass"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className={field}
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, password: generatePassword() })}
                        className="shrink-0 rounded-sm bg-white/10 px-3 text-xs text-gray-300 transition-colors hover:bg-white/20 hover:text-white"
                        title="Сгенерировать пароль"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 sm:col-span-2">
                    Пароль покажем один раз после сохранения. Тренер сменит его при первом входе.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" size="sm" disabled={busy}>
              {busy ? 'Сохраняем…' : editingId ? 'Сохранить изменения' : 'Добавить тренера'}
            </Button>
            <button type="button" onClick={closeForm} className="text-xs text-gray-400 hover:text-white">
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {sorted.map((t) => {
          const account = accountOf(t.id);
          const dirNames = t.directions
            .map((id) => directions.find((d) => d.id === id)?.name)
            .filter(Boolean);

          return (
            <div key={t.id} className="rounded-sm border border-white/10 bg-surface p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {t.photo ? (
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="h-16 w-16 shrink-0 rounded-sm object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-sm bg-accent-red/15 text-xl font-bold text-accent-red">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-accent-red">{t.specialization || '—'}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{t.experience}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {dirNames.map((d) => (
                      <span key={d} className="rounded-sm bg-accent-blue/10 px-1.5 py-0.5 text-[10px] text-accent-blue">
                        {d}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs">
                    {account ? (
                      <span className="text-green-400">Аккаунт: {account.email}</span>
                    ) : (
                      <span className="text-yellow-500">Аккаунта нет — тренер не может войти</span>
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {account ? (
                    <>
                      <button
                        onClick={() => copyInviteLink(account)}
                        className="flex items-center gap-1.5 rounded-sm bg-accent-blue/10 px-2.5 py-1.5 text-xs text-accent-blue transition-colors hover:bg-accent-blue/20"
                        aria-label={`Ссылка для входа для ${t.name}`}
                        title="Ссылка добавит аккаунт в браузер тренера"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        Ссылка для входа
                      </button>
                      <button
                        onClick={() => resetPassword(account)}
                        className="flex items-center gap-1.5 rounded-sm bg-yellow-500/10 px-2.5 py-1.5 text-xs text-yellow-400 transition-colors hover:bg-yellow-500/20"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                        Сбросить пароль
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => createAccountFor(t.id, t.name)}
                      className="flex items-center gap-1.5 rounded-sm bg-green-500/10 px-2.5 py-1.5 text-xs text-green-400 transition-colors hover:bg-green-500/20"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Создать аккаунт
                    </button>
                  )}

                  <button
                    onClick={() => startEdit(t.id)}
                    className="text-gray-500 transition-colors hover:text-accent-blue"
                    aria-label={`Редактировать ${t.name}`}
                    title="Редактировать"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  {confirmId === t.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400">Удалить?</span>
                      <button
                        onClick={() => remove(t.id, t.name)}
                        className="rounded-sm bg-red-500/20 px-2 py-1 text-[11px] font-semibold text-red-300 hover:bg-red-500/30"
                      >
                        Да
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="rounded-sm px-2 py-1 text-[11px] text-gray-400 hover:text-white"
                      >
                        Нет
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(t.id)}
                      className="text-gray-500 transition-colors hover:text-red-400"
                      aria-label={`Удалить ${t.name}`}
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div className="rounded-sm border border-white/10 bg-surface p-8 text-center text-sm text-gray-400">
            Тренеров пока нет — добавьте первого.
          </div>
        )}
      </div>

      <div className="mt-6 space-y-2 text-xs leading-relaxed text-gray-600">
        <p>
          Профили сразу появляются на странице «Тренеры». Аккаунт даёт тренеру доступ к кабинету:
          своё расписание, спортсмены и посещаемость. Вы вошли как {currentUser?.name}.
        </p>
        <p className="rounded-sm border border-white/10 bg-surface/60 px-3 py-2">
          Важно: аккаунты хранятся в браузере, в котором вы их создали. Чтобы тренер вошёл
          со своего компьютера или телефона, нажмите «Ссылка для входа» и отправьте ему ссылку —
          она добавит доступ в его браузер. Пароль передайте отдельным сообщением.
        </p>
      </div>
    </div>
  );
}
