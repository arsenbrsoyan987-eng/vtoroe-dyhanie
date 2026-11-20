import { useAuth } from '../../context/AuthContext';
import { useTrainings } from '../../store/trainingsStore';
import { visibleTrainings } from '../../lib/access';
import { formatDate, isPastDate } from '../../lib/date';
import {
  ActionButton,
  EmptyState,
  PageHeader,
  Panel,
  StatusBadge,
} from '../../components/cabinet/ui';

export default function TrainerSchedulePage() {
  const trainings = useTrainings();
  const { currentUser, registrations } = useAuth();

  const mine = visibleTrainings(trainings, currentUser, registrations).sort((a, b) =>
    (a.date + a.time).localeCompare(b.date + b.time)
  );
  const upcoming = mine.filter((t) => !isPastDate(t.date));
  const past = mine.filter((t) => isPastDate(t.date)).reverse();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Работа"
        title="Моё расписание"
        subtitle={`${upcoming.length} предстоящих · ${past.length} прошедших`}
      />

      {mine.length === 0 ? (
        <EmptyState
          title="Тренировок пока нет"
          text="За вами не закреплено ни одной тренировки. Обратитесь к администратору школы — он ведёт расписание."
        />
      ) : (
        <div className="space-y-3">
          {[...upcoming, ...past].map((t) => {
            const regCount = registrations.filter(
              (r) => r.trainingId === t.id && r.status !== 'cancelled'
            ).length;
            const done = isPastDate(t.date);
            return (
              <Panel
                key={t.id}
                className={`flex flex-col justify-between gap-4 sm:flex-row sm:items-center ${
                  done ? 'opacity-70' : ''
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-navy">
                      {t.directionName}
                    </span>
                    <span className="text-xs text-graphite">{t.level}</span>
                    {done && <StatusBadge tone="gray">Завершена</StatusBadge>}
                  </div>
                  <h3 className="text-base font-bold text-ink">{t.name}</h3>
                  <p className="mt-1.5 text-xs text-graphite">
                    {formatDate(t.date)} · {t.time} · {t.duration} · {t.location}
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
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}