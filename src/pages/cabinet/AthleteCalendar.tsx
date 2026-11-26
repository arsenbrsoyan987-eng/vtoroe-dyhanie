import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTrainings } from '../../store/trainingsStore';
import { toISODate } from '../../lib/date';
import { countNoun } from '../../lib/plural';
import {
  ActionButton,
  PageHeader,
  Panel,
  PanelTitle,
  StatusBadge,
} from '../../components/cabinet/ui';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Download,
  UserRound,
} from 'lucide-react';

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];
const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/**
 * Календарь спортсмена: расписание тренировок с отметками посещений.
 *
 * Показывает только записи текущего пользователя (не отменённые).
 * День тренировки подсвечивается бейджем «Записан» / «Лист ожидания».
 *
 * Экспорт: генерирует .ics-файл со всеми предстоящими тренировками
 * — открывается в Google Calendar, Apple Calendar, Outlook.
 */
export default function AthleteCalendarPage() {
  const trainings = useTrainings();
  const { currentUser, registrations } = useAuth();

  // Только собственные активные записи пользователя
  const userRegs = useMemo(
    () =>
      registrations.filter(
        (r) => r.status !== 'cancelled' && r.userId === currentUser?.id
      ),
    [registrations, currentUser?.id]
  );

  const now = new Date();
  const [cursor, setCursor] = useState({
    year: now.getFullYear(),
    month: now.getMonth(),
  });
  const { year, month } = cursor;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const getDayTrainings = (day: number) => {
    const dateStr = toISODate(new Date(year, month, day));
    return userRegs
      .map((r) => {
        const t = trainings.find((t) => t.id === r.trainingId && t.date === dateStr);
        return t ? { ...t, status: r.status } : null;
      })
      .filter(Boolean);
  };

  const monthCount = days.reduce((sum, day) => sum + getDayTrainings(day).length, 0);

  // Сколько занятий месяца уже прошло и сколько ещё впереди
  const todayStr = toISODate(now);
  let pastCount = 0;
  for (const day of days) {
    if (toISODate(new Date(year, month, day)) < todayStr) pastCount += getDayTrainings(day).length;
  }
  const futureCount = monthCount - pastCount;

  const shiftMonth = (delta: number) =>
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  // --- Экспорт в .ics ---
  const handleExport = () => {
    const upcoming = trainings.filter((t) => {
      const reg = userRegs.find((r) => r.trainingId === t.id && r.status !== 'cancelled');
      return reg;
    }).sort((a, b) => a.date.localeCompare(b.date));

    if (upcoming.length === 0) return;

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Второе Дыхание//RU',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    for (const t of upcoming) {
      const start = `${t.date.replace(/-/g, '')}T${(t.time || '09:00').replace(/:/g, '')}00`;
      const durMin = parseInt(t.duration) || 60;
      const endSec = new Date(`${t.date}T${t.time}:00`).getTime() + durMin * 60000;
      const end = new Date(endSec);
      const endStr = `${end.getFullYear()}${String(end.getMonth() + 1).padStart(2, '0')}${String(end.getDate()).padStart(2, '0')}T${String(end.getHours()).padStart(2, '0')}${String(end.getMinutes()).padStart(2, '0')}00`;

      lines.push(
        'BEGIN:VEVENT',
        `DTSTART:${start}`,
        `DTEND:${endStr}`,
        `SUMMARY:${t.name}`,
        `DESCRIPTION:Тренер: ${t.trainer}\nУровень: ${t.level}`,
        `LOCATION:${t.location}`,
        'END:VEVENT'
      );
    }

    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vtoroe-dyhanie-calendar.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Мой сезон"
        title="Календарь"
        subtitle={
          monthCount > 0
            ? `${monthCount} ${countNoun(monthCount, 'тренировка', 'тренировки', 'тренировок')} в ${MONTHS[month].toLowerCase()}е — ${pastCount} прошло, ${futureCount} впереди.`
            : `В ${MONTHS[month].toLowerCase()}е записей нет — самое время выбрать тренировку.`
        }
        actions={
          <ActionButton onClick={handleExport} variant="outline">
            <Download className="h-3.5 w-3.5" />
            Экспорт в календарь
          </ActionButton>
        }
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

      {/* Легенда + список на сегодня */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel>
          <PanelTitle>Легенда</PanelTitle>
          <ul className="space-y-2 text-xs text-graphite">
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-md border border-brand bg-brand/10" /> Сегодня
            </li>
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-md bg-navy/10" /> Тренировка
            </li>
            <li className="flex items-center gap-2">
              <StatusBadge tone="green">Посещено</StatusBadge> Прошедшая тренировка
            </li>
            <li className="flex items-center gap-2">
              <StatusBadge tone="yellow">Лист ожидания</StatusBadge> Мест нет
            </li>
          </ul>
        </Panel>

        <Panel>
          <PanelTitle>Сегодня</PanelTitle>
          {(() => {
            const todayStr = toISODate(now);
            const todayTrainings = userRegs
              .map((r) => trainings.find((t) => t.id === r.trainingId && t.date === todayStr))
              .filter((t): t is NonNullable<typeof t> => Boolean(t));

            if (todayTrainings.length === 0) {
              return <p className="text-xs text-graphite">Сегодня тренировок нет</p>;
            }

            return (
              <ul className="space-y-2">
                {todayTrainings.map((t) => (
                  <li key={t.id} className="rounded-xl border border-line bg-mist/50 p-3">
                    <p className="text-sm font-bold text-ink">{t.name}</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-graphite">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {t.time} · {t.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {t.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserRound className="h-3 w-3" /> {t.trainer}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            );
          })()}
        </Panel>
      </div>
    </div>
  );
}
