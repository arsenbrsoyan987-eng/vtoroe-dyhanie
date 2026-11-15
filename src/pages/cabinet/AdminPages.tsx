import { useMemo, useState } from 'react';
import { pagesStore, usePages } from '../../store/pagesStore';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import { Plus, Trash2, Pencil, X } from 'lucide-react';

const emptyForm = {
  slug: '',
  title: '',
  heroImage: '',
  content: '',
  published: true,
};

type FormState = {
  slug: string;
  title: string;
  heroImage: string;
  content: string;
  published: boolean;
};

export default function AdminPages() {
  const all = usePages();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const sorted = useMemo(
    () => [...all].sort((a, b) => a.sort_order - b.sort_order),
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
      slug: r.slug,
      title: r.title,
      heroImage: r.heroImage ?? '',
      content: r.content,
      published: r.published,
    });
    setEditingId(id);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await pagesStore.update(editingId, { ...form });
        toast('Страница обновлена');
      } else {
        await pagesStore.create(form);
        toast('Страница добавлена');
      }
      closeForm();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Не удалось сохранить', 'error');
    }
  };

  const remove = async (id: string, title: string) => {
    try {
      await pagesStore.remove(id);
      toast(`Страница «${title}» удалена`, 'info');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Не удалось удалить', 'error');
    }
  };

  const closeForm = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-white">Страницы</h1>
          <p className="text-sm text-gray-400">
            {sorted.length} страниц · изменения сразу видны на сайте
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
            <><Plus className="mr-1.5 h-4 w-4" /> Новая страница</>
          )}
        </Button>
      </div>

      {open && (
        <form onSubmit={submit} className="mb-6 space-y-4 rounded-sm border border-white/10 bg-surface p-6">
          <h2 className="font-semibold text-white">
            {editingId ? 'Редактирование страницы' : 'Новая страница'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="p-slug" className={label}>Адрес (slug)</label>
              <input
                id="p-slug"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className={field}
                placeholder="about"
              />
            </div>
            <div>
              <label htmlFor="p-title" className={label}>Заголовок</label>
              <input
                id="p-title"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={field}
                placeholder="О школе"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="p-hero" className={label}>URL обложки (опционально)</label>
              <input
                id="p-hero"
                value={form.heroImage}
                onChange={(e) => setForm({ ...form, heroImage: e.target.value })}
                className={field}
                placeholder="https://..."
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="p-content" className={label}>Содержимое</label>
              <textarea
                id="p-content"
                rows={6}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className={`${field} resize-none`}
                placeholder="Текст страницы (поддерживает HTML)"
              />
            </div>
            <div>
              <label htmlFor="p-published" className={label}>Опубликовать</label>
              <select
                id="p-published"
                value={form.published ? 'true' : 'false'}
                onChange={(e) => setForm({ ...form, published: e.target.value === 'true' })}
                className={field}
              >
                <option value="true">Да</option>
                <option value="false">Нет</option>
              </select>
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
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400">Заголовок</th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium text-gray-400 sm:table-cell">Адрес</th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium text-gray-400 md:table-cell">Статус</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-400">
                <span className="sr-only">Действия</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} className="border-b border-white/5 bg-surface/50 transition-colors last:border-0 hover:bg-white/5">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{r.title}</p>
                  <p className="text-xs text-gray-500">/{r.slug}</p>
                </td>
                <td className="hidden px-4 py-3 text-gray-400 sm:table-cell">/{r.slug}</td>
                <td className="hidden px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm ${
                    r.published
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {r.published ? 'Опубликовано' : 'Черновик'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => startEdit(r.id)} className="text-gray-500 transition-colors hover:text-accent-blue" title="Редактировать">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { if (window.confirm(`Удалить «${r.title}»?`)) remove(r.id, r.title); }}
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
