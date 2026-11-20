import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, MapPin, Wallet } from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { usePublishedCamps } from '../store/campsStore';
import { formatDate, isPastDate } from '../lib/date';
import { countNoun } from '../lib/plural';

/** «12–19 июня» или «12 июня», если сбор однодневный */
function dateRange(start: string, end?: string) {
  if (!end || end === start) return formatDate(start, false);
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${end}T12:00:00`);
  const sameMonth = a.getMonth() === b.getMonth();
  const left = a.toLocaleDateString('ru-RU', {
    day: 'numeric',
    ...(sameMonth ? {} : { month: 'long' }),
  });
  const right = b.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  return `${left} — ${right}`;
}

export default function CampsPage() {
  const camps = usePublishedCamps();
  const upcoming = camps
    .filter((c) => !isPastDate(c.endDate || c.startDate))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const past = camps
    .filter((c) => isPastDate(c.endDate || c.startDate))
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  const groups = [
    { label: 'Ближайшие', items: upcoming },
    { label: 'Прошедшие', items: past },
  ].filter((group) => group.items.length > 0);

  return (
    <>
      <Breadcrumbs items={[{ label: 'Кэмпы' }]} />

      <section className="bg-ink pb-14 pt-8 text-paper lg:pb-16">
        <div className="container-x">
          <span className="eyebrow mb-4 text-brand">
            <span className="h-[2px] w-8 bg-brand" />
            {upcoming.length > 0
              ? countNoun(upcoming.length, 'выезд', 'выезда', 'выездов') + ' в наборе'
              : 'Выезды школы'}
          </span>
          <h1 className="display max-w-3xl text-[2.5rem] sm:text-6xl lg:text-7xl">
            Тренировочные кэмпы
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Несколько дней плотной работы вдали от города: бег, трейл и ОФП
            с тренерами школы, восстановление и разбор техники.
          </p>
        </div>
      </section>

      <section className="bg-paper py-14 lg:py-20">
        <div className="container-x">
          {camps.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-mist px-6 py-16 text-center">
              <p className="mx-auto max-w-lg text-sm leading-relaxed text-graphite">
                Ближайшие сборы ещё не анонсированы. Как только даты и место
                определятся, кэмп появится в этом разделе — анонс также выходит
                в Telegram-канале школы.
              </p>
            </div>
          ) : (
            <div className="space-y-14">
              {groups.map((group) => (
                <div key={group.label}>
                  <h2 className="eyebrow mb-6">
                    <span className="h-[2px] w-6 bg-brand" />
                    {group.label}
                  </h2>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {group.items.map((camp) => (
                      <Link
                        key={camp.id}
                        to={`/camps/${camp.id}`}
                        className="card-lift card-lift-hover group flex flex-col overflow-hidden"
                      >
                        <div className="relative aspect-[16/9] overflow-hidden bg-mist">
                          {camp.image ? (
                            <img
                              src={camp.image}
                              alt={camp.name}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-navy text-4xl font-bold text-white">
                              {camp.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="absolute left-4 top-4 rounded-full bg-paper/95 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink backdrop-blur">
                            {dateRange(camp.startDate, camp.endDate)}
                          </span>
                        </div>

                        <div className="flex flex-1 flex-col p-5">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.1em] ${
                                camp.registrationOpen
                                  ? 'bg-emerald-500/10 text-emerald-700'
                                  : 'bg-mist text-graphite'
                              }`}
                            >
                              {camp.registrationOpen ? 'Набор открыт' : 'Набор закрыт'}
                            </span>
                          </div>

                          <h3 className="display text-xl leading-tight text-ink transition-colors group-hover:text-brand">
                            {camp.name}
                          </h3>
                          <p className="mt-2.5 line-clamp-2 flex-1 text-sm leading-relaxed text-graphite">
                            {camp.description}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-line pt-4 text-[0.75rem] text-graphite">
                            {camp.location && (
                              <span className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" />
                                {camp.location}
                              </span>
                            )}
                            {camp.price && (
                              <span className="flex items-center gap-1.5 font-semibold text-ink">
                                <Wallet className="h-3.5 w-3.5 shrink-0 text-brand" />
                                {camp.price}
                              </span>
                            )}
                            <span className="ml-auto flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-ink">
                              Подробнее
                              <ArrowRight className="h-3.5 w-3.5 text-brand transition-transform group-hover:translate-x-1" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="mt-10 flex items-center justify-center gap-2 text-center text-xs text-graphite">
            <CalendarDays className="h-3.5 w-3.5 text-brand" />
            Даты и стоимость сборов обновляет администратор школы в личном кабинете
          </p>
        </div>
      </section>
    </>
  );
}