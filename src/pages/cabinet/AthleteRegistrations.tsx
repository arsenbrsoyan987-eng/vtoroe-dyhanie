import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTrainings } from '../../store/trainingsStore';
import Button from '../../components/ui/Button';
import { CalendarDays, Clock, MapPin, Users } from 'lucide-react';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });

export default function AthleteRegistrations() {
  const trainings = useTrainings();
  const {
    currentUser,
    registrations,
    register,
    cancelRegistration,
  } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<'mine' | 'all'>('mine');

  const mine = useMemo(
    () =>
      registrations
        .filter((r) => r.userId === currentUser?.id && r.status !== 'cancelled')
        .sort((a, b) => a.registeredAt.localeCompare(b.registeredAt)),
    [registrations, currentUser?.id]
  );

  const confirmedCount = (trainingId: string) =>
    registrations.filter((r) => r.trainingId === trainingId && r.status === 'confirmed').length;

  const handleRegister = (trainingId: string, capacity: number, name: string) => {
    const status = register(trainingId, capacity);
    if (status === 'already') {
      toast('Вы уже записаны на эту тренировку', 'info');
    } else if (status === 'waitlist') {
      toast(`Мест нет — вы в листе ожидания: «${name}»`, 'info');
    } else {
      toast(`Запись подтверждена: «${name}»`);
    }
  };

  const handleCancel = (regId: string, name: string) => {
    cancelRegistration(regId);
    toast(`Запись отменена: «${name}»`, 'info');
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 text-2xl font-bold text-white">Мои записи</h1>
      <p className="mb-6 text-sm text-gray-400">
        Управляйте записями на тренировки и листом ожидания
      </p>

      <div className="mb-6 inline-flex rounded-sm border border-white/10 bg-surface p-1">
        {(
          [
            ['mine', `Мои записи (${mine.length})`],
            ['all', 'Все тренировки'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-sm px-4 py-2 text-xs font-medium transition-colors ${
              tab === key ? 'bg-accent-red text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'mine' && (
        <div className="space-y-3">
          {mine.length === 0 ? (
            <div className="rounded-sm border border-white/10 bg-surface p-10 text-center">
              <p className="mb-4 text-sm text-gray-400">У вас пока нет активных записей</p>
              <Button onClick={() => setTab('all')} variant="primary" size="sm">
                Выбрать тренировку
              </Button>
            </div>
          ) : (
            mine.map((reg) => {
              const training = trainings.find((t) => t.id === reg.trainingId);
              if (!training) return null;
              return (
                <article
                  key={reg.id}
                  className="rounded-sm border border-white/10 bg-surface p-5 transition-colors hover:border-white/20"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-white">{training.name}</h2>
                        <span
                          className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            reg.status === 'confirmed'
                              ? 'bg-green-500/15 text-green-400'
                              : 'bg-yellow-500/15 text-yellow-400'
                          }`}
                        >
                          {reg.status === 'confirmed' ? 'Подтверждено' : 'Лист ожидания'}
                        </span>
                        {reg.attended && (
                          <span className="rounded-sm bg-accent-blue/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-blue">
                            Посещено
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(training.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {training.time} · {training.duration}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {training.location}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-600">
                        Направление: {training.directionName} · Тренер: {training.trainer}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Link
                        to="/schedule"
                        className="rounded-sm border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-primary"
                      >
                        Детали
                      </Link>
                      <Button
                        onClick={() => handleCancel(reg.id, training.name)}
                        variant="outline"
                        size="sm"
                      >
                        Отменить
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      {tab === 'all' && (
        <div className="space-y-3">
          {trainings.map((t) => {
            const booked = mine.some((r) => r.trainingId === t.id);
            const taken = confirmedCount(t.id);
            const left = Math.max(0, t.spotsAvailable - taken);
            return (
              <article
                key={t.id}
                className="rounded-sm border border-white/10 bg-surface p-5 transition-colors hover:border-white/20"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent-blue">
                      {t.directionName} · {t.level}
                    </p>
                    <h2 className="font-semibold text-white">{t.name}</h2>
                    <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(t.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {t.time} · {t.duration}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {left > 0 ? `${left} мест` : 'мест нет'}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {booked ? (
                      <span className="text-xs text-gray-500">Вы записаны</span>
                    ) : (
                      <Button
                        onClick={() => handleRegister(t.id, t.spotsAvailable, t.name)}
                        variant="primary"
                        size="sm"
                      >
                        {left > 0 ? 'Записаться' : 'В лист ожидания'}
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
