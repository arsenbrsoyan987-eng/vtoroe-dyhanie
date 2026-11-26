import { useCallback, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { leadsStore, useLeads, type Lead } from '../../store/leadsStore';
import { useTrainings } from '../../store/trainingsStore';
import { dateFromToday } from '../../lib/date';
import {
  ActionButton,
  EmptyState,
  PageHeader,
  Panel,
  StatusBadge,
  Tabs,
} from '../../components/cabinet/ui';
import { countNoun } from '../../lib/plural';
import { Loader2, MessageSquare, RefreshCw, Search, Trash2, X } from 'lucide-react';

const STATUS_LABEL: Record<Lead['status'], string> = {
  new: 'Новая',
  worked: 'Обработана',
  closed: 'Закрыта',
};

const STATUS_TONE: Record<Lead['status'], 'yellow' | 'green' | 'gray'> = {
  new: 'yellow',
  worked: 'green',
  closed: 'gray',
};

/**
 * Заявки от гостей, записавшихся без регистрации.
 *
 * Список приходит через realtime-подписку leadsStore: новая заявка появляется
 * в таблице сама, кнопка «Обновить» нужна только когда база была недоступна.
 */
export default function AdminLeads() {
  const { toast } = useToast();
  const trainings = useTrainings();
  const leads = useLeads();
  const [refreshing, setRefreshing] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [tab, setTab] = useState<'open' | 'closed'>('open');

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      await leadsStore.reload();
    } catch {
      toast('Не удалось загрузить заявки — нужен доступ администратора', 'error');
    } finally {
      setRefreshing(false);
    }
  }, [toast]);

  // Первая загрузка происходит сама: useLeads подписывается на leadsStore,
  // а тот тянет список при старте. Здесь только явное обновление по кнопке.

  const handleStatus = async (id: string, status: Lead['status']) => {
    try {
      await leadsStore.updateStatus(id, status);
    } catch {
      toast('Не удалось обновить статус', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Удалить заявку безвозвратно?')) return;
    setRemoving(id);
    try {
      await leadsStore.remove(id);
      toast('Заявка удалена');
    } catch {
      toast('Не удалось удалить', 'error');
    } finally {
      setRemoving(null);
    }
  };

  const trainingName = (id: string) => trainings.find((t) => t.id === id)?.name || id;

  const open = leads.filter((l) => l.status !== 'closed');
  const closed = leads.filter((l) => l.status === 'closed');

  // Заявка «остыла», если висит в статусе «новая» дольше трёх дней
  const staleCutoff = dateFromToday(-3);
  const stale = open.filter(
    (l) => l.status === 'new' && l.createdAt.slice(0, 10) < staleCutoff
  ).length;

  const [search, setSearch] = useState('');
  const base = tab === 'open' ? open : closed;
  const q = search.trim().toLowerCase();
  const list = q
    ? base.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.email.toLowerCase().includes(q) ||
          (l.trainingId ? trainingName(l.trainingId).toLowerCase().includes(q) : false)
      )
    : base;

  const renderList = () =>
    list.length === 0 ? (
      <EmptyState
        title={tab === 'open' ? 'Активных заявок нет' : 'Закрытых заявок нет'}
        text={
          tab === 'open'
            ? 'Новые заявки с сайта появятся здесь сами — обновлять страницу не нужно.'
            : 'Заявки, которые вы закрыли, соберутся здесь.'
        }
      />
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-mist/60 text-left">
              <th className="px-4 py-2.5 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
                Имя
              </th>
              <th className="px-4 py-2.5 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
                Телефон
              </th>
              <th className="hidden px-4 py-2.5 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite sm:table-cell">
                Email
              </th>
              <th className="hidden px-4 py-2.5 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite md:table-cell">
                Тренировка
              </th>
              <th className="hidden px-4 py-2.5 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite lg:table-cell">
                Сообщение
              </th>
              <th className="px-4 py-2.5 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
                Статус
              </th>
              <th className="hidden px-4 py-2.5 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite lg:table-cell">
                Дата
              </th>
              <th className="px-4 py-2.5">
                <span className="sr-only">Действия</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((l) => (
              <tr key={l.id} className="border-b border-line last:border-0 hover:bg-mist/50">
                <td className="px-4 py-3 font-semibold text-ink">
                  {l.name}
                  {l.message && (
                    <span className="mt-1 block max-w-[14rem] text-[0.68rem] font-normal leading-relaxed text-graphite lg:hidden">
                      {l.message}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <a href={`tel:${l.phone}`} className="font-medium text-navy hover:underline">
                    {l.phone}
                  </a>
                </td>
                <td className="hidden px-4 py-3 text-graphite sm:table-cell">
                  {l.email ? (
                    <a href={`mailto:${l.email}`} className="hover:underline">
                      {l.email}
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="hidden px-4 py-3 text-graphite md:table-cell">
                  {l.trainingId ? trainingName(l.trainingId) : 'Свободная заявка'}
                </td>
                <td className="hidden max-w-[16rem] px-4 py-3 text-graphite lg:table-cell">
                  {l.message ? (
                    <span className="flex items-start gap-1.5" title={l.message}>
                      <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-graphite/60" />
                      <span className="line-clamp-2 text-xs leading-relaxed">{l.message}</span>
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge tone={STATUS_TONE[l.status]}>{STATUS_LABEL[l.status]}</StatusBadge>
                </td>
                <td className="hidden px-4 py-3 text-xs text-graphite lg:table-cell">
                  {new Date(l.createdAt).toLocaleDateString('ru-RU')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    {l.status === 'new' && (
                      <button
                        onClick={() => handleStatus(l.id, 'worked')}
                        className="text-xs font-semibold text-emerald-700 transition-colors hover:text-emerald-900"
                        title="Отметить обработанной"
                      >
                        В работу
                      </button>
                    )}
                    {l.status !== 'closed' && (
                      <button
                        onClick={() => handleStatus(l.id, 'closed')}
                        className="text-xs font-semibold text-graphite transition-colors hover:text-ink"
                        title="Скрыть из активных"
                      >
                        Закрыть
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(l.id)}
                      disabled={removing === l.id}
                      className="text-brand transition-colors hover:text-brand-dark disabled:opacity-50"
                      title="Удалить"
                    >
                      {removing === l.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

  return (
    <div>
      <PageHeader
        eyebrow="Люди"
        title="Заявки"
        subtitle="Записи гостей без регистрации — перезвоните, пока заявка горячая."
        actions={
          <ActionButton variant="outline" onClick={() => void load()} disabled={refreshing}>
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Обновить
          </ActionButton>
        }
      />

      <div className="mb-4">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'open', label: `Активные (${open.length})` },
            { value: 'closed', label: `Закрытые (${closed.length})` },
          ]}
        />
      </div>

      {stale > 0 && tab === 'open' && (
        <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <p className="text-xs leading-relaxed text-amber-800">
            <span className="font-bold">{stale}</span>{' '}
            {countNoun(stale, 'заявка ждёт', 'заявки ждут', 'заявок ждут')} ответа больше трёх
            дней — позвоните, пока человек не ушёл к конкурентам.
          </p>
        </div>
      )}

      <div className="mb-4 flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-2 text-xs">
        <Search className="h-3.5 w-3.5 shrink-0 text-graphite/60" />
        <input
          type="text"
          placeholder="Имя, телефон, email или тренировка…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            aria-label="Очистить поиск"
            className="shrink-0 text-graphite hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <Panel padded={false}>{renderList()}</Panel>
    </div>
  );
}