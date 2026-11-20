import { useMemo, useState } from 'react';
import { pagesStore, usePages } from '../../store/pagesStore';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { fieldClass, labelClass } from '../../components/cabinet/ui';
import { countNoun } from '../../lib/plural';

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
          <h1 className="mb-1 display text-2xl text-ink">Страницы</h1>
          <p className="text-sm text-graphite">
            {countNoun(sorted.length, 'страница', 'страницы', 'страниц')} · изменения сразу видны на сайте
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
        <form onSubmit={submit} className="mb-6 space-y-4 rounded-2xl border border-line bg-paper shadow-card p-6">
          <h2 className="font-semibold text-ink">
            {editingId ? 'Редактирование страницы' : 'Новая страница'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="p-slug" className={labelClass}>Адрес (slug)</label>
              <input
                id="p-slug"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className={fieldClass}
                placeholder="about"
              />
            </div>
            <div>
              <label htmlFor="p-title" className={labelClass}>Заголовок</label>
              <input
                id="p-title"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={fieldClass}
                placeholder="О школе"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="p-hero" className={labelClass}>URL обложки (опционально)</label>
              <input
                id="p-hero"
                value={form.heroImage}
                onChange={(e) => setForm({ ...form, heroImage: e.target.value })}
                className={fieldClass}
                placeholder="https://..."
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="p-content" className={labelClass}>Содержимое</label>
              <textarea
                id="p-content"
                rows={6}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className={`${fieldClass} resize-none`}
                placeholder="Текст страницы (поддерживает HTML)"
              />
            </div>
            <div>
              <label htmlFor="p-published" className={labelClass}>Опубликовать</label>
              <select
                id="p-published"
                value={form.published ? 'true' : 'false'}
                onChange={(e) => setForm({ ...form, published: e.target.value === 'true' })}
                className={fieldClass}
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
              <button type="button" onClick={closeForm} className="text-xs text-graphite hover:text-ink">
                Отменить
              </button>
            )}
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-line">
        <table className="w-full text-sm">
          <thead className="bg-paper">
            <tr className="border-b border-line">
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-graphite">Заголовок</th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium text-graphite sm:table-cell">Адрес</th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium text-graphite md:table-cell">Статус</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-graphite">
                <span className="sr-only">Действия</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id} className="border-b border-line bg-mist transition-colors last:border-0 hover:bg-mist">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{r.title}</p>
                  <p className="text-xs text-graphite">/{r.slug}</p>
                </td>
                <td className="hidden px-4 py-3 text-graphite sm:table-cell">/{r.slug}</td>
                <td className="hidden px-4 py-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-xl ${
                    r.published
                      ? 'bg-emerald-500/10 text-emerald-700'
                      : 'bg-mist text-graphite'
                  }`}>
                    {r.published ? 'Опубликовано' : 'Черновик'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => startEdit(r.id)} className="text-graphite transition-colors hover:text-navy" title="Редактировать">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { if (window.confirm(`Удалить «${r.title}»?`)) remove(r.id, r.title); }}
                      className="text-graphite transition-colors hover:text-brand"
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
