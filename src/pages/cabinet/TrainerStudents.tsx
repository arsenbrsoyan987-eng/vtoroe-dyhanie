import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { activeProfiles, useProfiles } from '../../store/profilesStore';
import { useTrainings } from '../../store/trainingsStore';
import { visibleTrainings } from '../../lib/access';
import { EmptyState, PageHeader, StatusBadge } from '../../components/cabinet/ui';
import { countNoun } from '../../lib/plural';
import { Search, SortAsc, X } from 'lucide-react';

type SortKey = 'name' | 'attended' | 'rate' | 'recent';

const SORT_LABEL: Record<SortKey, string> = {
  name: 'По имени',
  attended: 'По посещениям',
  rate: 'По явке',
  recent: 'По последней записи',
};

export default function TrainerStudentsPage() {
  const trainings = useTrainings();
  const { currentUser, registrations } = useAuth();
  const users = activeProfiles(useProfiles());
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('attended');

  const myTrainings = visibleTrainings(trainings, currentUser, registrations);
  const myTrainingIds = new Set(myTrainings.map((t) => t.id));

  // Только те, кто записан на тренировки этого тренера
  const myRegs = registrations.filter(
    (r) => r.status !== 'cancelled' && myTrainingIds.has(r.trainingId)
  );

  const athletes = useMemo(() => {
    const athleteIds = [...new Set(myRegs.map((r) => r.userId))];
    const rows = athleteIds
      .map((id) => {
        const user = users.find((u) => u.id === id);
        if (!user) return null;
        const regs = myRegs.filter((r) => r.userId === id);
        const attended = regs.filter((r) => r.attended).length;
        const rate = regs.length > 0 ? Math.round((attended / regs.length) * 100) : 0;
        const recent = regs.reduce((max, r) => (r.registeredAt > max ? r.registeredAt : max), '');
        return { user, regs, attended, rate, recent };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    const filtered = search.trim()
      ? rows.filter((row) => {
          const q = search.trim().toLowerCase();
          return (
            row.user.name.toLowerCase().includes(q) ||
            row.user.email.toLowerCase().includes(q) ||
            row.user.phone.includes(q)
          );
        })
      : rows;

    return filtered.sort((a, b) => {
      if (sort === 'name') return a.user.name.localeCompare(b.user.name, 'ru');
      if (sort === 'attended') return b.attended - a.attended || b.regs.length - a.regs.length;
      if (sort === 'rate') return b.rate - a.rate;
      return b.recent.localeCompare(a.recent);
    });
  }, [myRegs, users, search, sort]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Люди"
        title="Мои спортсмены"
        subtitle={`${countNoun(athletes.length, 'участник записан', 'участника записаны', 'участников записаны')} на ваши тренировки.`}
      />

      {myRegs.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <div className="flex min-w-[14rem] flex-1 items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-2 text-xs">
            <Search className="h-3.5 w-3.5 shrink-0 text-graphite/60" />
            <input
              type="text"
              placeholder="Имя, email или телефон…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Очистить поиск"
                className="shrink-0 text-graphite hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5">
            <SortAsc className="h-3.5 w-3.5 text-graphite/60" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Сортировка"
              className="bg-transparent text-xs font-semibold text-ink outline-none"
            >
              {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
                <option key={key} value={key}>
                  {SORT_LABEL[key]}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {athletes.length === 0 ? (
        <EmptyState
          title={search ? 'Никого не нашли' : 'Пока никто не записался'}
          text={
            search
              ? 'Проверьте написание имени, email или телефона.'
              : 'Список соберётся автоматически после первых записей на ваши тренировки.'
          }
        />
      ) : (
        <div className="space-y-3">
          {athletes.map(({ user: athlete, regs, attended, rate }) => {
            const lastReg = regs.reduce((max, r) => (r.registeredAt > max ? r.registeredAt : max), '');

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
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <StatusBadge tone={rate >= 70 ? 'green' : rate >= 40 ? 'yellow' : 'gray'}>
                      Явка {rate}%
                    </StatusBadge>
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
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
                        Записи
                      </p>
                      {lastReg && (
                        <p className="text-[0.62rem] text-graphite">Последняя: {lastReg}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {regs.map((r) => {
                        const training = myTrainings.find((t) => t.id === r.trainingId);
                        return (
                          <span
                            key={r.id}
                            className={`rounded-full px-2.5 py-1 text-[0.68rem] ${
                              r.attended
                                ? 'bg-emerald-500/10 text-emerald-700'
                                : 'bg-mist text-graphite'
                            }`}
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
