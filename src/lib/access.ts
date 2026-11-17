import type { Trainer, Training } from '../types';
import type { TrainingRegistration, User } from '../store/database';

/**
 * Сколько мест осталось на тренировке.
 *
 * Групповое занятие ограничено capacity, индивидуальное — числом тренеров
 * школы: каждый тренер примет одного спортсмена, поэтому слотов ровно
 * столько, сколько свободных в этот слот тренеров.
 */
export function freeSpots(
  training: Training,
  registrations: TrainingRegistration[],
  trainers: Trainer[]
): number {
  const active = registrations.filter(
    (r) => r.trainingId === training.id && r.status === 'confirmed'
  );

  if (training.format !== 'individual') {
    return Math.max(0, training.spotsAvailable - active.length);
  }

  const busy = new Set(
    active.map((r) => r.selectedTrainerId).filter((id): id is string => Boolean(id))
  );
  return trainers.filter((t) => !busy.has(t.id)).length;
}

/**
 * Тренировки, доступные пользователю в кабинете.
 * Администратор видит всё, тренер — только свои занятия: закреплённые за ним
 * и индивидуальные слоты, где спортсмены выбрали именно его.
 */
export function visibleTrainings(
  trainings: Training[],
  user: User | null,
  registrations: TrainingRegistration[] = []
): Training[] {
  if (!user) return [];
  if (user.role === 'admin') return trainings;
  if (user.role !== 'trainer') return [];

  const trainerId = user.trainerId ?? '';

  // Индивидуальное занятие ведёт выбранный спортсменом тренер, а не автор слота
  const chosen = new Set(
    registrations
      .filter((r) => r.status !== 'cancelled' && r.selectedTrainerId === trainerId)
      .map((r) => r.trainingId)
  );

  return trainings.filter((t) => {
    if (trainerId && t.trainerId === trainerId) return true;
    if (user.name && t.trainer === user.name) return true;
    return t.format === 'individual' && !!trainerId && chosen.has(t.id);
  });
}