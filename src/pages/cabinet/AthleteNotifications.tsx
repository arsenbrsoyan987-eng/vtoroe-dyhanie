import { useAuth } from '../../context/AuthContext';
import { ActionButton, EmptyState, PageHeader, Panel, StatusBadge } from '../../components/cabinet/ui';

const TYPE_LABEL: Record<string, string> = {
  success: 'Успех',
  warning: 'Внимание',
  info: 'Инфо',
};

const TYPE_TONE: Record<string, 'green' | 'yellow' | 'blue'> = {
  success: 'green',
  warning: 'yellow',
  info: 'blue',
};

export default function AthleteNotificationsPage() {
  const { currentUser, notifications, markNotificationRead } = useAuth();

  const userNotifs = notifications.filter((n) => n.userId === currentUser!.id);
  const unread = userNotifs.filter((n) => !n.read);
  const sorted = [...userNotifs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Аккаунт"
        title="Уведомления"
        subtitle={
          unread.length > 0
            ? `${unread.length} непрочитанных — нажмите на сообщение, чтобы отметить прочитанным.`
            : 'Все сообщения прочитаны.'
        }
        actions={
          unread.length > 0 ? (
            <ActionButton
              variant="outline"
              onClick={() => unread.forEach((n) => markNotificationRead(n.id))}
            >
              Прочитать все
            </ActionButton>
          ) : undefined
        }
      />

      {sorted.length === 0 ? (
        <EmptyState
          title="Уведомлений нет"
          text="Здесь появятся сообщения от школы: переносы тренировок, напоминания об оплате, новости сезона."
        />
      ) : (
        <ul className="space-y-2.5">
          {sorted.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => markNotificationRead(n.id)}
                className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                  n.read
                    ? 'border-line bg-paper hover:bg-mist/60'
                    : 'border-navy/25 bg-navy/5 hover:bg-navy/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      n.read ? 'bg-line' : 'bg-navy'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <StatusBadge tone={TYPE_TONE[n.type] ?? 'blue'}>
                        {TYPE_LABEL[n.type] ?? 'Инфо'}
                      </StatusBadge>
                      <span className="text-[0.68rem] text-graphite">{n.createdAt}</span>
                    </div>
                    <p className="text-sm font-bold text-ink">{n.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-graphite">{n.message}</p>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Panel className="mt-5 border-navy/20 bg-navy/5">
        <p className="text-xs leading-relaxed text-navy">
          Уведомления приходят от администраторов и тренеров школы. Отключить рассылку нельзя —
          через неё передают переносы тренировок.
        </p>
      </Panel>
    </div>
  );
}