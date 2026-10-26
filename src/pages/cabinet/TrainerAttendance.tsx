import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTrainings } from '../../store/trainingsStore';
import { getStoredUsers } from '../../store/database';
import { visibleTrainings } from '../../lib/access';
import { formatDate, isPastDate } from '../../lib/date';
import { Check, Undo2 } from 'lucide-react';

export default function TrainerAttendancePage() {
  const trainings = useTrainings();
  const { currentUser, registrations, markAttended } = useAuth();
  const users = getStoredUsers();
  const [showPast, setShowPast] = useState(true);

  const myTrainings = visibleTrainings(trainings, currentUser).sort((a, b) =>
    (a.date + a.time).localeCompare(b.date + b.time)
  );
  const listed = showPast ? myTrainings : myTrainings.filter((t) => !isPastDate(t.date));

  const activeRegs = registrations.filter((r) => r.status !== 'cancelled');

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-white">Посещаемость</h1>
      <p className="mb-6 text-sm text-gray-400">Отметка участников на ваших тренировках</p>

      <label className="mb-6 flex w-fit items-center gap-2 text-xs text-gray-400">
        <input
          type="checkbox"
          checked={showPast}
          onChange={(e) => setShowPast(e.target.checked)}
          className="h-4 w-4 accent-accent-red"
        />
        Показывать прошедшие тренировки
      </label>

      {listed.length === 0 && (
        <div className="rounded-sm border border-white/10 bg-surface p-8 text-center">
          <p className="text-sm text-gray-400">Нет тренировок для отметки посещаемости.</p>
        </div>
      )}

      <div className="space-y-4">
        {listed.map((t) => {
          const regList = activeRegs.filter((r) => r.trainingId === t.id);
          const done = isPastDate(t.date);
          return (
            <div key={t.id} className="rounded-sm border border-white/10 bg-surface p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-white">{t.name}</h3>
                <span className="text-xs text-gray-500">
                  {formatDate(t.date)} · {t.time} · записано {regList.length}
                  {done && ' · завершена'}
                </span>
              </div>

              {regList.length === 0 ? (
                <p className="text-xs text-gray-500">На эту тренировку никто не записан.</p>
              ) : (
                <div className="space-y-2">
                  {regList.map((reg) => {
                    const user = users.find((u) => u.id === reg.userId);
                    return (
                      <div
                        key={reg.id}
                        className="flex items-center justify-between border-b border-white/5 py-2 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-red/20 text-sm font-bold text-accent-red">
                            {user?.name.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="text-sm text-white">{user?.name || 'Неизвестно'}</div>
                            <div className="text-xs text-gray-500">
                              {reg.status === 'waitlist' ? 'Лист ожидания' : `Записан ${reg.registeredAt}`}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => markAttended(reg.id)}
                          className={`flex items-center gap-1.5 rounded-sm px-3 py-1 text-xs transition-colors ${
                            reg.attended
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20'
                          }`}
                          aria-label={
                            reg.attended
                              ? `Снять отметку с ${user?.name ?? 'участника'}`
                              : `Отметить ${user?.name ?? 'участника'}`
                          }
                        >
                          {reg.attended ? (
                            <>
                              <Check className="h-3.5 w-3.5" /> Посетил
                            </>
                          ) : (
                            'Отметить'
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-6 flex items-center gap-1.5 text-xs text-gray-600">
        <Undo2 className="h-3.5 w-3.5" />
        Повторное нажатие снимает отметку посещения.
      </p>
    </div>
  );
}
