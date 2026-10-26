import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTrainings } from '../store/trainingsStore';
import { formatDate, isPastDate } from '../lib/date';
import Button from '../components/ui/Button';
import {
  ArrowLeft,
  CalendarDays,
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
  const { currentUser, registrations, register, cancelRegistration } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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
  const capacity = training.spotsAvailable;
  const left = Math.max(0, capacity - confirmed);
  const past = isPastDate(training.date);

  const myReg = currentUser
    ? registrations.find(
        (r) => r.userId === currentUser.id &&
          r.trainingId === training.id &&
          r.status !== 'cancelled'
      )
    : undefined;

  const handleRegister = () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/schedule/${training.id}` } });
      return;
    }
    const status = register(training.id, capacity);
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
                {training.location}
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <User className="h-4 w-4 shrink-0 text-gray-500" />
                {training.trainer}
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Users className="h-4 w-4 shrink-0 text-gray-500" />
                {left > 0 ? `Свободно мест: ${left} из ${capacity}` : 'Мест нет'}
              </div>
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
              <div className="flex flex-wrap items-center gap-3 rounded-sm border border-green-500/30 bg-green-500/10 px-4 py-3">
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
            ) : past ? (
              <p className="text-sm text-gray-500">
                Эта тренировка уже прошла. Посмотрите актуальное расписание.
              </p>
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
      </div>
    </div>
  );
}
