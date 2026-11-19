import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { leadsStore } from '../../store/leadsStore';
import Button from './Button';
import { X } from 'lucide-react';

/**
 * Быстрая заявка без регистрации: имя и телефон, тренер перезванивает.
 *
 * Регистрация сознательно вынесена вторым шагом — посетитель сначала
 * бронирует место, а аккаунт заводит позже, если захочет отслеживать
 * тренировки в кабинете.
 */
export default function QuickBookingModal({
  trainingId,
  trainingName,
  onClose,
}: {
  trainingId?: string;
  trainingName?: string;
  onClose: () => void;
}) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Escape закрывает модалку — как в мобильном меню хедера
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const result = await leadsStore.submit({
      name,
      phone,
      email,
      trainingId,
      source: trainingId ? 'training' : 'header',
      message,
    });
    setSending(false);
    if (result.ok) {
      setSent(true);
    } else {
      toast(result.error, 'error');
    }
  };

  const cls =
    'w-full rounded-sm border border-white/10 bg-primary px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-accent-red focus:outline-none';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Заявка на тренировку"
    >
      <div
        className="max-h-full w-full max-w-md overflow-y-auto rounded-sm border border-white/10 bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-white">
            {sent ? 'Заявка отправлена' : trainingName ? `Запись: ${trainingName}` : 'Записаться на тренировку'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="rounded-sm p-1 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {sent ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-gray-300">
              Мы получили заявку и перезвоним в ближайшее время, чтобы подтвердить запись.
            </p>
            {!currentUser && (
              <p className="text-sm leading-relaxed text-gray-400">
                Хотите отслеживать тренировки и историю записей? Создайте
                аккаунт — это второй шаг, он не обязателен.
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {!currentUser && (
                <Button to="/register" variant="primary" size="sm">
                  Создать аккаунт
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onClose}>
                Готово
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-400">
              Оставьте имя и телефон — тренер перезвонит и подтвердит запись.
              Регистрация не нужна.
            </p>

            <div>
              <label htmlFor="qb-name" className="mb-1 block text-sm text-gray-400">
                Имя
              </label>
              <input
                id="qb-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={120}
                className={cls}
                placeholder="Как вас зовут?"
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="qb-phone" className="mb-1 block text-sm text-gray-400">
                Телефон
              </label>
              <input
                id="qb-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className={cls}
                placeholder="+7 900 000-00-00"
                autoComplete="tel"
              />
            </div>

            <div>
              <label htmlFor="qb-email" className="mb-1 block text-sm text-gray-400">
                Email <span className="text-gray-600">— необязательно</span>
              </label>
              <input
                id="qb-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cls}
                placeholder="vtoroedyhanie2@yandex.ru"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="qb-message" className="mb-1 block text-sm text-gray-400">
                Комментарий <span className="text-gray-600">— необязательно</span>
              </label>
              <textarea
                id="qb-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={1000}
                className={`${cls} resize-y`}
                placeholder="Уровень, удобное время, вопросы"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={sending}>
              {sending ? 'Отправка…' : 'Отправить заявку'}
            </Button>

            {!currentUser && (
              <p className="text-center text-xs text-gray-500">
                Уже занимались с нами?{' '}
                <Link to="/login" className="text-accent-blue hover:underline">
                  Войдите в кабинет
                </Link>{' '}
                — тогда запись появится там сразу.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
