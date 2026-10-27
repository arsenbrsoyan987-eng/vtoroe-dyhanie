import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import { passwordIssues } from '../lib/crypto';

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
      toast('Аккаунт создан — добро пожаловать в клуб!');
      navigate('/cabinet', { replace: true });
    } else {
      setError(result.error);
      setBusy(false);
    }
  };

  const field =
    'w-full rounded-sm border border-white/10 bg-primary px-3 py-3 text-sm text-white transition-colors placeholder:text-gray-600 focus:border-accent-red focus:outline-none';
  const label = 'mb-1.5 block text-xs uppercase tracking-wider text-gray-400';

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Регистрация</h1>
          <p className="mt-2 text-sm text-gray-400">
            Присоединяйтесь к сообществу «Второе дыхание»
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-sm border border-white/10 bg-surface p-6" noValidate>
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
              <p className="mt-1.5 text-xs text-yellow-400">
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

          <label className="flex items-start gap-2.5 text-xs leading-relaxed text-gray-400">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-accent-red"
            />
            <span>
              Согласен с{' '}
              <a href="/vtoroe-dyhanie/privacy" className="text-accent-blue hover:underline">
                политикой конфиденциальности
              </a>{' '}
              и обработкой персональных данных
            </span>
          </label>

          {error && (
            <p role="alert" className="rounded-sm border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={busy}>
            {busy ? 'Создаём аккаунт…' : 'Создать аккаунт'}
          </Button>

          <p className="text-center text-xs text-gray-500">
            Тренером можно стать по приглашению администратора клуба.
          </p>

          <p className="text-center text-xs text-gray-500">
            Уже есть аккаунт?{' '}
            <Link to="/vtoroe-dyhanie/login" className="text-accent-blue hover:underline">
              Войти
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
