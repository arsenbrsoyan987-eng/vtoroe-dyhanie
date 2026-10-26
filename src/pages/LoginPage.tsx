import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login, importAccount, ready } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [inviteNotice, setInviteNotice] = useState('');

  const from = (location.state as { from?: string } | null)?.from ?? '/cabinet';

  // Ссылка-приглашение добавляет аккаунт в этот браузер: данные клуба
  // хранятся локально и не переносятся между устройствами автоматически.
  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams(location.search);
    const token = params.get('invite');
    if (!token) return;

    const result = importAccount(token);
    if (result.ok) {
      setEmail(result.email);
      setInviteNotice(`Доступ для ${result.email} добавлен на это устройство. Введите пароль, который передал администратор.`);
    } else {
      setError(result.error);
    }
    // Убираем токен из адресной строки, чтобы он не сохранился в истории
    navigate('/login', { replace: true });
  }, [ready, location.search, importAccount, navigate]);

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

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-sm bg-accent-red/15">
            <ShieldCheck className="h-7 w-7 text-accent-red" />
          </div>
          <h1 className="text-3xl font-bold text-white">Вход в кабинет</h1>
          <p className="mt-2 text-sm text-gray-400">
            Доступ для спортсменов, тренеров и администрации клуба
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-sm border border-white/10 bg-surface p-6"
          noValidate
        >
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs uppercase tracking-wider text-gray-400">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
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
                className="w-full rounded-sm border border-white/10 bg-primary py-3 pl-10 pr-3 text-sm text-white transition-colors placeholder:text-gray-600 focus:border-accent-red focus:outline-none"
                placeholder="name@vtoroe-dyhanie.ru"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs uppercase tracking-wider text-gray-400">
              Пароль
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
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
                className="w-full rounded-sm border border-white/10 bg-primary py-3 pl-10 pr-10 text-sm text-white transition-colors placeholder:text-gray-600 focus:border-accent-red focus:outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-white"
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {inviteNotice && (
            <p className="rounded-sm border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-300">
              {inviteNotice}
            </p>
          )}

          {error && (
            <div role="alert" className="rounded-sm border border-red-500/30 bg-red-500/10 px-3 py-2">
              <p className="text-xs text-red-300">{error}</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-red-300/70">
                Аккаунт создаётся в конкретном браузере. Если доступ выдавали на другом
                устройстве, попросите у администратора ссылку-приглашение.
              </p>
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={busy}>
            {busy ? 'Проверяем…' : 'Войти'}
          </Button>

          <p className="text-center text-xs text-gray-500">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-accent-blue hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-gray-600">
          Доступы выдаёт администратор клуба. Пароли хранятся в виде хеша
          и не отображаются в интерфейсе.
        </p>
      </div>
    </div>
  );
}
