import { useCallback, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { leadsStore, useLeads, type Lead } from '../../store/leadsStore';
import { useTrainings } from '../../store/trainingsStore';
import {
  ActionButton,
  EmptyState,
  PageHeader,
  Panel,
  StatusBadge,
  Tabs,
} from '../../components/cabinet/ui';
import { Loader2, RefreshCw, Trash2 } from 'lucide-react';

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
  const list = tab === 'open' ? open : closed;

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
                <td className="px-4 py-3 font-semibold text-ink">{l.name}</td>
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

      <Panel padded={false}>{renderList()}</Panel>
    </div>
  );
}