import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTrainings, updateTraining, removeTraining, addTraining } from '../../store/trainingsStore';
import { useTrainers } from '../../store/trainersStore';
import { useDirections } from '../../store/directionsStore';
import { visibleTrainings } from '../../lib/access';
import Button from '../../components/ui/Button';
import { Camera, Copy, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { isPastDate, formatDate, todayISO } from '../../lib/date';
import type { TrainingFormat } from '../../types';
import { fieldClass, labelClass, Tabs } from '../../components/cabinet/ui';
import { countNoun } from '../../lib/plural';

const LEVELS = ['Начинающий', 'Средний', 'Продвинутый', 'Все уровни'];
const FORMATS: { value: TrainingFormat; label: string }[] = [
  { value: 'group', label: 'Групповая' },
  { value: 'individual', label: 'Индивидуальная' },
];

const emptyForm = {
  name: '',
  directionId: 'running',
  date: '',
  time: '',
  location: '',
  trainerId: '',
  duration: '60 мин',
  level: 'Все уровни',
  spots: 12,
  description: '',
  format: 'group' as TrainingFormat,
  priceGroup: '',
  priceIndividual: '',
};

type FormState = typeof emptyForm;
type Period = 'upcoming' | 'past' | 'all';

export default function AdminTrainings() {
  const all = useTrainings();
  const trainers = useTrainers();
  const directions = useDirections();
  const { currentUser, registrations } = useAuth();
  const { toast } = useToast();

  const isAdmin = currentUser?.role === 'admin';
  // Тренер видит и правит только свои занятия, администратор — все
  const trainings = useMemo(
    () => visibleTrainings(all, currentUser, registrations),
    [all, currentUser, registrations]
  );
  // Без привязки к карточке тренера база не даст создать занятие
  const unlinkedTrainer = !isAdmin && !currentUser?.trainerId;

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState<Period>('upcoming');

  /** Тренер не выбирает тренера — занятие всегда закрепляется за ним */
  const openCreate = () => {
    setForm({ ...emptyForm, trainerId: currentUser?.trainerId ?? '' });
    setEditingId(null);
    setOpen(true);
  };

  /** Статистика по записям: сколько мест занято и сколько ждут очереди */
  const stats = useMemo(() => {
    const map = new Map<string, { booked: number; waiting: number; attended: number }>();
    for (const r of registrations) {
      const prev = map.get(r.trainingId) ?? { booked: 0, waiting: 0, attended: 0 };
      map.set(r.trainingId, {
        booked: prev.booked + (r.status === 'confirmed' ? 1 : 0),
        waiting: prev.waiting + (r.status === 'waitlist' ? 1 : 0),
        attended: prev.attended + (r.attended ? 1 : 0),
      });
    }
    return map;
  }, [registrations]);

  const totals = useMemo(() => {
    const today = todayISO();
    let upcoming = 0;
    let full = 0;
    let waiting = 0;
    for (const t of trainings) {
      const s = stats.get(t.id);
      if (t.date >= today) upcoming += 1;
      if (s && s.booked >= t.spotsAvailable && t.spotsAvailable > 0) full += 1;
      waiting += s?.waiting ?? 0;
    }
    return { total: trainings.length, upcoming, full, waiting };
  }, [trainings, stats]);

  const sorted = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const today = todayISO();
    return trainings
      .filter((t) => {
        if (period === 'upcoming' && t.date < today) return false;
        if (period === 'past' && t.date >= today) return false;
        if (!needle) return true;
        return (
          t.name.toLowerCase().includes(needle) ||
          t.trainer.toLowerCase().includes(needle) ||
          t.location.toLowerCase().includes(needle) ||
          t.directionName.toLowerCase().includes(needle)
        );
      })
      // Предстоящие — от ближайшей к дальней, прошедшие — свежие сверху
      .sort((a, b) => {
        const keyA = a.date + a.time;
        const keyB = b.date + b.time;
        if (period === 'past') return keyB.localeCompare(keyA);
        return keyA.localeCompare(keyB);
      });
  }, [trainings, query, period]);

  const closeForm = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (id: string) => {
    const t = trainings.find((x) => x.id === id);
    if (!t) return;
    setForm({
      name: t.name,
      directionId: t.directionId,
      date: t.date,
      time: t.time,
      location: t.location,
      trainerId: t.trainerId,
      duration: t.duration,
      level: t.level,
      spots: t.spotsAvailable,
      description: t.description,
      format: t.format ?? 'group',
      priceGroup: t.priceGroup ?? '',
      priceIndividual: t.priceIndividual ?? '',
    });
    setEditingId(id);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** Повтор занятия через неделю: расписание часто копируется неделя в неделю */
  const duplicate = (id: string) => {
    const t = trainings.find((x) => x.id === id);
    if (!t) return;
    const next = new Date(`${t.date}T12:00:00`);
    next.setDate(next.getDate() + 7);
    setForm({
      name: t.name,
      directionId: t.directionId,
      date: next.toISOString().slice(0, 10),
      time: t.time,
      location: t.location,
      trainerId: t.trainerId,
      duration: t.duration,
      level: t.level,
      spots: t.spotsAvailable,
      description: t.description,
      format: t.format ?? 'group',
      priceGroup: t.priceGroup ?? '',
      priceIndividual: t.priceIndividual ?? '',
    });
    setEditingId(null);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const direction = directions.find((d) => d.id === form.directionId);
    // Тренер закрепляет тренировку за собой: чужой trainer_id база не примет
    const trainerId = isAdmin ? form.trainerId : (currentUser?.trainerId ?? '');
    const trainer = trainers.find((t) => t.id === trainerId);

    const patch = {
      name: form.name.trim(),
      directionId: form.directionId,
      directionName: direction?.name ?? 'Тренировка',
      date: form.date,
      time: form.time,
      location: form.location.trim(),
      trainer: trainer?.name ?? (isAdmin ? 'Не назначен' : (currentUser?.name ?? '')),
      trainerId,
      duration: form.duration,
      level: form.level,
      spotsAvailable: Number(form.spots) || 0,
      description: form.description.trim(),
      equipment: direction?.requiredEquipment ?? [],
      image: direction?.imageUrl ?? '',
      format: form.format,
      priceGroup: form.priceGroup.trim(),
      priceIndividual: form.priceIndividual.trim(),
    };

    try {
      if (editingId) {
        await updateTraining(editingId, patch);
        toast(`Тренировка обновлена: «${patch.name}»`);
      } else {
        await addTraining({ id: 'training-' + Date.now(), ...patch });
        toast(`Тренировка добавлена: «${patch.name}»`);
      }
      closeForm();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Не удалось сохранить тренировку', 'error');
    }
  };

  const remove = async (id: string, name: string) => {
    try {
      await removeTraining(id);
      toast(`Тренировка удалена: «${name}»`, 'info');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Не удалось удалить тренировку', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 display text-2xl text-ink">Расписание</h1>
          <p className="text-sm text-graphite">
            {countNoun(trainings.length, 'тренировка', 'тренировки', 'тренировок')} · изменения сразу видны на сайте
            {!isAdmin && ' · показаны только ваши занятия'}
          </p>
        </div>
        <Button
          onClick={() => (open ? closeForm() : openCreate())}
          variant={open ? 'outline' : 'primary'}
          size="sm"
          disabled={!open && unlinkedTrainer}
        >
          {open ? (
            <>
              <X className="mr-1.5 h-4 w-4" /> Отмена
            </>
          ) : (
            <>
              <Plus className="mr-1.5 h-4 w-4" /> Новая тренировка
            </>
          )}
        </Button>
      </div>

      {unlinkedTrainer && (
        <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-800">
          Аккаунт не привязан к карточке тренера, поэтому создать тренировку не
          получится — база отклонит запись. Попросите администратора указать вашу
          карточку в разделе «Тренеры».
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Всего занятий', value: totals.total },
          { label: 'Предстоит', value: totals.upcoming },
          { label: 'Заполнено', value: totals.full },
          { label: 'В очереди', value: totals.waiting },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-line bg-paper p-3.5 shadow-card">
            <p className="display text-xl text-ink">{stat.value}</p>
            <p className="text-[0.62rem] text-graphite">{stat.label}</p>
          </div>
        ))}
      </div>

      {open && (
        <form onSubmit={submit} className="mb-6 space-y-4 rounded-2xl border border-line bg-paper shadow-card p-6">
          <h2 className="font-semibold text-ink">
            {editingId ? 'Редактирование тренировки' : 'Новая тренировка'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="t-name" className={labelClass}>Название</label>
              <input id="t-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldClass} placeholder="Утренний бег в парке" />
            </div>
            <div>
              <label htmlFor="t-direction" className={labelClass}>Направление</label>
              <select id="t-direction" value={form.directionId} onChange={(e) => setForm({ ...form, directionId: e.target.value })} className={fieldClass}>
                {directions.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="t-trainer" className={labelClass}>Тренер</label>
              {isAdmin ? (
                <select id="t-trainer" value={form.trainerId} onChange={(e) => setForm({ ...form, trainerId: e.target.value })} className={fieldClass}>
                  <option value="">Не назначен</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              ) : (
                <p className="rounded-xl border border-line bg-mist px-3 py-2.5 text-sm text-graphite">
                  {currentUser?.name} — занятие закрепляется за вами
                </p>
              )}
            </div>
            <div>
              <label htmlFor="t-format" className={labelClass}>Формат</label>
              <select
                id="t-format"
                value={form.format}
                onChange={(e) => {
                  const format = e.target.value as TrainingFormat;
                  // Индивидуальное занятие — всегда один спортсмен
                  setForm({ ...form, format, spots: format === 'individual' ? 1 : form.spots });
                }}
                className={fieldClass}
              >
                {FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="t-price" className={labelClass}>
                Цена, ₽ {form.format === 'individual' ? 'за индивидуальную' : 'за групповую'}
              </label>
              <input
                id="t-price"
                value={form.format === 'individual' ? form.priceIndividual : form.priceGroup}
                onChange={(e) =>
                  setForm(
                    form.format === 'individual'
                      ? { ...form, priceIndividual: e.target.value }
                      : { ...form, priceGroup: e.target.value }
                  )
                }
                className={fieldClass}
                placeholder="2500"
                inputMode="numeric"
              />
            </div>
            <div>
              <label htmlFor="t-date" className={labelClass}>Дата</label>
              <input id="t-date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="t-time" className={labelClass}>Время</label>
              <input id="t-time" type="time" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="t-location" className={labelClass}>Место встречи</label>
              <input id="t-location" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={fieldClass} placeholder="Парк, главный вход" />
            </div>
            <div>
              <label htmlFor="t-duration" className={labelClass}>Продолжительность</label>
              <input id="t-duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={fieldClass} placeholder="60 мин" />
            </div>
            <div>
              <label htmlFor="t-level" className={labelClass}>Уровень</label>
              <select id="t-level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className={fieldClass}>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="t-spots" className={labelClass}>Мест всего</label>
              <input id="t-spots" type="number" min={1} max={100} value={form.spots} onChange={(e) => setForm({ ...form, spots: Number(e.target.value) })} className={fieldClass} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="t-desc" className={labelClass}>Описание</label>
              <textarea id="t-desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${fieldClass} resize-none`} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" size="sm">
              {editingId ? 'Сохранить изменения' : 'Добавить тренировку'}
            </Button>
            {editingId && (
              <button type="button" onClick={closeForm} className="text-xs text-graphite hover:text-ink">
                Отменить редактирование
              </button>
            )}
          </div>
        </form>
      )}

      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-graphite" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию, тренеру, месту"
            className={`${fieldClass} pl-9`}
            aria-label="Поиск тренировок"
          />
        </label>
        <Tabs
          value={period}
          onChange={setPeriod}
          items={[
            { value: 'upcoming', label: 'Предстоящие' },
            { value: 'past', label: 'Прошедшие' },
            { value: 'all', label: 'Все' },
          ]}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-line">
        <table className="w-full text-sm">
          <thead className="bg-paper">
            <tr className="border-b border-line">
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-graphite">Тренировка</th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium text-graphite sm:table-cell">Дата</th>
              <th scope="col" className="hidden px-4 py-3 text-left text-xs font-medium text-graphite md:table-cell">Место</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-graphite">Записей</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-graphite">
                <span className="sr-only">Действия</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="bg-mist px-4 py-10 text-center text-sm text-graphite">
                  {trainings.length === 0
                    ? 'Занятий пока нет — создайте первое.'
                    : 'По этому запросу ничего не найдено.'}
                </td>
              </tr>
            )}
            {sorted.map((t) => {
              const s = stats.get(t.id);
              const booked = s?.booked ?? 0;
              const waiting = s?.waiting ?? 0;
              const attended = s?.attended ?? 0;
              const done = isPastDate(t.date);
              const full = t.spotsAvailable > 0 && booked >= t.spotsAvailable;
              return (
                <tr key={t.id} className="border-b border-line bg-mist transition-colors last:border-0 hover:bg-mist">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">
                      {t.name}
                      {done && <span className="ml-2 text-[10px] uppercase text-graphite">завершена</span>}
                    </p>
                    <p className="text-xs text-graphite">
                      {t.format === 'individual' && (
                        <span className="mr-1 rounded-xl bg-navy/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-navy">
                          Индив.
                        </span>
                      )}
                      {t.directionName} · {t.trainer}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 text-graphite sm:table-cell">
                    {formatDate(t.date, false)}
                    <span className="ml-1 text-graphite/70">{t.time}</span>
                  </td>
                  <td className="hidden px-4 py-3 text-graphite md:table-cell">{t.location}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-xl px-2 py-0.5 text-xs font-semibold ${
                        full ? 'bg-brand/10 text-brand' : 'bg-navy/10 text-navy'
                      }`}
                      title={waiting > 0 ? `В листе ожидания: ${waiting}` : undefined}
                    >
                      {booked}/{t.spotsAvailable}
                    </span>
                    {waiting > 0 && (
                      <span className="ml-1 text-[10px] text-amber-700">+{waiting}</span>
                    )}
                    {done && attended > 0 && (
                      <span className="ml-1 text-[10px] text-emerald-700">✓ {attended}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {done && (
                        <Link
                          to={`/cabinet/photos?t=${t.id}`}
                          className="text-graphite transition-colors hover:text-navy"
                          aria-label={`Фото тренировки ${t.name}`}
                          title="Фото с тренировки"
                        >
                          <Camera className="h-4 w-4" />
                        </Link>
                      )}
                      <button
                        onClick={() => duplicate(t.id)}
                        className="text-graphite transition-colors hover:text-navy"
                        aria-label={`Повторить ${t.name} через неделю`}
                        title="Повторить через неделю"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => startEdit(t.id)}
                        className="text-graphite transition-colors hover:text-navy"
                        aria-label={`Редактировать ${t.name}`}
                        title="Редактировать"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Удалить тренировку «${t.name}»?`)) {
                            remove(t.id, t.name);
                          }
                        }}
                        className="text-graphite transition-colors hover:text-brand"
                        aria-label={`Удалить ${t.name}`}
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}