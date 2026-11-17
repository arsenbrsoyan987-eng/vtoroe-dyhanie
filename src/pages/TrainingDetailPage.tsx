import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
import { ArrowLeft, CalendarDays, Camera, CheckCircle2, Clock, MapPin, Timer, User, Users, Wallet } from 'lucide-react';

export default function TrainingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const trainings = useTrainings();
  const training = trainings.find((t) => t.id === id);
  const photos = usePhotosOf(training?.id);
  const trainers = useTrainers();
  const directions = useDirections();
  const { currentUser, registrations, register, cancelRegistration } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isIndividual = training?.format === 'individual';
  const [pickedTrainer, setPickedTrainer] = useState('');
  const [pickedDirection, setPickedDirection] = useState('');

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
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="mb-2 text-2xl font-bold text-white">Тренировка не найдена</h1>
        <p className="mb-6 text-sm text-gray-400">
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
    if (!currentUser) {
      navigate('/login', { state: { from: `/schedule/${training.id}` } });
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

  return (
    <div className="py-12 lg:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/schedule"
          className="mb-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Расписание
        </Link>

        <div className="overflow-hidden rounded-sm border border-white/10 bg-surface">
          {training.image && (
            <div className="h-48 w-full overflow-hidden sm:h-64">
              <img
                src={training.image}
                alt={training.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-6 lg:p-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent-blue">
                {training.directionName}
              </span>
              <span className="text-gray-600">·</span>
              <span
                className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  isIndividual ? 'bg-purple-500/15 text-purple-300' : 'bg-blue-500/15 text-blue-300'
                }`}
              >
                {isIndividual ? 'Индивидуальная' : 'Групповая'}
              </span>
              <span className="text-gray-600">·</span>
              <span className="text-xs text-gray-400">{training.level}</span>
              {past && (
                <span className="rounded-sm bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  Завершена
                </span>
              )}
            </div>

            <h1 className="mb-4 text-2xl font-bold text-white lg:text-3xl">
              {training.name}
            </h1>

            <dl className="mb-6 grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2 text-gray-300">
                <CalendarDays className="h-4 w-4 shrink-0 text-gray-500" />
                {formatDate(training.date)}
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="h-4 w-4 shrink-0 text-gray-500" />
                {training.time}
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Timer className="h-4 w-4 shrink-0 text-gray-500" />
                {training.duration}
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <MapPin className="h-4 w-4 shrink-0 text-gray-500" />
                {displayValue(training.location, 'Точку сбора уточняйте у тренера')}
              </div>
              {realValue(training.trainer) && (
                <div className="flex items-center gap-2 text-gray-300">
                  <User className="h-4 w-4 shrink-0 text-gray-500" />
                  {training.trainer}
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-300">
                <Users className="h-4 w-4 shrink-0 text-gray-500" />
                {isIndividual
                  ? 'Только вы и тренер'
                  : left > 0
                    ? `Свободно мест: ${left} из ${capacity}`
                    : 'Мест нет'}
              </div>
              {price && (
                <div className="flex items-center gap-2 font-semibold text-white">
                  <Wallet className="h-4 w-4 shrink-0 text-accent-red" />
                  {price}
                </div>
              )}
            </dl>

            {training.description && (
              <p className="mb-6 text-sm leading-relaxed text-gray-400">
                {training.description}
              </p>
            )}

            {training.equipment.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-2 text-xs uppercase tracking-wider text-gray-500">
                  Что взять с собой
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {training.equipment.map((item) => (
                    <li
                      key={item}
                      className="rounded-sm bg-white/5 px-2.5 py-1 text-xs text-gray-300"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {myReg ? (
              <div className="rounded-sm border border-green-500/30 bg-green-500/10 px-4 py-3">
                <div className="flex flex-wrap items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
                  <p className="flex-1 text-sm text-green-200">
                    {myReg.status === 'confirmed'
                      ? 'Вы записаны на эту тренировку'
                      : 'Вы в листе ожидания — сообщим, если освободится место'}
                  </p>
                  {!past && (
                    <button
                      onClick={handleCancel}
                      className="rounded-sm border border-white/20 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-primary"
                    >
                      Отменить запись
                    </button>
                  )}
                </div>
                {pickedTrainerName && (
                  <p className="mt-2 pl-7 text-xs text-green-200/70">
                    Ваш тренер: {pickedTrainerName}
                    {pickedDirectionName ? ` · Направление: ${pickedDirectionName}` : ''}
                  </p>
                )}
              </div>
            ) : past ? (
              <p className="text-sm text-gray-500">
                Эта тренировка уже прошла. Посмотрите актуальное расписание.
              </p>
            ) : isIndividual && currentUser ? (
              <div className="space-y-4">
                <div className="rounded-sm border border-white/10 bg-surface p-4">
                  <h3 className="mb-3 text-sm font-semibold text-white">
                    Выберите тренера и направление
                  </h3>
                  <div className="space-y-3 sm:flex sm:gap-3 sm:space-y-0">
                    <select
                      value={pickedDirection}
                      onChange={(e) => {
                        setPickedDirection(e.target.value);
                        // Тренер из другого направления больше не подходит
                        setPickedTrainer('');
                      }}
                      className="flex-1 rounded-sm border border-white/10 bg-primary px-3 py-2.5 text-sm text-white focus:border-accent-red focus:outline-none"
                    >
                      <option value="">— Выберите направление —</option>
                      {directions.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    <select
                      value={pickedTrainer}
                      onChange={(e) => setPickedTrainer(e.target.value)}
                      className="flex-1 rounded-sm border border-white/10 bg-primary px-3 py-2.5 text-sm text-white focus:border-accent-red focus:outline-none"
                    >
                      <option value="">— Выберите тренера —</option>
                      {availableTrainers.map((t) => (
                        <option key={t.id} value={t.id} disabled={busyTrainerIds.has(t.id)}>
                          {busyTrainerIds.has(t.id) ? `${t.name} — занят` : t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {pickedDirection && availableTrainers.length === 0 && (
                    <p className="mt-2 text-xs text-yellow-300">
                      По этому направлению пока нет свободных тренеров — выберите другое.
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={handleRegister} variant="primary">
                    Записаться
                  </Button>
                  <span className="text-xs text-gray-500">
                    Запись подтвердит выбранный тренер
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={handleRegister} variant="primary">
                  {currentUser
                    ? left > 0
                      ? 'Записаться'
                      : 'В лист ожидания'
                    : 'Войти и записаться'}
                </Button>
                <span className="text-xs text-gray-500">
                  {currentUser
                    ? 'Запись можно отменить в любой момент'
                    : 'Для записи нужен аккаунт спортсмена'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Отчёт с занятия: фото и видео загружает тренер после тренировки */}
        {photos.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-gray-500">
              <Camera className="h-3.5 w-3.5" />
              Как прошла тренировка · {photos.length} фото и видео
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((photo) => (
                <figure
                  key={photo.id}
                  className="overflow-hidden rounded-sm border border-white/10 bg-surface"
                >
                  {isVideoUrl(photo.url) ? (
                    <video
                      src={photo.url}
                      controls
                      preload="metadata"
                      playsInline
                      className="aspect-[4/3] w-full bg-black object-cover"
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
                    <figcaption className="px-3 py-2 text-xs text-gray-400">
                      {photo.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
