import { useAuth } from '../../context/AuthContext';
import { useTrainings } from '../../store/trainingsStore';
import { toISODate } from '../../lib/date';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

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

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Календарь</h1>
      <p className="text-gray-400 text-sm mb-8">Мои тренировки и мероприятия</p>

      <div className="bg-surface border border-white/10 rounded-sm p-6">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() =>
              setCursor(({ year, month }) => {
                const d = new Date(year, month - 1, 1);
                return { year: d.getFullYear(), month: d.getMonth() };
              })
            }
            className="rounded-sm p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="text-lg font-bold text-white">
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={() =>
              setCursor(({ year, month }) => {
                const d = new Date(year, month + 1, 1);
                return { year: d.getFullYear(), month: d.getMonth() };
              })
            }
            className="rounded-sm p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Следующий месяц"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 uppercase py-2">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {blanks.map((b) => (
            <div key={`blank-${b}`} className="min-h-[80px] p-1" />
          ))}
          {days.map((day) => {
            const dayTrainings = getDayTrainings(day);
            const isToday =
              day === now.getDate() &&
              month === now.getMonth() &&
              year === now.getFullYear();
            return (
              <div
                key={day}
                className={`min-h-[80px] p-1 rounded-sm border transition-colors ${
                  isToday ? 'border-accent-red bg-accent-red/5' : 'border-white/5 hover:border-white/10'
                }`}
              >
                <span className={`text-xs ${isToday ? 'text-accent-red font-bold' : 'text-gray-500'}`}>{day}</span>
                <div className="mt-1 space-y-0.5">
                  {dayTrainings.slice(0, 2).map((t, i) => (
                    <div key={i} className="text-[10px] bg-accent-blue/20 text-accent-blue px-1 py-0.5 rounded-sm truncate">
                      {t?.name}
                    </div>
                  ))}
                  {dayTrainings.length > 2 && (
                    <div className="text-[10px] text-gray-500">+{dayTrainings.length - 2}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-accent-red/20 border border-accent-red" />
          <span>Сегодня</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-accent-blue/20" />
          <span>Тренировка</span>
        </div>
      </div>
    </div>
  );
}
