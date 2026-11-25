import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTrainings } from '../../store/trainingsStore';
import { useTrainers } from '../../store/trainersStore';
import { useDirections } from '../../store/directionsStore';
import { countNoun } from '../../lib/plural';
import {
  ActionButton,
  EmptyState,
  PageHeader,
  Panel,
  StatusBadge,
  Tabs,
  fieldClass,
  labelClass,
} from '../../components/cabinet/ui';
import { CalendarDays, Clock, MapPin, Users, Wallet, X } from 'lucide-react';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });

export default function AthleteRegistrations() {
  const trainings = useTrainings();
  const trainers = useTrainers();
  const directions = useDirections();
  const { currentUser, registrations, register, cancelRegistration } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<'mine' | 'all'>('mine');
  const [cancelTarget, setCancelTarget] = useState<{ id: string; name: string } | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const mine = useMemo(
    () =>
      registrations
        .filter((r) => r.userId === currentUser?.id && r.status !== 'cancelled')
        .sort((a, b) => a.registeredAt.localeCompare(b.registeredAt)),
    [registrations, currentUser?.id]
  );

  const confirmedCount = (trainingId: string) =>
    registrations.filter((r) => r.trainingId === trainingId && r.status === 'confirmed').length;

  /**
   * Здесь записывают только на групповые тренировки: индивидуальная требует
   * выбрать тренера и направление, её оформляют на /schedule/<id>.
   */
  const handleRegister = async (trainingId: string, capacity: number, name: string) => {
    const status = await register(trainingId, capacity);
    if (status === 'already') {
      toast('Вы уже записаны на эту тренировку', 'info');
    } else if (status === 'waitlist') {
      toast(`Мест нет — вы в листе ожидания: «${name}»`, 'info');
    } else {
      toast(`Запись подтверждена: «${name}»`);
    }
  };

  const handleCancel = (regId: string, name: string) => {
    setCancelTarget({ id: regId, name });
    setCancelReason('');
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    await cancelRegistration(cancelTarget.id, cancelReason, cancelTarget.name);
    toast(`Запись отменена: «${cancelTarget.name}»`, 'info');
    setCancelTarget(null);
    setCancelReason('');
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Мой сезон"
        title="Мои записи"
        subtitle="Активные записи и лист ожидания. Отменить запись можно в любой момент."
      />

      <div className="mb-5">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { value: 'mine', label: `Мои записи (${mine.length})` },
            { value: 'all', label: 'Все тренировки' },
          ]}
        />
      </div>

      {cancelTarget && (
        <Panel className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 border-brand/30 shadow-lift sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-ink">Отменить запись</h2>
              <p className="mt-1 text-xs text-graphite">«{cancelTarget.name}»</p>
            </div>
            <button
              type="button"
              onClick={() => setCancelTarget(null)}
              className="text-graphite transition-colors hover:text-ink"
              aria-label="Закрыть"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <label htmlFor="cancel-reason" className={labelClass}>
            Причина (необязательно)
          </label>
          <textarea
            id="cancel-reason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            placeholder="Например: заболел, уехал в командировку"
            className={`${fieldClass} resize-none`}
          />
          <p className="mt-1.5 text-[0.68rem] leading-relaxed text-graphite">
            Причина уйдёт администратору школы — он предупредит тренера и поможет перенести
            занятие.
          </p>

          <div className="mt-4 flex gap-2">
            <ActionButton onClick={confirmCancel} variant="danger">
              Подтвердить отмену
            </ActionButton>
            <ActionButton onClick={() => setCancelTarget(null)} variant="outline">
              Оставить запись
            </ActionButton>
          </div>
        </Panel>
      )}
      {cancelTarget && (
        <button
          type="button"
          aria-label="Закрыть окно отмены"
          onClick={() => setCancelTarget(null)}
          className="fixed inset-0 z-40 bg-ink/30"
        />
      )}

      {tab === 'mine' && (
        <div className="space-y-3">
          {mine.length === 0 ? (
            <EmptyState
              title="Активных записей нет"
              text="Выберите тренировку в расписании — запись займёт пару секунд."
              action={<ActionButton onClick={() => setTab('all')}>Выбрать тренировку</ActionButton>}
            />
          ) : (
            mine.map((reg) => {
              const training = trainings.find((t) => t.id === reg.trainingId);
              if (!training) return null;
              return (
                <Panel key={reg.id} className="hover:shadow-lift">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-bold text-ink">{training.name}</h2>
                        <StatusBadge tone={reg.status === 'confirmed' ? 'green' : 'yellow'}>
                          {reg.status === 'confirmed' ? 'Подтверждено' : 'Лист ожидания'}
                        </StatusBadge>
                        {reg.attended && <StatusBadge tone="blue">Посещено</StatusBadge>}
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-graphite">
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
                      <p className="mt-2 text-xs text-graphite">
                        Направление:{' '}
                        {reg.selectedDirectionId
                          ? directions.find((d) => d.id === reg.selectedDirectionId)?.name ??
                            training.directionName
                          : training.directionName}{' '}
                        · Тренер:{' '}
                        {reg.selectedTrainerId
                          ? trainers.find((x) => x.id === reg.selectedTrainerId)?.name ??
                            training.trainer
                          : training.trainer}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <ActionButton to="/schedule" variant="outline">
                        Детали
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleCancel(reg.id, training.name)}
                        variant="danger"
                      >
                        Отменить
                      </ActionButton>
                    </div>
                  </div>
                </Panel>
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
              <Panel key={t.id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="mb-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-navy">
                      {t.directionName} · {t.level}
                    </p>
                    <h2 className="text-base font-bold text-ink">{t.name}</h2>
                    <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-graphite">
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
                        {t.format === 'individual'
                          ? 'Индивидуально'
                          : left > 0
                            ? countNoun(left, 'свободное место', 'свободных места', 'свободных мест')
                            : 'мест нет'}
                      </span>
                      {t.format === 'individual' && t.priceIndividual && (
                        <span className="flex items-center gap-1.5 font-semibold text-ink">
                          <Wallet className="h-3.5 w-3.5" />
                          {t.priceIndividual} ₽
                        </span>
                      )}
                      {t.format === 'group' && t.priceGroup && (
                        <span className="flex items-center gap-1.5">
                          <Wallet className="h-3.5 w-3.5" />
                          {t.priceGroup} ₽
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {booked ? (
                      <span className="text-xs font-semibold text-emerald-700">Вы записаны</span>
                    ) : t.format === 'individual' ? (
                      <ActionButton to={`/schedule/${t.id}`}>Выбрать тренера</ActionButton>
                    ) : (
                      <ActionButton
                        onClick={() => handleRegister(t.id, t.spotsAvailable, t.name)}
                      >
                        {left > 0 ? 'Записаться' : 'В лист ожидания'}
                      </ActionButton>
                    )}
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}