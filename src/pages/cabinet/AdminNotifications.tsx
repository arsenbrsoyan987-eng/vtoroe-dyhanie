import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProfiles } from '../../store/profilesStore';
import { activeProfiles } from '../../store/profilesStore';
import {
  ActionButton,
  EmptyState,
  PageHeader,
  Panel,
  PanelTitle,
  StatusBadge,
  fieldClass,
  labelClass,
} from '../../components/cabinet/ui';
import { useToast } from '../../context/ToastContext';
import { countNoun } from '../../lib/plural';
import { Bell, Check, Users } from 'lucide-react';

type Segment = 'all' | 'athletes' | 'trainers' | 'active';

const SEGMENTS: { value: Segment; label: string; hint: string }[] = [
  { value: 'all', label: 'Все', hint: 'все активные аккаунты' },
  { value: 'athletes', label: 'Спортсмены', hint: 'только роль «спортсмен»' },
  { value: 'trainers', label: 'Тренеры', hint: 'только тренерский состав' },
  { value: 'active', label: 'Активные', hint: 'были на тренировке за 30 дней' },
];

const TYPE_LABEL: Record<string, string> = {
  info: 'Информация',
  success: 'Хорошая новость',
  warning: 'Важно',
  event: 'Событие',
};

export default function AdminNotificationsPage() {
  const { notifications, addNotification, registrations } = useAuth();
  const profiles = useProfiles();
  // Рассылка идёт по живому списку из общей базы, а не по локальным копиям
  const users = activeProfiles(profiles);
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(0);
  const [form, setForm] = useState({
    title: '',
    message: '',
    segment: 'all' as Segment,
    type: 'info' as 'info' | 'success' | 'warning' | 'event',
    link: '',
  });

  // «Активные» — те, у кого есть отметка посещения за последние 30 дней
  const activeIds = useMemo(() => {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const cutoff = monthAgo.toISOString().slice(0, 10);
    return new Set(
      registrations.filter((r) => r.attended && r.registeredAt >= cutoff).map((r) => r.userId)
    );
  }, [registrations]);

  const recipients = useMemo(() => {
    if (form.segment === 'athletes') return users.filter((u) => u.role === 'athlete');
    if (form.segment === 'trainers') return users.filter((u) => u.role === 'trainer');
    if (form.segment === 'active') return users.filter((u) => activeIds.has(u.id));
    return users;
  }, [users, form.segment, activeIds]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    if (recipients.length === 0) {
      toast('В выбранном сегменте нет получателей', 'error');
      return;
    }

    setSending(true);
    let count = 0;
    let failed = 0;
    for (const u of recipients) {
      try {
        await addNotification({
          userId: u.id,
          title: form.title,
          message: form.message,
          type: form.type,
          ...(form.link.trim() ? { link: form.link.trim() } : {}),
        });
        count += 1;
      } catch {
        failed += 1;
      }
    }
    setSending(false);
    setSent(count);
    if (failed > 0) {
      toast(
        `Доставлено ${count}, не удалось ${failed} — проверьте права доступа в базе`,
        'error'
      );
    } else {
      toast(
        `Отправлено: ${count} ${countNoun(count, 'получатель', 'получателя', 'получателей')}`
      );
    }
    setShowForm(false);
    setForm({ title: '', message: '', segment: 'all', type: 'info', link: '' });
  };

  const feed = [...notifications]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Люди"
        title="Рассылки"
        subtitle="Сообщения появляются в кабинете спортсмена и тренера сразу после отправки."
        actions={
          <ActionButton onClick={() => setShowForm((v) => !v)} variant={showForm ? 'outline' : 'primary'}>
            {showForm ? 'Отмена' : '+ Создать уведомление'}
          </ActionButton>
        }
      />

      {sent > 0 && !showForm && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-2.5 text-xs text-emerald-700">
          <Check className="h-3.5 w-3.5" />
          Последняя рассылка доставлена {sent} {countNoun(sent, 'получателю', 'получателям', 'получателям')}.
        </div>
      )}

      {showForm && (
        <Panel className="mb-5">
          <PanelTitle hint="Выберите сегмент: сообщение получат только подходящие аккаунты.">
            Новое уведомление
          </PanelTitle>
          <form onSubmit={handleSend} className="space-y-3">
            <div>
              <label htmlFor="n-title" className={labelClass}>
                Заголовок
              </label>
              <input
                id="n-title"
                placeholder="Например: перенос тренировки"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label htmlFor="n-message" className={labelClass}>
                Сообщение
              </label>
              <textarea
                id="n-message"
                placeholder="Что нужно знать участникам"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={3}
                className={`${fieldClass} resize-none`}
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="n-type" className={labelClass}>
                  Тип
                </label>
                <select
                  id="n-type"
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as typeof form.type })
                  }
                  className={fieldClass}
                >
                  {Object.entries(TYPE_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="n-link" className={labelClass}>
                  Ссылка (необязательно)
                </label>
                <input
                  id="n-link"
                  placeholder="/schedule или /news/123"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className={fieldClass}
                />
              </div>
            </div>

            <div>
              <span className={labelClass}>Получатели</span>
              <div className="grid gap-2 sm:grid-cols-4">
                {SEGMENTS.map((segment) => {
                  const count =
                    segment.value === 'athletes'
                      ? users.filter((u) => u.role === 'athlete').length
                      : segment.value === 'trainers'
                        ? users.filter((u) => u.role === 'trainer').length
                        : segment.value === 'active'
                          ? users.filter((u) => activeIds.has(u.id)).length
                          : users.length;
                  return (
                    <button
                      key={segment.value}
                      type="button"
                      onClick={() => setForm({ ...form, segment: segment.value })}
                      aria-pressed={form.segment === segment.value}
                      className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                        form.segment === segment.value
                          ? 'border-brand/40 bg-brand/5'
                          : 'border-line bg-mist/50 hover:border-ink/20'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
                        <Users className="h-3 w-3" />
                        {segment.label}
                      </span>
                      <span className="mt-0.5 block text-[0.62rem] text-graphite">
                        {count} {countNoun(count, 'аккаунт', 'аккаунта', 'аккаунтов')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ActionButton type="submit" disabled={sending}>
                <Bell className="h-3.5 w-3.5" />
                {sending
                  ? `Отправляем ${recipients.length}…`
                  : `Отправить ${recipients.length} ${countNoun(recipients.length, 'получателю', 'получателям', 'получателям')}`}
              </ActionButton>
              <p className="text-[0.68rem] text-graphite">
                Сообщение приходит мгновенно, отметка «прочитано» — у каждого своя.
              </p>
            </div>
          </form>
        </Panel>
      )}

      <Panel>
        <PanelTitle hint="Последние 20 сообщений — от новых к старым.">История</PanelTitle>
        {feed.length === 0 ? (
          <EmptyState
            title="Уведомлений ещё не было"
            text="Создайте первое сообщение — оно появится в кабинетах участников."
          />
        ) : (
          <ul className="space-y-2.5">
            {feed.map((n) => {
              const user = users.find((u) => u.id === n.userId);
              return (
                <li key={n.id} className="rounded-xl border border-line bg-mist/50 p-4">
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-[0.68rem] text-graphite">
                    <span>{n.createdAt}</span>
                    <span aria-hidden>→</span>
                    <span className="font-semibold text-ink">{user?.name || 'Всем'}</span>
                    <StatusBadge tone={n.read ? 'gray' : 'blue'}>
                      {n.read ? 'Прочитано' : 'Новое'}
                    </StatusBadge>
                  </div>
                  <p className="text-sm font-bold text-ink">{n.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-graphite">{n.message}</p>
                  {n.link && (
                    <p className="mt-1.5 text-[0.68rem] font-semibold text-navy">{n.link}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
