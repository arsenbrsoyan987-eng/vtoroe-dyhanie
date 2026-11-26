import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTrainings } from '../../store/trainingsStore';
import { visibleTrainings } from '../../lib/access';
import { formatDate, isPastDate } from '../../lib/date';
import { countNoun } from '../../lib/plural';
import {
  ActionButton,
  EmptyState,
  PageHeader,
  Panel,
  StatusBadge,
} from '../../components/cabinet/ui';
import { CalendarDays, Filter, Search } from 'lucide-react';

export default function TrainerSchedulePage() {
  const trainings = useTrainings();
  const { currentUser, registrations } = useAuth();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [direction, setDirection] = useState<string>('');
  const [search, setSearch] = useState('');

  const myTrainings = useMemo(
    () => visibleTrainings(trainings, currentUser, registrations).sort((a, b) =>
      (a.date + a.time).localeCompare(b.date + b.time)
    ),
    [trainings, currentUser, registrations]
  );

  const directions = useMemo(() => {
    const set = new Set(myTrainings.map((t) => t.directionName));
    return Array.from(set).sort();
  }, [myTrainings]);

  const listed = useMemo(() => {
    let result = myTrainings;
    if (filter === 'upcoming') result = result.filter((t) => !isPastDate(t.date));
    if (filter === 'past') {
      result = result.filter((t) => isPastDate(t.date)).slice().reverse();
    }
    if (filter === 'all') {
      // Сначала ближайшие, затем прошедшие от свежих к старым
      result = [
        ...result.filter((t) => !isPastDate(t.date)),
        ...result.filter((t) => isPastDate(t.date)).slice().reverse(),
      ];
    }
    if (direction) result = result.filter((t) => t.directionName === direction);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.directionName.toLowerCase().includes(q) ||
          t.level.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q)
      );
    }
    return result;
  }, [myTrainings, filter, direction, search]);

  const upcoming = myTrainings.filter((t) => !isPastDate(t.date));
  const past = myTrainings.filter((t) => isPastDate(t.date)).reverse();

  const clearFilters = () => {
    setFilter('all');
    setDirection('');
    setSearch('');
  };

  const hasFilters = filter !== 'all' || direction || search.trim();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Работа"
        title="Моё расписание"
        subtitle={`${upcoming.length} предстоящих · ${past.length} прошедших`}
      />

      {/* Фильтры */}
      <div className="mb-5 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-full border px-3.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] transition-colors ${
              filter === 'all'
                ? 'border-brand bg-brand text-white'
                : 'border-line bg-paper text-graphite hover:text-ink'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`rounded-full border px-3.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] transition-colors ${
              filter === 'upcoming'
                ? 'border-brand bg-brand text-white'
                : 'border-line bg-paper text-graphite hover:text-ink'
            }`}
          >
            Предстоящие
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`rounded-full border px-3.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] transition-colors ${
              filter === 'past'
                ? 'border-brand bg-brand text-white'
                : 'border-line bg-paper text-graphite hover:text-ink'
            }`}
          >
            Прошедшие
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-2 text-xs">
            <Search className="h-3.5 w-3.5 text-graphite/60" />
            <input
              type="text"
              placeholder="Поиск по названию, направлению, локации…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none"
            />
          </div>

          {directions.length > 1 && (
            <div className="relative">
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="appearance-none rounded-full border border-line bg-paper px-3.5 py-2 pr-7 text-xs font-semibold text-ink hover:border-ink/30"
              >
                <option value="">Все направления</option>
                {directions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-graphite/60 pointer-events-none" />
            </div>
          )}

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="rounded-full border border-line bg-mist px-3 py-1.5 text-[0.68rem] font-bold text-graphite hover:text-ink"
            >
              Сбросить
            </button>
          )}
        </div>
      </div>

      <p className="mb-4 text-xs text-graphite">
        Найдено {listed.length}{' '}
        {countNoun(listed.length, 'тренировка', 'тренировки', 'тренировок')}
        {hasFilters && ' с применёнными фильтрами'}
      </p>

      {listed.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'Ничего не найдено' : 'Тренировок пока нет'}
          text={
            hasFilters
              ? 'Попробуйте сбросить фильтры или выберите другую категорию.'
              : 'За вами не закреплено ни одной тренировки. Обратитесь к администратору школы — он ведёт расписание.'
          }
          action={hasFilters && (
            <ActionButton onClick={clearFilters} variant="outline">
              Сбросить фильтры
            </ActionButton>
          )}
        />
      ) : (
        <div className="space-y-3">
          {listed.map((t) => {
            const regCount = registrations.filter(
              (r) => r.trainingId === t.id && r.status !== 'cancelled'
            ).length;
            const attendedCount = registrations.filter(
              (r) => r.trainingId === t.id && r.attended && r.status !== 'cancelled'
            ).length;
            const done = isPastDate(t.date);
            const attendanceRate = regCount > 0 ? Math.round((attendedCount / regCount) * 100) : 0;

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
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-navy/10 px-2.5 py-1 text-[0.68rem] font-bold text-navy">
                      {regCount} {countNoun(regCount, 'человек', 'человека', 'человек')}
                    </span>
                    {regCount > 0 && (
                      <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold ${
                        attendanceRate >= 70
                          ? 'bg-emerald-500/10 text-emerald-700'
                          : attendanceRate >= 40
                            ? 'bg-amber-500/10 text-amber-700'
                            : 'bg-brand/10 text-brand'
                      }`}>
                        Явка {attendanceRate}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <ActionButton to={`/cabinet/attendance?t=${t.id}`} variant="outline">
                    <CalendarDays className="h-3.5 w-3.5" />
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