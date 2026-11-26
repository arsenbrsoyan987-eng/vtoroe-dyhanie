import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  ActionButton,
  PageHeader,
  Panel,
  StatusBadge,
  fieldClass,
  labelClass,
} from '../../components/cabinet/ui';
import { BadgePercent, Check, Clock, Send, ShieldCheck, Wallet } from 'lucide-react';
import { countNoun } from '../../lib/plural';

/**
 * Тарифы школы. Цена хранится как число, чтобы считать выгоду:
 * ежемесячный — базовая точка отсчёта для скидок длинных абонементов.
 */
const plans = [
  {
    id: 'monthly',
    name: 'Ежемесячный',
    price: 990,
    months: 1,
    period: '/мес',
    features: ['Доступ к групповым тренировкам', 'Участие в школьных событиях', 'Личный кабинет'],
  },
  {
    id: 'quarterly',
    name: 'Квартальный',
    price: 2490,
    months: 3,
    period: '/3 мес',
    features: ['Всё из ежемесячного', 'Экономия 20%', 'Приоритетная запись'],
  },
  {
    id: 'yearly',
    name: 'Годовой',
    price: 7990,
    months: 12,
    period: '/год',
    features: [
      'Всё из квартального',
      'Экономия 33%',
      'Персональная консультация тренера',
      'Эксклюзивные мероприятия',
    ],
  },
];

const rub = (value: number) => value.toLocaleString('ru-RU');

const STEPS = [
  { title: 'Заявка', text: 'Она приходит администратору в кабинет сразу' },
  { title: 'Подтверждение', text: 'Школа сверяет свободные места и тариф' },
  { title: 'Оплата', text: 'Ссылку присылает администратор, карта не нужна' },
];

export default function PaymentPage() {
  const { currentUser, notifyAdmins } = useAuth();
  const { toast } = useToast();

  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const plan = plans.find((p) => p.id === selectedPlan);

  /** Выгода относительно помесячной оплаты: сколько экономит длинный тариф */
  const comparison = useMemo(() => {
    if (!plan) return null;
    const base = plans[0];
    const perMonth = Math.round(plan.price / plan.months);
    const fullPrice = base.price * plan.months;
    const saved = Math.max(0, fullPrice - plan.price);
    return {
      perMonth,
      saved,
      percent: fullPrice ? Math.round((saved / fullPrice) * 100) : 0,
    };
  }, [plan]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !plan || sending) return;

    setSending(true);
    try {
      // Карточные данные не собираются: заявка уходит администраторам школы
      await notifyAdmins(
        'Заявка на абонемент',
        `${currentUser.name} (${currentUser.email}) выбрал тариф «${plan.name}» — ${rub(plan.price)} ₽${plan.period}.${
          comment.trim() ? ` Комментарий: ${comment.trim()}` : ''
        }`,
        { type: 'info', link: '/cabinet/admin/users' }
      );
      setSent(true);
      toast('Заявка отправлена администратору');
    } catch {
      toast('Не удалось отправить заявку — попробуйте позже', 'error');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="mx-auto max-w-md">
        <Panel className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <Check className="h-8 w-8 text-emerald-700" />
          </div>
          <h2 className="display mb-2 text-2xl text-ink">Заявка отправлена</h2>
          <p className="mb-6 text-sm leading-relaxed text-graphite">
            Администратор свяжется с вами, подтвердит тариф «{plan?.name}» и пришлёт ссылку на
            оплату. Абонемент активируется после поступления оплаты.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <ActionButton to="/cabinet">В личный кабинет</ActionButton>
            <ActionButton
              variant="outline"
              onClick={() => {
                setSent(false);
                setComment('');
              }}
            >
              Выбрать другой тариф
            </ActionButton>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Аккаунт"
        title="Абонемент"
        subtitle="Выберите тариф — мы отправим заявку администратору школы."
      />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {plans.map((p) => {
          const active = selectedPlan === p.id;
          const perMonth = Math.round(p.price / p.months);
          const saved = p.months > 1 ? plans[0].price * p.months - p.price : 0;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              aria-pressed={active}
              className={`relative rounded-2xl border p-5 text-left transition-all ${
                active
                  ? 'border-brand bg-brand/5 shadow-card'
                  : 'border-line bg-paper hover:-translate-y-0.5 hover:shadow-card'
              }`}
            >
              {saved > 0 && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-emerald-700">
                  <BadgePercent className="h-2.5 w-2.5" />−{rub(saved)} ₽
                </span>
              )}
              <p className="text-sm font-bold text-ink">{p.name}</p>
              <p className="mt-1 flex items-baseline gap-1">
                <span className="display text-2xl text-ink">{rub(p.price)}</span>
                <span className="text-xs text-graphite">{p.period}</span>
              </p>
              <p className="mt-0.5 text-[0.68rem] text-graphite">{rub(perMonth)} ₽ в месяц</p>
              <ul className="mt-3 space-y-1.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs leading-relaxed text-graphite">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <Panel>
        <div className="mb-4 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-graphite" />
          <h2 className="text-base font-bold text-ink">Заявка на абонемент</h2>
        </div>

        <form onSubmit={handleRequest}>
          <dl className="mb-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl bg-mist px-3 py-2.5">
              <dt className={labelClass}>Тариф</dt>
              <dd className="text-sm font-semibold text-ink">{plan?.name}</dd>
            </div>
            <div className="rounded-xl bg-mist px-3 py-2.5">
              <dt className={labelClass}>Стоимость</dt>
              <dd className="text-sm font-semibold text-ink">
                {plan ? `${rub(plan.price)} ₽` : '—'}
                {plan?.period}
              </dd>
            </div>
            <div className="rounded-xl bg-mist px-3 py-2.5">
              <dt className={labelClass}>В пересчёте на месяц</dt>
              <dd className="text-sm font-semibold text-ink">
                {comparison ? `${rub(comparison.perMonth)} ₽` : '—'}
              </dd>
            </div>
          </dl>

          {comparison && comparison.saved > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3.5 py-2.5 text-xs text-emerald-800">
              <StatusBadge tone="green">
                Выгода {comparison.percent}%
              </StatusBadge>
              Экономия {rub(comparison.saved)} ₽ против{' '}
              {countNoun(plan?.months ?? 1, 'месяца', 'месяцев', 'месяцев')} по 990 ₽.
            </div>
          )}

          <label htmlFor="pay-comment" className={labelClass}>
            Комментарий (необязательно)
          </label>
          <textarea
            id="pay-comment"
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Например: удобно оплатить после 5 числа"
            className={`${fieldClass} resize-none`}
            maxLength={500}
          />

          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-mist px-3 py-2.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-xs leading-relaxed text-graphite">
              Мы не запрашиваем и не храним данные банковских карт. Ссылку на оплату присылает
              администратор школы.
            </p>
          </div>

          <ActionButton type="submit" size="md" className="mt-5 w-full" disabled={sending}>
            <Send className="h-3.5 w-3.5" />
            {sending ? 'Отправляем…' : 'Отправить заявку'}
          </ActionButton>
        </form>
      </Panel>

      <Panel className="mt-5">
        <ol className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy/10 text-[0.68rem] font-bold text-navy">
                {index + 1}
              </span>
              <span>
                <span className="block text-xs font-bold text-ink">{step.title}</span>
                <span className="block text-[0.68rem] leading-relaxed text-graphite">
                  {step.text}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </Panel>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-graphite">
        <Clock className="h-3.5 w-3.5" />
        Обычно отвечаем в течение рабочего дня
      </p>
    </div>
  );
}
