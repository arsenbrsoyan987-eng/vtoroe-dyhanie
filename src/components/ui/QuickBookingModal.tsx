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
    'w-full rounded-xl border border-line bg-mist px-3 py-2.5 text-sm text-ink placeholder-graphite/60 transition-colors focus:border-brand focus:bg-paper focus:outline-none';
  const labelCls = 'mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-graphite';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/70 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Заявка на тренировку"
    >
      <div
        className="max-h-full w-full max-w-md overflow-y-auto rounded-2xl bg-paper p-6 shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="display text-xl text-ink">
            {sent ? 'Заявка отправлена' : trainingName ? `Запись: ${trainingName}` : 'Записаться на тренировку'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="rounded-full p-1.5 text-graphite transition-colors hover:bg-mist hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {sent ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-graphite">
              Мы получили заявку и перезвоним в ближайшее время, чтобы подтвердить запись.
            </p>
            {!currentUser && (
              <p className="text-sm leading-relaxed text-graphite">
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
            <p className="text-sm leading-relaxed text-graphite">
              Оставьте имя и телефон — тренер перезвонит и подтвердит запись.
              Регистрация не нужна.
            </p>

            <div>
              <label htmlFor="qb-name" className={labelCls}>
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
              <label htmlFor="qb-phone" className={labelCls}>
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
              <label htmlFor="qb-email" className={labelCls}>
                Email <span className="font-normal normal-case tracking-normal text-graphite/70">— необязательно</span>
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
              <label htmlFor="qb-message" className={labelCls}>
                Комментарий <span className="font-normal normal-case tracking-normal text-graphite/70">— необязательно</span>
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
              <p className="text-center text-xs text-graphite">
                Уже занимались с нами?{' '}
                <Link to="/login" className="font-semibold text-brand hover:underline">
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