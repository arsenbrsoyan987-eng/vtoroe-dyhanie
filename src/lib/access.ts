import type { Training } from '../types';
import type { User } from '../store/database';

/**
 * Тренировки, доступные пользователю в кабинете.
 * Администратор видит всё, тренер — только свои занятия
 * (по привязанному профилю или по совпадению имени).
 */
export function visibleTrainings(trainings: Training[], user: User | null): Training[] {
  if (!user) return [];
  if (user.role === 'admin') return trainings;
  if (user.role !== 'trainer') return [];
  return trainings.filter(
    (t) =>
      (user.trainerId && t.trainerId === user.trainerId) ||
      (!!user.name && t.trainer === user.name)
  );
}
