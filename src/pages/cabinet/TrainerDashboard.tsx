import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTrainings } from '../../store/trainingsStore';
import { activeProfiles, useProfiles } from '../../store/profilesStore';
import { visibleTrainings } from '../../lib/access';
import { formatDate, isPastDate, todayISO } from '../../lib/date';
import { countNoun } from '../../lib/plural';
import {
  ActionButton,
  EmptyState,
  PageHeader,
  Panel,
  PanelTitle,
  StatCard,
} from '../../components/cabinet/ui';
import { Calendar, Camera, Users, ClipboardList, TrendingUp, CheckCircle2, Newspaper } from 'lucide-react';

export default function TrainerDashboard() {
  const trainings = useTrainings();
  const { currentUser, registrations } = useAuth();
  const profiles = activeProfiles(useProfiles());

  const myTrainings = useMemo(
    () =>
      visibleTrainings(trainings, currentUser, registrations).sort((a, b) =>
        (a.date + a.time).localeCompare(b.date + b.time)
      ),
    [trainings, currentUser, registrations]
  );

  const today = todayISO();
  const upcoming = myTrainings.filter((t) => !isPastDate(t.date));
  const myIds = new Set(myTrainings.map((t) => t.id));
  const myRegs = registrations.filter((r) => r.status !== 'cancelled' && myIds.has(r.trainingId));
  const students = new Set(myRegs.map((r) => r.userId)).size;
  const attended = myRegs.filter((r) => r.attended).length;

  // Статистика по периодам: считаем завершённые занятия и среднюю явку
  const stats = useMemo(() => {
    const monthAgo = new Date(`${today}T12:00:00`);
    monthAgo.setDate(monthAgo.getDate() - 30);
    const cutoff = monthAgo.toISOString().slice(0, 10);

    const finished = myTrainings.filter((t) => t.date < today);
    const finishedMonth = finished.filter((t) => t.date >= cutoff);

    const regsOf = (ids: Set<string>) =>
      registrations.filter((r) => r.status !== 'cancelled' && ids.has(r.trainingId));

    const monthIds = new Set(finishedMonth.map((t) => t.id));
    const monthRegs = regsOf(monthIds);
    const monthAttended = monthRegs.filter((r) => r.attended).length;
    const attendanceRate =
      monthRegs.length > 0 ? Math.round((monthAttended / monthRegs.length) * 100) : 0;

    return {
      finished: finished.length,
      finishedMonth: finishedMonth.length,
      monthAttended,
      monthRegs: monthRegs.length,
      attendanceRate,
    };
  }, [myTrainings, registrations, today]);

  // Новички: записались впервые за последние 30 дней
  const newcomers = useMemo(() => {
    const monthAgo = new Date(`${today}T12:00:00`);
    monthAgo.setDate(monthAgo.getDate() - 30);
    const cutoff = monthAgo.toISOString().slice(0, 10);
    const firstSeen = new Map<string, string>();

    for (const reg of myRegs) {
      const prev = firstSeen.get(reg.userId);
      if (!prev || reg.registeredAt < prev) firstSeen.set(reg.userId, reg.registeredAt);
    }

    return [...firstSeen.entries()].filter(([, date]) => date >= cutoff).length;
  }, [myRegs, today]);

  return (
    <div>
      <PageHeader
        eyebrow="Кабинет тренера"
        title={`Здравствуйте, ${currentUser?.name ?? ''}`}
        subtitle="Ваши тренировки, спортсмены и отметки посещаемости."
        actions={
          <ActionButton to="/cabinet/schedule" variant="outline">
            Всё расписание
          </ActionButton>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Calendar}
          label="Предстоящих"
          value={upcoming.length}
          hint="тренировок"
          to="/cabinet/schedule"
        />
        <StatCard
          icon={Users}
          label="Спортсменов"
          value={students}
          hint="за весь сезон"
          to="/cabinet/students"
        />
        <StatCard
          icon={ClipboardList}
          label="Посещений"
          value={attended}
          hint="отмечено вами"
          to="/cabinet/attendance"
        />
        <StatCard
          icon={TrendingUp}
          label="Явка за месяц"
          value={`${stats.attendanceRate}%`}
          hint={`${stats.monthAttended} из ${stats.monthRegs} записей`}
          to="/cabinet/attendance"
        />
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-paper px-4 py-3.5">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
            За месяц
          </p>
          <p className="mt-1 display text-xl text-ink">
            {stats.finishedMonth}{' '}
            <span className="text-sm font-normal text-graphite">
              {countNoun(stats.finishedMonth, 'тренировка', 'тренировки', 'тренировок')}
            </span>
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-paper px-4 py-3.5">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
            Всего проведено
          </p>
          <p className="mt-1 display text-xl text-ink">
            {stats.finished}{' '}
            <span className="text-sm font-normal text-graphite">
              {countNoun(stats.finished, 'занятие', 'занятия', 'занятий')}
            </span>
          </p>
        </div>
        <div className="rounded-2xl border border-navy/20 bg-navy/5 px-4 py-3.5">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-navy">
            Новые спортсмены
          </p>
          <p className="mt-1 display text-xl text-navy">
            {newcomers}{' '}
            <span className="text-sm font-normal text-navy/70">за 30 дней</span>
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Panel>
          <div className="mb-4 flex items-center justify-between gap-3">
            <PanelTitle hint="Пять ближайших тренировок — откройте участников, чтобы отметить посещение.">
              Мои тренировки
            </PanelTitle>
            <ActionButton to="/cabinet/attendance" variant="outline">
              Посещаемость
            </ActionButton>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState
              title="Предстоящих тренировок нет"
              text="Если это ошибка — напишите администратору школы: расписание ведёт он."
            />
          ) : (
            <ul className="space-y-2.5">
              {upcoming.slice(0, 5).map((t) => {
                const regCount = registrations.filter(
                  (r) => r.trainingId === t.id && r.status !== 'cancelled'
                ).length;
                return (
                  <li
                    key={t.id}
                    className="flex flex-col gap-3 rounded-xl border border-line bg-mist/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink">{t.name}</p>
                      <p className="mt-1 text-xs text-graphite">
                        {formatDate(t.date)} · {t.time} · {t.location}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-full bg-navy/10 px-2.5 py-1 text-[0.68rem] font-bold text-navy">
                        {regCount} чел.
                      </span>
                      <ActionButton to="/cabinet/attendance" variant="outline">
                        Участники
                      </ActionButton>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <div className="space-y-5">
          <Panel>
            <PanelTitle hint="Спортсмены, записанные на ваши занятия.">Мои спортсмены</PanelTitle>
            {students === 0 ? (
              <EmptyState title="Пока пусто" text="Список появится после первых записей." />
            ) : (
              <ul className="space-y-2">
                {[...new Set(myRegs.map((r) => r.userId))]
                  .slice(0, 5)
                  .map((userId) => {
                    const athlete = profiles.find((p) => p.id === userId);
                    const count = myRegs.filter((r) => r.userId === userId).length;
                    if (!athlete) return null;
                    return (
                      <li key={userId}>
                        <ActionButton
                          to={`/cabinet/students/${userId}`}
                          variant="ghost"
                          className="w-full justify-between"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                              {athlete.name.charAt(0)}
                            </span>
                            <span className="truncate">{athlete.name}</span>
                          </span>
                          <span className="shrink-0 text-[0.62rem] font-normal text-graphite">
                            {count} {countNoun(count, 'запись', 'записи', 'записей')}
                          </span>
                        </ActionButton>
                      </li>
                    );
                  })}
              </ul>
            )}
            <ActionButton to="/cabinet/students" variant="outline" className="mt-3 w-full">
              Все спортсмены
            </ActionButton>
          </Panel>

          <Panel>
            <PanelTitle hint="Быстрый переход к частым действиям.">Быстрые действия</PanelTitle>
            <div className="space-y-2">
              <ActionButton to="/cabinet/attendance" variant="ghost" className="w-full justify-start">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Отметить посещение
              </ActionButton>
              <ActionButton to="/cabinet/photos" variant="ghost" className="w-full justify-start">
                <Camera className="h-4 w-4 text-navy" />
                Загрузить фото
              </ActionButton>
              <ActionButton to="/cabinet/admin/news" variant="ghost" className="w-full justify-start">
                <Newspaper className="h-4 w-4 text-brand" />
                Написать новость
              </ActionButton>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
