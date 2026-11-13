import type { Direction } from '../types';
import directionsJson from './directions.json';

/**
 * Начальные направления.
 *
 * Значения живут в `directions.json`, потому что их читают два потребителя:
 * приложение (как запасной вариант, пока база недоступна) и
 * `scripts/seed-supabase.cjs`, который переносит их в таблицу public.directions.
 * Держать один и тот же текст в TS и в скрипте нельзя — копии разъезжаются.
 */
export const directions: Direction[] = directionsJson as Direction[];