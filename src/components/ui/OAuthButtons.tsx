import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { enabledProviders, oauthErrorFromUrl, OAUTH_PROVIDERS, type OAuthKey } from '../../lib/oauth';

/**
 * Кнопки «Войти через Яндекс / Google / Apple».
 *
 * Список рисуется только по фактически включённым в Supabase провайдерам:
 * кнопка, которая ведёт на ошибку, хуже, чем её отсутствие. Пока ответ не
 * пришёл — блок пустой, чтобы форма не «прыгала» дважды.
 */
export default function OAuthButtons({
  action = 'login',
  next = '/cabinet',
  compact = false,
}: {
  action?: 'login' | 'register';
  next?: string;
  compact?: boolean;
}) {
  const { loginWithOAuth, configured } = useAuth();
  const { toast } = useToast();
  const [available, setAvailable] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<OAuthKey | null>(null);

  // Ошибка возврата от провайдера прилетает в hash после редиректа
  useEffect(() => {
    const message = oauthErrorFromUrl();
    if (!message) return;
    toast(message, 'error');
    // Убираем hash, чтобы сообщение не повторялось при обновлении страницы
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }, [toast]);

  useEffect(() => {
    if (!configured) return;
    let active = true;
    enabledProviders().then((set) => {
      if (active) setAvailable(set);
    });
    return () => {
      active = false;
    };
  }, [configured]);

  const shown = OAUTH_PROVIDERS.filter((p) => available.has(p.key));
  if (shown.length === 0) return null;

  const start = async (key: OAuthKey) => {
    if (busy) return;
    setBusy(key);
    const result = await loginWithOAuth(key, next);
    if (!result.ok) {
      toast(result.error, 'error');
      setBusy(null);
    }
    // При успехе страница уходит на провайдера — сбрасывать busy не нужно
  };

  const separator = (
    <div className="flex items-center gap-3 py-1" aria-hidden>
      <span className="h-px flex-1 bg-line" />
      <span className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-graphite/70">
        или через
      </span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {separator}
      <div className="grid gap-2 sm:grid-cols-3">
        {shown.map((p) => (
          <button
            key={p.key}
            type="button"
            disabled={busy !== null}
            onClick={() => void start(p.key)}
            aria-label={
              action === 'register'
                ? `Создать аккаунт через ${p.label}`
                : `Войти через ${p.label}`
            }
            className="flex items-center justify-center gap-2 rounded-full border border-line bg-paper px-3 py-2.5 text-xs font-bold text-ink transition-colors hover:border-ink/25 hover:bg-mist disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ProviderIcon provider={p.key} />
            {busy === p.key ? 'Открываем…' : p.label}
          </button>
        ))}
      </div>
      {!compact && (
        <p className="text-center text-[0.68rem] leading-relaxed text-graphite/80">
          Аккаунт создаётся автоматически, роль — «Спортсмен». Тренера и
          администратора назначает школа.
        </p>
      )}
    </div>
  );
}

/** Значки рисуются inline: внешних шрифтов и логотипов скачивать не нужно */
function ProviderIcon({ provider }: { provider: OAuthKey }) {
  const cls = 'h-4 w-4 shrink-0';

  if (provider === 'yandex') {
    return (
      <svg viewBox="0 0 24 24" className={cls} aria-hidden>
        <circle cx="12" cy="12" r="11" fill="#FC3F1D" />
        <path
          d="M13.6 5.2v13.1h-2.3c-2.9 0-4.6-1.7-4.6-4.3 0-2.2 1.2-3.6 3.4-4.1l1.1-.2v-1c0-1.2-.7-1.8-1.9-1.8-.9 0-1.6.3-2.2.9l-1.2-1.5c1-1 2.2-1.4 3.7-1.4 2.3 0 4 1.4 4 3.6v.2h-.1zm-2.4 4.9c-1 .2-1.5.7-1.5 1.7 0 1.1.7 1.7 2 1.7h.9v-3.6h-1.4z"
          fill="#fff"
        />
      </svg>
    );
  }

  if (provider === 'google') {
    return (
      <svg viewBox="0 0 24 24" className={cls} aria-hidden>
        <path
          fill="#4285F4"
          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.7-4.9H1.3v3.1A12 12 0 0 0 12 24z"
        />
        <path fill="#FBBC05" d="M5.3 14.4a7.2 7.2 0 0 1 0-4.7V6.6H1.3a12 12 0 0 0 0 10.9l4-3.1z" />
        <path
          fill="#EA4335"
          d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A11.6 11.6 0 0 0 12 0 12 12 0 0 0 1.3 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={cls} aria-hidden>
      <path
        fill="currentColor"
        d="M16.4 12.8c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9-.7 0-1.8-.9-3-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.8-.4 6.9 1.1 9.2.8 1.1 1.7 2.3 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.2.9-1.3 1.2-2.5 1.2-2.6 0 0-2.4-.9-2.4-3.7zM14.2 5.6c.6-.8 1-1.9.9-3-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-.9 2.9 1 0 2-.5 2.7-1.3z"
      />
    </svg>
  );
}
