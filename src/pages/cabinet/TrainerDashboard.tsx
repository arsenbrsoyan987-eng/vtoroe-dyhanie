import { useAuth } from '../../context/AuthContext';
import { useTrainings } from '../../store/trainingsStore';
import { visibleTrainings } from '../../lib/access';
import { formatDate, isPastDate } from '../../lib/date';
import Button from '../../components/ui/Button';
import { Calendar, Users, ClipboardList } from 'lucide-react';

export default function TrainerDashboard() {
  const trainings = useTrainings();
  const { currentUser, registrations } = useAuth();

  const myTrainings = visibleTrainings(trainings, currentUser).sort((a, b) =>
    (a.date + a.time).localeCompare(b.date + b.time)
  );
  const upcoming = myTrainings.filter((t) => !isPastDate(t.date));
  const myIds = new Set(myTrainings.map((t) => t.id));
  const myRegs = registrations.filter((r) => r.status !== 'cancelled' && myIds.has(r.trainingId));
  const students = new Set(myRegs.map((r) => r.userId)).size;
  const attended = myRegs.filter((r) => r.attended).length;

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-white">Кабинет тренера</h1>
      <p className="mb-8 text-sm text-gray-400">Добро пожаловать, {currentUser?.name}!</p>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <div className="rounded-sm border border-white/10 bg-surface p-5">
          <div className="mb-3 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-2xl font-bold text-white">{upcoming.length}</span>
          </div>
          <div className="text-sm text-gray-400">Предстоящих</div>
        </div>
        <div className="rounded-sm border border-white/10 bg-surface p-5">
          <div className="mb-3 flex items-center gap-3">
            <Users className="h-5 w-5 text-gray-400" />
            <span className="text-2xl font-bold text-white">{students}</span>
          </div>
          <div className="text-sm text-gray-400">Спортсменов</div>
        </div>
        <div className="rounded-sm border border-white/10 bg-surface p-5">
          <div className="mb-3 flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-gray-400" />
            <span className="text-2xl font-bold text-white">{attended}</span>
          </div>
          <div className="text-sm text-gray-400">Посещений</div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Мои тренировки</h2>
        <Button to="/cabinet/schedule" variant="outline" size="sm">
          Всё расписание
        </Button>
      </div>

      {upcoming.length === 0 ? (
        <div className="rounded-sm border border-white/10 bg-surface p-8 text-center">
          <p className="text-sm text-gray-400">
            Предстоящих тренировок нет. Если это ошибка — напишите администратору клуба.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcoming.slice(0, 5).map((t) => {
            const regCount = registrations.filter(
              (r) => r.trainingId === t.id && r.status !== 'cancelled'
            ).length;
            return (
              <div
                key={t.id}
                className="flex flex-col justify-between gap-4 rounded-sm border border-white/10 bg-surface p-5 sm:flex-row sm:items-center"
              >
                <div>
                  <h3 className="text-sm font-semibold text-white">{t.name}</h3>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDate(t.date)} · {t.time} · {t.location}
                  </p>
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
      )}
    </div>
  );
}
