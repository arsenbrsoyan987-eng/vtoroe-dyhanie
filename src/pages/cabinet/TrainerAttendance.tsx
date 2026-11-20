import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTrainings } from '../../store/trainingsStore';
import { activeProfiles, useProfiles } from '../../store/profilesStore';
import { visibleTrainings } from '../../lib/access';
import { formatDate, isPastDate } from '../../lib/date';
import { EmptyState, PageHeader, Panel, StatusBadge } from '../../components/cabinet/ui';
import { Check, Undo2 } from 'lucide-react';

export default function TrainerAttendancePage() {
  const trainings = useTrainings();
  const { currentUser, registrations, markAttended } = useAuth();
  const users = activeProfiles(useProfiles());
  const [showPast, setShowPast] = useState(true);

  const myTrainings = visibleTrainings(trainings, currentUser, registrations).sort((a, b) =>
    (a.date + a.time).localeCompare(b.date + b.time)
  );
  const listed = showPast ? myTrainings : myTrainings.filter((t) => !isPastDate(t.date));

  const activeRegs = registrations.filter((r) => r.status !== 'cancelled');

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Работа"
        title="Посещаемость"
        subtitle="Отметьте, кто пришёл на тренировку. Повторное нажатие снимает отметку."
      />

      <label className="mb-5 flex w-fit cursor-pointer items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-2 text-xs font-semibold text-graphite transition-colors hover:border-ink/25 hover:text-ink">
        <input
          type="checkbox"
          checked={showPast}
          onChange={(e) => setShowPast(e.target.checked)}
          className="h-4 w-4 accent-brand"
        />
        Показывать прошедшие тренировки
      </label>

      {listed.length === 0 ? (
        <EmptyState
          title="Нет тренировок для отметки"
          text="Как только в расписании появятся ваши занятия, список откроется здесь."
        />
      ) : (
        <div className="space-y-3">
          {listed.map((t) => {
            const regList = activeRegs.filter((r) => r.trainingId === t.id);
            const done = isPastDate(t.date);
            return (
              <Panel key={t.id}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-ink">{t.name}</h3>
                    {done && <StatusBadge tone="gray">Завершена</StatusBadge>}
                  </div>
                  <span className="text-xs text-graphite">
                    {formatDate(t.date)} · {t.time} · записано {regList.length}
                  </span>
                </div>

                {regList.length === 0 ? (
                  <p className="rounded-xl bg-mist px-3 py-3 text-xs text-graphite">
                    На эту тренировку никто не записан.
                  </p>
                ) : (
                  <ul className="divide-y divide-line">
                    {regList.map((reg) => {
                      const user = users.find((u) => u.id === reg.userId);
                      return (
                        <li
                          key={reg.id}
                          className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                              {user?.name.charAt(0) || '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-ink">
                                {user?.name || 'Неизвестно'}
                              </p>
                              <p className="text-xs text-graphite">
                                {reg.status === 'waitlist'
                                  ? 'Лист ожидания'
                                  : `Записан ${reg.registeredAt}`}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => void markAttended(reg.id)}
                            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] transition-colors ${
                              reg.attended
                                ? 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20'
                                : 'bg-navy/10 text-navy hover:bg-navy/15'
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
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Panel>
            );
          })}
        </div>
      )}

      <p className="mt-5 flex items-center gap-1.5 text-xs text-graphite">
        <Undo2 className="h-3.5 w-3.5" />
        Отметки сохраняются сразу и видны администратору школы.
      </p>
    </div>
  );
}