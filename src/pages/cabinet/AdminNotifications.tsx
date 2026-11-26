import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { activeProfiles, useProfiles } from '../../store/profilesStore';
import { describeError, supabase } from '../../lib/supabase';
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
import { dateFromToday } from '../../lib/date';
import type { Notification } from '../../store/database';
import { Bell, Check, Copy, Eye, Search, Send, Users } from 'lucide-react';

type Segment = 'all' | 'athletes' | 'trainers' | 'active' | 'newcomers' | 'lapsed';
type NoticeType = Notification['type'];

const SEGMENTS: { value: Segment; label: string; hint: string }[] = [
  { value: 'all', label: 'Все', hint: 'все активные аккаунты' },
  { value: 'athletes', label: 'Спортсмены', hint: 'только роль «спортсмен»' },
  { value: 'trainers', label: 'Тренеры', hint: 'только тренерский состав' },
  { value: 'active', label: 'Активные', hint: 'были на тренировке за 30 дней' },
  { value: 'newcomers', label: 'Новички', hint: 'зарегистрированы за 14 дней' },
  { value: 'lapsed', label: 'Без визитов', hint: 'не были 30 дней — пора вернуть' },
];

const TYPE_LABEL: Record<NoticeType, string> = {
  info: 'Информация',
  success: 'Хорошая новость',
  warning: 'Важно',
  event: 'Событие',
};

const TYPE_TONE: Record<NoticeType, 'blue' | 'green' | 'yellow'> = {
  info: 'blue',
  success: 'green',
  warning: 'yellow',
  event: 'blue',
};

/** Одна рассылка: одинаковые заголовок, текст и дата у разных получателей */
interface Campaign {
  key: string;
  title: string;
  message: string;
  type: NoticeType;
  link?: string;
  createdAt: string;
  total: number;
  read: number;
}

export default function AdminNotificationsPage() {
  const { notifications, registrations, refresh } = useAuth();
  const profiles = useProfiles();
  // Рассылка идёт по живому списку из общей базы, а не по локальным копиям
  const users = activeProfiles(profiles);
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(0);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | NoticeType>('all');
  const [form, setForm] = useState({
    title: '',
    message: '',
    segment: 'all' as Segment,
    type: 'info' as NoticeType,
    link: '',
  });

  const cutoff30 = dateFromToday(-30);
  const cutoff14 = dateFromToday(-14);

  // «Активные» — те, у кого есть отметка посещения за последние 30 дней
  const activeIds = useMemo(
    () =>
      new Set(
        registrations
          .filter((r) => r.attended && r.registeredAt >= cutoff30)
          .map((r) => r.userId)
      ),
    [registrations, cutoff30]
  );

  /** Сколько человек попадёт в каждый сегмент — считаем один раз */
  const segmentCounts = useMemo<Record<Segment, number>>(
    () => ({
      all: users.length,
      athletes: users.filter((u) => u.role === 'athlete').length,
      trainers: users.filter((u) => u.role === 'trainer').length,
      active: users.filter((u) => activeIds.has(u.id)).length,
      newcomers: users.filter((u) => u.created >= cutoff14).length,
      lapsed: users.filter((u) => u.role === 'athlete' && !activeIds.has(u.id)).length,
    }),
    [users, activeIds, cutoff14]
  );

  const recipients = useMemo(() => {
    if (form.segment === 'athletes') return users.filter((u) => u.role === 'athlete');
    if (form.segment === 'trainers') return users.filter((u) => u.role === 'trainer');
    if (form.segment === 'active') return users.filter((u) => activeIds.has(u.id));
    if (form.segment === 'newcomers') return users.filter((u) => u.created >= cutoff14);
    if (form.segment === 'lapsed')
      return users.filter((u) => u.role === 'athlete' && !activeIds.has(u.id));
    return users;
  }, [users, form.segment, activeIds, cutoff14]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    if (recipients.length === 0) {
      toast('В выбранном сегменте нет получателей', 'error');
      return;
    }

    setSending(true);
    // Один insert на всех получателей: цикл по addNotification давал
    // по запросу на человека и перезагружал список после каждого
    const payload = recipients.map((u) => ({
      user_id: u.id,
      title: form.title.trim(),
      message: form.message.trim(),
      type: form.type,
      link: form.link.trim() || null,
    }));

    const { error } = await supabase.from('notifications').insert(payload);
    setSending(false);

    if (error) {
      toast(describeError(error), 'error');
      return;
    }

    setSent(payload.length);
    toast(`Отправлено: ${countNoun(payload.length, 'получатель', 'получателя', 'получателей')}`);
    refresh();
    setShowForm(false);
    setForm({ title: '', message: '', segment: 'all', type: 'info', link: '' });
  };

  /** Повторить рассылку: текст и ссылка переносятся в форму как есть */
  const repeat = (c: Campaign) => {
    setForm({
      title: c.title,
      message: c.message,
      segment: 'all',
      type: c.type,
      link: c.link ?? '',
    });
    setShowForm(true);
  };

  // Рассылки группируются по тексту и дате: у каждой копии своя отметка «прочитано»
  const campaigns = useMemo(() => {
    const map = new Map<string, Campaign>();
    for (const n of notifications) {
      const key = `${n.createdAt}|${n.title}|${n.message}`;
      const prev = map.get(key);
      map.set(key, {
        key,
        title: n.title,
        message: n.message,
        type: n.type,
        link: n.link ?? prev?.link,
        createdAt: n.createdAt,
        total: (prev?.total ?? 0) + 1,
        read: (prev?.read ?? 0) + (n.read ? 1 : 0),
      });
    }
    return [...map.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [notifications]);

  const history = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (typeFilter !== 'all' && c.type !== typeFilter) return false;
      if (!needle) return true;
      return (
        c.title.toLowerCase().includes(needle) || c.message.toLowerCase().includes(needle)
      );
    });
  }, [campaigns, query, typeFilter]);

  const totals = useMemo(() => {
    const delivered = campaigns.reduce((sum, c) => sum + c.total, 0);
    const opened = campaigns.reduce((sum, c) => sum + c.read, 0);
    return { delivered, opened, percent: delivered ? Math.round((opened / delivered) * 100) : 0 };
  }, [campaigns]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Люди"
        title="Рассылки"
        subtitle="Сообщения появляются в кабинете спортсмена и тренера сразу после отправки."
        actions={
          <ActionButton
            onClick={() => setShowForm((v) => !v)}
            variant={showForm ? 'outline' : 'primary'}
          >
            {showForm ? 'Отмена' : '+ Создать уведомление'}
          </ActionButton>
        }
      />

      {sent > 0 && !showForm && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-2.5 text-xs text-emerald-700">
          <Check className="h-3.5 w-3.5" />
          Последняя рассылка доставлена{' '}
          {countNoun(sent, 'получателю', 'получателям', 'получателям')}.
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
                maxLength={120}
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
                  onChange={(e) => setForm({ ...form, type: e.target.value as NoticeType })}
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
              <div className="grid gap-2 sm:grid-cols-3">
                {SEGMENTS.map((segment) => (
                  <button
                    key={segment.value}
                    type="button"
                    onClick={() => setForm({ ...form, segment: segment.value })}
                    aria-pressed={form.segment === segment.value}
                    title={segment.hint}
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
                      {countNoun(segmentCounts[segment.value], 'аккаунт', 'аккаунта', 'аккаунтов')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Предпросмотр: администратор видит сообщение так же, как спортсмен */}
            <div className="rounded-2xl border border-navy/25 bg-navy/5 p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-navy">
                <Eye className="h-3 w-3" /> Так увидит получатель
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={TYPE_TONE[form.type]}>{TYPE_LABEL[form.type]}</StatusBadge>
                <span className="text-[0.68rem] text-graphite">сегодня</span>
              </div>
              <p className="mt-1.5 text-sm font-bold text-ink">
                {form.title.trim() || 'Заголовок уведомления'}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-graphite">
                {form.message.trim() || 'Текст сообщения появится здесь.'}
              </p>
              {form.link.trim() && (
                <p className="mt-1.5 text-[0.68rem] font-semibold text-navy">{form.link.trim()}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ActionButton type="submit" disabled={sending || recipients.length === 0}>
                {sending ? <Send className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                {sending
                  ? `Отправляем ${recipients.length}…`
                  : `Отправить · ${countNoun(recipients.length, 'получатель', 'получателя', 'получателей')}`}
              </ActionButton>
              <p className="text-[0.68rem] text-graphite">
                Сообщение приходит мгновенно, отметка «прочитано» — у каждого своя.
              </p>
            </div>
          </form>
        </Panel>
      )}

      <Panel>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <PanelTitle hint="Сгруппировано по тексту и дате: видно, сколько человек открыли.">
            История
          </PanelTitle>
          <div className="flex flex-wrap gap-3 text-[0.68rem] text-graphite">
            <span>
              Доставлено <strong className="text-ink">{totals.delivered}</strong>
            </span>
            <span>
              Прочитано <strong className="text-ink">{totals.opened}</strong> · {totals.percent}%
            </span>
          </div>
        </div>

        <div className="mb-3 flex flex-col gap-2 sm:flex-row">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-graphite" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по заголовку и тексту"
              className={`${fieldClass} pl-9`}
              aria-label="Поиск по истории рассылок"
            />
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | NoticeType)}
            className={`${fieldClass} sm:w-52`}
            aria-label="Фильтр по типу"
          >
            <option value="all">Все типы</option>
            {Object.entries(TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {history.length === 0 ? (
          <EmptyState
            title={campaigns.length === 0 ? 'Уведомлений ещё не было' : 'Ничего не найдено'}
            text={
              campaigns.length === 0
                ? 'Создайте первое сообщение — оно появится в кабинетах участников.'
                : 'Измените запрос или сбросьте фильтр по типу.'
            }
            action={
              campaigns.length > 0 ? (
                <ActionButton
                  variant="outline"
                  onClick={() => {
                    setQuery('');
                    setTypeFilter('all');
                  }}
                >
                  Сбросить фильтры
                </ActionButton>
              ) : undefined
            }
          />
        ) : (
          <ul className="space-y-2.5">
            {history.slice(0, 15).map((c) => {
              const percent = c.total ? Math.round((c.read / c.total) * 100) : 0;
              return (
                <li key={c.key} className="rounded-xl border border-line bg-mist/50 p-4">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[0.68rem] text-graphite">
                    <span>{c.createdAt}</span>
                    <StatusBadge tone={TYPE_TONE[c.type]}>{TYPE_LABEL[c.type]}</StatusBadge>
                    <span>
                      {countNoun(c.total, 'получатель', 'получателя', 'получателей')}
                    </span>
                    <button
                      type="button"
                      onClick={() => repeat(c)}
                      className="ml-auto inline-flex items-center gap-1 font-semibold text-navy transition-colors hover:text-brand"
                    >
                      <Copy className="h-3 w-3" /> Повторить
                    </button>
                  </div>
                  <p className="text-sm font-bold text-ink">{c.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-graphite">{c.message}</p>
                  {c.link && (
                    <p className="mt-1.5 text-[0.68rem] font-semibold text-navy">{c.link}</p>
                  )}
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-[0.62rem] font-semibold text-graphite">
                      {c.read}/{c.total} прочитали
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}