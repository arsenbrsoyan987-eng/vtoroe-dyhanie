import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTrainings } from '../../store/trainingsStore';
import { formatDate } from '../../lib/date';
import {
  EmptyState,
  PageHeader,
  Panel,
  PanelTitle,
  StatCard,
  StatusBadge,
  ActionButton,
} from '../../components/cabinet/ui';
import { Calendar, ClipboardList, TrendingUp, Bell, Settings, CreditCard, Download } from 'lucide-react';

const QUICK_LINKS = [
  { to: '/cabinet/registrations', icon: ClipboardList, label: 'Записи' },
  { to: '/cabinet/results', icon: TrendingUp, label: 'Результаты' },
  { to: '/cabinet/calendar', icon: Calendar, label: 'Календарь' },
  { to: '/cabinet/payment', icon: CreditCard, label: 'Абонемент' },
  { to: '/cabinet/calendar-export', icon: Download, label: 'Экспорт' },
  { to: '/cabinet/settings', icon: Settings, label: 'Настройки' },
];

export default function AthleteDashboard() {
  const trainings = useTrainings();
  const { currentUser, registrations, notifications, personalResults } = useAuth();
  const navigate = useNavigate();

  const activeRegs = registrations.filter((r) => r.userId === currentUser!.id && r.status !== 'cancelled');
  const upcomingRegs = activeRegs.filter((r) => {
    const training = trainings.find((t) => t.id === r.trainingId);
    return training && new Date(training.date) >= new Date();
  });
  const totalResults = personalResults.filter((r) => r.userId === currentUser!.id).length;
  const unread = notifications.filter((n) => n.userId === currentUser!.id && !n.read).length;
  const unreadList = notifications.filter((n) => n.userId === currentUser!.id && !n.read);

  return (
    <div>
      <PageHeader
        eyebrow="Мой сезон"
        title={`Привет, ${currentUser?.name ?? ''}!`}
        subtitle="Записи на тренировки, результаты и уведомления — всё в одном месте."
      />

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          label="Мои записи"
          value={upcomingRegs.length}
          hint="предстоящие"
          to="/cabinet/registrations"
        />
        <StatCard icon={TrendingUp} label="Результаты" value={totalResults} to="/cabinet/results" />
        <StatCard
          icon={Bell}
          label="Уведомления"
          value={unread}
          hint={unread > 0 ? 'непрочитанные' : 'всё прочитано'}
          to="/cabinet/notifications"
        />
        <StatCard
          icon={Calendar}
          label="Ближайшая"
          value={upcomingRegs.length > 0 ? '1' : '—'}
          hint="тренировка в плане"
          to="/cabinet/registrations"
        />
      </div>

      <div className="mb-8 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Panel>
          <div className="mb-4 flex items-center justify-between gap-3">
            <PanelTitle hint="Тренировки, на которые вы записаны.">Ближайшие тренировки</PanelTitle>
            <ActionButton to="/schedule" variant="outline">
              Всё расписание
            </ActionButton>
          </div>
          {upcomingRegs.length === 0 ? (
            <EmptyState
              title="Записей пока нет"
              text="Выберите тренировку в расписании — запись займёт пару секунд."
              action={
                <ActionButton onClick={() => navigate('/schedule')}>Записаться</ActionButton>
              }
            />
          ) : (
            <ul className="space-y-2.5">
              {upcomingRegs.slice(0, 3).map((reg) => {
                const training = trainings.find((t) => t.id === reg.trainingId);
                if (!training) return null;
                return (
                  <li
                    key={reg.id}
                    className="flex flex-col gap-3 rounded-xl border border-line bg-mist/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink">{training.name}</p>
                      <p className="mt-1 text-xs text-graphite">
                        {formatDate(training.date)} · {training.time} · {training.location}
                      </p>
                    </div>
                    <StatusBadge tone={reg.status === 'confirmed' ? 'green' : 'yellow'}>
                      {reg.status === 'confirmed' ? 'Подтверждено' : 'Лист ожидания'}
                    </StatusBadge>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <div className="space-y-5">
          {unread > 0 && (
            <Panel>
              <div className="mb-4 flex items-center justify-between gap-3">
                <PanelTitle>Новые уведомления</PanelTitle>
                <ActionButton to="/cabinet/notifications" variant="ghost">
                  Все
                </ActionButton>
              </div>
              <ul className="space-y-2">
                {unreadList.slice(0, 2).map((n) => (
                  <li key={n.id} className="rounded-xl border border-navy/20 bg-navy/5 p-3">
                    <p className="text-xs font-bold text-ink">{n.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-graphite">{n.message}</p>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel>
            <PanelTitle hint="Частые разделы кабинета.">Быстрый переход</PanelTitle>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group rounded-xl border border-line bg-mist/60 p-3 text-center transition-colors hover:border-ink/20 hover:bg-paper"
                >
                  <item.icon className="mx-auto mb-1.5 h-4.5 w-4.5 text-graphite transition-colors group-hover:text-brand" />
                  <span className="text-[0.68rem] font-semibold text-ink">{item.label}</span>
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}