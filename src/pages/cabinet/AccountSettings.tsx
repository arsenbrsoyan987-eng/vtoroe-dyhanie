import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/ui/ImageUpload';
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

  const field =
    'w-full rounded-sm border border-white/10 bg-primary px-3 py-2.5 text-sm text-white transition-colors placeholder:text-gray-600 focus:border-accent-red focus:outline-none';
  const label = 'mb-1.5 block text-xs uppercase tracking-wider text-gray-400';

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
      <h1 className="mb-1 text-2xl font-bold text-white">Настройки</h1>
      <p className="mb-8 text-sm text-gray-400">
        Профиль, безопасность и дополнительные возможности
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Профиль */}
        <section className="rounded-sm border border-white/10 bg-surface p-6">
          <h2 className="mb-4 font-semibold text-white">Профиль</h2>
          <form onSubmit={saveProfile} className="space-y-4">
            <ImageUpload
              value={photo}
              onChange={setPhoto}
              label="Фото профиля"
              circle
              fallback={name.trim().charAt(0).toUpperCase() || '?'}
            />
            <div>
              <label htmlFor="name" className={label}>Имя и фамилия</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={field} />
            </div>
            <div>
              <label htmlFor="phone" className={label}>Телефон</label>
              <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={field} placeholder="+7 900 000-00-00" />
            </div>
            <div>
              <label htmlFor="email" className={label}>Email (логин)</label>
              <input id="email" value={currentUser.email} disabled className={`${field} cursor-not-allowed opacity-60`} />
              <p className="mt-1 text-xs text-gray-600">
                Логин меняет только администратор клуба
              </p>
            </div>
            <Button type="submit" variant="primary" size="sm">Сохранить профиль</Button>
          </form>
        </section>

        {/* Безопасность */}
        <section className="rounded-sm border border-white/10 bg-surface p-6">
          <h2 className="mb-1 flex items-center gap-2 font-semibold text-white">
            <KeyRound className="h-4 w-4 text-accent-red" />
            Смена пароля
          </h2>
          <p className="mb-4 text-xs text-gray-500">
            Регулярно меняйте пароль и не передавайте его третьим лицам
          </p>
          <form onSubmit={savePassword} className="space-y-3">
            <div>
              <label htmlFor="current-pw" className={label}>Текущий пароль</label>
              <input
                id="current-pw"
                type="password"
                autoComplete="current-password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className={field}
                required
              />
            </div>
            <div>
              <label htmlFor="next-pw" className={label}>Новый пароль</label>
              <input
                id="next-pw"
                type="password"
                autoComplete="new-password"
                value={nextPw}
                onChange={(e) => setNextPw(e.target.value)}
                className={field}
                required
              />
            </div>
            <div>
              <label htmlFor="confirm-pw" className={label}>Повторите новый пароль</label>
              <input
                id="confirm-pw"
                type="password"
                autoComplete="new-password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className={field}
                required
              />
            </div>
            <Button type="submit" variant="primary" size="sm" disabled={pwBusy}>
              {pwBusy ? 'Меняем…' : 'Изменить пароль'}
            </Button>
          </form>
          <p className="mt-4 flex items-start gap-2 text-xs text-gray-600">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
            Пароль хранится в виде необратимого хеша (PBKDF2, 120 000 итераций).
          </p>
        </section>
      </div>

      {/* Аккаунт */}
      <section className="mt-6 rounded-sm border border-white/10 bg-surface p-6">
        <h2 className="mb-4 font-semibold text-white">Аккаунт</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex justify-between sm:block">
            <dt className="text-gray-400">Роль</dt>
            <dd className="text-white">{ROLE_LABEL[currentUser.role]}</dd>
          </div>
          <div className="flex justify-between sm:block">
            <dt className="text-gray-400">В клубе с</dt>
            <dd className="text-white">
              {new Date(currentUser.created).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </dd>
          </div>
        </dl>
      </section>

      {/* Дополнительно — только спортсмену */}
      {currentUser.role !== 'trainer' && (
        <section className="mt-6 rounded-sm border border-white/10 bg-surface p-6">
          <h2 className="mb-4 font-semibold text-white">Дополнительно</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link to="/cabinet/payment" className="flex items-center gap-3 rounded-sm bg-white/5 p-3 transition-colors hover:bg-white/10">
              <CreditCard className="h-5 w-5 text-accent-red" />
              <span>
                <span className="block text-sm font-medium text-white">Абонемент</span>
                <span className="block text-xs text-gray-500">Тарифы и оплата</span>
              </span>
            </Link>
            <Link to="/cabinet/calendar-export" className="flex items-center gap-3 rounded-sm bg-white/5 p-3 transition-colors hover:bg-white/10">
              <Calendar className="h-5 w-5 text-accent-blue" />
              <span>
                <span className="block text-sm font-medium text-white">Экспорт в календарь</span>
                <span className="block text-xs text-gray-500">Google, Apple, Outlook</span>
              </span>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
