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
import { Plus, Star, Trash2, X } from 'lucide-react';

const empty = {
  trainingId: '',
  date: new Date().toISOString().split('T')[0],
  distance: '',
  time: '',
  notes: '',
  rating: 4,
};

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