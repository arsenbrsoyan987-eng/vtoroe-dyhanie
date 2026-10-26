import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getUsers } from '../../store/database';
import Button from '../../components/ui/Button';
import { Check, Clock, ShieldCheck, Wallet } from 'lucide-react';

const plans = [
  { id: 'monthly', name: 'Ежемесячный', price: '990', period: '/мес', features: ['Доступ к групповым тренировкам', 'Участие в клубных событиях', 'Личный кабинет'] },
  { id: 'quarterly', name: 'Квартальный', price: '2 490', period: '/3 мес', features: ['Всё из ежемесячного', 'Экономия 20%', 'Приоритетная запись'] },
  { id: 'yearly', name: 'Годовой', price: '7 990', period: '/год', features: ['Всё из квартального', 'Экономия 33%', 'Персональная консультация тренера', 'Эксклюзивные мероприятия'] },
];

export default function PaymentPage() {
  const { currentUser, addNotification } = useAuth();
  const { toast } = useToast();

  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);

  const plan = plans.find((p) => p.id === selectedPlan);

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !plan) return;

    // Заявка уходит администраторам клуба — карточные данные не собираются
    const admins = getUsers().filter((u) => u.role === 'admin');
    const recipients = admins.length > 0 ? admins : [];
    recipients.forEach((admin) => {
      addNotification({
        userId: admin.id,
        title: 'Заявка на абонемент',
        message: `${currentUser.name} (${currentUser.email}) выбрал тариф «${plan.name}» — ${plan.price} ₽${plan.period}.${
          comment.trim() ? ` Комментарий: ${comment.trim()}` : ''
        }`,
        type: 'info',
        link: '/cabinet/admin/users',
      });
    });

    setSent(true);
    toast('Заявка отправлена администратору');
  };

  if (sent) {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="rounded-sm border border-green-500/30 bg-surface p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <Check className="h-8 w-8 text-green-400" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">Заявка отправлена</h2>
          <p className="mb-6 text-sm text-gray-400">
            Администратор свяжется с вами, подтвердит тариф «{plan?.name}» и пришлёт
            ссылку на оплату. Абонемент активируется после поступления оплаты.
          </p>
          <Button to="/cabinet" variant="primary" size="sm">В личный кабинет</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-center text-2xl font-bold text-white">Абонемент</h1>
      <p className="mb-8 text-center text-sm text-gray-400">
        Выберите тариф — мы отправим заявку администратору клуба
      </p>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {plans.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPlan(p.id)}
            className={`rounded-sm border p-5 text-left transition-all ${
              selectedPlan === p.id
                ? 'border-accent-red bg-accent-red/5'
                : 'border-white/10 bg-surface hover:border-white/20'
            }`}
          >
            <div className="mb-1 text-lg font-bold text-white">{p.name}</div>
            <div className="mb-1 text-3xl font-bold text-white">
              {p.price}
              <span className="text-sm text-gray-400">{p.period}</span>
            </div>
            <ul className="mt-3 space-y-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-1 text-xs text-gray-400">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-green-400" />
                  {f}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <form onSubmit={handleRequest} className="rounded-sm border border-white/10 bg-surface p-6">
        <div className="mb-4 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-gray-400" />
          <h3 className="font-semibold text-white">Заявка на абонемент</h3>
        </div>

        <dl className="mb-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-500">Тариф</dt>
            <dd className="text-white">{plan?.name}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-gray-500">Стоимость</dt>
            <dd className="text-white">{plan?.price} ₽{plan?.period}</dd>
          </div>
        </dl>

        <label htmlFor="pay-comment" className="mb-1.5 block text-xs uppercase tracking-wider text-gray-400">
          Комментарий (необязательно)
        </label>
        <textarea
          id="pay-comment"
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Например: удобно оплатить после 5 числа"
          className="w-full resize-none rounded-sm border border-white/10 bg-primary px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-accent-red focus:outline-none"
        />

        <div className="mt-4 flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
          <p className="text-xs text-gray-500">
            Мы не запрашиваем и не храним данные банковских карт. Ссылку на оплату
            присылает администратор клуба.
          </p>
        </div>

        <Button type="submit" variant="primary" className="mt-6 w-full">
          Отправить заявку
        </Button>
      </form>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-600">
        <Clock className="h-3.5 w-3.5" />
        Обычно отвечаем в течение рабочего дня
      </p>
    </div>
  );
}
