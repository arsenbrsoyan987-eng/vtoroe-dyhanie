import { useCallback, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { leadsStore, useLeads, type Lead } from '../../store/leadsStore';
import { useTrainings } from '../../store/trainingsStore';
import { Loader2, RefreshCw, Trash2 } from 'lucide-react';

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

  const statusBadge = (status: Lead['status']) => {
    const cls: Record<Lead['status'], string> = {
      new: 'bg-yellow-500/20 text-yellow-300',
      worked: 'bg-green-500/20 text-green-300',
      closed: 'bg-gray-500/20 text-gray-400',
    };
    const label: Record<Lead['status'], string> = {
      new: 'Новая',
      worked: 'Обработана',
      closed: 'Закрыта',
    };
    return (
      <span
        className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls[status]}`}
      >
        {label[status]}
      </span>
    );
  };

  const open = leads.filter((l) => l.status !== 'closed');
  const closed = leads.filter((l) => l.status === 'closed');

  const renderList = (list: Lead[]) =>
    list.length === 0 ? (
      <p className="py-8 text-center text-sm text-gray-500">Заявок пока нет</p>
    ) : (
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-gray-500">
            <th className="px-4 py-3">Имя</th>
            <th className="px-4 py-3">Телефон</th>
            <th className="hidden px-4 py-3 sm:table-cell">Email</th>
            <th className="hidden px-4 py-3 md:table-cell">Тренировка</th>
            <th className="px-4 py-3">Статус</th>
            <th className="hidden px-4 py-3 lg:table-cell">Дата</th>
            <th className="px-4 py-3">
              <span className="sr-only">Действия</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {list.map((l) => (
            <tr key={l.id} className="border-b border-white/5 hover:bg-white/5">
              <td className="px-4 py-3 font-medium text-white">{l.name}</td>
              <td className="px-4 py-3">
                <a href={`tel:${l.phone}`} className="text-accent-blue hover:underline">
                  {l.phone}
                </a>
              </td>
              <td className="hidden px-4 py-3 text-gray-400 sm:table-cell">
                {l.email ? (
                  <a href={`mailto:${l.email}`} className="hover:underline">
                    {l.email}
                  </a>
                ) : (
                  '—'
                )}
              </td>
              <td className="hidden px-4 py-3 text-gray-300 md:table-cell">
                {l.trainingId ? trainingName(l.trainingId) : 'Свободная заявка'}
              </td>
              <td className="px-4 py-3">{statusBadge(l.status)}</td>
              <td className="hidden px-4 py-3 text-xs text-gray-500 lg:table-cell">
                {new Date(l.createdAt).toLocaleDateString('ru-RU')}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {l.status === 'new' && (
                    <button
                      onClick={() => handleStatus(l.id, 'worked')}
                      className="text-xs text-green-400 transition-colors hover:text-green-300"
                      title="Отметить обработанной"
                    >
                      В работу
                    </button>
                  )}
                  {l.status !== 'closed' && (
                    <button
                      onClick={() => handleStatus(l.id, 'closed')}
                      className="text-xs text-gray-400 transition-colors hover:text-gray-300"
                      title="Скрыть из активных"
                    >
                      Закрыть
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(l.id)}
                    disabled={removing === l.id}
                    className="text-red-400 transition-colors hover:text-red-300 disabled:opacity-50"
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
    );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Заявки</h1>
          <p className="text-sm text-gray-400">
            Записи гостей без регистрации — перезвоните, пока заявка горячая
          </p>
        </div>
        <button
          onClick={() => void load()}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-sm border border-white/10 px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>

      <div className="space-y-6">
        <div className="overflow-x-auto rounded-sm border border-white/10 bg-surface">
          {renderList(open)}
        </div>

        {closed.length > 0 && (
          <details className="rounded-sm border border-white/10 bg-surface">
            <summary className="cursor-pointer px-4 py-3 text-sm text-gray-400 transition-colors hover:text-white">
              Закрытые ({closed.length})
            </summary>
            <div className="overflow-x-auto">{renderList(closed)}</div>
          </details>
        )}
      </div>
    </div>
  );
}
