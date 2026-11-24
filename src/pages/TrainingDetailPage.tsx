import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTrainings } from '../store/trainingsStore';
import { usePhotosOf } from '../store/trainingPhotosStore';
import { useTrainers } from '../store/trainersStore';
import { useDirections } from '../store/directionsStore';
import { formatDate, isPastDate } from '../lib/date';
import { isVideoUrl } from '../lib/upload';
import { displayValue, realValue } from '../lib/placeholder';
import Button from '../components/ui/Button';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import QuickBookingModal from '../components/ui/QuickBookingModal';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  Timer,
  User,
  Users,
} from 'lucide-react';

export default function TrainingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const trainings = useTrainings();
  const training = trainings.find((t) => t.id === id);
  const photos = usePhotosOf(training?.id);
  const trainers = useTrainers();
  const directions = useDirections();
  const { currentUser, registrations, register, cancelRegistration } = useAuth();
  const { toast } = useToast();

  const isIndividual = training?.format === 'individual';
  const [pickedTrainer, setPickedTrainer] = useState('');
  const [pickedDirection, setPickedDirection] = useState('');
  /** Гость записывается без аккаунта — модалка заявки открывается по кнопке */
  const [bookingOpen, setBookingOpen] = useState(false);

  /**
   * Индивидуальное занятие ведёт любой тренер школы, поэтому спортсмен
   * выбирает сам. Список сокращаем до тех, кто работает по выбранному
   * направлению; если по нему нет ни одного — показываем всех.
   */
  const availableTrainers = useMemo(() => {
    if (!isIndividual) return [];
    if (!pickedDirection) return trainers;
    const matched = trainers.filter((t) => t.directions.includes(pickedDirection));
    return matched.length > 0 ? matched : trainers;
  }, [isIndividual, pickedDirection, trainers]);

  /** Тренер уже ведёт это занятие у другого спортсмена — выбрать его нельзя */
  const busyTrainerIds = useMemo(
    () =>
      new Set(
        registrations
          .filter(
            (r) =>
              r.trainingId === training?.id &&
              r.status === 'confirmed' &&
              r.selectedTrainerId
          )
          .map((r) => r.selectedTrainerId as string)
      ),
    [registrations, training?.id]
  );

  if (!training) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="display mb-4 text-3xl text-ink">Тренировка не найдена</h1>
        <p className="mb-8 text-sm text-graphite">
          Возможно, её отменили или удалили из расписания.
        </p>
        <Button to="/schedule" variant="outline" size="sm">
          Вернуться в расписание
        </Button>
      </div>
    );
  }

  const confirmed = registrations.filter(
    (r) => r.trainingId === training.id && r.status === 'confirmed'
  ).length;
  const past = isPastDate(training.date);

  /**
   * Ёмкость занятия: группу ограничивает capacity, индивидуальное занятие —
   * числом тренеров школы, ведь каждый тренер берёт одного спортсмена.
   */
  const capacity = isIndividual ? Math.max(trainers.length, confirmed) : training.spotsAvailable;
  const left = Math.max(0, capacity - confirmed);

  const myReg = currentUser
    ? registrations.find(
        (r) => r.userId === currentUser.id &&
          r.trainingId === training.id &&
          r.status !== 'cancelled'
      )
    : undefined;

  /** Тариф подставлен по формату: у тренировки заполнено только нужное поле */
  const price = isIndividual ? training.priceIndividual : training.priceGroup;

  /** Already-запись на индивидуальное занятие: показываем выбор спортсмена */
  const pickedTrainerName = trainers.find((t) => t.id === myReg?.selectedTrainerId)?.name;
  const pickedDirectionName = directions.find((d) => d.id === myReg?.selectedDirectionId)?.name;

  const handleRegister = async () => {
    // Гость не обязан заводить аккаунт: сначала заявка, вход — второй шаг
    if (!currentUser) {
      setBookingOpen(true);
      return;
    }
    if (isIndividual && (!pickedTrainer || !pickedDirection)) {
      toast('Выберите тренера и направление для индивидуальной тренировки', 'error');
      return;
    }

    // Индивидуальное занятие оформляют только с выбранными тренером и направлением
    const choice = isIndividual ? { trainerId: pickedTrainer, directionId: pickedDirection } : undefined;
    const status = await register(training.id, capacity, choice);
    if (status === 'already') {
      toast('Вы уже записаны на эту тренировку', 'info');
    } else if (status === 'waitlist') {
      toast('Мест нет — вы в листе ожидания', 'info');
    } else {
      toast('Запись подтверждена');
    }
  };

  const handleCancel = () => {
    if (!myReg) return;
    cancelRegistration(myReg.id);
    toast('Запись отменена', 'info');
  };

  const selectCls =
    'w-full rounded-xl border border-line bg-mist px-3 py-2.5 text-sm text-ink transition-colors focus:border-brand focus:bg-paper focus:outline-none';

  /** Факты о занятии: одинаковые для всех форматов, меняется только наполнение */
  const facts = [
    { icon: CalendarDays, label: 'Дата', value: formatDate(training.date) },
    { icon: Clock, label: 'Начало', value: training.time },
    { icon: Timer, label: 'Длительность', value: training.duration },
    {
      icon: MapPin,
      label: 'Место',
      value: displayValue(training.location, 'Точку сбора уточняйте у тренера'),
    },
    ...(realValue(training.trainer)
      ? [{ icon: User, label: 'Тренер', value: training.trainer }]
      : []),
    {
      icon: Users,
      label: 'Места',
      value: isIndividual
        ? 'Только вы и тренер'
        : left > 0
          ? `Свободно ${left} из ${capacity}`
          : 'Мест нет — лист ожидания',
    },
  ];

  return (
    <>
      <Breadcrumbs
        items={[{ label: 'Расписание', to: '/schedule' }, { label: training.name }]}
      />

      <section className="bg-ink pb-14 pt-6 text-paper lg:pb-20">
        <div className="container-x">
          <div className="mb-5 flex flex-wrap items-center gap-2.5">
            <span className="eyebrow text-brand">
              <span className="h-[2px] w-8 bg-brand" />
              {training.directionName}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-white/80">
              {isIndividual ? 'Персональная' : 'Групповая'}
            </span>
            <span className="text-[0.7rem] text-white/50">{training.level}</span>
            {past && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-white/60">
                Завершена
              </span>
            )}
          </div>

          <h1 className="display max-w-4xl text-[2.25rem] sm:text-5xl lg:text-6xl">
            {training.name}
          </h1>

          {training.description && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
              {training.description}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {price && (
              <span className="display text-3xl text-white">
                {price} <span className="text-lg text-white/60">₽</span>
              </span>
            )}
            <span
              className={`text-[0.72rem] font-bold uppercase tracking-[0.12em] ${
                past ? 'text-white/50' : left > 0 ? 'text-emerald-400' : 'text-brand'
              }`}
            >
              {past
                ? 'тренировка прошла'
                : left > 0
                  ? isIndividual
                    ? 'есть свободные тренеры'
                    : `${left} свободных мест`
                  : 'мест нет — лист ожидания'}
            </span>
          </div>
        </div>
      </section>

      <section className="bg-paper py-12 lg:py-16">
        <div className="container-x grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          {/* Основная колонка */}
          <div className="min-w-0">
            {training.image && (
              <div className="mb-8 overflow-hidden rounded-2xl bg-mist">
                <img
                  src={training.image}
                  alt={training.name}
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            )}

            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {facts.map((f) => (
                <div key={f.label} className="flex items-start gap-3 border-t border-line pt-4">
                  <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <div>
                    <dt className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-graphite">
                      {f.label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-ink">{f.value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            {training.equipment.length > 0 && (
              <div className="mt-10">
                <h2 className="display mb-3 text-xl text-ink">Что взять с собой</h2>
                <ul className="flex flex-wrap gap-2">
                  {training.equipment.map((item) => (
                    <li
                      key={item}
                      className="rounded-full bg-mist px-3 py-1.5 text-xs font-medium text-graphite"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Отчёт с занятия: фото и видео загружает тренер после тренировки */}
            {photos.length > 0 && (
              <section className="mt-10">
                <h2 className="display mb-3 flex items-center gap-2 text-xl text-ink">
                  <Camera className="h-5 w-5 text-brand" />
                  Как прошла тренировка
                </h2>
                <p className="mb-4 text-sm text-graphite">
                  {photos.length} фото и видео с занятия
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.map((photo) => (
                    <figure key={photo.id} className="overflow-hidden rounded-xl bg-mist">
                      {isVideoUrl(photo.url) ? (
                        <video
                          src={photo.url}
                          controls
                          preload="metadata"
                          playsInline
                          className="aspect-[4/3] w-full bg-ink object-cover"
                        />
                      ) : (
                        <img
                          src={photo.url}
                          alt={photo.caption || training.name}
                          className="aspect-[4/3] w-full object-cover"
                          loading="lazy"
                        />
                      )}
                      {photo.caption && (
                        <figcaption className="px-3 py-2 text-xs text-graphite">
                          {photo.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Колонка записи */}
          <aside className="lg:sticky lg:top-28">
            <div className="rounded-2xl border border-line bg-paper p-6 shadow-card">
              {myReg ? (
                <div>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <h2 className="display text-lg">Вы записаны</h2>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-graphite">
                    {myReg.status === 'confirmed'
                      ? 'Место закреплено за вами. Напоминание придёт в личный кабинет.'
                      : 'Вы в листе ожидания — сообщим, если освободится место.'}
                  </p>
                  {pickedTrainerName && (
                    <p className="mt-3 rounded-xl bg-mist px-3 py-2 text-xs text-graphite">
                      Ваш тренер: <strong className="text-ink">{pickedTrainerName}</strong>
                      {pickedDirectionName ? ` · ${pickedDirectionName}` : ''}
                    </p>
                  )}
                  {!past && (
                    <button
                      onClick={handleCancel}
                      className="mt-4 w-full rounded-full border border-line px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-graphite transition-colors hover:border-brand hover:text-brand"
                    >
                      Отменить запись
                    </button>
                  )}
                </div>
              ) : past ? (
                <div>
                  <h2 className="display text-lg text-ink">Тренировка прошла</h2>
                  <p className="mt-2 text-sm leading-relaxed text-graphite">
                    Посмотрите актуальное расписание — там есть ближайшие занятия.
                  </p>
                  <Button to="/schedule" variant="primary" size="sm" className="mt-4 w-full">
                    В расписание
                  </Button>
                </div>
              ) : isIndividual && currentUser ? (
                <div>
                  <h2 className="display text-lg text-ink">Выберите тренера</h2>
                  <p className="mt-2 text-sm leading-relaxed text-graphite">
                    Персональное занятие ведёт любой тренер направления.
                  </p>
                  <div className="mt-4 space-y-3">
                    <div>
                      <label htmlFor="pick-direction" className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-graphite">
                        Направление
                      </label>
                      <select
                        id="pick-direction"
                        value={pickedDirection}
                        onChange={(e) => {
                          setPickedDirection(e.target.value);
                          // Тренер из другого направления больше не подходит
                          setPickedTrainer('');
                        }}
                        className={selectCls}
                      >
                        <option value="">— Выберите направление —</option>
                        {directions.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="pick-trainer" className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-graphite">
                        Тренер
                      </label>
                      <select
                        id="pick-trainer"
                        value={pickedTrainer}
                        onChange={(e) => setPickedTrainer(e.target.value)}
                        className={selectCls}
                      >
                        <option value="">— Выберите тренера —</option>
                        {availableTrainers.map((t) => (
                          <option key={t.id} value={t.id} disabled={busyTrainerIds.has(t.id)}>
                            {busyTrainerIds.has(t.id) ? `${t.name} — занят` : t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {pickedDirection && availableTrainers.length === 0 && (
                    <p className="mt-3 text-xs text-amber-600">
                      По этому направлению пока нет свободных тренеров — выберите другое.
                    </p>
                  )}
                  <Button onClick={handleRegister} variant="primary" size="sm" className="mt-4 w-full">
                    Записаться
                  </Button>
                  <p className="mt-3 text-center text-[0.7rem] leading-relaxed text-graphite">
                    Запись подтвердит выбранный тренер
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="display text-lg text-ink">
                    {left > 0 ? 'Записаться' : 'Лист ожидания'}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-graphite">
                    {currentUser
                      ? 'Запись можно отменить в любой момент — место вернётся в набор.'
                      : 'Оставьте имя и телефон: тренер перезвонит и подтвердит запись. Аккаунт не нужен.'}
                  </p>
                  <Button onClick={handleRegister} variant="primary" size="sm" className="mt-4 w-full">
                    {currentUser
                      ? left > 0
                        ? 'Записаться'
                        : 'В лист ожидания'
                      : 'Записаться без регистрации'}
                  </Button>
                  <p className="mt-3 text-center text-[0.7rem] text-graphite">
                    Первое занятие — по цене чашки кофе
                  </p>
                </div>
              )}
            </div>

            <Link
              to="/schedule"
              className="mt-4 inline-flex items-center gap-2 px-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-graphite transition-colors hover:text-brand"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Всё расписание
            </Link>
          </aside>
        </div>
      </section>

      {/* Другие занятия направления */}
      <section className="bg-mist py-12 lg:py-16">
        <div className="container-x">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="display text-2xl text-ink sm:text-3xl">
              Ещё {training.directionName.toLowerCase()}
            </h2>
            <Link
              to="/schedule"
              className="group inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-ink hover:text-brand"
            >
              Все тренировки
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trainings
              .filter(
                (t) =>
                  t.id !== training.id &&
                  t.directionId === training.directionId &&
                  !isPastDate(t.date)
              )
              .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
              .slice(0, 3)
              .map((t) => (
                <li key={t.id} className="card-lift card-lift-hover p-5">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-brand">
                    {formatDate(t.date, false)} · {t.time}
                  </p>
                  <h3 className="mt-2 text-sm font-bold leading-snug text-ink">
                    <Link to={`/schedule/${t.id}`} className="hover:text-brand">
                      {t.name}
                    </Link>
                  </h3>
                  <p className="mt-2 text-xs text-graphite">
                    {displayValue(t.location, 'Место — в анонсе')}
                  </p>
                </li>
              ))}
          </ul>
        </div>
      </section>

      {bookingOpen && (
        <QuickBookingModal
          trainingId={training.id}
          trainingName={training.name}
          onClose={() => setBookingOpen(false)}
        />
      )}
    </>
  );
}