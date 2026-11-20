import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { addNews, removeNews, updateNews, useNews } from '../../store/newsStore';
import { todayISO } from '../../lib/date';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/ui/ImageUpload';
import { ExternalLink, Pencil, Plus, Trash2, X } from 'lucide-react';
import { fieldClass, labelClass } from '../../components/cabinet/ui';
import { countNoun } from '../../lib/plural';

const CATEGORIES = ['События', 'Результаты', 'Школа', 'Тренировки', 'Анонс'];

const emptyForm = {
  title: '',
  summary: '',
  content: '',
  date: todayISO(),
  category: 'Школа',
  image: '',
};

export default function AdminNews() {
  const items = useNews();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const isAdmin = currentUser?.role === 'admin';
  // Тренер ведёт свои публикации, администратор — все
  const mine = useMemo(
    () => (isAdmin ? items : items.filter((n) => n.authorId === currentUser?.id)),
    [items, isAdmin, currentUser?.id]
  );

  const sorted = useMemo(
    () => [...mine].sort((a, b) => b.date.localeCompare(a.date)),
    [mine]
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

  const submit = async (e: React.FormEvent) => {
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
      image: form.image || '/images/about.svg',
    };

    setBusy(true);
    try {
      if (editingId) {
        await updateNews(editingId, payload);
        toast('Новость обновлена');
      } else {
        await addNews({
          id: 'news-' + Date.now(),
          ...payload,
          ...(currentUser ? { authorId: currentUser.id, authorName: currentUser.name } : {}),
        });
        toast(`Новость опубликована: «${title}»`);
      }
      closeForm();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Не удалось сохранить новость', 'error');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string, title: string) => {
    setBusy(true);
    try {
      await removeNews(id);
      setConfirmId(null);
      toast(`Новость удалена: «${title}»`, 'info');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Не удалось удалить новость', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 display text-2xl text-ink">Новости</h1>
          <p className="text-sm text-graphite">
            {countNoun(sorted.length, 'публикация', 'публикации', 'публикаций')} · сразу появляются на сайте
            {!isAdmin && ' · тренер правит только свои'}
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
        <form onSubmit={submit} className="mb-6 space-y-4 rounded-2xl border border-line bg-paper shadow-card p-6">
          <h2 className="font-semibold text-ink">
            {editingId ? 'Редактирование новости' : 'Новая новость'}
          </h2>

          <div>
            <label htmlFor="n-title" className={labelClass}>Заголовок *</label>
            <input
              id="n-title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={fieldClass}
              placeholder="Открыта запись на осенний поход"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="n-date" className={labelClass}>Дата</label>
              <input
                id="n-date"
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="n-cat" className={labelClass}>Категория</label>
              <select
                id="n-cat"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={fieldClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="n-summary" className={labelClass}>Краткое описание (для карточки)</label>
            <textarea
              id="n-summary"
              rows={2}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className={`${fieldClass} resize-none`}
              placeholder="Одно-два предложения, которые видно в списке новостей"
            />
          </div>

          <div>
            <label htmlFor="n-content" className={labelClass}>Полный текст</label>
            <textarea
              id="n-content"
              rows={8}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className={`${fieldClass} resize-y`}
              placeholder="Текст новости. Пустая строка между абзацами сохраняется."
            />
          </div>

          <ImageUpload
            value={form.image}
            onChange={(image) => setForm({ ...form, image })}
            label="Обложка новости"
          />

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" size="sm" disabled={busy}>
              {editingId ? 'Сохранить' : 'Опубликовать'}
            </Button>
            <button type="button" onClick={closeForm} className="text-xs text-graphite hover:text-ink">
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {sorted.map((n) => (
          <div key={n.id} className="flex flex-col gap-3 rounded-2xl border border-line bg-paper shadow-card p-4 sm:flex-row sm:items-center">
            {n.image && (
              <img
                src={n.image}
                alt=""
                className="h-16 w-24 shrink-0 rounded-xl object-cover"
                loading="lazy"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="rounded-xl bg-brand/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                  {n.category}
                </span>
                <span className="text-xs text-graphite">
                  {new Date(`${n.date}T12:00:00`).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                {isAdmin && n.authorName && (
                  <span className="text-[10px] uppercase tracking-wide text-graphite/70">
                    {n.authorName}
                  </span>
                )}
              </div>
              <p className="truncate font-medium text-ink">{n.title}</p>
              <p className="truncate text-xs text-graphite">{n.summary || '—'}</p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Link
                to={`/news/${n.id}`}
                className="text-graphite transition-colors hover:text-navy"
                title="Открыть на сайте"
                aria-label={`Открыть ${n.title}`}
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
              <button
                onClick={() => startEdit(n.id)}
                className="text-graphite transition-colors hover:text-navy"
                aria-label={`Редактировать ${n.title}`}
                title="Редактировать"
              >
                <Pencil className="h-4 w-4" />
              </button>
              {confirmId === n.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-graphite">Удалить?</span>
                  <button
                    onClick={() => void remove(n.id, n.title)}
                    disabled={busy}
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
                  onClick={() => setConfirmId(n.id)}
                  className="text-graphite transition-colors hover:text-brand"
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
          <div className="rounded-2xl border border-line bg-paper shadow-card p-8 text-center text-sm text-graphite">
            Новостей пока нет — создайте первую.
          </div>
        )}
      </div>
    </div>
  );
}