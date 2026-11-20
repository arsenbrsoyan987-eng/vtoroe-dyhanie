import { useAuth } from '../../context/AuthContext';
import { useTrainings } from '../../store/trainingsStore';
import { visibleTrainings } from '../../lib/access';
import { formatDate, isPastDate } from '../../lib/date';
import { ActionButton, EmptyState, PageHeader, Panel, PanelTitle, StatCard } from '../../components/cabinet/ui';
import { Calendar, Users, ClipboardList } from 'lucide-react';

export default function TrainerDashboard() {
  const trainings = useTrainings();
  const { currentUser, registrations } = useAuth();

  const myTrainings = visibleTrainings(trainings, currentUser, registrations).sort((a, b) =>
    (a.date + a.time).localeCompare(b.date + b.time)
  );
  const upcoming = myTrainings.filter((t) => !isPastDate(t.date));
  const myIds = new Set(myTrainings.map((t) => t.id));
  const myRegs = registrations.filter((r) => r.status !== 'cancelled' && myIds.has(r.trainingId));
  const students = new Set(myRegs.map((r) => r.userId)).size;
  const attended = myRegs.filter((r) => r.attended).length;

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

      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={Calendar} label="Предстоящих" value={upcoming.length} hint="тренировок" />
        <StatCard icon={Users} label="Спортсменов" value={students} hint="за весь сезон" />
        <StatCard icon={ClipboardList} label="Посещений" value={attended} hint="отмечено вами" />
      </div>

      <Panel>
        <PanelTitle hint="Пять ближайших тренировок — откройте участников, чтобы отметить посещение.">
          Мои тренировки
        </PanelTitle>
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
    </div>
  );
}