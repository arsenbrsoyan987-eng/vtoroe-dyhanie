import { useMemo, useState } from 'react';
import { routesStore, useRoutes } from '../../store/routesStore';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import { Plus, Trash2, Pencil, X } from 'lucide-react';

const TYPES = [
  { id: 'running', label: 'Бег' },
  { id: 'trail', label: 'Трейл' },
  { id: 'cycling', label: 'Вело' },
  { id: 'hiking', label: 'Поход' },
];

const DIFFICULTIES = [
  { id: 'easy', label: 'Лёгкий' },
  { id: 'medium', label: 'Средний' },
  { id: 'hard', label: 'Сложный' },
  { id: 'extreme', label: 'Экстремальный' },
];

type FormState = {
  name: string;
  type: 'running' | 'trail' | 'cycling' | 'hiking';
  image: string;
  distance: string;
  elevation: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  description: string;
  startPoint: string;
  mapUrl: string;
  gpxUrl: string;
};

const emptyForm: FormState = {
  name: '',
  type: 'running',
  image: '',
  distance: '',
  elevation: '',
  duration: '',
  difficulty: 'easy',
  description: '',
  startPoint: '',
  mapUrl: '',
  gpxUrl: '',
};

export default function AdminRoutes() {
  const all = useRoutes();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const sorted = useMemo(
    () => [...all].sort((a, b) => (a as any).sort_order - (b as any).sort_order),
    [all]
  );

  const field =
    'w-full rounded-sm border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white transition-colors placeholder:text-gray-600 focus:border-accent-red focus:outline-none';
  const label = 'mb-1.5 block text-xs uppercase tracking-wider text-gray-400';

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpen(true);
  };

  const startEdit = (id: string) => {
    const r = all.find((x) => x.id === id);
    if (!r) return;
    setForm({
      name: r.name,
      type: r.type,
      image: r.image,
      distance: r.distance,
      elevation: r.elevation,
      duration: r.duration,
      difficulty: r.difficulty,
      description: r.description,
      startPoint: r.startPoint,
      mapUrl: r.mapUrl ?? '',
      gpxUrl: r.gpxUrl ?? '',
    });
    setEditingId(id);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await routesStore.update(editingId, { ...form });
        toast('Маршрут обновлён');
      } else {
        await routesStore.create(form);
        toast('Маршрут добавлен');
      }
      closeForm();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Не удалось сохранить', 'error');
    }
  };

  const remove = async (id: string, name: string) => {
    try {
      await routesStore.remove(id);
      toast(`Маршрут «${name}» удалён`, 'info');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Не удалось удалить', 'error');
    }
  };

  const closeForm = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const diffLabels: Record<string, string> = Object.fromEntries(DIFFICULTIES.map((d) => [d.id, d.label]));
  const diffColors: Record<string, string> = {
    easy: 'bg-green-500/20 text-green-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    hard: 'bg-orange-500/20 text-orange-400',
    extreme: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-white">Маршруты</h1>
          <p className="text-sm text-gray-400">
            {sorted.length} маршрутов · изменения сразу видны на странице
          </p>
        </div>
        <Button
          onClick={() => (open ? closeForm() : openCreate())}
          variant={open ? 'outline' : 'primary'}
          size="sm"
        >
          {open ? (
            <><X className="mr-1.5 h-4 w-4" /> Отмена</>
          ) : (
            <><Plus className="mr-1.5 h-4 w-4" /> Новый маршрут</>
          )}
        </Button>
      </div>

      {open && (
        <form onSubmit={submit} className="mb-6 space-y-4 rounded-sm border border-white/10 bg-surface p-6">
          <h2 className="font-semibold text-white">
            {editingId ? 'Редактирование маршрута' : 'Новый маршрут'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="r-name" className={label}>Название</label>
              <input id="r-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} placeholder="Парковая петля" />
            </div>
            <div>
              <label htmlFor="r-type" className={label}>Тип</label>
              <select id="r-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as FormState['type'] })} className={field}>
                {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="r-difficulty" className={label}>Сложность</label>
              <select id="r-difficulty" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as FormState['difficulty'] })} className={field}>
                {DIFFICULTIES.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="r-desc" className={label}>Описание</label>
              <textarea id="r-desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${field} resize-none`} />
            </div>
            <div>
              <label htmlFor="r-distance" className={label}>Дистанция</label>
              <input id="r-distance" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} className={field} placeholder="~5 км" />
            </div>
            <div>
              <label htmlFor="r-elevation" className={label}>Набор высоты</label>
              <input id="r-elevation" value={form.elevation} onChange={(e) => setForm({ ...form, elevation: e.target.value })} className={field} placeholder="Ровный" />
            </div>
            <div>
              <label htmlFor="r-duration" className={label}>Время</label>
              <input id="r-duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={field} placeholder="25–35 мин" />
            </div>
            <div>
              <label htmlFor="r-start" className={label}>Точка старта</label>
              <input id="r-start" value={form.startPoint} onChange={(e) => setForm({ ...form, startPoint: e.target.value })} className={field} placeholder="Парк, главный вход" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="r-image" className={label}>URL фото</label>
              <input id="r-image" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={field} placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="r-map" className={label}>URL карты (опционально)</label>
              <input id="r-map" value={form.mapUrl} onChange={(e) => setForm({ ...form, mapUrl: e.target.value })} className={field} placeholder="https://maps.app.goo.gl/..." />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="r-gpx" className={label}>URL GPX (опционально)</label>
              <input id="r-gpx" value={form.gpxUrl} onChange={(e) => setForm({ ...form, gpxUrl: e.target.value })} className={field} placeholder="https://..." />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" size="sm">
              {editingId ? 'Сохранить' : 'Добавить'}
            </Button>
            {editingId && (
              <button type="button" onClick={closeForm} className="text-xs text-gray-400 hover:text-white">
                Отменить
              </button>
            )}
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-sm border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr className="border-b border-white/10">
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400">Маршрут</th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium text-gray-400 sm:table-cell">Тип</th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium text-gray-400 md:table-cell">Дист.</th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium text-gray-400 lg:table-cell">Время</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-400">
                <span className="sr-only">Действия</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} className="border-b border-white/5 bg-surface/50 transition-colors last:border-0 hover:bg-white/5">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.startPoint}</p>
                </td>
                <td className="hidden px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm ${diffColors[r.difficulty]}`}>
                    {diffLabels[r.difficulty]}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-gray-400 sm:table-cell">{r.distance}</td>
                <td className="hidden px-4 py-3 text-gray-400 lg:table-cell">{r.duration}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => startEdit(r.id)} className="text-gray-500 transition-colors hover:text-accent-blue" title="Редактировать">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { if (window.confirm(`Удалить «${r.name}»?`)) remove(r.id, r.name); }}
                      className="text-gray-500 transition-colors hover:text-red-400"
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
