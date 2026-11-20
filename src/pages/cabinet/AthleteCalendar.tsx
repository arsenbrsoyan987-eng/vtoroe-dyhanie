import { useAuth } from '../../context/AuthContext';
import { useTrainings } from '../../store/trainingsStore';
import { toISODate } from '../../lib/date';
import { PageHeader, Panel } from '../../components/cabinet/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];
const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function AthleteCalendarPage() {
  const trainings = useTrainings();
  const { currentUser, registrations } = useAuth();
  // Только собственные записи пользователя
  const userRegs = registrations.filter(
    (r) => r.status !== 'cancelled' && r.userId === currentUser?.id
  );

  const now = new Date();
  const [cursor, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });
  const { year, month } = cursor;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // Monday start

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const getDayTrainings = (day: number) => {
    const dateStr = toISODate(new Date(year, month, day));
    return userRegs
      .map((r) => trainings.find((t) => t.id === r.trainingId && t.date === dateStr))
      .filter(Boolean);
  };

  const shiftMonth = (delta: number) =>
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const monthCount = days.reduce((sum, day) => sum + getDayTrainings(day).length, 0);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Мой сезон"
        title="Календарь"
        subtitle={`${monthCount} тренировок в ${MONTHS[month].toLowerCase()}е — только ваши записи.`}
      />

      <Panel>
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            onClick={() => shiftMonth(-1)}
            className="rounded-full border border-line p-2 text-graphite transition-colors hover:border-ink/25 hover:text-ink"
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="display text-lg text-ink">
            {MONTHS[month]} {year}
          </h2>
          <button
            onClick={() => shiftMonth(1)}
            className="rounded-full border border-line p-2 text-graphite transition-colors hover:border-ink/25 hover:text-ink"
            aria-label="Следующий месяц"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-1.5 grid grid-cols-7 gap-1">
          {WEEK_DAYS.map((d) => (
            <div
              key={d}
              className="py-1.5 text-center text-[0.62rem] font-bold uppercase tracking-[0.08em] text-graphite"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {blanks.map((b) => (
            <div key={`blank-${b}`} className="min-h-16 sm:min-h-20" />
          ))}
          {days.map((day) => {
            const dayTrainings = getDayTrainings(day);
            const isToday =
              day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
            return (
              <div
                key={day}
                className={`min-h-16 rounded-xl border p-1 transition-colors sm:min-h-20 ${
                  isToday ? 'border-brand bg-brand/5' : 'border-line bg-mist/40 hover:bg-mist'
                }`}
              >
                <span
                  className={`text-[0.68rem] font-semibold ${
                    isToday ? 'text-brand' : 'text-graphite'
                  }`}
                >
                  {day}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayTrainings.slice(0, 2).map((t, i) => (
                    <div
                      key={i}
                      className="truncate rounded-md bg-navy/10 px-1 py-0.5 text-[0.6rem] font-semibold text-navy"
                    >
                      {t?.name}
                    </div>
                  ))}
                  {dayTrainings.length > 2 && (
                    <div className="text-[0.6rem] text-graphite">+{dayTrainings.length - 2}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="mt-4 flex items-center gap-4 text-xs text-graphite">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md border border-brand bg-brand/10" />
          Сегодня
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md bg-navy/10" />
          Тренировка
        </span>
      </div>
    </div>
  );
}