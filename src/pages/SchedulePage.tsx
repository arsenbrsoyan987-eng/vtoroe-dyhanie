import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionTitle from '../components/ui/SectionTitle';
import Button from '../components/ui/Button';
import { useTrainings } from '../store/trainingsStore';
import { useAuth } from '../context/AuthContext';
import { directions } from '../data/directions';
import { formatDate, isPastDate, todayISO } from '../lib/date';
import { displayValue, realValue } from '../lib/placeholder';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

export default function SchedulePage() {
  const trainings = useTrainings();
  const { registrations } = useAuth();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filterDir, setFilterDir] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
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
          return true;
        })
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [trainings, filterDir, filterLevel]
  );

  const upcoming = filtered.filter((t) => !isPastDate(t.date));
  const past = filtered.filter((t) => isPastDate(t.date)).reverse();
  const list = tab === 'upcoming' ? upcoming : past;

  const levels = [...new Set(trainings.map((t) => t.level))];

  const bookedCount = (trainingId: string) =>
    registrations.filter((r) => r.trainingId === trainingId && r.status === 'confirmed').length;

  const leftSpots = (t: (typeof trainings)[number]) =>
    Math.max(0, t.spotsAvailable - bookedCount(t.id));

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
    'rounded-sm border border-white/10 bg-surface px-4 py-2 text-sm text-white focus:border-accent-red focus:outline-none';

  return (
    <div className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle subtitle="Тренировки" title="Расписание" as="h1" />

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
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

          <div className="flex gap-1 sm:ml-auto">
            <button
              onClick={() => setView('list')}
              className={`rounded-sm px-3 py-2 text-xs font-medium transition-colors ${
                view === 'list' ? 'bg-accent-red text-white' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Список
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`rounded-sm px-3 py-2 text-xs font-medium transition-colors ${
                view === 'calendar' ? 'bg-accent-red text-white' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Календарь
            </button>
          </div>
        </div>

        {view === 'list' && (
          <>
            <div className="mb-6 inline-flex rounded-sm border border-white/10 bg-surface p-1">
              {(
                [
                  ['upcoming', `Предстоящие (${upcoming.length})`],
                  ['past', `Прошедшие (${past.length})`],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`rounded-sm px-4 py-2 text-xs font-medium transition-colors ${
                    tab === key ? 'bg-accent-red text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {list.length === 0 ? (
                <div className="rounded-sm border border-white/10 bg-surface py-12 text-center text-sm text-gray-400">
                  {tab === 'upcoming'
                    ? 'Пока нет запланированных тренировок — загляните позже'
                    : 'Прошедших тренировок нет'}
                </div>
              ) : (
                list.map((t) => {
                  const left = leftSpots(t);
                  const done = isPastDate(t.date);
                  return (
                    <div
                      key={t.id}
                      className={`rounded-sm border border-white/10 bg-surface p-6 transition-colors hover:border-accent-red/30 ${
                        done ? 'opacity-70' : ''
                      }`}
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold uppercase text-accent-blue">
                              {t.directionName}
                            </span>
                            <span className="text-gray-600">·</span>
                            <span className="text-xs text-gray-400">{t.level}</span>
                            <span className="text-gray-600">·</span>
                            <span
                              className={`text-xs font-semibold ${
                                done ? 'text-gray-500' : left > 0 ? 'text-green-400' : 'text-red-400'
                              }`}
                            >
                              {done ? 'Завершена' : left > 0 ? `${left} мест` : 'Мест нет'}
                            </span>
                          </div>
                          <h3 className="mb-1 text-lg font-bold text-white">
                            <Link to={`/schedule/${t.id}`} className="transition-colors hover:text-accent-red">
                              {t.name}
                            </Link>
                          </h3>
                          <p className="mb-3 text-sm text-gray-400">{t.description}</p>
                          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-400">
                            <span>📅 {formatDate(t.date)}</span>
                            <span>🕐 {t.time} · {t.duration}</span>
                            <span>📍 {displayValue(t.location, 'точка сбора в анонсе')}</span>
                            {realValue(t.trainer) && <span>👤 {t.trainer}</span>}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button to={`/schedule/${t.id}`} variant={done ? 'outline' : 'primary'} size="sm">
                            {done ? 'Подробнее' : 'Записаться'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {view === 'calendar' && (
          <div className="rounded-sm border border-white/10 bg-surface p-4 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => shiftMonth(-1)}
                className="rounded-sm p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Предыдущий месяц"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2 className="text-sm font-bold text-white sm:text-base">
                {MONTHS[month.month]} {month.year}
              </h2>
              <button
                onClick={() => shiftMonth(1)}
                className="rounded-sm p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Следующий месяц"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1 sm:gap-2">
              {WEEK_DAYS.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-semibold uppercase text-gray-400">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {cells.map((cell, i) => {
                if (!cell) {
                  return <div key={`empty-${i}`} className="min-h-[64px] rounded-sm sm:min-h-[80px]" />;
                }
                const dayTrainings = filtered.filter((t) => t.date === cell.iso);
                const isToday = cell.iso === today;
                return (
                  <div
                    key={cell.iso}
                    className={`min-h-[64px] rounded-sm border p-1 sm:min-h-[80px] ${
                      isToday ? 'border-accent-red bg-accent-red/5' : 'border-white/5'
                    }`}
                  >
                    <span className={`text-xs ${isToday ? 'font-bold text-accent-red' : 'text-gray-500'}`}>
                      {cell.day}
                    </span>
                    {dayTrainings.map((t) => (
                      <Link
                        key={t.id}
                        to={`/schedule/${t.id}`}
                        className="mt-1 block truncate rounded-sm bg-accent-red/20 px-1 py-0.5 text-[10px] text-accent-red hover:bg-accent-red/30"
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
    </div>
  );
}
