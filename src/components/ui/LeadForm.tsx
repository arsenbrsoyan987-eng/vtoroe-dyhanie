import { useState } from 'react';
import { Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { leadsStore } from '../../store/leadsStore';

export interface LeadFormProps {
  /** Откуда пришла заявка: попадает в админку вместе с контактами */
  source: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  /** Фиксированное значение комментария, если посетитель ничего не пишет */
  message?: string;
  /** Дополнительные чекбоксы над полем комментария */
  options?: string[];
  /** id тренировки или программы, к которой относится заявка */
  trainingId?: string;
  dark?: boolean;
  className?: string;
}

/**
 * Форма быстрой заявки на светлых страницах витрины.
 *
 * Регистрация не требуется: имя и телефон достаточны, чтобы тренер
 * перезвонил. Данные идут в public.leads и становятся видны в админке.
 */
export default function LeadForm({
  source,
  title = 'Оставьте заявку',
  subtitle = 'Тренер перезвонит, подберёт группу и ответит на вопросы. Регистрация не нужна.',
  cta = 'Отправить заявку',
  message = '',
  options,
  trainingId,
  dark = false,
  className = '',
}: LeadFormProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(currentUser?.name ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [comment, setComment] = useState('');
  const [checked, setChecked] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const field = dark
    ? 'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 focus:border-brand focus:outline-none'
    : 'w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink placeholder-graphite/60 focus:border-brand focus:outline-none';

  const label = dark ? 'text-white/60' : 'text-graphite';

  const toggle = (value: string) =>
    setChecked((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const note = [
      message,
      checked.length > 0 ? `Интересует: ${checked.join(', ')}` : '',
      comment.trim(),
    ]
      .filter(Boolean)
      .join('. ');

    const result = await leadsStore.submit({
      name,
      phone,
      email,
      trainingId,
      source,
      message: note,
    });
    setSending(false);

    if (result.ok) {
      setSent(true);
    } else {
      toast(result.error, 'error');
    }
  };

  if (sent) {
    return (
      <div
        className={`rounded-2xl p-8 text-center ${
          dark ? 'bg-white/10 ring-1 ring-white/15' : 'bg-mist ring-1 ring-line'
        } ${className}`}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand">
          <Check className="h-6 w-6 text-white" />
        </div>
        <h3 className={`display text-xl ${dark ? 'text-white' : 'text-ink'}`}>
          Заявка отправлена
        </h3>
        <p
          className={`mx-auto mt-3 max-w-sm text-sm leading-relaxed ${
            dark ? 'text-white/70' : 'text-graphite'
          }`}
        >
          Свяжемся с вами в ближайшее время, чтобы подобрать удобное время и группу.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <h3 className={`display text-2xl ${dark ? 'text-white' : 'text-ink'}`}>{title}</h3>
        <p
          className={`mt-2 text-sm leading-relaxed ${dark ? 'text-white/65' : 'text-graphite'}`}
        >
          {subtitle}
        </p>
      </div>

      {options && options.length > 0 && (
        <fieldset>
          <legend className={`mb-2.5 text-xs font-bold uppercase tracking-[0.12em] ${label}`}>
            Что вас интересует
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {options.map((option) => {
              const on = checked.includes(option);
              return (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm transition-colors ${
                    on
                      ? 'border-brand bg-brand/10 text-ink'
                      : dark
                        ? 'border-white/15 text-white/70 hover:border-white/35'
                        : 'border-line text-graphite hover:border-ink/25'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggle(option)}
                    className="sr-only"
                  />
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      on ? 'border-brand bg-brand' : dark ? 'border-white/30' : 'border-line'
                    }`}
                  >
                    {on && <Check className="h-3 w-3 text-white" />}
                  </span>
                  {option}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
          placeholder="Имя"
          autoComplete="name"
          aria-label="Имя"
          className={field}
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder="+7 900 000-00-00"
          autoComplete="tel"
          aria-label="Телефон"
          className={field}
        />
      </div>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email — необязательно"
        autoComplete="email"
        aria-label="Email"
        className={field}
      />

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Ваш уровень, цель, удобное время"
        aria-label="Комментарий"
        className={`${field} resize-y`}
      />

      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-full bg-brand px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-brand-dark active:scale-[0.99] disabled:opacity-60"
      >
        {sending ? 'Отправка…' : cta}
      </button>

      <p className={`text-center text-xs ${label}`}>
        Нажимая кнопку, вы соглашаетесь с{' '}
        <a href="/privacy" className="underline hover:text-brand">
          политикой обработки данных
        </a>
        .
      </p>
    </form>
  );
}
