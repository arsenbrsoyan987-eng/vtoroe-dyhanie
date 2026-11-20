import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTrainings } from '../store/trainingsStore';
import { useDirections } from '../store/directionsStore';
import { useTrainers } from '../store/trainersStore';
import { freeSpots } from '../lib/access';
import { MONTHS, WEEK_DAYS, formatDate, isPastDate, todayISO } from '../lib/date';
import { displayValue, realValue } from '../lib/placeholder';
import { countNoun } from '../lib/plural';
import Button from '../components/ui/Button';
import Breadcrumbs from '../components/ui/Breadcrumbs';

/** Кубик даты: день крупно, месяц и год под ним — как в афише */
function DateCube({ iso }: { iso: string }) {
  const [, , day] = iso.split('-');
  const month = new Date(`${iso}T12:00:00`).toLocaleDateString('ru-RU', { month: 'short' });
  return (
    <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-navy py-3 text-paper">
      <span className="display text-2xl leading-none">{day}</span>
      <span className="mt-1 text-[0.62rem] uppercase tracking-[0.14em] text-white/60">
        {month}
      </span>
    </div>
  );
}

export default function SchedulePage() {
  const trainings = useTrainings();
  const directions = useDirections();
  const trainers = useTrainers();
  const { registrations } = useAuth();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filterDir, setFilterDir] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterFormat, setFilterFormat] = useState('all');
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const today = todayISO();
  const now = new Date();
  const [month, setMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const filtered = useMemo(
    () =>
      trainings
        .filter((t) => {
          if (filterDir !== 'all' && t.directionId !== filterDir) return false;
          if (filterLevel !== 'all' && t.level !== filterLevel) return false;
          if (filterFormat !== 'all' && t.format !== filterFormat) return false;
          return true;
        })
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [trainings, filterDir, filterLevel, filterFormat]
  );

  const upcoming = filtered.filter((t) => !isPastDate(t.date));
  const past = filtered.filter((t) => isPastDate(t.date)).reverse();
  const list = tab === 'upcoming' ? upcoming : past;

  const levels = [...new Set(trainings.map((t) => t.level))];

  /** Свободные места: для групповой — по ёмкости, для индивидуальной — по свободным тренерам */
  const leftSpots = (t: (typeof trainings)[number]) =>
    freeSpots(t, registrations, trainers);

  // Календарь: сетка 6 недель с понедельника
  const firstDay = new Date(month.year, month.month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(month.year, month.month + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - startOffset + 1;
    if (day < 1 || day > daysInMonth) return null;
    const iso = `${month.year}-${String(month.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { day, iso };
  });

  const shiftMonth = (delta: number) => {
    setMonth(({ year, month: m }) => {
      const next = new Date(year, m + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  const selectClass =
    'rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink transition-colors focus:border-brand focus:outline-none';

  return (
    <>
      <Breadcrumbs items={[{ label: 'Расписание' }]} />

      <section className="bg-ink pb-14 pt-8 text-paper lg:pb-16">
        <div className="container-x">
          <span className="eyebrow mb-4 text-brand">
            <span className="h-[2px] w-8 bg-brand" />
            {upcoming.length > 0
              ? `${countNoun(upcoming.length, 'тренировка', 'тренировки', 'тренировок')} впереди`
              : 'Расписание сезона'}
          </span>
          <h1 className="display max-w-3xl text-[2.5rem] sm:text-6xl lg:text-7xl">
            Расписание
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Групповые и персональные занятия школы. Первое занятие бесплатное —
            выберите удобную дату и площадку.
          </p>
        </div>
      </section>

      <section className="bg-paper py-12 lg:py-16">
        <div className="container-x">
          {/* Фильтры */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <select
              value={filterDir}
              onChange={(e) => setFilterDir(e.target.value)}
              className={selectClass}
              aria-label="Фильтр по направлению"
            >
              <option value="all">Все направления</option>
              {directions.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className={selectClass}
              aria-label="Фильтр по уровню"
            >
              <option value="all">Все уровни</option>
              {levels.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <select
              value={filterFormat}
              onChange={(e) => setFilterFormat(e.target.value)}
              className={selectClass}
              aria-label="Фильтр по формату"
            >
              <option value="all">Любой формат</option>
              <option value="group">Групповые</option>
              <option value="individual">Индивидуальные</option>
            </select>

            <div className="inline-flex rounded-full border border-line bg-mist p-1 sm:ml-auto">
              {(
                [
                  ['list', 'Список'],
                  ['calendar', 'Календарь'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    view === key ? 'bg-ink text-white' : 'text-graphite hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {view === 'list' && (
            <>
              <div className="mb-6 inline-flex rounded-full border border-line bg-mist p-1">
                {(
                  [
                    ['upcoming', `Предстоящие (${upcoming.length})`],
                    ['past', `Прошедшие (${past.length})`],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                      tab === key ? 'bg-ink text-white' : 'text-graphite hover:text-ink'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {list.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-line bg-mist p-12 text-center text-sm text-graphite">
                    {tab === 'upcoming'
                      ? 'Пока нет запланированных тренировок — загляните позже'
                      : 'Прошедших тренировок нет'}
                  </div>
                ) : (
                  list.map((t) => {
                    const left = leftSpots(t);
                    const done = isPastDate(t.date);
                    const individual = t.format === 'individual';
                    const price = individual ? t.priceIndividual : t.priceGroup;

                    return (
                      <article
                        key={t.id}
                        className={`card-lift flex flex-col gap-5 p-5 sm:flex-row sm:items-start ${
                          done ? 'opacity-70' : ''
                        }`}
                      >
                        <DateCube iso={t.date} />

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
                            <span
                              className={`text-[0.7rem] font-semibold ${
                                done ? 'text-graphite' : left > 0 ? 'text-emerald-600' : 'text-brand'
                              }`}
                            >
                              {done
                                ? 'Завершена'
                                : left > 0
                                  ? individual
                                    ? 'Есть свободные тренеры'
                                    : `${left} свобод. мест`
                                  : 'Мест нет'}
                            </span>
                          </div>

                          <h2 className="text-lg font-bold leading-snug text-ink">
                            <Link to={`/schedule/${t.id}`} className="transition-colors hover:text-brand">
                              {t.name}
                            </Link>
                          </h2>

                          {t.description && (
                            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-graphite">
                              {t.description}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.8rem] text-graphite">
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 shrink-0 text-brand" />
                              {formatDate(t.date)} · {t.time} · {t.duration}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" />
                              {displayValue(t.location, 'Точка сбора — в анонсе')}
                            </span>
                            {!individual && realValue(t.trainer) && (
                              <span className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 shrink-0 text-brand" />
                                {t.trainer}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                          {price && (
                            <span className="display text-xl text-ink">{price} ₽</span>
                          )}
                          <Button
                            to={`/schedule/${t.id}`}
                            variant={done ? 'outline' : 'primary'}
                            size="sm"
                          >
                            {done ? 'Подробнее' : individual ? 'Выбрать тренера' : 'Записаться'}
                          </Button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </>
          )}

          {view === 'calendar' && (
            <div className="rounded-2xl border border-line bg-paper p-4 shadow-card sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <button
                  onClick={() => shiftMonth(-1)}
                  className="rounded-full p-2 text-graphite transition-colors hover:bg-mist hover:text-ink"
                  aria-label="Предыдущий месяц"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h2 className="display text-base text-ink sm:text-lg">
                  {MONTHS[month.month]} {month.year}
                </h2>
                <button
                  onClick={() => shiftMonth(1)}
                  className="rounded-full p-2 text-graphite transition-colors hover:bg-mist hover:text-ink"
                  aria-label="Следующий месяц"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-2 grid grid-cols-7 gap-1 sm:gap-2">
                {WEEK_DAYS.map((d) => (
                  <div
                    key={d}
                    className="py-2 text-center text-[0.65rem] font-bold uppercase tracking-[0.12em] text-graphite"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {cells.map((cell, i) => {
                  if (!cell) {
                    return <div key={`empty-${i}`} className="min-h-[64px] rounded-lg sm:min-h-[80px]" />;
                  }
                  const dayTrainings = filtered.filter((t) => t.date === cell.iso);
                  const isToday = cell.iso === today;
                  return (
                    <div
                      key={cell.iso}
                      className={`min-h-[64px] rounded-lg border p-1 sm:min-h-[80px] ${
                        isToday ? 'border-brand bg-brand/5' : 'border-line bg-mist/40'
                      }`}
                    >
                      <span
                        className={`text-xs ${
                          isToday ? 'font-bold text-brand' : 'text-graphite'
                        }`}
                      >
                        {cell.day}
                      </span>
                      {dayTrainings.map((t) => (
                        <Link
                          key={t.id}
                          to={`/schedule/${t.id}`}
                          className="mt-1 block truncate rounded bg-brand/10 px-1 py-0.5 text-[10px] font-medium text-brand transition-colors hover:bg-brand/20"
                          title={`${t.time} · ${t.name}`}
                        >
                          {t.name}
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}