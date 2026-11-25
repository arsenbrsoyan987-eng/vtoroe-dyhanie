import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { activeProfiles, useProfiles } from '../../store/profilesStore';
import { useTrainings } from '../../store/trainingsStore';
import { todayISO } from '../../lib/date';
import { countNoun } from '../../lib/plural';
import { EmptyState, PageHeader, Panel, PanelTitle, StatCard, StatusBadge } from '../../components/cabinet/ui';
import {
  Camera,
  Users,
  ClipboardList,
  Calendar,
  Trophy,
  TrendingUp,
  Newspaper,
  PartyPopper,
  Tent,
  Inbox,
  Sparkles,
  UserCheck,
  Activity,
} from 'lucide-react';

const QUICK_LINKS = [
  { to: '/cabinet/admin/users', icon: Users, label: 'Пользователи' },
  { to: '/cabinet/admin/trainers', icon: Users, label: 'Тренеры' },
  { to: '/cabinet/admin/directions', icon: TrendingUp, label: 'Направления' },
  { to: '/cabinet/admin/trainings', icon: ClipboardList, label: 'Тренировки' },
  { to: '/cabinet/admin/leads', icon: Inbox, label: 'Заявки' },
  { to: '/cabinet/admin/notifications', icon: Calendar, label: 'Рассылки' },
  { to: '/cabinet/admin/news', icon: Newspaper, label: 'Новости' },
  { to: '/cabinet/admin/events', icon: PartyPopper, label: 'Мероприятия' },
  { to: '/cabinet/admin/camps', icon: Tent, label: 'Кэмпы' },
  { to: '/cabinet/photos', icon: Camera, label: 'Фото' },
  { to: '/cabinet/admin/results', icon: Trophy, label: 'Результаты' },
  { to: '/cabinet/admin/site-settings', icon: Calendar, label: 'Настройки сайта' },
];

const STATUS: Record<string, { label: string; tone: 'green' | 'yellow' | 'gray' }> = {
  confirmed: { label: 'Подтверждён', tone: 'green' },
  waitlist: { label: 'Ожидание', tone: 'yellow' },
  cancelled: { label: 'Отменён', tone: 'gray' },
};

export default function AdminDashboard() {
  const trainings = useTrainings();
  const { registrations } = useAuth();
  // Счётчики считаются по общей базе и обновляются в реальном времени
  const users = activeProfiles(useProfiles());
  const athletes = users.filter((u) => u.role === 'athlete').length;
  const trainers = users.filter((u) => u.role === 'trainer').length;
  const totalRegs = registrations.filter((r) => r.status !== 'cancelled').length;
  const totalAttended = registrations.filter((r) => r.attended).length;
  const recent = registrations.slice(-6).reverse();

  const today = todayISO();

  const metrics = useMemo(() => {
    const monthAgo = new Date(`${today}T12:00:00`);
    monthAgo.setDate(monthAgo.getDate() - 30);
    const cutoff = monthAgo.toISOString().slice(0, 10);

    const weekAgo = new Date(`${today}T12:00:00`);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekCutoff = weekAgo.toISOString().slice(0, 10);

    const upcoming = trainings.filter((t) => t.date >= today).length;
    const newUsers = users.filter((u) => u.created >= cutoff).length;
    const newUsersWeek = users.filter((u) => u.created >= weekCutoff).length;

    const activeRegs = registrations.filter((r) => r.status !== 'cancelled');
    const attendedMonth = activeRegs.filter((r) => r.attended && r.registeredAt >= cutoff).length;
    const activeAthletes = new Set(
      activeRegs.filter((r) => r.registeredAt >= cutoff).map((r) => r.userId)
    ).size;

    // Заполняемость: сколько мест занято на предстоящих занятиях
    const upcomingTrainings = trainings.filter((t) => t.date >= today);
    let seats = 0;
    let taken = 0;
    for (const t of upcomingTrainings) {
      seats += t.spotsAvailable;
      taken += activeRegs.filter((r) => r.trainingId === t.id && r.status === 'confirmed').length;
    }
    const fillRate = seats > 0 ? Math.round((taken / seats) * 100) : 0;

    return {
      upcoming,
      newUsers,
      newUsersWeek,
      attendedMonth,
      activeAthletes,
      fillRate,
      seats,
      taken,
    };
  }, [trainings, registrations, users, today]);

  return (
    <div>
      <PageHeader
        eyebrow="Управление"
        title="Панель администратора"
        subtitle="Сводка по школе «Второе дыхание» и быстрый доступ к разделам."
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={Users} label="Пользователей" value={users.length} to="/cabinet/admin/users" />
        <StatCard icon={TrendingUp} label="Спортсменов" value={athletes} to="/cabinet/admin/users" />
        <StatCard icon={Users} label="Тренеров" value={trainers} to="/cabinet/admin/trainers" />
        <StatCard icon={ClipboardList} label="Записей" value={totalRegs} hint="без отменённых" />
        <StatCard icon={ClipboardList} label="Посещений" value={totalAttended} hint="отмечено вручную" />
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-paper px-4 py-3.5">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-emerald-600" />
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
              Новые аккаунты
            </p>
          </div>
          <p className="mt-1.5 display text-2xl text-ink">
            +{metrics.newUsersWeek}
            <span className="ml-1 text-xs font-normal text-graphite">за неделю</span>
          </p>
          <p className="text-[0.68rem] text-graphite">
            +{metrics.newUsers} за 30 дней
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-paper px-4 py-3.5">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-navy" />
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
              Активные за месяц
            </p>
          </div>
          <p className="mt-1.5 display text-2xl text-ink">{metrics.activeAthletes}</p>
          <p className="text-[0.68rem] text-graphite">
            {countNoun(metrics.activeAthletes, 'спортсмен записывался', 'спортсмена записывались', 'спортсменов записывались')}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-paper px-4 py-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
              Заполняемость
            </p>
          </div>
          <p className="mt-1.5 display text-2xl text-ink">{metrics.fillRate}%</p>
          <p className="text-[0.68rem] text-graphite">
            {metrics.taken} из {metrics.seats} мест
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-paper px-4 py-3.5">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand" />
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
              Предстоящих
            </p>
          </div>
          <p className="mt-1.5 display text-2xl text-ink">{metrics.upcoming}</p>
          <p className="text-[0.68rem] text-graphite">
            {countNoun(metrics.upcoming, 'тренировка', 'тренировки', 'тренировок')} в расписании
          </p>
        </div>
      </div>

      <Panel className="mb-8">
        <PanelTitle hint="Каждый раздел открывается в этом же кабинете — вкладка сайта не нужна.">
          Быстрые действия
        </PanelTitle>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group rounded-xl border border-line bg-mist/60 p-3 text-center transition-colors hover:border-ink/20 hover:bg-paper"
            >
              <item.icon className="mx-auto mb-2 h-5 w-5 text-graphite transition-colors group-hover:text-brand" />
              <span className="text-xs font-semibold text-ink">{item.label}</span>
            </Link>
          ))}
        </div>
      </Panel>

      <Panel className="mb-8 border-navy/20 bg-navy/5">
        <p className="text-xs leading-relaxed text-navy">
          Все данные хранятся в Supabase и обновляются мгновенно — правки из админки сразу видны
          всем посетителям. Кнопка «Опубликовать» больше не нужна.
        </p>
      </Panel>

      <Panel padded={false}>
        <div className="p-5 pb-0 sm:p-6 sm:pb-0">
          <PanelTitle hint="Последние шесть записей по всей школе.">Последние записи</PanelTitle>
        </div>
        {recent.length === 0 ? (
          <div className="px-5 pb-6 sm:px-6">
            <EmptyState
              title="Записей пока нет"
              text="Как только спортсмены начнут записываться на тренировки, список появится здесь."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-line bg-mist/60">
                  <th className="px-5 py-2.5 text-left text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite sm:px-6">
                    Спортсмен
                  </th>
                  <th className="hidden px-3 py-2.5 text-left text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite sm:table-cell">
                    Тренировка
                  </th>
                  <th className="px-3 py-2.5 text-left text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
                    Статус
                  </th>
                  <th className="hidden px-5 py-2.5 text-left text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite md:table-cell sm:px-6">
                    Дата
                  </th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => {
                  const user = users.find((u) => u.id === r.userId);
                  const training = trainings.find((t) => t.id === r.trainingId);
                  const status = STATUS[r.status] ?? STATUS.cancelled;
                  return (
                    <tr key={r.id} className="border-b border-line last:border-0 hover:bg-mist/50">
                      <td className="px-5 py-3 font-medium text-ink sm:px-6">{user?.name || '—'}</td>
                      <td className="hidden px-3 py-3 text-graphite sm:table-cell">
                        {training?.name || '—'}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                      </td>
                      <td className="hidden px-5 py-3 text-xs text-graphite md:table-cell sm:px-6">
                        {r.registeredAt}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
