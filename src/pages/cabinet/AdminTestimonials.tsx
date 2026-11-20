import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { testimonialsStore, useTestimonials } from '../../store/testimonialsStore';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/ui/ImageUpload';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { fieldClass, labelClass } from '../../components/cabinet/ui';
import { countNoun } from '../../lib/plural';

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

  const submit = async (e: React.FormEvent) => {
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
      await testimonialsStore.update(editingId, payload);
      toast('Отзыв обновлён');
    } else {
      await testimonialsStore.add({ id: 'testimonial-' + Date.now(), ...payload });
      toast(`Отзыв добавлен: ${name}`);
    }
    closeForm();
  };

  const remove = async (id: string, name: string) => {
    await testimonialsStore.remove(id);
    setConfirmId(null);
    toast(`Отзыв удалён: ${name}`, 'info');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 display text-2xl text-ink">Отзывы</h1>
          <p className="text-sm text-graphite">
            {countNoun(items.length, 'отзыв', 'отзыва', 'отзывов')} · показываются на главной странице
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
        <form onSubmit={submit} className="mb-6 space-y-4 rounded-2xl border border-line bg-paper shadow-card p-6">
          <h2 className="font-semibold text-ink">
            {editingId ? 'Редактирование отзыва' : 'Новый отзыв'}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="t-name" className={labelClass}>Имя *</label>
              <input
                id="t-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={fieldClass}
                placeholder="Мария Соколова"
              />
            </div>
            <div>
              <label htmlFor="t-dir" className={labelClass}>Направление</label>
              <input
                id="t-dir"
                value={form.direction}
                onChange={(e) => setForm({ ...form, direction: e.target.value })}
                className={fieldClass}
                placeholder="Бег"
              />
            </div>
          </div>

          <div>
            <label htmlFor="t-text" className={labelClass}>Текст отзыва *</label>
            <textarea
              id="t-text"
              required
              rows={4}
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              className={`${fieldClass} resize-none`}
              placeholder="Что даёт школа, как проходят тренировки, за что благодарны"
            />
          </div>

          <div>
            <label htmlFor="t-ach" className={labelClass}>Достижение</label>
            <input
              id="t-ach"
              value={form.achievement}
              onChange={(e) => setForm({ ...form, achievement: e.target.value })}
              className={fieldClass}
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
            <button type="button" onClick={closeForm} className="text-xs text-graphite hover:text-ink">
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {items.map((t) => (
          <div key={t.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-paper shadow-card p-4 sm:flex-row sm:items-start">
            {t.photo ? (
              <img src={t.photo} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand/15 font-bold text-brand">
                {t.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">
                {t.name}
                {t.direction && <span className="ml-2 text-xs text-brand">{t.direction}</span>}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-graphite">{t.text}</p>
              {t.achievement && (
                <p className="mt-1 text-xs text-graphite/70">🏆 {t.achievement}</p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={() => startEdit(t.id)}
                className="text-graphite transition-colors hover:text-navy"
                aria-label={`Редактировать отзыв ${t.name}`}
                title="Редактировать"
              >
                <Pencil className="h-4 w-4" />
              </button>
              {confirmId === t.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-graphite">Удалить?</span>
                  <button
                    onClick={() => remove(t.id, t.name)}
                    className="rounded-xl bg-brand/10 px-2 py-1 text-[11px] font-semibold text-brand hover:bg-brand/15"
                  >
                    Да
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="rounded-xl px-2 py-1 text-[11px] text-graphite hover:text-ink"
                  >
                    Нет
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(t.id)}
                  className="text-graphite transition-colors hover:text-brand"
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
          <div className="rounded-2xl border border-line bg-paper shadow-card p-8 text-center text-sm text-graphite">
            Отзывов пока нет — добавьте первый.
          </div>
        )}
      </div>
    </div>
  );
}
