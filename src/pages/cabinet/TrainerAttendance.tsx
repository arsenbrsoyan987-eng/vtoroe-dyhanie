import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTrainings } from '../../store/trainingsStore';
import { activeProfiles, useProfiles } from '../../store/profilesStore';
import { visibleTrainings } from '../../lib/access';
import { todayISO as todayISODate } from '../../lib/date';
import {
  ActionButton,
  EmptyState,
  PageHeader,
  Panel,
} from '../../components/cabinet/ui';
import { Check, Clock, Download, Search, Undo2 } from 'lucide-react';

export default function TrainerAttendancePage() {
  const trainings = useTrainings();
  const { currentUser, registrations, markAttended, markManyAttended } = useAuth();
  const users = activeProfiles(useProfiles());
  const { toast } = useToast();
  const [showPast, setShowPast] = useState(true);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const todayISO = todayISODate();

  const myTrainings = visibleTrainings(trainings, currentUser, registrations).sort((a, b) =>
    (a.date + a.time).localeCompare(b.date + b.time)
  );
  const listed = showPast ? myTrainings : myTrainings.filter((t) => t.date >= todayISO);

  const activeRegs = registrations.filter((r) => r.status !== 'cancelled');

  const stats = useMemo(() => {
    let total = 0, present = 0, absent = 0;
    for (const t of listed) {
      const regs = activeRegs.filter((r) => r.trainingId === t.id);
      total += regs.length;
      present += regs.filter((r) => r.attended).length;
      absent += regs.filter((r) => !r.attended).length;
    }
    return { total, present, absent };
  }, [listed, activeRegs]);

  const markAllAttended = async (trainingId: string) => {
    const ids = activeRegs
      .filter((r) => r.trainingId === trainingId && !r.attended)
      .map((r) => r.id);
    if (ids.length === 0) return;
    setBusy(`all-${trainingId}`);
    try {
      await markManyAttended(ids);
      toast(`Отмечены все присутствующие — ${ids.length} чел.`, 'success');
    } finally {
      setBusy(null);
    }
  };

  const exportCSV = () => {
    const rows: (string | number)[][] = [['Спортсмен', 'Тренировка', 'Дата', 'Посещение', 'Статус записи']];
    for (const t of listed) {
      const regs = activeRegs.filter((r) => r.trainingId === t.id);
      for (const reg of regs) {
        const user = users.find((u) => u.id === reg.userId);
        rows.push([
          user?.name ?? '—',
          t.name,
          t.date,
          reg.attended ? 'Посетил' : 'Не посещал',
          reg.status === 'waitlist' ? 'Лист ожидания' : 'Записан',
        ]);
      }
    }
    const blob = new Blob(['\uFEFF' + rows.map(r => r.map(v => String(v ?? '')).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `posh-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast('Файл скачан', 'success');
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Работа"
        title="Посещаемость"
        subtitle="Отметьте, кто пришёл на тренировку. Повторное нажатие снимает отметку."
        actions={
          <ActionButton onClick={exportCSV} variant="outline">
            <Download className="h-3.5 w-3.5" />
            Экспорт
          </ActionButton>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-2 text-xs font-semibold text-graphite">
          <input
            type="checkbox"
            checked={showPast}
            onChange={(e) => setShowPast(e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          Показывать прошедшие
        </label>

        <div className="flex-1 rounded-full border border-line bg-paper px-3.5 py-2 text-xs">
          <Search className="inline h-3.5 w-3.5 text-graphite/60" />
          <input
            type="text"
            placeholder="Поиск спортсмена…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-2 w-full bg-transparent outline-none"
          />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-line bg-paper px-4 py-3 text-center">
          <p className="text-2xl font-bold text-ink">{stats.total}</p>
          <p className="text-[0.62rem] uppercase tracking-[0.08em] text-graphite">Всего записей</p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-emerald-700">{stats.present}</p>
          <p className="text-[0.62rem] uppercase tracking-[0.08em] text-emerald-700">Посетили</p>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-amber-700">{stats.absent}</p>
          <p className="text-[0.62rem] uppercase tracking-[0.08em] text-amber-700">Не посетили</p>
        </div>
      </div>

      {listed.length === 0 ? (
        <EmptyState
          title="Нет тренировок для отметки"
          text="Как только в расписании появятся ваши занятия, список откроется здесь."
        />
      ) : (
        <div className="space-y-4">
          {listed.map((t) => {
            const regs = activeRegs.filter((r) => r.trainingId === t.id);
            const done = t.date <= todayISO;
            const filtered = regs.filter((r) => {
              if (!search) return true;
              const user = users.find((u) => u.id === r.userId);
              return user?.name.toLowerCase().includes(search.toLowerCase());
            });

            return (
              <Panel key={t.id}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-ink">{t.name}</h3>
                    {done && <span className="rounded-full bg-mist px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-graphite">Завершена</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-graphite">
                      {t.date} · {t.time} · {regs.length} чел.
                    </span>
                    {done && regs.some((r) => !r.attended) && (
                      <ActionButton
                        onClick={() => void markAllAttended(t.id)}
                        variant="outline"
                        size="sm"
                        disabled={busy === `all-${t.id}`}
                      >
                        <Check className="h-3 w-3" />
                        {busy === `all-${t.id}` ? 'Отмечаем…' : 'Отметить всех'}
                      </ActionButton>
                    )}
                  </div>
                </div>

                {filtered.length === 0 ? (
                  <p className="rounded-xl bg-mist px-3 py-3 text-xs text-graphite">
                    {regs.length === 0
                      ? 'На эту тренировку никто не записан.'
                      : 'Никого не найдено по поиску.'}
                  </p>
                ) : (
                  <ul className="divide-y divide-line">
                    {filtered.map((reg) => {
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
                            onClick={() => {
                              setBusy(reg.id);
                              void markAttended(reg.id).finally(() => setBusy(null));
                            }}
                            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] transition-colors ${
                              reg.attended
                                ? 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20'
                                : 'bg-navy/10 text-navy hover:bg-navy/15'
                            } disabled:opacity-50`}
                            aria-label={
                              reg.attended
                                ? `Снять отметку с ${user?.name ?? 'участника'}`
                                : `Отметить ${user?.name ?? 'участника'}`
                            }
                            disabled={busy === reg.id}
                          >
                            {busy === reg.id ? (
                              <Clock className="h-3.5 w-3.5 animate-spin" />
                            ) : reg.attended ? (
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
