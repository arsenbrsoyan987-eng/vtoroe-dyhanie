import { Link } from 'react-router-dom';
import SectionTitle from '../ui/SectionTitle';
import Button from '../ui/Button';
import { useTrainings } from '../../store/trainingsStore';
import { useAuth } from '../../context/AuthContext';
import { formatDate, isPastDate } from '../../lib/date';
import { displayValue } from '../../lib/placeholder';

export default function UpcomingTrainings() {
  const trainings = useTrainings();
  const { registrations } = useAuth();

  const upcoming = [...trainings]
    .filter((t) => !isPastDate(t.date))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 4);

  const leftSpots = (id: string, capacity: number) =>
    Math.max(
      0,
      capacity -
        registrations.filter((r) => r.trainingId === id && r.status === 'confirmed').length
    );

  return (
    <section className="bg-primary py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between">
          <SectionTitle subtitle="Расписание" title="Ближайшие тренировки" />
          <Button to="/schedule" variant="outline" size="sm" className="mb-12 shrink-0 md:mb-12">
            Все тренировки
          </Button>
        </div>

        {upcoming.length === 0 ? (
          <div className="rounded-sm border border-white/10 bg-surface p-10 text-center">
            <p className="text-sm text-gray-400">
              Новое расписание появится совсем скоро — следите за обновлениями.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {upcoming.map((t) => {
              const left = leftSpots(t.id, t.spotsAvailable);
              return (
                <div
                  key={t.id}
                  className="group flex flex-col overflow-hidden rounded-sm border border-white/10 bg-surface transition-colors hover:border-accent-red/30 sm:flex-row"
                >
                  <div className="h-40 shrink-0 overflow-hidden sm:h-auto sm:w-40">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-accent-blue">
                          {t.directionName}
                        </span>
                        <span className="text-gray-600">·</span>
                        <span className="text-xs text-gray-400">{t.level}</span>
                      </div>
                      <h3 className="mb-2 text-lg font-bold text-white">
                        <Link to={`/schedule/${t.id}`} className="transition-colors hover:text-accent-red">
                          {t.name}
                        </Link>
                      </h3>
                      <div className="space-y-1 text-sm text-gray-400">
                        <p>
                          {formatDate(t.date, false)} · {t.time} · {t.duration}
                        </p>
                        <p>{displayValue(t.location, 'Точка сбора — в расписании')}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold ${
                          left > 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {left > 0 ? `${left} мест` : 'Мест нет'}
                      </span>
                      <Button to={`/schedule/${t.id}`} variant="blue" size="sm">
                        {left > 0 ? 'Записаться' : 'В лист ожидания'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}