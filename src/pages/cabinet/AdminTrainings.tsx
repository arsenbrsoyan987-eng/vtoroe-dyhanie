import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { directions } from '../../data/directions';
import { useTrainers } from '../../store/trainersStore';
import {
  addTraining,
  removeTraining,
  updateTraining,
  useTrainings,
} from '../../store/trainingsStore';
import { getRegistrations, saveRegistrations } from '../../store/database';
import { formatDate, isPastDate } from '../../lib/date';
import Button from '../../components/ui/Button';
import { Pencil, Plus, Trash2, X } from 'lucide-react';

const LEVELS = ['Начинающий', 'Средний', 'Продвинутый', 'Все уровни'];

const emptyForm = {
  name: '',
  directionId: 'running',
  date: '',
  time: '',
  location: '',
  trainerId: '',
  duration: '60 мин',
  level: 'Все уровни',
  spots: 12,
  description: '',
};

type FormState = typeof emptyForm;

export default function AdminTrainings() {
  const trainings = useTrainings();
  const trainers = useTrainers();
  const { registrations } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const field =
    'w-full rounded-sm border border-white/10 bg-primary px-3 py-2.5 text-sm text-white transition-colors placeholder:text-gray-600 focus:border-accent-red focus:outline-none';
  const label = 'mb-1.5 block text-xs uppercase tracking-wider text-gray-400';

  const sorted = useMemo(
    () => [...trainings].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [trainings]
  );

  const closeForm = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (id: string) => {
    const t = trainings.find((x) => x.id === id);
    if (!t) return;
    setForm({
      name: t.name,
      directionId: t.directionId,
      date: t.date,
      time: t.time,
      location: t.location,
      trainerId: t.trainerId,
      duration: t.duration,
      level: t.level,
      spots: t.spotsAvailable,
      description: t.description,
    });
    setEditingId(id);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const direction = directions.find((d) => d.id === form.directionId);
    const trainer = trainers.find((t) => t.id === form.trainerId);

    const patch = {
      name: form.name.trim(),
      directionId: form.directionId,
      directionName: direction?.name ?? 'Тренировка',
      date: form.date,
      time: form.time,
      location: form.location.trim(),
      trainer: trainer?.name ?? 'Не назначен',
      trainerId: form.trainerId,
      duration: form.duration,
      level: form.level,
      spotsAvailable: Number(form.spots) || 0,
      description: form.description.trim(),
      equipment: direction?.requiredEquipment ?? [],
      image: direction?.imageUrl ?? '',
    };

    if (editingId) {
      updateTraining(editingId, patch);
      toast(`Тренировка обновлена: «${patch.name}»`);
    } else {
      addTraining({ id: 'training-' + Date.now(), ...patch });
      toast(`Тренировка добавлена: «${patch.name}»`);
    }

    closeForm();
  };

  const remove = (id: string, name: string) => {
    removeTraining(id);
    // Убираем «висящие» записи на удалённую тренировку
    saveRegistrations(getRegistrations().filter((r) => r.trainingId !== id));
    setConfirmId(null);
    toast(`Тренировка удалена: «${name}»`, 'info');
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-white">Расписание</h1>
          <p className="text-sm text-gray-400">
            {trainings.length} тренировок · изменения сразу видны на сайте
          </p>
        </div>
        <Button
          onClick={() => (open ? closeForm() : setOpen(true))}
          variant={open ? 'outline' : 'primary'}
          size="sm"
        >
          {open ? (
            <>
              <X className="mr-1.5 h-4 w-4" /> Отмена
            </>
          ) : (
            <>
              <Plus className="mr-1.5 h-4 w-4" /> Новая тренировка
            </>
          )}
        </Button>
      </div>

      {open && (
        <form onSubmit={submit} className="mb-6 space-y-4 rounded-sm border border-white/10 bg-surface p-6">
          <h2 className="font-semibold text-white">
            {editingId ? 'Редактирование тренировки' : 'Новая тренировка'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="t-name" className={label}>Название</label>
              <input id="t-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} placeholder="Утренний бег в парке" />
            </div>
            <div>
              <label htmlFor="t-direction" className={label}>Направление</label>
              <select id="t-direction" value={form.directionId} onChange={(e) => setForm({ ...form, directionId: e.target.value })} className={field}>
                {directions.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="t-trainer" className={label}>Тренер</label>
              <select id="t-trainer" value={form.trainerId} onChange={(e) => setForm({ ...form, trainerId: e.target.value })} className={field}>
                <option value="">Не назначен</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="t-date" className={label}>Дата</label>
              <input id="t-date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={field} />
            </div>
            <div>
              <label htmlFor="t-time" className={label}>Время</label>
              <input id="t-time" type="time" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={field} />
            </div>
            <div>
              <label htmlFor="t-location" className={label}>Место встречи</label>
              <input id="t-location" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={field} placeholder="Парк, главный вход" />
            </div>
            <div>
              <label htmlFor="t-duration" className={label}>Продолжительность</label>
              <input id="t-duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={field} placeholder="60 мин" />
            </div>
            <div>
              <label htmlFor="t-level" className={label}>Уровень</label>
              <select id="t-level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className={field}>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="t-spots" className={label}>Мест всего</label>
              <input id="t-spots" type="number" min={1} max={100} value={form.spots} onChange={(e) => setForm({ ...form, spots: Number(e.target.value) })} className={field} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="t-desc" className={label}>Описание</label>
              <textarea id="t-desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${field} resize-none`} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" size="sm">
              {editingId ? 'Сохранить изменения' : 'Добавить тренировку'}
            </Button>
            {editingId && (
              <button type="button" onClick={closeForm} className="text-xs text-gray-400 hover:text-white">
                Отменить редактирование
              </button>
            )}
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-sm border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr className="border-b border-white/10">
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400">Тренировка</th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium text-gray-400 sm:table-cell">Дата</th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium text-gray-400 md:table-cell">Место</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400">Записей</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-400">
                <span className="sr-only">Действия</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t) => {
              const booked = registrations.filter(
                (r) => r.trainingId === t.id && r.status === 'confirmed'
              ).length;
              const waiting = registrations.filter(
                (r) => r.trainingId === t.id && r.status === 'waitlist'
              ).length;
              const done = isPastDate(t.date);
              return (
                <tr key={t.id} className="border-b border-white/5 bg-surface/50 transition-colors last:border-0 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">
                      {t.name}
                      {done && <span className="ml-2 text-[10px] uppercase text-gray-500">завершена</span>}
                    </p>
                    <p className="text-xs text-gray-500">{t.directionName} · {t.trainer}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-gray-400 sm:table-cell">
                    {formatDate(t.date, false)}
                    <span className="ml-1 text-gray-600">{t.time}</span>
                  </td>
                  <td className="hidden px-4 py-3 text-gray-400 md:table-cell">{t.location}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-sm px-2 py-0.5 text-xs font-semibold ${
                        booked >= t.spotsAvailable
                          ? 'bg-red-500/15 text-red-400'
                          : 'bg-blue-500/15 text-blue-400'
                      }`}
                      title={waiting > 0 ? `В листе ожидания: ${waiting}` : undefined}
                    >
                      {booked}/{t.spotsAvailable}
                    </span>
                    {waiting > 0 && (
                      <span className="ml-1 text-[10px] text-yellow-400">+{waiting}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {confirmId === t.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[11px] text-gray-400">Удалить?</span>
                        <button
                          onClick={() => remove(t.id, t.name)}
                          className="rounded-sm bg-red-500/20 px-2 py-1 text-[11px] font-semibold text-red-300 hover:bg-red-500/30"
                        >
                          Да
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="rounded-sm px-2 py-1 text-[11px] text-gray-400 hover:text-white"
                        >
                          Нет
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => startEdit(t.id)}
                          className="text-gray-500 transition-colors hover:text-accent-blue"
                          aria-label={`Редактировать ${t.name}`}
                          title="Редактировать"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmId(t.id)}
                          className="text-gray-500 transition-colors hover:text-red-400"
                          aria-label={`Удалить ${t.name}`}
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
