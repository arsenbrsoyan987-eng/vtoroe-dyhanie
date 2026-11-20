import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useEvents } from '../../store/eventsStore';
import { isFilled, realValue } from '../../lib/placeholder';

const categoryLabels: Record<string, string> = {
  training: 'Тренировка',
  competition: 'Соревнование',
  hike: 'Поход',
  camp: 'Сборы',
  public: 'Общественное',
};

/**
 * Мероприятия школы — афиша с кубиками дат.
 *
 * Карточки с «[Название соревнования]» на главной — прямой сигнал, что
 * сайт не заполнен, поэтому показываем только реальные события.
 */
export default function Events() {
  const events = useEvents();
  const upcoming = events
    .filter((e) => isFilled(e, ['name', 'location', 'description']))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  if (upcoming.length === 0) return null;

  return (
    <section className="bg-paper py-20 lg:py-28">
      <div className="container-x">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow mb-4">Календарь</span>
            <h2 className="display max-w-xl text-4xl text-ink sm:text-5xl">
              Ближайшие старты и выезды
            </h2>
          </div>
          <Link
            to="/events"
            className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink"
          >
            Афиша целиком
            <ArrowRight className="h-4 w-4 text-brand transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {upcoming.map((event) => {
            const date = new Date(`${event.date}T12:00:00`);
            const day = String(date.getDate()).padStart(2, '0');
            const month = date.toLocaleDateString('ru-RU', { month: 'long' });

            return (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="card-lift card-lift-hover group flex flex-col overflow-hidden"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-mist">
                  {event.images[0] ? (
                    <img
                      src={event.images[0]}
                      alt={event.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-navy/5 text-5xl font-bold text-brand/60">
                      {event.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute left-4 top-4 flex w-16 flex-col items-center rounded-xl bg-paper py-2 shadow-card">
                    <span className="display text-2xl leading-none text-ink">{day}</span>
                    <span className="mt-0.5 text-[0.6rem] uppercase tracking-[0.12em] text-graphite">
                      {month}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand/10 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-brand">
                      {categoryLabels[event.category]}
                    </span>
                    {event.registrationOpen && (
                      <span className="rounded-full bg-navy/8 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-navy">
                        Идёт запись
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold leading-snug text-ink group-hover:text-brand">
                    {event.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-[0.82rem] leading-relaxed text-graphite">
                    {event.description}
                  </p>
                  {realValue(event.location) && (
                    <p className="mt-3 text-[0.7rem] uppercase tracking-[0.12em] text-graphite">
                      {event.location}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
