import { useEffect, useState } from 'react';

/** Событие `beforeinstallprompt` не описано в стандартных типах DOM */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa_install_dismissed';

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    // Кто уже отказался — больше не дёргаем: навязчивая плашка бесит сильнее,
    // чем помогает установке.
    if (localStorage.getItem(DISMISS_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setDeferred(null);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  if (!deferred) return null;

  return (
    <div
      role="region"
      aria-label="Установка приложения"
      className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-sm"
    >
      <div className="rounded-2xl border border-line bg-paper p-4 shadow-lift">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-ink">Установить приложение</h2>
            <p className="mt-0.5 text-xs text-graphite">
              Расписание и запись — на главном экране
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Скрыть предложение"
            className="shrink-0 rounded-full p-1 text-graphite transition-colors hover:bg-mist hover:text-ink"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button
          type="button"
          onClick={() => void install()}
          className="w-full rounded-full bg-brand py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-dark"
        >
          Установить
        </button>
      </div>
    </div>
  );
}
