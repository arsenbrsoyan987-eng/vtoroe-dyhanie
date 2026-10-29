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
      <div className="rounded-sm border border-white/10 bg-surface p-4 shadow-xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Установить приложение</h2>
            <p className="mt-0.5 text-xs text-gray-400">
              Расписание и запись — на главном экране
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Скрыть предложение"
            className="shrink-0 rounded-sm p-1 text-gray-500 transition-colors hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button
          type="button"
          onClick={() => void install()}
          className="w-full rounded-sm bg-accent-red py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-red-hover"
        >
          Установить
        </button>
      </div>
    </div>
  );
}