import { useAuth } from '../../context/AuthContext';
import { useTrainings } from '../../store/trainingsStore';
import { visibleTrainings } from '../../lib/access';
import { formatDate, isPastDate } from '../../lib/date';
import Button from '../../components/ui/Button';

export default function TrainerSchedulePage() {
  const trainings = useTrainings();
  const { currentUser, registrations } = useAuth();

  const mine = visibleTrainings(trainings, currentUser).sort((a, b) =>
    (a.date + a.time).localeCompare(b.date + b.time)
  );
  const upcoming = mine.filter((t) => !isPastDate(t.date));
  const past = mine.filter((t) => isPastDate(t.date)).reverse();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-white">Моё расписание</h1>
      <p className="mb-8 text-sm text-gray-400">
        {upcoming.length} предстоящих тренировок · {past.length} прошедших
      </p>

      {mine.length === 0 && (
        <div className="rounded-sm border border-white/10 bg-surface p-8 text-center">
          <p className="text-sm text-gray-400">
            За вами пока не закреплено ни одной тренировки. Обратитесь к администратору клуба.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {[...upcoming, ...past].map((t) => {
          const regCount = registrations.filter(
            (r) => r.trainingId === t.id && r.status !== 'cancelled'
          ).length;
          const done = isPastDate(t.date);
          return (
            <div
              key={t.id}
              className={`flex flex-col justify-between gap-4 rounded-sm border border-white/10 bg-surface p-5 sm:flex-row sm:items-center ${
                done ? 'opacity-70' : ''
              }`}
            >
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase text-accent-blue">{t.directionName}</span>
                  <span className="text-gray-600">·</span>
                  <span className="text-xs text-gray-400">{t.level}</span>
                  {done && (
                    <span className="rounded-sm bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-400">
                      Завершена
                    </span>
                  )}
                </div>
                <h3 className="mb-1 text-lg font-bold text-white">{t.name}</h3>
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-400">
                  <span>📅 {formatDate(t.date)}</span>
                  <span>🕐 {t.time} · {t.duration}</span>
                  <span>📍 {t.location}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="rounded-sm bg-accent-blue/10 px-2 py-1 text-xs text-accent-blue">
                  {regCount} чел.
                </span>
                <Button to="/cabinet/attendance" variant="outline" size="sm">
                  Участники
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
