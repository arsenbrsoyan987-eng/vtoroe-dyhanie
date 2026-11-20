import { useMemo, useState } from 'react';
import {
  cardsStore,
  sectionsStore,
  useCards,
  useSections,
} from '../../store/sectionsStore';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import { Plus, Trash2, Pencil, X, ChevronRight } from 'lucide-react';
import { fieldClass, labelClass } from '../../components/cabinet/ui';
import { countNoun } from '../../lib/plural';

const emptyForm = {
  slug: '',
  title: '',
  subtitle: '',
  icon: '',
  description: '',
  published: true,
};

type FormState = {
  slug: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  published: boolean;
};

export default function AdminSections() {
  const all = useSections();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [viewingSection, setViewingSection] = useState<string | null>(null);

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
      subtitle: r.subtitle,
      icon: r.icon,
      description: r.description ?? '',
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
        await sectionsStore.update(editingId, { ...form });
        toast('Раздел обновлён');
      } else {
        await sectionsStore.create(form);
        toast('Раздел добавлен');
      }
      closeForm();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Не удалось сохранить', 'error');
    }
  };

  const remove = async (id: string, title: string) => {
    try {
      await sectionsStore.remove(id);
      toast(`Раздел «${title}» удалён`, 'info');
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
          <h1 className="mb-1 display text-2xl text-ink">Разделы</h1>
          <p className="text-sm text-graphite">
            {countNoun(sorted.length, 'раздел', 'раздела', 'разделов')} · создайте раздел, чтобы добавить его на сайт
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
            <><Plus className="mr-1.5 h-4 w-4" /> Новый раздел</>
          )}
        </Button>
      </div>

      {open && (
        <form onSubmit={submit} className="mb-6 space-y-4 rounded-2xl border border-line bg-paper shadow-card p-6">
          <h2 className="font-semibold text-ink">
            {editingId ? 'Редактирование раздела' : 'Новый раздел'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="s-slug" className={labelClass}>Адрес (slug)</label>
              <input
                id="s-slug"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className={fieldClass}
                placeholder="meropriyatiya"
              />
            </div>
            <div>
              <label htmlFor="s-title" className={labelClass}>Заголовок</label>
              <input
                id="s-title"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={fieldClass}
                placeholder="Мероприятия клуба"
              />
            </div>
            <div>
              <label htmlFor="s-subtitle" className={labelClass}>Подзаголовок</label>
              <input
                id="s-subtitle"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className={fieldClass}
                placeholder="Календарь событий"
              />
            </div>
            <div>
              <label htmlFor="s-icon" className={labelClass}>Иконка (эмодзи)</label>
              <input
                id="s-icon"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className={fieldClass}
                placeholder="🏆"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="s-desc" className={labelClass}>Описание раздела (вводный текст)</label>
              <textarea
                id="s-desc"
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`${fieldClass} resize-none`}
                placeholder="Краткое описание раздела, которое показывается перед карточками на странице"
              />
            </div>
            <div>
              <label htmlFor="s-published" className={labelClass}>Опубликовать</label>
              <select
                id="s-published"
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
                  <div className="flex items-center gap-2">
                    {r.icon && <span className="text-lg">{r.icon}</span>}
                    <p className="font-medium text-ink">{r.title}</p>
                  </div>
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
                    <button
                      onClick={() => setViewingSection(r.id)}
                      className="text-graphite transition-colors hover:text-navy"
                      title="Карточки раздела"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
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

      {viewingSection && (
        <AdminCards
          sectionId={viewingSection}
          onClose={() => setViewingSection(null)}
        />
      )}
    </div>
  );
}

// ====== Карточки раздела (вложенный компонент) ======
function AdminCards({ sectionId, onClose }: { sectionId: string; onClose: () => void }) {
  const all = useCards(sectionId);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
  });

  const sorted = useMemo(
    () => [...all].sort((a, b) => a.sort_order - b.sort_order),
    [all]
  );

  const openCreate = () => {
    setForm({ title: '', description: '', image: '', link: '' });
    setEditingId(null);
    setOpen(true);
  };

  const startEdit = (id: string) => {
    const r = all.find((x) => x.id === id);
    if (!r) return;
    setForm({
      title: r.title,
      description: r.description,
      image: r.image,
      link: r.link,
    });
    setEditingId(id);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await cardsStore.update(editingId, { ...form, section_id: sectionId });
        toast('Карточка обновлена');
      } else {
        await cardsStore.create({ ...form, section_id: sectionId });
        toast('Карточка добавлена');
      }
      closeForm();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Не удалось сохранить', 'error');
    }
  };

  const remove = async (id: string, title: string) => {
    try {
      await cardsStore.remove(id);
      toast(`Карточка «${title}» удалена`, 'info');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Не удалось удалить', 'error');
    }
  };

  const closeForm = () => {
    setOpen(false);
    setEditingId(null);
    setForm({ title: '', description: '', image: '', link: '' });
  };

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink">Карточки раздела</h2>
        <Button onClick={onClose} variant="outline" size="sm">
          <X className="mr-1.5 h-4 w-4" /> Назад к разделам
        </Button>
      </div>

      <Button onClick={openCreate} variant="primary" size="sm" className="mb-4">
        <Plus className="mr-1.5 h-4 w-4" /> Новая карточка
      </Button>

      {open && (
        <form onSubmit={submit} className="mb-6 space-y-4 rounded-2xl border border-line bg-paper shadow-card p-6">
          <h3 className="font-semibold text-ink">
            {editingId ? 'Редактирование карточки' : 'Новая карточка'}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="c-title" className={labelClass}>Заголовок</label>
              <input
                id="c-title"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={fieldClass}
                placeholder="Итоги сезона 2025"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="c-desc" className={labelClass}>Описание</label>
              <textarea
                id="c-desc"
                rows={10}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`${fieldClass} resize-y leading-relaxed`}
                placeholder={'Обычный текст: пустая строка разделяет абзацы, строки с «- » соберут список. Можно вставить и готовый HTML.'}
              />
              <p className="mt-1.5 text-[11px] leading-relaxed text-graphite">
                Этот текст становится страницей карточки: в списке раздела показывается только
                начало, полностью — при переходе по карточке.
              </p>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="c-image" className={labelClass}>URL фото</label>
              <input
                id="c-image"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className={fieldClass}
                placeholder="https://..."
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="c-link" className={labelClass}>Ссылка (опционально)</label>
              <input
                id="c-link"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className={fieldClass}
                placeholder="https://..."
              />
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
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium text-graphite sm:table-cell">Фото</th>
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
                  <p className="text-xs text-graphite line-clamp-1">{r.description}</p>
                </td>
                <td className="hidden px-4 py-3">
                  {r.image && <img src={r.image} alt="" className="h-8 w-8 rounded-xl object-cover" />}
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
