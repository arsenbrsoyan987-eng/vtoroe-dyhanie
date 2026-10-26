import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { eventsStore, useEvents } from '../../store/eventsStore';
import { formatDate, todayISO } from '../../lib/date';
import type { EventCategory } from '../../types';
import Button from '../../components/ui/Button';
import ImageUpload from '../../components/ui/ImageUpload';
import { ExternalLink, Pencil, Plus, Trash2, X } from 'lucide-react';

const CATEGORIES: Array<{ id: EventCategory; label: string }> = [
  { id: 'training', label: 'Клубная тренировка' },
  { id: 'competition', label: 'Соревнование' },
  { id: 'hike', label: 'Поход' },
  { id: 'camp', label: 'Сборы' },
  { id: 'public', label: 'Общественное' },
];

const emptyForm = {
  name: '',
  category: 'competition' as EventCategory,
  date: todayISO(),
  time: '10:00',
  location: '',
  description: '',
  fullDescription: '',
  image: '',
  registrationOpen: true,
  registrationDeadline: '',
  price: '',
  requirements: '',
};

export default function AdminEvents() {
  const events = useEvents();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const field =
    'w-full rounded-sm border border-white/10 bg-primary px-3 py-2.5 text-sm text-white transition-colors placeholder:text-gray-600 focus:border-accent-red focus:outline-none';
  const label = 'mb-1.5 block text-xs uppercase tracking-wider text-gray-400';

  const sorted = useMemo(
    () => [...events].sort((a, b) => a.date.localeCompare(b.date)),
    [events]
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
    const e = events.find((x) => x.id === id);
    if (!e) return;
    setForm({
      name: e.name,
      category: e.category,
      date: e.date,
      time: e.time,
      location: e.location,
      description: e.description,
      fullDescription: e.fullDescription,
      image: e.images[0] ?? '',
      registrationOpen: e.registrationOpen,
      registrationDeadline: e.registrationDeadline,
      price: e.price,
      requirements: e.requirements.join('\n'),
    });
    setEditingId(id);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      toast('Укажите название мероприятия', 'error');
      return;
    }

    const payload = {
      name,
      category: form.category,
      date: form.date,
      time: form.time,
      location: form.location.trim(),
      description: form.description.trim(),
      fullDescription: form.fullDescription.trim(),
      images: form.image ? [form.image] : [],
      registrationOpen: form.registrationOpen,
      registrationDeadline: form.registrationDeadline,
      price: form.price.trim(),
      requirements: form.requirements
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean),
    };

    if (editingId) {
      eventsStore.update(editingId, payload);
      toast('Мероприятие обновлено');
    } else {
      eventsStore.add({ id: 'event-' + Date.now(), ...payload });
      toast(`Мероприятие создано: «${name}»`);
    }
    closeForm();
  };

  const remove = (id: string, name: string) => {
    eventsStore.remove(id);
    setConfirmId(null);
    toast(`Мероприятие удалено: «${name}»`, 'info');
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-white">Мероприятия</h1>
          <p className="text-sm text-gray-400">
            {events.length} событий · соревнования, походы, сборы, встречи
          </p>
        </div>
        <Button onClick={() => (open ? closeForm() : startCreate())} variant={open ? 'outline' : 'primary'} size="sm">
          {open ? (
            <>
              <X className="mr-1.5 h-4 w-4" /> Отмена
            </>
          ) : (
            <>
              <Plus className="mr-1.5 h-4 w-4" /> Новое мероприятие
            </>
          )}
        </Button>
      </div>

      {open && (
        <form onSubmit={submit} className="mb-6 space-y-4 rounded-sm border border-white/10 bg-surface p-6">
          <h2 className="font-semibold text-white">
            {editingId ? 'Редактирование мероприятия' : 'Новое мероприятие'}
          </h2>

          <div>
            <label htmlFor="e-name" className={label}>Название *</label>
            <input
              id="e-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={field}
              placeholder="Осенний трейл-забег"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="e-cat" className={label}>Тип</label>
              <select
                id="e-cat"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as EventCategory })}
                className={field}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="e-loc" className={label}>Место</label>
              <input
                id="e-loc"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className={field}
                placeholder="Парк «Сокольники», главный вход"
              />
            </div>
            <div>
              <label htmlFor="e-date" className={label}>Дата</label>
              <input
                id="e-date"
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={field}
              />
            </div>
            <div>
              <label htmlFor="e-time" className={label}>Время</label>
              <input
                id="e-time"
                type="time"
                required
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className={field}
              />
            </div>
          </div>

          <div>
            <label htmlFor="e-desc" className={label}>Краткое описание</label>
            <textarea
              id="e-desc"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`${field} resize-none`}
              placeholder="Что это за событие — для карточки в списке"
            />
          </div>

          <div>
            <label htmlFor="e-full" className={label}>Подробности</label>
            <textarea
              id="e-full"
              rows={6}
              value={form.fullDescription}
              onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
              className={`${field} resize-y`}
              placeholder="Дистанция, программа, регламент, что взять с собой"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="e-price" className={label}>Стоимость</label>
              <input
                id="e-price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={field}
                placeholder="Бесплатно для участников клуба"
              />
            </div>
            <div>
              <label htmlFor="e-deadline" className={label}>Приём заявок до</label>
              <input
                id="e-deadline"
                type="date"
                value={form.registrationDeadline}
                onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                className={field}
              />
            </div>
          </div>

          <div>
            <label htmlFor="e-req" className={label}>Требования и снаряжение (каждое с новой строки)</label>
            <textarea
              id="e-req"
              rows={3}
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              className={`${field} resize-none`}
              placeholder={'Трейловые кроссовки\nМедицинская справка'}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-white">
            <input
              type="checkbox"
              checked={form.registrationOpen}
              onChange={(e) => setForm({ ...form, registrationOpen: e.target.checked })}
              className="h-4 w-4 accent-accent-red"
            />
            Регистрация открыта
          </label>

          <ImageUpload
            value={form.image}
            onChange={(image) => setForm({ ...form, image })}
            label="Фото мероприятия"
          />

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" size="sm">
              {editingId ? 'Сохранить' : 'Создать'}
            </Button>
            <button type="button" onClick={closeForm} className="text-xs text-gray-400 hover:text-white">
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {sorted.map((e) => (
          <div key={e.id} className="flex flex-col gap-3 rounded-sm border border-white/10 bg-surface p-4 sm:flex-row sm:items-center">
            {e.images[0] ? (
              <img src={e.images[0]} alt="" className="h-16 w-24 shrink-0 rounded-sm object-cover" loading="lazy" />
            ) : (
              <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-sm bg-white/5 text-xs text-gray-600">
                нет фото
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="rounded-sm bg-accent-blue/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-blue">
                  {CATEGORIES.find((c) => c.id === e.category)?.label ?? e.category}
                </span>
                <span className="text-xs text-gray-500">{formatDate(e.date)} · {e.time}</span>
                <span
                  className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase ${
                    e.registrationOpen
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-gray-500/15 text-gray-400'
                  }`}
                >
                  {e.registrationOpen ? 'открыта' : 'закрыта'}
                </span>
              </div>
              <p className="truncate font-medium text-white">{e.name}</p>
              <p className="truncate text-xs text-gray-500">{e.location || '—'}</p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Link
                to={`/events/${e.id}`}
                className="text-gray-500 transition-colors hover:text-accent-blue"
                title="Открыть на сайте"
                aria-label={`Открыть ${e.name}`}
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
              <button
                onClick={() => startEdit(e.id)}
                className="text-gray-500 transition-colors hover:text-accent-blue"
                aria-label={`Редактировать ${e.name}`}
                title="Редактировать"
              >
                <Pencil className="h-4 w-4" />
              </button>
              {confirmId === e.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400">Удалить?</span>
                  <button
                    onClick={() => remove(e.id, e.name)}
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
                  onClick={() => setConfirmId(e.id)}
                  className="text-gray-500 transition-colors hover:text-red-400"
                  aria-label={`Удалить ${e.name}`}
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
            Мероприятий пока нет — создайте первое.
          </div>
        )}
      </div>
    </div>
  );
}
