import { useAuth } from '../../context/AuthContext';
import { activeProfiles, useProfiles } from '../../store/profilesStore';
import { useTrainings } from '../../store/trainingsStore';
import { visibleTrainings } from '../../lib/access';
import { EmptyState, PageHeader } from '../../components/cabinet/ui';
import { countNoun } from '../../lib/plural';
import { Link } from 'react-router-dom';

export default function TrainerStudentsPage() {
  const trainings = useTrainings();
  const { currentUser, registrations } = useAuth();
  const users = activeProfiles(useProfiles());

  const myTrainings = visibleTrainings(trainings, currentUser, registrations);
  const myTrainingIds = new Set(myTrainings.map((t) => t.id));

  // Только те, кто записан на тренировки этого тренера
  const myRegs = registrations.filter(
    (r) => r.status !== 'cancelled' && myTrainingIds.has(r.trainingId)
  );
  const athleteIds = [...new Set(myRegs.map((r) => r.userId))];
  const athletes = users.filter((u) => athleteIds.includes(u.id));

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Люди"
        title="Мои спортсмены"
        subtitle={`${countNoun(athletes.length, 'участник записан', 'участника записаны', 'участников записаны')} на ваши тренировки.`}
      />

      {athletes.length === 0 ? (
        <EmptyState
          title="Пока никто не записался"
          text="Список соберётся автоматически после первых записей на ваши тренировки."
        />
      ) : (
        <div className="space-y-3">
          {athletes.map((athlete) => {
            const regs = myRegs.filter((r) => r.userId === athlete.id);
            const attended = regs.filter((r) => r.attended).length;

            return (
              <Link
                key={athlete.id}
                to={`/cabinet/students/${athlete.id}`}
                className="block rounded-2xl border border-line bg-paper p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    {athlete.photo ? (
                      <img
                        src={athlete.photo}
                        alt={athlete.name}
                        className="h-12 w-12 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/10 text-lg font-bold text-brand">
                        {athlete.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">{athlete.name}</p>
                      <p className="truncate text-xs text-graphite">{athlete.email}</p>
                      {athlete.phone && (
                        <a
                          href={`tel:${athlete.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5 block text-xs font-semibold text-navy hover:underline"
                        >
                          {athlete.phone}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <div className="rounded-xl bg-mist px-3 py-2 text-center">
                      <p className="text-base font-bold text-ink">{regs.length}</p>
                      <p className="text-[0.62rem] uppercase tracking-[0.08em] text-graphite">
                        Записей
                      </p>
                    </div>
                    <div className="rounded-xl bg-mist px-3 py-2 text-center">
                      <p className="text-base font-bold text-ink">{attended}</p>
                      <p className="text-[0.62rem] uppercase tracking-[0.08em] text-graphite">
                        Посещено
                      </p>
                    </div>
                  </div>
                </div>
                {regs.length > 0 && (
                  <div className="mt-4 border-t border-line pt-3">
                    <p className="mb-2 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
                      Записи
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {regs.map((r) => {
                        const training = myTrainings.find((t) => t.id === r.trainingId);
                        return (
                          <span
                            key={r.id}
                            className="rounded-full bg-mist px-2.5 py-1 text-[0.68rem] text-graphite"
                          >
                            {training?.name || '—'}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}