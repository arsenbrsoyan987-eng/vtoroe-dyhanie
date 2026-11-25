import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ImageUpload from '../../components/ui/ImageUpload';
import { ActionButton, PageHeader, Panel, PanelTitle, fieldClass, labelClass } from '../../components/cabinet/ui';
import { CreditCard, Calendar, KeyRound, ShieldCheck, Download, Link2, Unlink, Trash2, AlertTriangle } from 'lucide-react';
import { passwordIssues } from '../../lib/crypto';
import { OAUTH_PROVIDERS, providerLabel } from '../../lib/oauth';
import { buildExport, downloadJson } from '../../lib/export';

const ROLE_LABEL: Record<string, string> = {
  athlete: 'Спортсмен',
  trainer: 'Тренер',
  admin: 'Администратор',
};

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

  const [currentPw, setCurrentPw] = useState('');
  const [nextPw, setNextPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwBusy, setPwBusy] = useState(false);

  const [linkBusy, setLinkBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);

  if (!currentUser) return null;

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateProfile({ name, phone, photo });
    if (result.ok) toast('Профиль обновлён');
    else toast(result.error, 'error');
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
    downloadJson(
      buildExport(currentUser, registrations, personalResults, notifications)
    );
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
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
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
                className={fieldClass}
                placeholder="+7 900 000-00-00"
              />
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
            <ActionButton type="submit">Сохранить профиль</ActionButton>
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
                className={fieldClass}
                required
              />
            </div>
            <ActionButton type="submit" disabled={pwBusy}>
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
            const linked = identities.some((i) =>
              i.provider === provider.provider || i.provider === provider.key
            );
            return (
              <button
                key={provider.key}
                type="button"
                disabled={linked || linkBusy !== null}
                onClick={() => void handleLink(provider.key)}
                className="flex items-center justify-center gap-2 rounded-full border border-line px-3 py-2.5 text-xs font-bold text-ink transition-colors hover:border-ink/25 hover:bg-mist disabled:cursor-not-allowed disabled:opacity-50"
              >
                {linked ? 'Привязано' : linkBusy === provider.key ? 'Открываем…' : `Привязать ${provider.label}`}
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
              {new Date(currentUser.created).toLocaleDateString('ru-RU', {
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
        <ActionButton onClick={exportData} variant="outline">
          <Download className="h-3.5 w-3.5" />
          Скачать данные (JSON)
        </ActionButton>
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
        </Panel>
      )}
    </div>
  );
}
