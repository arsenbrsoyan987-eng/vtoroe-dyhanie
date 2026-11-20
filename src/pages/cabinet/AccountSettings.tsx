import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ImageUpload from '../../components/ui/ImageUpload';
import { ActionButton, PageHeader, Panel, PanelTitle, fieldClass, labelClass } from '../../components/cabinet/ui';
import { CreditCard, Calendar, KeyRound, ShieldCheck } from 'lucide-react';
import { passwordIssues } from '../../lib/crypto';

const ROLE_LABEL: Record<string, string> = {
  athlete: 'Спортсмен',
  trainer: 'Тренер',
  admin: 'Администратор',
};

export default function AccountSettings() {
  const { currentUser, updateProfile, changePassword } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(currentUser?.name ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [photo, setPhoto] = useState(currentUser?.photo ?? '');

  const [currentPw, setCurrentPw] = useState('');
  const [nextPw, setNextPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwBusy, setPwBusy] = useState(false);

  if (!currentUser) return null;

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, phone, photo });
    toast('Профиль обновлён');
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

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Аккаунт"
        title="Настройки"
        subtitle="Профиль, безопасность и дополнительные возможности кабинета."
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
                value={currentUser.email}
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
              Регулярно меняйте пароль и не передавайте его третьим лицам.
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
        <PanelTitle>Аккаунт</PanelTitle>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
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
        </dl>
      </Panel>

      {currentUser.role !== 'trainer' && (
        <Panel className="mt-5">
          <PanelTitle>Дополнительно</PanelTitle>
          <div className="grid gap-2.5 sm:grid-cols-2">
            <Link
              to="/cabinet/payment"
              className="flex items-center gap-3 rounded-xl border border-line bg-mist/60 p-3.5 transition-colors hover:border-ink/20 hover:bg-paper"
            >
              <CreditCard className="h-5 w-5 shrink-0 text-brand" />
              <span>
                <span className="block text-sm font-semibold text-ink">Абонемент</span>
                <span className="block text-xs text-graphite">Тарифы и оплата</span>
              </span>
            </Link>
            <Link
              to="/cabinet/calendar-export"
              className="flex items-center gap-3 rounded-xl border border-line bg-mist/60 p-3.5 transition-colors hover:border-ink/20 hover:bg-paper"
            >
              <Calendar className="h-5 w-5 shrink-0 text-navy" />
              <span>
                <span className="block text-sm font-semibold text-ink">Экспорт в календарь</span>
                <span className="block text-xs text-graphite">Google, Apple, Outlook</span>
              </span>
            </Link>
          </div>
        </Panel>
      )}
    </div>
  );
}