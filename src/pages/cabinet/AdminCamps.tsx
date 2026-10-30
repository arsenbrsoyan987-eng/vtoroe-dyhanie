import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { addCamp, removeCamp, updateCamp, useCamps } from '../../store/campsStore';
import { formatDate, todayISO } from '../../lib/date';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/ui/ImageUpload';
import { ExternalLink, Pencil, Plus, Trash2, X } from 'lucide-react';
import type { Camp } from '../../types';

const emptyForm = {
  name: '',
  location: '',
  startDate: todayISO(),
  endDate: '',
  description: '',
  fullDescription: '',
  price: '',
  program: '',
  includes: '',
  image: '',
  images: '',
  registrationOpen: true,
  contact: '',
  published: true,
};

type FormState = typeof emptyForm;

/** Поля-списки вводятся построчно: одна строка — один пункт */
function toLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function AdminCamps() {
  const camps = useCamps();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const field =
    'w-full rounded-sm border border-white/10 bg-primary px-3 py-2.5 text-sm text-white transition-colors placeholder:text-gray-600 focus:border-accent-red focus:outline-none';
  const label = 'mb-1.5 block text-xs uppercase tracking-wider text-gray-400';

  const sorted = useMemo(
    () => [...camps].sort((a, b) => b.startDate.localeCompare(a.startDate)),
    [camps]
  );

  const closeForm = () => {
    setOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm, startDate: todayISO() });
  };

  const startCreate = () => {
    setForm({ ...emptyForm, startDate: todayISO() });
    setEditingId(null);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEdit = (camp: Camp) => {
    setForm({
      name: camp.name,
      location: camp.location,
      startDate: camp.startDate,
      endDate: camp.endDate ?? '',
      description: camp.description,
      fullDescription: camp.fullDescription,
      price: camp.price,
      program: camp.program.join('\n'),
      includes: camp.includes.join('\n'),
      image: camp.image,
      images: camp.images.join('\n'),
      registrationOpen: camp.registrationOpen,
      contact: camp.contact,
      published: camp.published,
    });
    setEditingId(camp.id);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      toast('Укажите название кэмпа', 'error');
      return;
    }
    if (form.endDate && form.endDate < form.startDate) {
      toast('Дата окончания раньше начала', 'error');
      return;
    }

    const payload = {
      name,
      location: form.location.trim(),
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      description: form.description.trim(),
      fullDescription: form.fullDescription.trim(),
      price: form.price.trim(),
      program: toLines(form.program),
      includes: toLines(form.includes),
      image: form.image,
      images: toLines(form.images),
      registrationOpen: form.registrationOpen,
      contact: form.contact.trim(),
      published: form.published,
    };

    setBusy(true);
    try {
      if (editingId) {
        await updateCamp(editingId, payload);
        toast(`Кэмп обновлён: «${name}»`);
      } else {
        await addCamp({ id: 'camp-' + Date.now(), ...payload });
        toast(`Кэмп создан: «${name}»`);
      }
      closeForm();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Не удалось сохранить кэмп', 'error');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (camp: Camp) => {
    setBusy(true);
    try {
      await removeCamp(camp.id);
      setConfirmId(null);
      toast(`Кэмп удалён: «${camp.name}»`, 'info');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Не удалось удалить кэмп', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-white">Кэмпы</h1>
          <p className="text-sm text-gray-400">
            {camps.length} сборов · раздел видят все, править может только администратор
          </p>
        </div>
        <Button
          onClick={() => (open ? closeForm() : startCreate())}
          variant={open ? 'outline' : 'primary'}
          size="sm"
        >
          {open ? (
            <>
              <X className="mr-1.5 h-4 w-4" /> Отмена
            </>
          ) : (
            <>
              <Plus className="mr-1.5 h-4 w-4" /> Новый кэмп
            </>
          )}
        </Button>
      </div>

      {open && (
        <form onSubmit={submit} className="mb-6 space-y-4 rounded-sm border border-white/10 bg-surface p-6">
          <h2 className="font-semibold text-white">
            {editingId ? 'Редактирование кэмпа' : 'Новый кэмп'}
          </h2>

          <div>
            <label htmlFor="c-name" className={label}>Название *</label>
            <input
              id="c-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={field}
              placeholder="Осенний беговой кэмп в Карелии"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="c-loc" className={label}>Место</label>
              <input
                id="c-loc"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className={field}
                placeholder="Карелия, база «Лесная»"
              />
            </div>
            <div>
              <label htmlFor="c-price" className={label}>Стоимость</label>
              <input
                id="c-price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={field}
                placeholder="28 000 ₽, проживание и питание включены"
              />
            </div>
            <div>
              <label htmlFor="c-start" className={label}>Начало</label>
              <input
                id="c-start"
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className={field}
              />
            </div>
            <div>
              <label htmlFor="c-end" className={label}>Окончание (если не один день)</label>
              <input
                id="c-end"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className={field}
              />
            </div>
          </div>

          <div>
            <label htmlFor="c-desc" className={label}>Краткое описание (для карточки)</label>
            <textarea
              id="c-desc"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`${field} resize-none`}
              placeholder="Несколько дней бега и ОФП на природе с тренерами клуба"
            />
          </div>

          <div>
            <label htmlFor="c-full" className={label}>Программа сбора</label>
            <textarea
              id="c-full"
              rows={6}
              value={form.fullDescription}
              onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
              className={`${field} resize-y`}
              placeholder="Что будет на сборе: объёмы, темпы, восстановление"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="c-program" className={label}>Распорядок (по строке)</label>
              <textarea
                id="c-program"
                rows={5}
                value={form.program}
                onChange={(e) => setForm({ ...form, program: e.target.value })}
                className={`${field} resize-y`}
                placeholder={'08:00 — зарядка\n10:00 — длинная в лесу\n17:00 — ОФП'}
              />
            </div>
            <div>
              <label htmlFor="c-includes" className={label}>Что входит (по строке)</label>
              <textarea
                id="c-includes"
                rows={5}
                value={form.includes}
                onChange={(e) => setForm({ ...form, includes: e.target.value })}
                className={`${field} resize-y`}
                placeholder={'Проживание\nТрёхразовое питание\nРабота тренеров'}
              />
            </div>
          </div>

          <div>
            <label htmlFor="c-contact" className={label}>Контакт для записи</label>
            <input
              id="c-contact"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className={field}
              placeholder="Telegram @vtoroe_dyhanie"
            />
          </div>

          <ImageUpload
            value={form.image}
            onChange={(image) => setForm({ ...form, image })}
            label="Обложка кэмпа"
          />

          <div>
            <label htmlFor="c-images" className={label}>
              Дополнительные фото (по ссылке, каждое с новой строки)
            </label>
            <textarea
              id="c-images"
              rows={3}
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
              className={`${field} resize-none`}
              placeholder="https://…/photo-1.jpg"
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-white">
              <input
                type="checkbox"
                checked={form.registrationOpen}
                onChange={(e) => setForm({ ...form, registrationOpen: e.target.checked })}
                className="h-4 w-4 accent-accent-red"
              />
              Набор открыт
            </label>
            <label className="flex items-center gap-2 text-sm text-white">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="h-4 w-4 accent-accent-red"
              />
              Показывать на сайте
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" size="sm" disabled={busy}>
              {editingId ? 'Сохранить' : 'Создать кэмп'}
            </Button>
            <button type="button" onClick={closeForm} className="text-xs text-gray-400 hover:text-white">
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {sorted.map((camp) => (
          <div
            key={camp.id}
            className="flex flex-col gap-3 rounded-sm border border-white/10 bg-surface p-4 sm:flex-row sm:items-center"
          >
            {camp.image ? (
              <img
                src={camp.image}
                alt=""
                className="h-16 w-24 shrink-0 rounded-sm object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-sm bg-white/5 text-xs text-gray-600">
                нет фото
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="rounded-sm bg-accent-blue/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-blue">
                  {formatDate(camp.startDate, false)}
                  {camp.endDate && camp.endDate !== camp.startDate
                    ? ` — ${formatDate(camp.endDate, false)}`
                    : ''}
                </span>
                {!camp.published && (
                  <span className="rounded-sm bg-gray-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-400">
                    черновик
                  </span>
                )}
                <span
                  className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase ${
                    camp.registrationOpen
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-gray-500/15 text-gray-400'
                  }`}
                >
                  {camp.registrationOpen ? 'набор открыт' : 'набор закрыт'}
                </span>
              </div>
              <p className="truncate font-medium text-white">{camp.name}</p>
              <p className="truncate text-xs text-gray-500">{camp.location || '—'}</p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Link
                to={`/camps/${camp.id}`}
                className="text-gray-500 transition-colors hover:text-accent-blue"
                title="Открыть на сайте"
                aria-label={`Открыть ${camp.name}`}
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
              <button
                onClick={() => startEdit(camp)}
                className="text-gray-500 transition-colors hover:text-accent-blue"
                aria-label={`Редактировать ${camp.name}`}
                title="Редактировать"
              >
                <Pencil className="h-4 w-4" />
              </button>
              {confirmId === camp.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">Удалить?</span>
                  <button
                    onClick={() => void remove(camp)}
                    disabled={busy}
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
                  onClick={() => setConfirmId(camp.id)}
                  className="text-gray-500 transition-colors hover:text-red-400"
                  aria-label={`Удалить ${camp.name}`}
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
            Кэмпов пока нет — создайте первый.
          </div>
        )}
      </div>
    </div>
  );
}
