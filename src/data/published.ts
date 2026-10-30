import publishedJson from './published.json';
import type {
  Camp,
  Event,
  NewsItem,
  SportResult,
  Testimonial,
  Trainer,
  Training,
} from '../types';

/**
 * Данные, которые видят ВСЕ посетители.
 *
 * Админка пишет в localStorage — это память одного браузера, поэтому правки
 * с телефона владельца не появлялись у других людей. `published.json`
 * лежит в репозитории: он попадает в сборку, и его обновление через
 * админку (кнопка «Опубликовать») пересобирает сайт для всех.
 */
export interface PublishedData {
  updatedAt: string;
  trainers: Trainer[];
  trainings: Training[];
  events: Event[];
  news: NewsItem[];
  testimonials: Testimonial[];
  results: SportResult[];
  camps?: Camp[];
}

export const published = publishedJson as PublishedData;

/** Опубликованные записи непусты — тогда они важнее демо-данных из data/*.ts */
export function publishedOr<T>(key: keyof Omit<PublishedData, 'updatedAt'>, fallback: T[]): T[] {
  const list = published[key] as unknown as T[];
  return Array.isArray(list) && list.length > 0 ? list : fallback;
}

/** Есть ли что показывать: сайт уже наполнен реальными данными */
export const hasPublishedContent = published.trainers.length > 0;
