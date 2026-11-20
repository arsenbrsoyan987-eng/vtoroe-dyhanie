import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Clock, MapPin, Users } from 'lucide-react';
import { useTrainings } from '../../store/trainingsStore';
import { useTrainers } from '../../store/trainersStore';
import { useAuth } from '../../context/AuthContext';
import { freeSpots } from '../../lib/access';
import { isPastDate } from '../../lib/date';
import { displayValue } from '../../lib/placeholder';
import Button from '../ui/Button';

/**
 * «Подобрали для вас» — ближайшие занятия из реального расписания.
 *
 * Карточка строится вокруг даты: день и месяц крупно, остальное списком.
 * Так блок читается как афиша, а не как таблица расписания.
 */
export default function UpcomingTrainings() {
  const trainings = useTrainings();
  const trainers = useTrainers();
  const { registrations } = useAuth();

  const upcoming = [...trainings]
    .filter((t) => !isPastDate(t.date))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 4);

  return (
    <section className="bg-mist py-20 lg:py-28">
      <div className="container-x">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow mb-4">Расписание</span>
            <h2 className="display max-w-xl text-4xl text-ink sm:text-5xl">
              Подобрали для вас
            </h2>
          </div>
          <Button
            to="/schedule"
            variant="outline"
            size="sm"
            className="shrink-0 rounded-full border-ink text-ink hover:bg-ink hover:text-white"
          >
            Все тренировки
          </Button>
        </div>

        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-paper p-10 text-center">
            <p className="text-sm text-graphite">
              Новое расписание появится совсем скоро — следите за обновлениями
              или напишите нам в Telegram.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {upcoming.map((t) => {
              const left = freeSpots(t, registrations, trainers);
              const individual = t.format === 'individual';
              const price = individual ? t.priceIndividual : t.priceGroup;
              const [year, , day] = t.date.split('-');
              const monthShort = new Date(`${t.date}T12:00:00`).toLocaleDateString('ru-RU', {
                month: 'short',
              });

              return (
                <li
                  key={t.id}
                  className="card-lift card-lift-hover flex gap-5 p-5 sm:p-6"
                >
                  {/* Кубик даты */}
                  <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-navy py-3 text-paper">
                    <span className="display text-2xl leading-none">{day}</span>
                    <span className="mt-1 text-[0.62rem] uppercase tracking-[0.14em] text-white/60">
                      {monthShort}
                    </span>
                    <span className="text-[0.62rem] text-white/40">{year.slice(2)}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-brand">
                        {t.directionName}
                      </span>
                      <span className="text-line">·</span>
                      <span className="text-[0.7rem] text-graphite">{t.level}</span>
                      <span className="rounded-full bg-mist px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide text-graphite">
                        {individual ? 'Персональная' : 'Групповая'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold leading-snug text-ink">
                      <Link to={`/schedule/${t.id}`} className="hover:text-brand">
                        {t.name}
                      </Link>
                    </h3>

                    <div className="mt-3 space-y-1.5 text-[0.8rem] text-graphite">
                      <p className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-brand" />
                        {t.time} · {t.duration}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" />
                        {displayValue(t.location, 'Точка сбора — в расписании')}
                      </p>
                      <p className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 shrink-0 text-brand" />
                        {left > 0
                          ? individual
                            ? 'Есть свободные тренеры'
                            : `${left} свобод. мест`
                          : 'Мест нет — лист ожидания'}
                        {price && <span className="ml-auto font-bold text-ink">{price} ₽</span>}
                      </p>
                    </div>

                    <Link
                      to={`/schedule/${t.id}`}
                      className="group mt-4 inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-ink hover:text-brand"
                    >
                      <CalendarDays className="h-3.5 w-3.5 text-brand" />
                      {individual ? 'Выбрать тренера' : left > 0 ? 'Записаться' : 'В лист ожидания'}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
