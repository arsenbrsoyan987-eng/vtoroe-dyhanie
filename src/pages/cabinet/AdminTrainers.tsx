import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTrainers, addTrainer, updateTrainer, removeTrainer } from '../../store/trainersStore';
import { useTrainings, updateTraining } from '../../store/trainingsStore';
import { activeProfiles, useProfiles } from '../../store/profilesStore';
import { supabase } from '../../lib/supabase';
import type { User } from '../../store/database';
import { useDirections } from '../../store/directionsStore';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/ui/ImageUpload';
import { Check, Copy, Link2, Mail, Pencil, Plus, Trash2, UserPlus, X } from 'lucide-react';
import { fieldClass, labelClass } from '../../components/cabinet/ui';
import { countNoun } from '../../lib/plural';

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
};

type FormState = typeof emptyForm;

/** Предложение логина из имени: тренер подтвердит или заменит его при регистрации */
function suggestLogin(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-zа-яё]/gi, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '');
  return `${slug || 'trainer'}@vtoroe-dyhanie.ru`;
}

export default function AdminTrainers() {
  const trainers = useTrainers();
  const trainings = useTrainings();
  const profiles = useProfiles();
  const directions = useDirections();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [invite, setInvite] = useState<{ name: string; email: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const users = useMemo(() => activeProfiles(profiles), [profiles]);

  /** Аккаунт тренера в общей базе: роль trainer и привязка к профилю на сайте */
  const accountOf = (trainerId: string): User | undefined =>
    users.find((u) => u.trainerId === trainerId && u.role === 'trainer');

  /** Email уже приглашён, но человек ещё не зарегистрировался */
  const pendingInviteOf = async (email: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('invitations')
      .select('email')
      .eq('email', email)
      .maybeSingle();
    return !error && Boolean(data);
  };

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
    setForm({ ...emptyForm });
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
    });
    setEditingId(id);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Сохраняет приглашение в таблицу invitations: триггер в базе выдаст
   * роль trainer и привязку к профилю, когда человек подтвердит регистрацию.
   */
  const saveInvite = async (email: string, name: string, trainerId: string) => {
    const { error } = await supabase.from('invitations').upsert(
      { email, name, role: 'trainer', trainer_id: trainerId },
      { onConflict: 'email' }
    );
    if (error) {
      toast(error.message, 'error');
      return false;
    }
    setCopied(false);
    setInvite({ name, email });
    return true;
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

    if (form.createAccount && !loginEmail) {
      toast('Укажите email, с которым тренер будет входить', 'error');
      return;
    }

    setBusy(true);

    const trainerId = editingId ?? 'trainer-' + Date.now();

    if (editingId) {
      await updateTrainer(editingId, profile);
      // Имя тренера хранится и в тренировках: переименование разносим по расписанию
      const affected = trainings.filter((t) => t.trainerId === editingId && t.trainer !== name);
      for (const t of affected) {
        await updateTraining(t.id, { trainer: name });
      }
    } else {
      await addTrainer({ id: trainerId, ...profile });
    }

    if (form.createAccount) {
      if (users.some((u) => u.email.toLowerCase() === loginEmail)) {
        toast('Этот email уже зарегистрирован — аккаунт привяжите в списке ниже', 'error');
        setBusy(false);
        return;
      }
      await saveInvite(loginEmail, name, trainerId);
    }

    setBusy(false);
    toast(editingId ? `Профиль обновлён: ${name}` : `Тренер добавлен: ${name}`);
    closeForm();
  };

  /** Создаёт аккаунт уже существующему тренеру — по email из его профиля */
  const createAccountFor = async (trainerId: string, name: string, fallbackEmail: string) => {
    const email = window.prompt(`Email (логин) для ${name}:`, fallbackEmail || suggestLogin(name));
    if (!email) return;

    const loginEmail = email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === loginEmail)) {
      toast('Этот email уже зарегистрирован', 'error');
      return;
    }
    if (await pendingInviteOf(loginEmail)) {
      toast('Приглашение для этого email уже отправлено', 'info');
      return;
    }

    if (await saveInvite(loginEmail, name, trainerId)) {
      toast('Приглашение сохранено — отправьте тренеру ссылку');
    }
  };

  /** Привязывает уже зарегистрированный аккаунт к профилю тренера */
  const linkExistingAccount = async (trainerId: string, name: string) => {
    const candidates = users.filter(
      (u) => u.role === 'athlete' && !u.trainerId && u.email.toLowerCase() === suggestLogin(name).toLowerCase()
    );
    const email = window.prompt(
      `Email аккаунта, который станет тренером «${name}»:`,
      candidates[0]?.email ?? ''
    );
    if (!email) return;

    const target = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!target) {
      toast('Аккаунт с таким email ещё не зарегистрировался', 'error');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ role: 'trainer', trainer_id: trainerId })
      .eq('id', target.id);

    if (error) {
      toast(error.message, 'error');
      return;
    }
    toast(`Аккаунт ${target.email} теперь тренер`);
  };

  const copyRegisterLink = async (email: string) => {
    const link = `${window.location.origin}/register?email=${encodeURIComponent(email)}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast('Ссылка на регистрацию скопирована — отправьте её тренеру');
    } catch {
      toast('Не удалось скопировать ссылку', 'error');
    }
  };

  const remove = async (id: string, name: string) => {
    await removeTrainer(id);

    // Отвязываем аккаунт, чтобы он не остался привязан к удалённому профилю
    const account = accountOf(id);
    if (account) {
      await supabase.from('profiles').update({ trainer_id: null, role: 'athlete' }).eq('id', account.id);
    }
    // Отзываем неиспользованное приглашение
    await supabase.from('invitations').delete().eq('trainer_id', id);

    // Освобождаем тренировки этого тренера
    const affected = trainings.filter((t) => t.trainerId === id);
    for (const t of affected) {
      await updateTraining(t.id, { trainer: 'Не назначен', trainerId: '' });
    }

    setConfirmId(null);
    toast(`Тренер удалён: ${name}`, 'info');
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 display text-2xl text-ink">Тренеры</h1>
          <p className="text-sm text-graphite">
            {countNoun(trainers.length, 'профиль', 'профиля', 'профилей')} · профиль сразу появляется на сайте
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
        <div className="mb-6 rounded-xl border border-navy/30 bg-navy/10 px-4 py-3">
          <p className="text-xs leading-relaxed text-navy">
            В списке остались демонстрационные профили (помечены «[Имя тренера]»).
            Отредактируйте их под своих тренеров или удалите — на сайте они исчезнут сразу.
          </p>
        </div>
      )}

      {invite && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-emerald-800">Приглашение для {invite.name}</p>
              <p className="mt-0.5 text-xs text-emerald-700/70">
                Роль тренера привяжется автоматически при регистрации с email{' '}
                {invite.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyRegisterLink(invite.email)}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-500/20"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Скопировано' : 'Ссылка на регистрацию'}
              </button>
              <button
                onClick={() => setInvite(null)}
                className="text-xs text-emerald-700/70 hover:text-emerald-800"
              >
                Закрыть
              </button>
            </div>
          </div>
          <p className="mt-3 text-xs text-emerald-700/70">
            Пароль тренер придумывает сам, доступ появляется на любом его устройстве.
            Пока он не зарегистрируется, вход в кабинет ему недоступен.
          </p>
        </div>
      )}

      {open && (
        <form onSubmit={submit} className="mb-6 space-y-5 rounded-2xl border border-line bg-paper shadow-card p-6">
          <h2 className="font-semibold text-ink">
            {editingId ? 'Редактирование тренера' : 'Новый тренер'}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="tr-name" className={labelClass}>Имя и фамилия *</label>
              <input id="tr-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldClass} placeholder="Иван Петров" />
            </div>
            <div>
              <label htmlFor="tr-spec" className={labelClass}>Специализация</label>
              <input id="tr-spec" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className={fieldClass} placeholder="Бег, подготовка к марафонам" />
            </div>
            <div>
              <label htmlFor="tr-exp" className={labelClass}>Опыт</label>
              <input id="tr-exp" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className={fieldClass} placeholder="8 лет тренерского стажа" />
            </div>
            <div>
              <label htmlFor="tr-phone" className={labelClass}>Телефон</label>
              <input id="tr-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={fieldClass} placeholder="+7 900 000-00-00" />
            </div>
            <div>
              <label htmlFor="tr-email" className={labelClass}>Контактный email на сайте</label>
              <input id="tr-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={fieldClass} placeholder="тренер@vtoroe-dyhanie.ru" />
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
              <label htmlFor="tr-bio" className={labelClass}>О тренере</label>
              <textarea id="tr-bio" rows={4} value={form.biography} onChange={(e) => setForm({ ...form, biography: e.target.value })} className={`${fieldClass} resize-none`} placeholder="Опыт, достижения, подход к тренировкам" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="tr-certs" className={labelClass}>Сертификаты и квалификации</label>
              <textarea id="tr-certs" rows={3} value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} className={`${fieldClass} resize-none`} placeholder={'Каждый с новой строки\nКМС по лёгкой атлетике'} />
            </div>
            <div className="sm:col-span-2">
              <span className={labelClass}>Направления</span>
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
                      className={`rounded-xl px-3 py-1.5 text-xs transition-colors ${
                        active
                          ? 'bg-brand text-white'
                          : 'bg-mist text-graphite hover:text-ink'
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
            <div className="rounded-xl border border-line bg-mist/60 p-4">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.createAccount}
                  onChange={(e) => setForm({ ...form, createAccount: e.target.checked })}
                  className="h-4 w-4 accent-brand"
                />
                Сразу пригласить тренера в кабинет
              </label>

              {form.createAccount && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="tr-login" className={labelClass}>Email для входа *</label>
                    <input
                      id="tr-login"
                      type="email"
                      value={form.loginEmail}
                      onChange={(e) => setForm({ ...form, loginEmail: e.target.value })}
                      className={fieldClass}
                      placeholder={suggestLogin(form.name || 'тренера')}
                    />
                  </div>
                  <p className="self-end text-xs leading-relaxed text-graphite/70 sm:col-span-1">
                    На этот email придёт ссылка регистрации: тренер сам придумает пароль
                    и получит роль тренера автоматически.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" size="sm" disabled={busy}>
              {busy ? 'Сохраняем…' : editingId ? 'Сохранить изменения' : 'Добавить тренера'}
            </Button>
            <button type="button" onClick={closeForm} className="text-xs text-graphite hover:text-ink">
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
            <div key={t.id} className="rounded-2xl border border-line bg-paper shadow-card p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {t.photo ? (
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-xl font-bold text-brand">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{t.name}</p>
                  <p className="text-xs text-brand">{t.specialization || '—'}</p>
                  <p className="mt-0.5 text-xs text-graphite">{t.experience}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {dirNames.map((d) => (
                      <span key={d} className="rounded-xl bg-navy/10 px-1.5 py-0.5 text-[10px] text-navy">
                        {d}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs">
                    {account ? (
                      <span className="text-emerald-700">Входит в кабинет: {account.email}</span>
                    ) : (
                      <span className="text-amber-700">Аккаунта нет — тренер не может войти</span>
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  {account ? (
                    <button
                      onClick={() => copyRegisterLink(account.email)}
                      className="flex items-center gap-1.5 rounded-xl bg-navy/10 px-2.5 py-1.5 text-xs text-navy transition-colors hover:bg-navy/20"
                      aria-label={`Ссылка на вход для ${t.name}`}
                      title="Ссылка на страницу входа — отправьте её тренеру"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      Ссылка для входа
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => createAccountFor(t.id, t.name, t.email)}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-700 transition-colors hover:bg-emerald-500/10"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Пригласить
                      </button>
                      <button
                        onClick={() => linkExistingAccount(t.id, t.name)}
                        className="flex items-center gap-1.5 rounded-xl bg-mist px-2.5 py-1.5 text-xs text-ink/80 transition-colors hover:bg-line hover:text-ink"
                        title="Если человек уже зарегистрировался как спортсмен"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Привязать аккаунт
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => startEdit(t.id)}
                    className="text-graphite transition-colors hover:text-navy"
                    aria-label={`Редактировать ${t.name}`}
                    title="Редактировать"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  {confirmId === t.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-graphite">Удалить?</span>
                      <button
                        onClick={() => remove(t.id, t.name)}
                        className="rounded-xl bg-brand/10 px-2 py-1 text-[11px] font-semibold text-brand hover:bg-brand/15"
                      >
                        Да
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="rounded-xl px-2 py-1 text-[11px] text-graphite hover:text-ink"
                      >
                        Нет
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(t.id)}
                      className="text-graphite transition-colors hover:text-brand"
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
          <div className="rounded-2xl border border-line bg-paper shadow-card p-8 text-center text-sm text-graphite">
            Тренеров пока нет — добавьте первого.
          </div>
        )}
      </div>

      <div className="mt-6 space-y-2 text-xs leading-relaxed text-graphite/70">
        <p>
          Профили сразу появляются на странице «Тренеры». Аккаунт даёт тренеру доступ к кабинету:
          своё расписание, спортсмены и посещаемость. Вы вошли как {currentUser?.name}.
        </p>
        <p className="rounded-xl border border-line bg-mist px-3 py-2">
          Важно: доступы общие, они в облаке. Пригласите тренера по ссылке на регистрацию —
          он придёт с любого своего устройства и попадёт в список «Пользователи» автоматически.
        </p>
      </div>
    </div>
  );
}