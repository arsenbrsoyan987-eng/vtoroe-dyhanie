import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import OAuthButtons from '../components/ui/OAuthButtons';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { passwordIssues } from '../lib/crypto';
import { CLUB_WELCOME_POINTS } from '../data/site';
import { Check } from 'lucide-react';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirm: '',
};

export default function RegisterPage() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);

  const issues = form.password ? passwordIssues(form.password) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError('');

    if (form.password !== form.confirm) {
      setError('Пароли не совпадают');
      return;
    }
    if (!consent) {
      setError('Нужно согласие на обработку персональных данных');
      return;
    }

    setBusy(true);
    const result = await signUp({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });

    if (result.ok) {
      toast('Аккаунт создан — добро пожаловать в школу!');
      navigate('/cabinet', { replace: true });
    } else {
      setError(result.error);
      setBusy(false);
    }
  };

  const field =
    'w-full rounded-xl border border-line bg-mist px-3.5 py-3 text-sm text-ink transition-colors placeholder-graphite/60 focus:border-brand focus:bg-paper focus:outline-none';
  const label = 'mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-graphite';

  return (
    <>
      <Breadcrumbs items={[{ label: 'Регистрация' }]} />

      <section className="bg-paper pb-20 pt-6 lg:pb-28">
        <div className="container-x">
          <div className="grid items-start gap-10 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-16">
            {/* Пояснение слева: что даёт регистрация */}
            <aside className="lg:sticky lg:top-28">
              <span className="eyebrow mb-5">
                <span className="h-[2px] w-8 bg-brand" />
                Первый шаг
              </span>
              <h1 className="display text-[2.25rem] text-ink sm:text-4xl">
                Записаться в школу
              </h1>
              <p className="mt-4 text-base leading-relaxed text-graphite">
                Аккаунт нужен, чтобы записываться на занятия, видеть историю
                и копить баллы клуба. Заявку можно оставить и без регистрации.
              </p>

              <ul className="mt-7 space-y-3">
                {[
                  'Первое занятие — по цене чашки кофе',
                  `+${CLUB_WELCOME_POINTS} приветственных баллов`,
                  'Запись и отмена — в один клик',
                  'Напоминания о тренировках',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10">
                      <Check className="h-3 w-3 text-brand" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </aside>

            {/* Форма */}
            <div className="mx-auto w-full max-w-lg rounded-2xl border border-line bg-paper p-6 shadow-card sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="name" className={label}>Имя и фамилия *</label>
                  <input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={field}
                    placeholder="Иван Петров"
                    autoComplete="name"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="email" className={label}>Email *</label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={field}
                      placeholder="name@example.ru"
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className={label}>Телефон</label>
                    <input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className={field}
                      placeholder="+7 900 000-00-00"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="password" className={label}>Пароль *</label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className={field}
                      placeholder="Минимум 8 символов"
                      autoComplete="new-password"
                    />
                    {form.password && issues.length > 0 && (
                      <p className="mt-1.5 text-xs text-amber-600">
                        Нужно: {issues.join(', ')}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="confirm" className={label}>Повторите пароль *</label>
                    <input
                      id="confirm"
                      type="password"
                      required
                      value={form.confirm}
                      onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                      className={field}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2.5 rounded-xl bg-mist p-3.5 text-xs leading-relaxed text-graphite">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
                  />
                  <span>
                    Согласен с{' '}
                    <a href="/privacy" className="font-semibold text-brand hover:underline">
                      политикой конфиденциальности
                    </a>{' '}
                    и обработкой персональных данных
                  </span>
                </label>

                {error && (
                  <p role="alert" className="rounded-xl border border-brand/30 bg-brand/5 px-3.5 py-2.5 text-xs text-brand">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-full bg-brand px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-brand-dark active:scale-[0.99] disabled:opacity-60"
                >
                  {busy ? 'Создаём аккаунт…' : 'Создать аккаунт'}
                </button>

                <p className="text-center text-xs text-graphite">
                  Тренером можно стать по приглашению администратора школы.
                </p>

                <OAuthButtons
                  action="register"
                  next="/cabinet/settings?onboard=1"
                />

                <p className="border-t border-line pt-4 text-center text-xs text-graphite">
                  Уже есть аккаунт?{' '}
                  <Link to="/login" className="font-semibold text-brand hover:underline">
                    Войти
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}