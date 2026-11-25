import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ActionButton,
  EmptyState,
  PageHeader,
  Panel,
  StatusBadge,
  Tabs,
} from '../../components/cabinet/ui';
import { countNoun } from '../../lib/plural';
import { ArrowUpRight, CheckCheck, Inbox } from 'lucide-react';

const TYPE_LABEL: Record<string, string> = {
  success: 'Успех',
  warning: 'Внимание',
  info: 'Инфо',
  event: 'Событие',
};

const TYPE_TONE: Record<string, 'green' | 'yellow' | 'blue'> = {
  success: 'green',
  warning: 'yellow',
  info: 'blue',
  event: 'blue',
};

const formatStamp = (iso: string) => {
  if (!iso) return '';
  const date = new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Почта кабинета: сообщения от администраторов и тренеров.
 *
 * Прочитанность хранится в самой строке уведомления, поэтому отметка
 * переживает перезагрузку и синхронизируется на других устройствах.
 */
export default function AthleteNotificationsPage() {
  const { currentUser, notifications, markNotificationRead } = useAuth();
  const [tab, setTab] = useState<'all' | 'unread'>('all');

  const mine = useMemo(
    () => notifications.filter((n) => n.userId === currentUser?.id),
    [notifications, currentUser?.id]
  );

  const unread = mine.filter((n) => !n.read);
  const list = tab === 'unread' ? unread : mine;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Аккаунт"
        title="Уведомления"
        subtitle={
          unread.length > 0
            ? `${countNoun(unread.length, 'непрочитанное сообщение', 'непрочитанных сообщения', 'непрочитанных сообщений')} — откройте, чтобы отметить прочитанным.`
            : 'Все сообщения прочитаны.'
        }
        actions={
          unread.length > 0 ? (
            <ActionButton
              variant="outline"
              onClick={() => unread.forEach((n) => void markNotificationRead(n.id))}
            >
              <CheckCheck className="h-3.5 w-3.5" /> Прочитать все
            </ActionButton>
          ) : undefined
        }
      />

      {mine.length > 0 && (
        <div className="mb-4">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { value: 'all', label: `Все (${mine.length})` },
              { value: 'unread', label: `Непрочитанные (${unread.length})` },
            ]}
          />
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState
          title={tab === 'unread' ? 'Непрочитанных нет' : 'Уведомлений нет'}
          text="Здесь появятся сообщения от школы: переносы тренировок, напоминания об оплате, новости сезона."
          action={
            tab === 'unread' ? (
              <ActionButton onClick={() => setTab('all')} variant="outline">
                Показать все
              </ActionButton>
            ) : undefined
          }
        />
      ) : (
        <ul className="space-y-2.5">
          {list.map((n) => {
            const body = (
              <>
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
                      <span className="text-[0.68rem] text-graphite">
                        {formatStamp(n.createdAt)}
                      </span>
                      {n.link && (
                        <ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-graphite" />
                      )}
                    </div>
                    <p className={`text-sm ${n.read ? 'font-semibold' : 'font-bold'} text-ink`}>
                      {n.title}
                    </p>
                    {n.message && (
                      <p className="mt-1 text-xs leading-relaxed text-graphite">{n.message}</p>
                    )}
                  </div>
                </div>
              </>
            );

            const shell = `block w-full rounded-2xl border p-4 text-left transition-colors ${
              n.read
                ? 'border-line bg-paper hover:bg-mist/60'
                : 'border-navy/25 bg-navy/5 hover:bg-navy/10'
            }`;

            return (
              <li key={n.id}>
                {n.link ? (
                  <Link
                    to={n.link}
                    onClick={() => !n.read && void markNotificationRead(n.id)}
                    className={shell}
                  >
                    {body}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => !n.read && void markNotificationRead(n.id)}
                    className={shell}
                  >
                    {body}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Panel className="mt-5 border-navy/20 bg-navy/5">
        <div className="flex gap-3">
          <Inbox className="h-4 w-4 shrink-0 text-navy" />
          <p className="text-xs leading-relaxed text-navy">
            Уведомления приходят от администраторов и тренеров школы. Отключить рассылку нельзя —
            через неё передают переносы тренировок.
          </p>
        </div>
      </Panel>
    </div>
  );
}
