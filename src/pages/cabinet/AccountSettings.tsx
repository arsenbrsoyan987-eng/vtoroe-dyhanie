import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ImageUpload from '../../components/ui/ImageUpload';
import {
  ActionButton,
  PageHeader,
  Panel,
  PanelTitle,
  StatusBadge,
  fieldClass,
  labelClass,
} from '../../components/cabinet/ui';
import {
  CreditCard,
  Calendar,
  KeyRound,
  ShieldCheck,
  Download,
  Link2,
  Unlink,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Bell,
  TrendingUp,
} from 'lucide-react';
import { passwordIssues } from '../../lib/crypto';
import { OAUTH_PROVIDERS, providerLabel } from '../../lib/oauth';
import { buildExport, downloadJson } from '../../lib/export';
import { normalizePhone, phoneIssue } from '../../store/database';
import { countNoun } from '../../lib/plural';

const ROLE_LABEL: Record<string, string> = {
  athlete: 'Спортсмен',
  trainer: 'Тренер',
  admin: 'Администратор',
};

/** Оценка пароля по тем же требованиям, что проверяет база */
function strengthOf(password: string): { score: number; label: string; tone: string } {
  if (!password) return { score: 0, label: 'не задан', tone: 'bg-line' };
  const issues = passwordIssues(password);
  const score = Math.max(0, 4 - issues.length);
  if (score >= 4) return { score, label: 'надёжный', tone: 'bg-emerald-500' };
  if (score === 3) return { score, label: 'хороший', tone: 'bg-emerald-400' };
  if (score === 2) return { score, label: 'средний', tone: 'bg-amber-400' };
  return { score: Math.max(1, score), label: 'слабый', tone: 'bg-brand' };
}

export default function AccountSettings() {
  const {
    currentUser,
    updateProfile,
    changePassword,
    identities,
    linkOAuth,
    unlinkOAuth,
    deleteOwnAccount,
    registrations,
    personalResults,
    notifications,
  } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(currentUser?.name ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [photo, setPhoto] = useState(currentUser?.photo ?? '');
  const [profileBusy, setProfileBusy] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [nextPw, setNextPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwBusy, setPwBusy] = useState(false);

  const [linkBusy, setLinkBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);

  const myRegs = useMemo(
    () => registrations.filter((r) => r.userId === currentUser?.id),
    [registrations, currentUser?.id]
  );
  const attended = myRegs.filter((r) => r.attended).length;
  const unread = notifications.filter((n) => n.userId === currentUser?.id && !n.read).length;

  const phoneError = phone.trim() ? phoneIssue(phone) : null;
  const dirty =
    name !== (currentUser?.name ?? '') ||
    phone !== (currentUser?.phone ?? '') ||
    photo !== (currentUser?.photo ?? '');

  /** Заполненность профиля: без фото и телефона тренер не узнает спортсмена */
  const filled = useMemo(() => {
    const checks = [
      { label: 'Имя и фамилия', ok: name.trim().length >= 3 },
      { label: 'Телефон', ok: !phoneIssue(phone) },
      { label: 'Фото профиля', ok: Boolean(photo) },
    ];
    return { checks, done: checks.filter((c) => c.ok).length, total: checks.length };
  }, [name, phone, photo]);

  const strength = strengthOf(nextPw);
  const mismatch = confirmPw.length > 0 && nextPw !== confirmPw;

  if (!currentUser) return null;

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileBusy) return;
    if (phoneError) {
      toast(phoneError, 'error');
      return;
    }

    setProfileBusy(true);
    const result = await updateProfile({
      name: name.trim(),
      phone: normalizePhone(phone),
      photo,
    });
    setProfileBusy(false);

    if (result.ok) {
      setPhone(normalizePhone(phone));
      toast('Профиль обновлён');
    } else {
      toast(result.error, 'error');
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwBusy) return;

    if (nextPw !== confirmPw) {
      toast('Новые пароли не совпадают', 'error');
      return;
    }
    const issues = passwordIssues(nextPw);
    if (issues.length > 0) {
      toast(`Пароль слишком простой: нужен ${issues.join(', ')}`, 'error');
      return;
    }

    setPwBusy(true);
    const result = await changePassword(currentPw, nextPw);
    setPwBusy(false);

    if (result.ok) {
      toast('Пароль изменён');
      setCurrentPw('');
      setNextPw('');
      setConfirmPw('');
    } else {
      toast(result.error, 'error');
    }
  };

  const hasEmailPassword = identities.some((i) => i.provider === 'email');

  const handleLink = async (key: 'yandex' | 'google' | 'apple') => {
    setLinkBusy(key);
    const result = await linkOAuth(key);
    if (!result.ok) {
      toast(result.error, 'error');
      setLinkBusy(null);
    }
  };

  const handleUnlink = async (identityId: string) => {
    const result = await unlinkOAuth(identityId);
    if (result.ok) toast('Способ входа отвязан', 'info');
    else toast(result.error, 'error');
  };

  const exportData = () => {
    downloadJson(buildExport(currentUser, registrations, personalResults, notifications));
    toast('Файл с вашими данными скачан');
  };

  const handleDelete = async () => {
    if (deleteBusy) return;
    if (confirmDelete.trim().toUpperCase() !== 'УДАЛИТЬ') {
      toast('Введите слово УДАЛИТЬ для подтверждения', 'error');
      return;
    }

    setDeleteBusy(true);
    const result = await deleteOwnAccount();
    setDeleteBusy(false);

    if (result.ok) {
      toast('Аккаунт удалён. Спасибо, что были с нами!', 'info');
      navigate('/', { replace: true });
    } else {
      toast(result.error, 'error');
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Аккаунт"
        title="Настройки"
        subtitle="Профиль, безопасность, способы входа и ваши данные."
      />

      {filled.done < filled.total && (
        <div className="mb-5 rounded-2xl border border-navy/20 bg-navy/5 p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">
              Профиль заполнен на {filled.done} из {filled.total}
            </p>
            <span className="text-[0.68rem] text-graphite">
              Тренер видит эти данные в списке участников
            </span>
          </div>
          <div className="mb-2.5 h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-navy transition-all"
              style={{ width: `${(filled.done / filled.total) * 100}%` }}
            />
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {filled.checks.map((check) => (
              <li
                key={check.label}
                className={`flex items-center gap-1.5 text-[0.68rem] ${
                  check.ok ? 'text-emerald-700' : 'text-graphite'
                }`}
              >
                {check.ok ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
                {check.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <PanelTitle hint="Имя и фото видны тренеру в списках участников.">Профиль</PanelTitle>
          <form onSubmit={saveProfile} className="space-y-4">
            <ImageUpload
              value={photo}
              onChange={setPhoto}
              label="Фото профиля"
              circle
              fallback={name.trim().charAt(0).toUpperCase() || '?'}
            />
            <div>
              <label htmlFor="name" className={labelClass}>
                Имя и фамилия
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
                maxLength={80}
              />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>
                Телефон
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`${fieldClass} ${phoneError ? 'border-brand/60' : ''}`}
                placeholder="+7 900 000-00-00"
                aria-invalid={Boolean(phoneError)}
                aria-describedby={phoneError ? 'phone-error' : undefined}
              />
              {phoneError ? (
                <p id="phone-error" className="mt-1.5 text-xs text-brand">
                  {phoneError}
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-graphite">
                  По телефону тренер связывается при переносе занятия.
                </p>
              )}
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>
                Email (логин)
              </label>
              <input
                id="email"
                value={currentUser.email || 'не задан'}
                disabled
                className={`${fieldClass} cursor-not-allowed`}
              />
              <p className="mt-1.5 text-xs text-graphite">Логин меняет только администратор школы.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ActionButton type="submit" disabled={profileBusy || Boolean(phoneError) || !dirty}>
                {profileBusy ? 'Сохраняем…' : 'Сохранить профиль'}
              </ActionButton>
              {dirty && !profileBusy && (
                <button
                  type="button"
                  onClick={() => {
                    setName(currentUser.name);
                    setPhone(currentUser.phone);
                    setPhoto(currentUser.photo ?? '');
                  }}
                  className="text-xs text-graphite transition-colors hover:text-ink"
                >
                  Вернуть как было
                </button>
              )}
            </div>
          </form>
        </Panel>

        <Panel>
          <div className="mb-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <KeyRound className="h-4 w-4 text-brand" />
              Смена пароля
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-graphite">
              {hasEmailPassword
                ? 'Регулярно меняйте пароль и не передавайте его третьим лицам.'
                : 'Пароль не задан: вы входите через внешний сервис. Добавьте пароль, чтобы входить по email.'}
            </p>
          </div>
          <form onSubmit={savePassword} className="space-y-3">
            <div>
              <label htmlFor="current-pw" className={labelClass}>
                Текущий пароль
              </label>
              <input
                id="current-pw"
                type="password"
                autoComplete="current-password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label htmlFor="next-pw" className={labelClass}>
                Новый пароль
              </label>
              <input
                id="next-pw"
                type="password"
                autoComplete="new-password"
                value={nextPw}
                onChange={(e) => setNextPw(e.target.value)}
                className={fieldClass}
                required
              />
              {nextPw && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i <= strength.score ? strength.tone : 'bg-line'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[0.62rem] text-graphite">{strength.label}</span>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="confirm-pw" className={labelClass}>
                Повторите новый пароль
              </label>
              <input
                id="confirm-pw"
                type="password"
                autoComplete="new-password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className={`${fieldClass} ${mismatch ? 'border-brand/60' : ''}`}
                aria-invalid={mismatch}
                required
              />
              {mismatch && <p className="mt-1.5 text-xs text-brand">Пароли пока не совпадают</p>}
            </div>
            <ActionButton type="submit" disabled={pwBusy || mismatch}>
              {pwBusy ? 'Меняем…' : 'Изменить пароль'}
            </ActionButton>
          </form>
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-mist px-3 py-2.5 text-xs leading-relaxed text-graphite">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            Пароль хранится в виде необратимого хеша (PBKDF2, 120 000 итераций).
          </p>
        </Panel>
      </div>

      <Panel className="mt-5">
        <PanelTitle hint="Привязанный сервис позволяет входить в один клик — без пароля. Основной вход по email остаётся доступен.">
          Способы входа
        </PanelTitle>

        {identities.length > 0 && (
          <ul className="mb-4 space-y-2">
            {identities.map((identity) => (
              <li
                key={identity.identity_id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-mist/50 px-3.5 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <Link2 className="h-4 w-4 shrink-0 text-graphite" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">
                      {providerLabel(identity.provider)}
                    </p>
                    <p className="truncate text-xs text-graphite">
                      {(identity.identity_data?.email as string | undefined) ??
                        (identity.identity_data?.preferred_username as string | undefined) ??
                        'подключено'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleUnlink(identity.identity_id)}
                  disabled={identities.length <= 1}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-graphite transition-colors hover:bg-brand/10 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Unlink className="h-3.5 w-3.5" />
                  Отвязать
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-2 sm:grid-cols-3">
          {OAUTH_PROVIDERS.map((provider) => {
            const linked = identities.some(
              (i) => i.provider === provider.provider || i.provider === provider.key
            );
            return (
              <button
                key={provider.key}
                type="button"
                disabled={linked || linkBusy !== null}
                onClick={() => void handleLink(provider.key)}
                className="flex items-center justify-center gap-2 rounded-full border border-line px-3 py-2.5 text-xs font-bold text-ink transition-colors hover:border-ink/25 hover:bg-mist disabled:cursor-not-allowed disabled:opacity-50"
              >
                {linked
                  ? 'Привязано'
                  : linkBusy === provider.key
                    ? 'Открываем…'
                    : `Привязать ${provider.label}`}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[0.68rem] leading-relaxed text-graphite/80">
          Кнопки работают после того, как провайдеры включены в настройках
          Supabase. Если сервис не подключён, он просто не появится на странице входа.
        </p>
      </Panel>

      <Panel className="mt-5">
        <PanelTitle>Аккаунт</PanelTitle>
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="flex items-center justify-between rounded-xl bg-mist/60 px-3 py-2.5 sm:block sm:bg-transparent sm:px-0 sm:py-0">
            <dt className="text-graphite">Роль</dt>
            <dd className="font-semibold text-ink">{ROLE_LABEL[currentUser.role]}</dd>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-mist/60 px-3 py-2.5 sm:block sm:bg-transparent sm:px-0 sm:py-0">
            <dt className="text-graphite">В школе с</dt>
            <dd className="font-semibold text-ink">
              {new Date(`${currentUser.created}T12:00:00`).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </dd>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-mist/60 px-3 py-2.5 sm:block sm:bg-transparent sm:px-0 sm:py-0">
            <dt className="text-graphite">Способ входа</dt>
            <dd className="font-semibold text-ink">
              {identities.length > 1
                ? `${identities.length} привязано`
                : providerLabel(identities[0]?.provider ?? 'email')}
            </dd>
          </div>
        </dl>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          <Link
            to="/cabinet/registrations"
            className="flex items-center gap-3 rounded-xl border border-line bg-mist/60 p-3.5 transition-colors hover:border-ink/20 hover:bg-paper"
          >
            <Calendar className="h-5 w-5 shrink-0 text-navy" />
            <span>
              <span className="block text-sm font-semibold text-ink">
                {countNoun(myRegs.length, 'запись', 'записи', 'записей')}
              </span>
              <span className="block text-xs text-graphite">
                Посещено: {attended}
              </span>
            </span>
          </Link>
          <Link
            to="/cabinet/notifications"
            className="flex items-center gap-3 rounded-xl border border-line bg-mist/60 p-3.5 transition-colors hover:border-ink/20 hover:bg-paper"
          >
            <Bell className="h-5 w-5 shrink-0 text-brand" />
            <span>
              <span className="block text-sm font-semibold text-ink">Уведомления</span>
              <span className="block text-xs text-graphite">
                {unread > 0 ? `Непрочитанных: ${unread}` : 'Всё прочитано'}
              </span>
            </span>
          </Link>
          <Link
            to="/cabinet/results"
            className="flex items-center gap-3 rounded-xl border border-line bg-mist/60 p-3.5 transition-colors hover:border-ink/20 hover:bg-paper"
          >
            <TrendingUp className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>
              <span className="block text-sm font-semibold text-ink">
                {countNoun(personalResults.length, 'результат', 'результата', 'результатов')}
              </span>
              <span className="block text-xs text-graphite">Дневник и прогресс</span>
            </span>
          </Link>
        </div>
      </Panel>

      {currentUser.role !== 'trainer' && (
        <Panel className="mt-5">
          <PanelTitle>Дополнительно</PanelTitle>
          <div className="grid gap-2.5 sm:grid-cols-3">
            <Link
              to="/cabinet/loyalty"
              className="flex items-center gap-3 rounded-xl border border-line bg-mist/60 p-3.5 transition-colors hover:border-ink/20 hover:bg-paper"
            >
              <CreditCard className="h-5 w-5 shrink-0 text-brand" />
              <span>
                <span className="block text-sm font-semibold text-ink">Баллы клуба</span>
                <span className="block text-xs text-graphite">Баланс и история</span>
              </span>
            </Link>
            <Link
              to="/cabinet/payment"
              className="flex items-center gap-3 rounded-xl border border-line bg-mist/60 p-3.5 transition-colors hover:border-ink/20 hover:bg-paper"
            >
              <CreditCard className="h-5 w-5 shrink-0 text-navy" />
              <span>
                <span className="block text-sm font-semibold text-ink">Абонемент</span>
                <span className="block text-xs text-graphite">Тарифы и оплата</span>
              </span>
            </Link>
            <Link
              to="/cabinet/calendar-export"
              className="flex items-center gap-3 rounded-xl border border-line bg-mist/60 p-3.5 transition-colors hover:border-ink/20 hover:bg-paper"
            >
              <Calendar className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>
                <span className="block text-sm font-semibold text-ink">Экспорт в календарь</span>
                <span className="block text-xs text-graphite">Google, Apple, Outlook</span>
              </span>
            </Link>
          </div>
        </Panel>
      )}

      <Panel className="mt-5">
        <PanelTitle hint="Скачайте копию профиля, записей и результатов — файл откроется в любом редакторе.">
          Мои данные
        </PanelTitle>
        <div className="flex flex-wrap items-center gap-3">
          <ActionButton onClick={exportData} variant="outline">
            <Download className="h-3.5 w-3.5" />
            Скачать данные (JSON)
          </ActionButton>
          <span className="text-[0.68rem] text-graphite">
            {countNoun(myRegs.length, 'запись', 'записи', 'записей')} ·{' '}
            {countNoun(personalResults.length, 'результат', 'результата', 'результатов')} ·{' '}
            {countNoun(notifications.length, 'уведомление', 'уведомления', 'уведомлений')}
          </span>
        </div>
      </Panel>

      {currentUser.role !== 'admin' && (
        <Panel className="mt-5 border-brand/25">
          <PanelTitle hint="Аккаунт будет закрыт сразу: записи и результаты останутся в истории школы без доступа к ним.">
            <span className="flex items-center gap-2 text-brand">
              <AlertTriangle className="h-4 w-4" />
              Удаление аккаунта
            </span>
          </PanelTitle>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="confirm-delete" className={labelClass}>
                Введите слово УДАЛИТЬ
              </label>
              <input
                id="confirm-delete"
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                className={fieldClass}
                placeholder="УДАЛИТЬ"
              />
            </div>
            <ActionButton onClick={handleDelete} variant="danger" disabled={deleteBusy}>
              <Trash2 className="h-3.5 w-3.5" />
              {deleteBusy ? 'Удаляем…' : 'Удалить аккаунт'}
            </ActionButton>
          </div>
          {myRegs.length > 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-[0.68rem] text-graphite">
              <StatusBadge tone="gray">История</StatusBadge>
              Записи о посещениях сохранятся — школа ведёт статистику по прошедшим
              занятиям.
            </p>
          )}
        </Panel>
      )}
    </div>
  );
}