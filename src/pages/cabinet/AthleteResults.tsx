import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTrainings } from '../../store/trainingsStore';
import {
  ActionButton,
  EmptyState,
  PageHeader,
  Panel,
  PanelTitle,
  fieldClass,
  labelClass,
} from '../../components/cabinet/ui';
import { countNoun } from '../../lib/plural';
import { BarChart3, Medal, Plus, Star, Trash2, X } from 'lucide-react';

const empty = {
  trainingId: '',
  date: new Date().toISOString().split('T')[0],
  distance: '',
  time: '',
  notes: '',
  rating: 4,
};

/** Парсит «28:34» или «1:28:34» в секунды */
function parseTime(sec?: string): number {
  if (!sec) return 0;
  const parts = sec.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

/** Парсит «5 км» или «10.5 км» в километры */
function parseDistance(km?: string): number {
  if (!km) return 0;
  const m = km.match(/([\d.]+)/);
  return m ? Number(m[1]) : 0;
}

export default function AthleteResults() {
  const trainings = useTrainings();
  const { currentUser, personalResults, addPersonalResult, removePersonalResult } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const mine = useMemo(
    () =>
      personalResults
        .filter((r) => r.userId === currentUser?.id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [personalResults, currentUser?.id]
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.trainingId) {
      toast('Выберите тренировку', 'error');
      return;
    }
    addPersonalResult({
      userId: currentUser!.id,
      trainingId: form.trainingId,
      date: form.date,
      distance: form.distance.trim() || undefined,
      time: form.time.trim() || undefined,
      notes: form.notes.trim() || undefined,
      rating: form.rating,
    });
    toast('Результат добавлен');
    setForm(empty);
    setOpen(false);
  };

  const remove = (id: string) => {
    removePersonalResult(id);
    toast('Результат удалён', 'info');
  };

  // --- Аналитика ---
  const bestResults = useMemo(() => {
    const best: Record<string, (typeof mine)[number]> = {};
    for (const r of mine) {
      if (!best[r.trainingId]) {
        best[r.trainingId] = r;
        continue;
      }
      const existing = best[r.trainingId];
      // Лучше = больше км или меньше времени
      const newKm = parseDistance(r.distance);
      const oldKm = parseDistance(existing.distance);
      const newSec = parseTime(r.time);
      const oldSec = parseTime(existing.time);
      if (newKm > oldKm || (newKm === oldKm && newSec > 0 && oldSec > 0 && newSec < oldSec)) {
        best[r.trainingId] = r;
      }
    }
    return Object.values(best);
  }, [mine]);

  const trainingStats = useMemo(() => {
    const stats: Record<string, { count: number; bestTime?: string; bestKm?: string }> = {};
    for (const r of mine) {
      if (!stats[r.trainingId]) {
        stats[r.trainingId] = { count: 0 };
      }
      stats[r.trainingId].count += 1;
      if (r.time && (!stats[r.trainingId].bestTime || parseTime(r.time) < parseTime(stats[r.trainingId].bestTime!))) {
        stats[r.trainingId].bestTime = r.time;
      }
      if (r.distance && (!stats[r.trainingId].bestKm || parseDistance(r.distance) > parseDistance(stats[r.trainingId].bestKm!))) {
        stats[r.trainingId].bestKm = r.distance;
      }
    }
    return stats;
  }, [mine]);

  const totalTrainings = mine.length;
  const avgRating = mine.length
    ? (mine.reduce((s, r) => s + (r.rating ?? 0), 0) / mine.length).toFixed(1)
    : '—';

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Мой сезон"
        title="Мои результаты"
        subtitle={
          mine.length > 0
            ? `${countNoun(mine.length, 'запись', 'записи', 'записей')} в дневнике тренировок.`
            : 'Личный дневник достижений — дистанция, время и впечатления.'
        }
        actions={
          <ActionButton onClick={() => setOpen((v) => !v)} variant={open ? 'outline' : 'primary'}>
            {open ? (
              <>
                <X className="h-3.5 w-3.5" /> Отмена
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" /> Добавить
              </>
            )}
          </ActionButton>
        }
      />

      {/* Карточки аналитики */}
      {mine.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <Panel className="text-center">
            <BarChart3 className="mx-auto mb-2 h-5 w-5 text-brand" />
            <p className="display text-xl text-ink">{totalTrainings}</p>
            <p className="text-xs text-graphite">Тренировок</p>
          </Panel>
          <Panel className="text-center">
            <Medal className="mx-auto mb-2 h-5 w-5 text-amber-500" />
            <p className="display text-xl text-ink">{bestResults.length}</p>
            <p className="text-xs text-graphite">Лучших результатов</p>
          </Panel>
          <Panel className="text-center">
            <Star className="mx-auto mb-2 h-5 w-5 fill-amber-400 text-amber-500" />
            <p className="display text-xl text-ink">{avgRating}</p>
            <p className="text-xs text-graphite">Средняя оценка</p>
          </Panel>
        </div>
      )}

      {/* Лучшие результаты */}
      {bestResults.length > 0 && (
        <Panel className="mb-6">
          <PanelTitle>Лучшие результаты</PanelTitle>
          <div className="space-y-2">
            {bestResults.map((r) => {
              const training = trainings.find((t) => t.id === r.trainingId);
              return (
                <div
                  key={r.id}
                  className="flex flex-col gap-1 rounded-xl border border-amber-200/50 bg-amber-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-ink">{training?.name ?? 'Тренировка'}</p>
                    <p className="text-xs text-graphite">
                      {new Date(r.date).toLocaleDateString('ru-RU')}
                      {r.distance && ` · ${r.distance}`}
                      {r.time && ` · ${r.time}`}
                    </p>
                  </div>
                  <Medal className="h-4 w-4 text-amber-500" />
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {/* Статистика по тренировкам */}
      {mine.length > 1 && (
        <Panel className="mb-6">
          <PanelTitle>Статистика по тренировкам</PanelTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-mist/60">
                  <th className="px-3 py-2 text-left text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
                    Тренировка
                  </th>
                  <th className="px-3 py-2 text-center text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
                    Раз
                  </th>
                  <th className="hidden px-3 py-2 text-center text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite sm:table-cell">
                    Лучшее время
                  </th>
                  <th className="hidden px-3 py-2 text-center text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite md:table-cell">
                    Лучшая дистанция
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(trainingStats).map(([tid, stats]) => {
                  const training = trainings.find((t) => t.id === tid);
                  return (
                    <tr key={tid} className="border-b border-line last:border-0 hover:bg-mist/50">
                      <td className="px-3 py-2 font-medium text-ink">{training?.name ?? tid}</td>
                      <td className="px-3 py-2 text-center text-graphite">{stats.count}</td>
                      <td className="hidden px-3 py-2 text-center text-navy sm:table-cell">
                        {stats.bestTime ?? '—'}
                      </td>
                      <td className="hidden px-3 py-2 text-center text-navy md:table-cell">
                        {stats.bestKm ?? '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Форма добавления */}
      {open && (
        <Panel className="mb-5">
          <PanelTitle hint="Результат видите только вы — это личный дневник, а не протокол соревнований.">
            Новый результат
          </PanelTitle>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="training" className={labelClass}>
                  Тренировка
                </label>
                <select
                  id="training"
                  value={form.trainingId}
                  onChange={(e) => setForm({ ...form, trainingId: e.target.value })}
                  className={fieldClass}
                  required
                >
                  <option value="">Выберите тренировку</option>
                  {trainings.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="date" className={labelClass}>
                  Дата
                </label>
                <input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className={fieldClass}
                  required
                />
              </div>
              <div>
                <label htmlFor="distance" className={labelClass}>
                  Дистанция
                </label>
                <input
                  id="distance"
                  value={form.distance}
                  onChange={(e) => setForm({ ...form, distance: e.target.value })}
                  className={fieldClass}
                  placeholder="5 км"
                />
              </div>
              <div>
                <label htmlFor="time" className={labelClass}>
                  Время
                </label>
                <input
                  id="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className={fieldClass}
                  placeholder="28:34"
                />
              </div>
            </div>
            <div>
              <label htmlFor="notes" className={labelClass}>
                Заметки
              </label>
              <textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className={`${fieldClass} resize-none`}
                placeholder="Как прошла тренировка?"
              />
            </div>
            <div>
              <span className={labelClass}>Оценка тренировки</span>
              <div className="flex gap-0.5" role="radiogroup" aria-label="Оценка тренировки">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={form.rating === n}
                    onClick={() => setForm({ ...form, rating: n })}
                    className="rounded-md p-1 transition-colors hover:bg-mist"
                    aria-label={`${n} из 5`}
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        n <= form.rating ? 'fill-amber-400 text-amber-500' : 'text-line'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <ActionButton type="submit">Сохранить результат</ActionButton>
          </form>
        </Panel>
      )}

      {/* Таблица результатов */}
      {mine.length === 0 ? (
        <EmptyState
          title="Дневник пока пуст"
          text="Добавьте первый результат после тренировки — так видно прогресс за сезон."
          action={<ActionButton onClick={() => setOpen(true)}>Добавить результат</ActionButton>}
        />
      ) : (
        <Panel padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-mist/60">
                  <th scope="col" className="px-4 py-2.5 text-left text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
                    Тренировка
                  </th>
                  <th scope="col" className="hidden px-4 py-2.5 text-left text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite sm:table-cell">
                    Дата
                  </th>
                  <th scope="col" className="hidden px-4 py-2.5 text-left text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite md:table-cell">
                    Дистанция
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-left text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
                    Время
                  </th>
                  <th scope="col" className="hidden px-4 py-2.5 text-left text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite sm:table-cell">
                    Оценка
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right">
                    <span className="sr-only">Действия</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {mine.map((r) => {
                  const training = trainings.find((t) => t.id === r.trainingId);
                  return (
                    <tr key={r.id} className="border-b border-line last:border-0 hover:bg-mist/50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink">{training?.name ?? 'Тренировка'}</p>
                        {r.notes && (
                          <p className="mt-0.5 text-xs text-graphite">{r.notes}</p>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 text-graphite sm:table-cell">
                        {new Date(r.date).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="hidden px-4 py-3 text-graphite md:table-cell">
                        {r.distance ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-bold text-navy">{r.time ?? '—'}</td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span className="flex gap-0.5">
                          {Array.from({ length: r.rating ?? 0 }, (_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                          ))}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => remove(r.id)}
                          className="text-graphite transition-colors hover:text-brand"
                          aria-label="Удалить результат"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
