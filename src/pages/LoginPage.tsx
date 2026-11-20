import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';

/**
 * Вход в кабинет.
 *
 * Форма собрана в светлой витринной палитре: тёмная панель осталась только
 * как акцентная колонка с объяснением, что даёт аккаунт.
 */
export default function LoginPage() {
  const { login, sendPasswordReset } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/cabinet';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');

    const result = await login(email, password);

    if (result.ok) {
      toast('Вы вошли в личный кабинет');
      navigate(from, { replace: true });
    } else {
      setError(result.error);
      setBusy(false);
    }
  };

  const field =
    'w-full rounded-xl border border-line bg-mist py-3 pl-10 pr-3 text-sm text-ink transition-colors placeholder-graphite/60 focus:border-brand focus:bg-paper focus:outline-none';
  const label = 'mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-graphite';

  return (
    <>
      <Breadcrumbs items={[{ label: 'Вход в кабинет' }]} />

      <section className="bg-paper pb-20 pt-6 lg:pb-28">
        <div className="container-x">
          <div className="grid items-stretch gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Левая колонка: что даёт аккаунт */}
            <div className="order-2 lg:order-1">
              <span className="eyebrow mb-5">
                <span className="h-[2px] w-8 bg-brand" />
                Личный кабинет
              </span>
              <h1 className="display text-[2.5rem] text-ink sm:text-5xl lg:text-6xl">
                Всё о ваших тренировках — в одном месте
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-graphite">
                Записи, календарь, результаты и баллы клуба. Доступ открыт
                спортсменам, тренерам и администрации школы.
              </p>

              <ul className="mt-8 space-y-4">
                {[
                  {
                    icon: ShieldCheck,
                    title: 'Запись в один клик',
                    body: 'Свободные места видны сразу — без звонков и переписок.',
                  },
                  {
                    icon: Lock,
                    title: 'История и результаты',
                    body: 'Все занятия, посещения и личные рекорды сохраняются в профиле.',
                  },
                  {
                    icon: Mail,
                    title: 'Напоминания',
                    body: 'Уведомления о переносах, наборах и событиях школы.',
                  },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10">
                      <item.icon className="h-5 w-5 text-brand" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-ink">{item.title}</h2>
                      <p className="mt-1 text-sm leading-relaxed text-graphite">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Правая колонка: форма */}
            <div className="order-1 lg:order-2">
              <div className="mx-auto w-full max-w-md rounded-2xl border border-line bg-paper p-6 shadow-card sm:p-8">
                <h2 className="display text-2xl text-ink">Вход</h2>
                <p className="mt-2 text-sm text-graphite">
                  Введите данные, которые выдала школа
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
                  <div>
                    <label htmlFor="email" className={label}>
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite/60" />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError('');
                        }}
                        className={field}
                        placeholder="name@vtoroe-dyhanie.ru"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className={label}>
                      Пароль
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite/60" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError('');
                        }}
                        className={`${field} pr-10`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-graphite/70 transition-colors hover:text-ink"
                        aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div role="alert" className="rounded-xl border border-brand/30 bg-brand/5 px-3.5 py-2.5">
                      <p className="text-xs text-brand">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-full bg-brand px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-brand-dark active:scale-[0.99] disabled:opacity-60"
                  >
                    {busy ? 'Проверяем…' : 'Войти'}
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const result = await sendPasswordReset(email);
                      if (result.ok) toast('Письмо со ссылкой для сброса отправлено', 'success');
                      else toast(result.error, 'error');
                    }}
                    className="w-full text-center text-xs text-graphite transition-colors hover:text-brand"
                  >
                    Забыли пароль?
                  </button>
                </form>

                <p className="mt-6 border-t border-line pt-5 text-center text-xs text-graphite">
                  Нет аккаунта?{' '}
                  <Link to="/register" className="font-semibold text-brand hover:underline">
                    Зарегистрироваться
                  </Link>
                </p>
              </div>

              <p className="mx-auto mt-5 max-w-md text-center text-xs leading-relaxed text-graphite/80">
                Доступы выдаёт администратор школы. Пароли хранятся в виде хеша
                и не отображаются в интерфейсе.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}