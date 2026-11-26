import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTrainings } from '../../store/trainingsStore';
import { formatDate, isPastDate, todayISO } from '../../lib/date';
import { loyaltySummary, weeklyStreak } from '../../lib/loyalty';
import { countNoun } from '../../lib/plural';
import {
  EmptyState,
  PageHeader,
  Panel,
  PanelTitle,
  StatCard,
  StatusBadge,
  ActionButton,
} from '../../components/cabinet/ui';
import {
  Calendar,
  ClipboardList,
  TrendingUp,
  Bell,
  Settings,
  CreditCard,
  Download,
  Flame,
  Sparkles,
} from 'lucide-react';

const QUICK_LINKS = [
  { to: '/cabinet/registrations', icon: ClipboardList, label: 'Записи' },
  { to: '/cabinet/results', icon: TrendingUp, label: 'Результаты' },
  { to: '/cabinet/calendar', icon: Calendar, label: 'Календарь' },
  { to: '/cabinet/loyalty', icon: Sparkles, label: 'Баллы' },
  { to: '/cabinet/payment', icon: CreditCard, label: 'Абонемент' },
  { to: '/cabinet/calendar-export', icon: Download, label: 'Экспорт' },
  { to: '/cabinet/notifications', icon: Bell, label: 'Уведомления' },
  { to: '/cabinet/settings', icon: Settings, label: 'Настройки' },
];

export default function AthleteDashboard() {
  const trainings = useTrainings();
  const { currentUser, registrations, notifications, personalResults } = useAuth();
  const navigate = useNavigate();

  const activeRegs = useMemo(
    () =>
      registrations.filter((r) => r.userId === currentUser!.id && r.status !== 'cancelled'),
    [registrations, currentUser]
  );
  const today = todayISO();
  const upcomingRegs = activeRegs
    .filter((r) => {
      const training = trainings.find((t) => t.id === r.trainingId);
      return training && !isPastDate(training.date);
    })
    .sort((a, b) => {
      const ta = trainings.find((t) => t.id === a.trainingId);
      const tb = trainings.find((t) => t.id === b.trainingId);
      return `${ta?.date ?? ''}${ta?.time ?? ''}`.localeCompare(`${tb?.date ?? ''}${tb?.time ?? ''}`);
    });

  const totalResults = personalResults.filter((r) => r.userId === currentUser!.id).length;
  const unread = notifications.filter((n) => n.userId === currentUser!.id && !n.read).length;
  const unreadList = notifications.filter((n) => n.userId === currentUser!.id && !n.read);

  const loyalty = loyaltySummary(currentUser!.id, registrations, trainings, personalResults);
  const streak = weeklyStreak(currentUser!.id, registrations, trainings);

  // Разбивка посещений по направлениям: видно, куда уходит сезон
  const byDirection = useMemo(() => {
    const map = new Map<string, { total: number; attended: number }>();
    for (const reg of activeRegs) {
      const training = trainings.find((t) => t.id === reg.trainingId);
      if (!training) continue;
      const key = training.directionName || 'Другое';
      const entry = map.get(key) ?? { total: 0, attended: 0 };
      entry.total += 1;
      if (reg.attended) entry.attended += 1;
      map.set(key, entry);
    }
    return [...map.entries()].sort((a, b) => b[1].total - a[1].total).slice(0, 4);
  }, [activeRegs, trainings]);

  // Сколько дней осталось до ближайшей тренировки
  const nearest = upcomingRegs[0];
  const nearestTraining = nearest ? trainings.find((t) => t.id === nearest.trainingId) : undefined;
  const daysLeft = nearestTraining
    ? Math.max(
        0,
        Math.round(
          (new Date(`${nearestTraining.date}T12:00:00`).getTime() -
            new Date(`${today}T12:00:00`).getTime()) /
            86_400_000
        )
      )
    : 0;

  // Последняя запись дневника: показываем, что изменилось с прошлого раза
  const myResults = useMemo(
    () =>
      personalResults
        .filter((r) => r.userId === currentUser!.id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [personalResults, currentUser]
  );
  const lastResult = myResults[0];
  const lastTraining = lastResult
    ? trainings.find((t) => t.id === lastResult.trainingId)
    : undefined;

  return (
    <div>
      <PageHeader
        eyebrow="Мой сезон"
        title={`Привет, ${currentUser?.name ?? ''}!`}
        subtitle="Записи на тренировки, результаты и баллы клуба — всё в одном месте."
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          label="Мои записи"
          value={upcomingRegs.length}
          hint="предстоящие"
          to="/cabinet/registrations"
        />
        <StatCard icon={TrendingUp} label="Результаты" value={totalResults} to="/cabinet/results" />
        <StatCard
          icon={Sparkles}
          label="Баллы клуба"
          value={loyalty.balance}
          hint={`статус «${loyalty.tier.name}»`}
          to="/cabinet/loyalty"
        />
        <StatCard
          icon={Flame}
          label="Серия"
          value={streak}
          hint={countNoun(streak, 'неделя', 'недели', 'недель')}
          to="/cabinet/loyalty"
        />
      </div>

      {nearestTraining && (
        <div className="mb-8 flex flex-wrap items-center gap-4 rounded-2xl border border-brand/25 bg-brand/5 px-4 py-3.5 sm:px-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10">
            <Calendar className="h-5 w-5 text-brand" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-ink">
              {nearestTraining.name}
              {daysLeft === 0 && <span className="ml-2 text-brand">— сегодня</span>}
              {daysLeft === 1 && <span className="ml-2 text-brand">— завтра</span>}
              {daysLeft > 1 && (
                <span className="ml-2 font-normal text-graphite">
                  — через {daysLeft} {countNoun(daysLeft, 'день', 'дня', 'дней')}
                </span>
              )}
            </p>
            <p className="mt-0.5 text-xs text-graphite">
              {formatDate(nearestTraining.date)} · {nearestTraining.time} ·{' '}
              {nearestTraining.location} · тренер {nearestTraining.trainer}
            </p>
          </div>
          <ActionButton to="/cabinet/registrations" variant="outline">
            Мои записи
          </ActionButton>
        </div>
      )}

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
          <Panel>
            <div className="mb-3 flex items-center justify-between gap-3">
              <PanelTitle>Баллы и статус</PanelTitle>
              <ActionButton to="/cabinet/loyalty" variant="ghost">
                Подробнее
              </ActionButton>
            </div>
            <p className="display text-3xl text-ink">
              {loyalty.balance} <span className="text-lg text-graphite">₽</span>
            </p>
            <p className="mt-1 text-xs text-graphite">
              Статус «{loyalty.tier.name}» · кэшбэк {loyalty.tier.cashback}%
            </p>
            {loyalty.expiringSoon > 0 && (
              <p className="mt-2 rounded-lg bg-amber-500/10 px-2.5 py-2 text-[0.68rem] font-semibold text-amber-800">
                {loyalty.expiringSoon} {countNoun(loyalty.expiringSoon, 'балл сгорит', 'балла сгорят', 'баллов сгорят')} в течение 30 дней
              </p>
            )}
            {loyalty.nextTier && (
              <>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-mist">
                  <div
                    className="h-full rounded-full bg-brand transition-all"
                    style={{ width: `${loyalty.progress}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[0.68rem] text-graphite">
                  До «{loyalty.nextTier.name}» — {loyalty.toNext}{' '}
                  {countNoun(loyalty.toNext, 'тренировка', 'тренировки', 'тренировок')}
                </p>
              </>
            )}
          </Panel>

          {byDirection.length > 0 && (
            <Panel>
              <PanelTitle hint="Сколько раз записывались и сколько раз дошли.">
                Мои направления
              </PanelTitle>
              <ul className="space-y-2">
                {byDirection.map(([name, stat]) => {
                  const rate = stat.total > 0 ? Math.round((stat.attended / stat.total) * 100) : 0;
                  return (
                    <li key={name}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-semibold text-ink">{name}</span>
                        <span className="text-graphite">
                          {stat.attended}/{stat.total}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-mist">
                        <div
                          className={`h-full rounded-full ${
                            rate >= 70
                              ? 'bg-emerald-500'
                              : rate >= 40
                                ? 'bg-amber-500'
                                : 'bg-brand'
                          }`}
                          style={{ width: `${Math.max(4, rate)}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          )}

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

          {lastResult && (
            <Panel>
              <div className="mb-3 flex items-center justify-between gap-3">
                <PanelTitle>Последний результат</PanelTitle>
                <ActionButton to="/cabinet/results" variant="ghost">
                  Дневник
                </ActionButton>
              </div>
              <p className="text-sm font-bold text-ink">
                {lastTraining?.name ?? 'Тренировка'}
              </p>
              <p className="mt-0.5 text-xs text-graphite">{formatDate(lastResult.date)}</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {lastResult.distance && (
                  <span className="rounded-full bg-navy/10 px-2.5 py-1 text-[0.68rem] font-bold text-navy">
                    {lastResult.distance}
                  </span>
                )}
                {lastResult.time && (
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[0.68rem] font-bold text-emerald-700">
                    {lastResult.time}
                  </span>
                )}
                {lastResult.rating ? (
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[0.68rem] font-bold text-amber-700">
                    ★ {lastResult.rating}/5
                  </span>
                ) : null}
              </div>
              {lastResult.notes && (
                <p className="mt-2.5 line-clamp-3 rounded-lg bg-mist px-2.5 py-2 text-[0.68rem] leading-relaxed text-graphite">
                  {lastResult.notes}
                </p>
              )}
            </Panel>
          )}

          <Panel>
            <PanelTitle hint="Частые разделы кабинета.">Быстрый переход</PanelTitle>
            <div className="grid grid-cols-4 gap-2">
              {QUICK_LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group rounded-xl border border-line bg-mist/60 p-2.5 text-center transition-colors hover:border-ink/20 hover:bg-paper"
                >
                  <item.icon className="mx-auto mb-1.5 h-4 w-4 text-graphite transition-colors group-hover:text-brand" />
                  <span className="text-[0.62rem] font-semibold text-ink">{item.label}</span>
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}