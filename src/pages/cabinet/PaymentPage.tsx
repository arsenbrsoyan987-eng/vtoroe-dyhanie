import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { activeProfiles, useProfiles } from '../../store/profilesStore';
import {
  ActionButton,
  PageHeader,
  Panel,
  fieldClass,
  labelClass,
} from '../../components/cabinet/ui';
import { Check, Clock, ShieldCheck, Wallet } from 'lucide-react';

const plans = [
  {
    id: 'monthly',
    name: 'Ежемесячный',
    price: '990',
    period: '/мес',
    features: ['Доступ к групповым тренировкам', 'Участие в школьных событиях', 'Личный кабинет'],
  },
  {
    id: 'quarterly',
    name: 'Квартальный',
    price: '2 490',
    period: '/3 мес',
    features: ['Всё из ежемесячного', 'Экономия 20%', 'Приоритетная запись'],
  },
  {
    id: 'yearly',
    name: 'Годовой',
    price: '7 990',
    period: '/год',
    features: [
      'Всё из квартального',
      'Экономия 33%',
      'Персональная консультация тренера',
      'Эксклюзивные мероприятия',
    ],
  },
];

export default function PaymentPage() {
  const { currentUser, addNotification } = useAuth();
  const profiles = useProfiles();
  const users = activeProfiles(profiles);
  const { toast } = useToast();

  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);

  const plan = plans.find((p) => p.id === selectedPlan);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !plan) return;

    // Заявка уходит администраторам школы — карточные данные не собираются
    const admins = users.filter((u) => u.role === 'admin');
    for (const admin of admins) {
      await addNotification({
        userId: admin.id,
        title: 'Заявка на абонемент',
        message: `${currentUser.name} (${currentUser.email}) выбрал тариф «${plan.name}» — ${plan.price} ₽${plan.period}.${
          comment.trim() ? ` Комментарий: ${comment.trim()}` : ''
        }`,
        type: 'info',
        link: '/cabinet/admin/users',
      });
    }

    setSent(true);
    toast('Заявка отправлена администратору');
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
          <ActionButton to="/cabinet">В личный кабинет</ActionButton>
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
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              aria-pressed={active}
              className={`rounded-2xl border p-5 text-left transition-all ${
                active
                  ? 'border-brand bg-brand/5 shadow-card'
                  : 'border-line bg-paper hover:-translate-y-0.5 hover:shadow-card'
              }`}
            >
              <p className="text-sm font-bold text-ink">{p.name}</p>
              <p className="mt-1 flex items-baseline gap-1">
                <span className="display text-2xl text-ink">{p.price}</span>
                <span className="text-xs text-graphite">{p.period}</span>
              </p>
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
          <dl className="mb-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl bg-mist px-3 py-2.5">
              <dt className={labelClass}>Тариф</dt>
              <dd className="text-sm font-semibold text-ink">{plan?.name}</dd>
            </div>
            <div className="rounded-xl bg-mist px-3 py-2.5">
              <dt className={labelClass}>Стоимость</dt>
              <dd className="text-sm font-semibold text-ink">
                {plan?.price} ₽{plan?.period}
              </dd>
            </div>
          </dl>

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
          />

          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-mist px-3 py-2.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-xs leading-relaxed text-graphite">
              Мы не запрашиваем и не храним данные банковских карт. Ссылку на оплату присылает
              администратор школы.
            </p>
          </div>

          <ActionButton type="submit" size="md" className="mt-5 w-full">
            Отправить заявку
          </ActionButton>
        </form>
      </Panel>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-graphite">
        <Clock className="h-3.5 w-3.5" />
        Обычно отвечаем в течение рабочего дня
      </p>
    </div>
  );
}