import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { newsStore, useNews } from '../../store/newsStore';
import { todayISO } from '../../lib/date';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/ui/ImageUpload';
import { ExternalLink, Pencil, Plus, Trash2, X } from 'lucide-react';

const CATEGORIES = ['События', 'Результаты', 'Клуб', 'Тренировки', 'Анонс'];

const emptyForm = {
  title: '',
  summary: '',
  content: '',
  date: todayISO(),
  category: 'Клуб',
  image: '',
};

export default function AdminNews() {
  const items = useNews();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const field =
    'w-full rounded-sm border border-white/10 bg-primary px-3 py-2.5 text-sm text-white transition-colors placeholder:text-gray-600 focus:border-accent-red focus:outline-none';
  const label = 'mb-1.5 block text-xs uppercase tracking-wider text-gray-400';

  const sorted = useMemo(
    () => [...items].sort((a, b) => b.date.localeCompare(a.date)),
    [items]
  );

  const closeForm = () => {
    setOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm, date: todayISO() });
  };

  const startCreate = () => {
    setForm({ ...emptyForm, date: todayISO() });
    setEditingId(null);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEdit = (id: string) => {
    const item = items.find((n) => n.id === id);
    if (!item) return;
    setForm({
      title: item.title,
      summary: item.summary,
      content: item.content,
      date: item.date,
      category: item.category,
      image: item.image,
    });
    setEditingId(id);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) {
      toast('Укажите заголовок', 'error');
      return;
    }

    const payload = {
      title,
      summary: form.summary.trim(),
      content: form.content.trim(),
      date: form.date,
      category: form.category,
      image:
        form.image ||
        '/vtoroe-dyhanie/images/about.svg',
    };

    if (editingId) {
      newsStore.update(editingId, payload);
      toast('Новость обновлена');
    } else {
      newsStore.add({ id: 'news-' + Date.now(), ...payload });
      toast(`Новость опубликована: «${title}»`);
    }
    closeForm();
  };

  const remove = (id: string, title: string) => {
    newsStore.remove(id);
    setConfirmId(null);
    toast(`Новость удалена: «${title}»`, 'info');
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-white">Новости</h1>
          <p className="text-sm text-gray-400">
            {items.length} публикаций · сразу появляются на сайте
          </p>
        </div>
        <Button onClick={() => (open ? closeForm() : startCreate())} variant={open ? 'outline' : 'primary'} size="sm">
          {open ? (
            <>
              <X className="mr-1.5 h-4 w-4" /> Отмена
            </>
          ) : (
            <>
              <Plus className="mr-1.5 h-4 w-4" /> Новая новость
            </>
          )}
        </Button>
      </div>

      {open && (
        <form onSubmit={submit} className="mb-6 space-y-4 rounded-sm border border-white/10 bg-surface p-6">
          <h2 className="font-semibold text-white">
            {editingId ? 'Редактирование новости' : 'Новая новость'}
          </h2>

          <div>
            <label htmlFor="n-title" className={label}>Заголовок *</label>
            <input
              id="n-title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={field}
              placeholder="Открыта запись на осенний поход"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="n-date" className={label}>Дата</label>
              <input
                id="n-date"
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={field}
              />
            </div>
            <div>
              <label htmlFor="n-cat" className={label}>Категория</label>
              <select
                id="n-cat"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={field}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="n-summary" className={label}>Краткое описание (для карточки)</label>
            <textarea
              id="n-summary"
              rows={2}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className={`${field} resize-none`}
              placeholder="Одно-два предложения, которые видно в списке новостей"
            />
          </div>

          <div>
            <label htmlFor="n-content" className={label}>Полный текст</label>
            <textarea
              id="n-content"
              rows={8}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className={`${field} resize-y`}
              placeholder="Текст новости. Пустая строка между абзацами сохраняется."
            />
          </div>

          <ImageUpload
            value={form.image}
            onChange={(image) => setForm({ ...form, image })}
            label="Обложка новости"
          />

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" size="sm">
              {editingId ? 'Сохранить' : 'Опубликовать'}
            </Button>
            <button type="button" onClick={closeForm} className="text-xs text-gray-400 hover:text-white">
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {sorted.map((n) => (
          <div key={n.id} className="flex flex-col gap-3 rounded-sm border border-white/10 bg-surface p-4 sm:flex-row sm:items-center">
            {n.image && (
              <img
                src={n.image}
                alt=""
                className="h-16 w-24 shrink-0 rounded-sm object-cover"
                loading="lazy"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="rounded-sm bg-accent-red/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-red">
                  {n.category}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(`${n.date}T12:00:00`).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <p className="truncate font-medium text-white">{n.title}</p>
              <p className="truncate text-xs text-gray-500">{n.summary || '—'}</p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Link
                to={`/news/${n.id}`}
                className="text-gray-500 transition-colors hover:text-accent-blue"
                title="Открыть на сайте"
                aria-label={`Открыть ${n.title}`}
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
              <button
                onClick={() => startEdit(n.id)}
                className="text-gray-500 transition-colors hover:text-accent-blue"
                aria-label={`Редактировать ${n.title}`}
                title="Редактировать"
              >
                <Pencil className="h-4 w-4" />
              </button>
              {confirmId === n.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">Удалить?</span>
                  <button
                    onClick={() => remove(n.id, n.title)}
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
                  onClick={() => setConfirmId(n.id)}
                  className="text-gray-500 transition-colors hover:text-red-400"
                  aria-label={`Удалить ${n.title}`}
                  title="Удалить"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {sorted.length === 0 && (
          <div className="rounded-sm border border-white/10 bg-surface p-8 text-center text-sm text-gray-400">
            Новостей пока нет — создайте первую.
          </div>
        )}
      </div>
    </div>
  );
}
