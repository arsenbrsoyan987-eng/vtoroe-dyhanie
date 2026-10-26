import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { testimonialsStore, useTestimonials } from '../../store/testimonialsStore';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/ui/ImageUpload';
import { Pencil, Plus, Trash2, X } from 'lucide-react';

const emptyForm = {
  name: '',
  text: '',
  achievement: '',
  direction: '',
  photo: '',
};

export default function AdminTestimonials() {
  const items = useTestimonials();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const field =
    'w-full rounded-sm border border-white/10 bg-primary px-3 py-2.5 text-sm text-white transition-colors placeholder:text-gray-600 focus:border-accent-red focus:outline-none';
  const label = 'mb-1.5 block text-xs uppercase tracking-wider text-gray-400';

  const closeForm = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const startCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEdit = (id: string) => {
    const item = items.find((t) => t.id === id);
    if (!item) return;
    setForm({
      name: item.name,
      text: item.text,
      achievement: item.achievement,
      direction: item.direction,
      photo: item.photo,
    });
    setEditingId(id);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name || !form.text.trim()) {
      toast('Нужны имя и текст отзыва', 'error');
      return;
    }

    const payload = {
      name,
      text: form.text.trim(),
      achievement: form.achievement.trim(),
      direction: form.direction.trim(),
      photo: form.photo,
    };

    if (editingId) {
      testimonialsStore.update(editingId, payload);
      toast('Отзыв обновлён');
    } else {
      testimonialsStore.add({ id: 'testimonial-' + Date.now(), ...payload });
      toast(`Отзыв добавлен: ${name}`);
    }
    closeForm();
  };

  const remove = (id: string, name: string) => {
    testimonialsStore.remove(id);
    setConfirmId(null);
    toast(`Отзыв удалён: ${name}`, 'info');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-white">Отзывы</h1>
          <p className="text-sm text-gray-400">
            {items.length} отзывов · показываются на главной странице
          </p>
        </div>
        <Button onClick={() => (open ? closeForm() : startCreate())} variant={open ? 'outline' : 'primary'} size="sm">
          {open ? (
            <>
              <X className="mr-1.5 h-4 w-4" /> Отмена
            </>
          ) : (
            <>
              <Plus className="mr-1.5 h-4 w-4" /> Добавить отзыв
            </>
          )}
        </Button>
      </div>

      {open && (
        <form onSubmit={submit} className="mb-6 space-y-4 rounded-sm border border-white/10 bg-surface p-6">
          <h2 className="font-semibold text-white">
            {editingId ? 'Редактирование отзыва' : 'Новый отзыв'}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="t-name" className={label}>Имя *</label>
              <input
                id="t-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={field}
                placeholder="Мария Соколова"
              />
            </div>
            <div>
              <label htmlFor="t-dir" className={label}>Направление</label>
              <input
                id="t-dir"
                value={form.direction}
                onChange={(e) => setForm({ ...form, direction: e.target.value })}
                className={field}
                placeholder="Бег"
              />
            </div>
          </div>

          <div>
            <label htmlFor="t-text" className={label}>Текст отзыва *</label>
            <textarea
              id="t-text"
              required
              rows={4}
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              className={`${field} resize-none`}
              placeholder="Что даёт клуб, как проходят тренировки, за что благодарны"
            />
          </div>

          <div>
            <label htmlFor="t-ach" className={label}>Достижение</label>
            <input
              id="t-ach"
              value={form.achievement}
              onChange={(e) => setForm({ ...form, achievement: e.target.value })}
              className={field}
              placeholder="Первый марафон — 3:58"
            />
          </div>

          <ImageUpload
            value={form.photo}
            onChange={(photo) => setForm({ ...form, photo })}
            label="Фото участника"
            circle
            fallback={form.name.trim().charAt(0).toUpperCase() || '?'}
          />

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" size="sm">
              {editingId ? 'Сохранить' : 'Добавить'}
            </Button>
            <button type="button" onClick={closeForm} className="text-xs text-gray-400 hover:text-white">
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {items.map((t) => (
          <div key={t.id} className="flex flex-col gap-3 rounded-sm border border-white/10 bg-surface p-4 sm:flex-row sm:items-start">
            {t.photo ? (
              <img src={t.photo} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-red/15 font-bold text-accent-red">
                {t.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="font-medium text-white">
                {t.name}
                {t.direction && <span className="ml-2 text-xs text-accent-red">{t.direction}</span>}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-gray-400">{t.text}</p>
              {t.achievement && (
                <p className="mt-1 text-xs text-gray-600">🏆 {t.achievement}</p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={() => startEdit(t.id)}
                className="text-gray-500 transition-colors hover:text-accent-blue"
                aria-label={`Редактировать отзыв ${t.name}`}
                title="Редактировать"
              >
                <Pencil className="h-4 w-4" />
              </button>
              {confirmId === t.id ? (
                <div className="flex items-center gap-2">
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
                <button
                  onClick={() => setConfirmId(t.id)}
                  className="text-gray-500 transition-colors hover:text-red-400"
                  aria-label={`Удалить отзыв ${t.name}`}
                  title="Удалить"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="rounded-sm border border-white/10 bg-surface p-8 text-center text-sm text-gray-400">
            Отзывов пока нет — добавьте первый.
          </div>
        )}
      </div>
    </div>
  );
}
