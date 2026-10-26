import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTrainings } from '../../store/trainingsStore';
import Button from '../../components/ui/Button';
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

  const field =
    'w-full rounded-sm border border-white/10 bg-primary px-3 py-2.5 text-sm text-white transition-colors placeholder:text-gray-600 focus:border-accent-red focus:outline-none';
  const label = 'mb-1.5 block text-xs uppercase tracking-wider text-gray-400';

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
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-white">Мои результаты</h1>
          <p className="text-sm text-gray-400">
            {mine.length > 0
              ? `${mine.length} записей в дневнике тренировок`
              : 'Личный дневник достижений'}
          </p>
        </div>
        <Button onClick={() => setOpen((v) => !v)} variant={open ? 'outline' : 'primary'} size="sm">
          {open ? (
            <>
              <X className="mr-1.5 h-4 w-4" /> Отмена
            </>
          ) : (
            <>
              <Plus className="mr-1.5 h-4 w-4" /> Добавить
            </>
          )}
        </Button>
      </div>

      {open && (
        <form onSubmit={submit} className="mb-6 space-y-4 rounded-sm border border-white/10 bg-surface p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="training" className={label}>Тренировка</label>
              <select
                id="training"
                value={form.trainingId}
                onChange={(e) => setForm({ ...form, trainingId: e.target.value })}
                className={field}
                required
              >
                <option value="">Выберите тренировку</option>
                {trainings.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="date" className={label}>Дата</label>
              <input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={field}
                required
              />
            </div>
            <div>
              <label htmlFor="distance" className={label}>Дистанция</label>
              <input
                id="distance"
                value={form.distance}
                onChange={(e) => setForm({ ...form, distance: e.target.value })}
                className={field}
                placeholder="5 км"
              />
            </div>
            <div>
              <label htmlFor="time" className={label}>Время</label>
              <input
                id="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className={field}
                placeholder="28:34"
              />
            </div>
          </div>
          <div>
            <label htmlFor="notes" className={label}>Заметки</label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className={`${field} resize-none`}
              placeholder="Как прошла тренировка?"
            />
          </div>
          <div>
            <span className={label}>Оценка тренировки</span>
            <div className="flex gap-1" role="radiogroup" aria-label="Оценка тренировки">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={form.rating === n}
                  onClick={() => setForm({ ...form, rating: n })}
                  className="p-1"
                  aria-label={`${n} из 5`}
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      n <= form.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" variant="primary" size="sm">Сохранить результат</Button>
        </form>
      )}

      {mine.length === 0 ? (
        <div className="rounded-sm border border-white/10 bg-surface p-10 text-center">
          <p className="mb-4 text-sm text-gray-400">Здесь появятся ваши тренировки и результаты</p>
          <Button onClick={() => setOpen(true)} variant="primary" size="sm">
            Добавить первый результат
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-sm border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr className="border-b border-white/10">
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400">Тренировка</th>
                <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium text-gray-400 sm:table-cell">Дата</th>
                <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium text-gray-400 md:table-cell">Дистанция</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400">Время</th>
                <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium text-gray-400 sm:table-cell">Оценка</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-400">
                  <span className="sr-only">Действия</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {mine.map((r) => {
                const training = trainings.find((t) => t.id === r.trainingId);
                return (
                  <tr key={r.id} className="border-b border-white/5 bg-surface/50 transition-colors last:border-0 hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-white">
                      {training?.name ?? 'Тренировка'}
                      {r.notes && <p className="mt-0.5 text-xs font-normal text-gray-500">{r.notes}</p>}
                    </td>
                    <td className="hidden px-4 py-3 text-gray-400 sm:table-cell">
                      {new Date(r.date).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="hidden px-4 py-3 text-gray-400 md:table-cell">{r.distance ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold text-accent-blue">{r.time ?? '—'}</td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="flex gap-0.5">
                        {Array.from({ length: r.rating ?? 0 }, (_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => remove(r.id)}
                        className="text-gray-500 transition-colors hover:text-red-400"
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
      )}
    </div>
  );
}
