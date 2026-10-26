import { useAuth } from '../../context/AuthContext';
import { getStoredUsers } from '../../store/database';
import { useTrainings } from '../../store/trainingsStore';
import { visibleTrainings } from '../../lib/access';

export default function TrainerStudentsPage() {
  const trainings = useTrainings();
  const { currentUser, registrations } = useAuth();
  const users = getStoredUsers();

  const myTrainings = visibleTrainings(trainings, currentUser);
  const myTrainingIds = new Set(myTrainings.map((t) => t.id));

  // Только те, кто записан на тренировки этого тренера
  const myRegs = registrations.filter(
    (r) => r.status !== 'cancelled' && myTrainingIds.has(r.trainingId)
  );
  const athleteIds = [...new Set(myRegs.map((r) => r.userId))];
  const athletes = users.filter((u) => athleteIds.includes(u.id));

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-white">Мои студенты</h1>
      <p className="mb-8 text-sm text-gray-400">
        {athletes.length} участников записаны на ваши тренировки
      </p>

      {athletes.length === 0 ? (
        <div className="rounded-sm border border-white/10 bg-surface p-8 text-center">
          <p className="text-sm text-gray-400">
            Пока никто не записался. Список появится после первых записей.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {athletes.map((athlete) => {
            const regs = myRegs.filter((r) => r.userId === athlete.id);
            const attended = regs.filter((r) => r.attended).length;

            return (
              <div key={athlete.id} className="rounded-sm border border-white/10 bg-surface p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-red/20 text-lg font-bold text-accent-red">
                      {athlete.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{athlete.name}</div>
                      <div className="text-xs text-gray-400">{athlete.email}</div>
                      {athlete.phone && (
                        <div className="mt-0.5 text-xs text-gray-500">{athlete.phone}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-center">
                      <div className="font-bold text-white">{regs.length}</div>
                      <div className="text-gray-500">Записей</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-white">{attended}</div>
                      <div className="text-gray-500">Посещено</div>
                    </div>
                  </div>
                </div>
                {regs.length > 0 && (
                  <div className="mt-3 border-t border-white/5 pt-3">
                    <div className="mb-2 text-xs text-gray-500">Активные записи:</div>
                    <div className="flex flex-wrap gap-2">
                      {regs.map((r) => {
                        const training = myTrainings.find((t) => t.id === r.trainingId);
                        return (
                          <span
                            key={r.id}
                            className="rounded-sm bg-white/5 px-2 py-1 text-xs text-gray-400"
                          >
                            {training?.name || '—'}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
