import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, MapPin, Search } from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { useEvents } from '../store/eventsStore';
import { isFilled, realValue } from '../lib/placeholder';
import { countNoun } from '../lib/plural';

const CATEGORIES = [
  { id: 'all', label: 'Все' },
  { id: 'competition', label: 'Соревнования' },
  { id: 'training', label: 'Тренировки' },
  { id: 'hike', label: 'Походы' },
  { id: 'camp', label: 'Сборы' },
  { id: 'public', label: 'Встречи' },
];

const CATEGORY_LABEL: Record<string, string> = {
  training: 'Тренировка',
  competition: 'Соревнование',
  hike: 'Поход',
  camp: 'Сборы',
  public: 'Встреча',
};

/** Сколько недель осталось до старта — так афиша показывает срочность */
function weeksUntil(iso: string): number {
  const diff = new Date(`${iso}T12:00:00`).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000)));
}

export default function EventsPage() {
  const events = useEvents();
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  const published = useMemo(
    () =>
      events
        .filter((e) => isFilled(e, ['name', 'location', 'description']))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [events],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return published.filter((e) => {
      if (category !== 'all' && e.category !== category) return false;
      if (!q) return true;
      return `${e.name} ${e.location} ${e.description}`.toLowerCase().includes(q);
    });
  }, [published, category, query]);

  const nearest = published[0];

  return (
    <>
      <Breadcrumbs items={[{ label: 'Мероприятия' }]} />

      <section className="bg-ink pb-14 pt-8 text-paper lg:pb-20">
        <div className="container-x">
          <span className="eyebrow mb-4 text-brand">
            <span className="h-[2px] w-8 bg-brand" />
            Афиша сезона
          </span>
          <h1 className="display max-w-3xl text-[2.5rem] sm:text-6xl lg:text-7xl">
            Мероприятия и старты
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Гонки, походы, клубные встречи и выездные сборы. К каждому старту
            привязана программа подготовки — посмотрите, сколько недель осталось.
          </p>

          {nearest && (
            <div className="mt-8 inline-flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl bg-white/5 px-5 py-4 ring-1 ring-white/10">
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-brand">
                Ближайшее
              </span>
              <span className="text-sm font-semibold text-white">{nearest.name}</span>
              <span className="text-sm text-white/55">
                {new Date(`${nearest.date}T12:00:00`).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                })}
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="bg-paper py-12 lg:py-16">
        <div className="container-x">
          {published.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-mist px-6 py-16 text-center">
              <p className="mx-auto max-w-lg text-sm leading-relaxed text-graphite">
                Календарь на сезон ещё формируется. Анонсы стартов, походов и
                сборов публикуем в Telegram-канале школы — там же сбор заявок.
              </p>
            </div>
          ) : (
            <>
              {/* Фильтры + поиск */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const count =
                      cat.id === 'all'
                        ? published.length
                        : published.filter((e) => e.category === cat.id).length;
                    if (count === 0 && cat.id !== 'all') return null;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        aria-pressed={category === cat.id}
                        className={`rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${
                          category === cat.id
                            ? 'bg-brand text-white'
                            : 'border border-line bg-paper text-graphite hover:border-ink hover:text-ink'
                        }`}
                      >
                        {cat.label} <span className="opacity-50">{count}</span>
                      </button>
                    );
                  })}
                </div>

                <label className="relative block lg:w-72">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Найти событие"
                    aria-label="Поиск по мероприятиям"
                    className="w-full rounded-full border border-line bg-paper py-2.5 pl-11 pr-4 text-sm text-ink placeholder-graphite/60 focus:border-brand focus:outline-none"
                  />
                </label>
              </div>

              <p className="mt-6 text-xs uppercase tracking-[0.12em] text-graphite">
                {countNoun(filtered.length, 'событие', 'события', 'событий')}
              </p>

              {filtered.length === 0 ? (
                <p className="py-16 text-center text-sm text-graphite">
                  По этому запросу ничего не нашлось. Попробуйте другую категорию.
                </p>
              ) : (
                <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((event) => {
                const date = new Date(`${event.date}T12:00:00`);
                const day = String(date.getDate()).padStart(2, '0');
                const month = date.toLocaleDateString('ru-RU', { month: 'short' });
                const weeks = weeksUntil(event.date);

                return (
                  <li key={event.id}>
                    <Link
                      to={`/events/${event.id}`}
                      className="card-lift card-lift-hover group flex h-full flex-col overflow-hidden"
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
                            {CATEGORY_LABEL[event.category]}
                          </span>
                          {event.registrationOpen ? (
                            <span className="rounded-full bg-navy px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-white">
                              Запись открыта
                            </span>
                          ) : (
                            <span className="rounded-full bg-mist px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
                              Запись закрыта
                            </span>
                          )}
                        </div>

                        <h2 className="text-base font-bold leading-snug text-ink group-hover:text-brand">
                          {event.name}
                        </h2>
                        <p className="mt-2 line-clamp-2 flex-1 text-[0.82rem] leading-relaxed text-graphite">
                          {event.description}
                        </p>

                        <div className="mt-4 space-y-1.5 border-t border-line pt-4 text-[0.75rem] text-graphite">
                          {realValue(event.location) && (
                            <p className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" />
                              {event.location}
                            </p>
                          )}
                          <p className="flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-brand" />
                            {weeks > 0
                              ? `через ${countNoun(weeks, 'неделю', 'недели', 'недель')}`
                              : 'на этой неделе'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
                </ul>
              )}
            </>
          )}

          <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl bg-mist p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="display text-xl text-ink">Хотите свой старт в афише?</h2>
              <p className="mt-1.5 text-sm text-graphite">
                Клубные выезды и сборы собираем вместе — расскажите, куда хотите.
              </p>
            </div>
            <Link
              to="/camps"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-navy px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-navy-soft"
            >
              Кемпы и сборы
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
