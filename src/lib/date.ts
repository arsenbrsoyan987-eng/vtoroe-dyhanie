/** Работе с датами в локальном часовом поясе (без сдвигов UTC). */

/** Названия месяцев для заголовка календаря */
export const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

/** Дни недели с понедельника — порядок сетки календаря */
export const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** Date → `YYYY-MM-DD` по локальному времени */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Сегодняшняя дата в формате `YYYY-MM-DD` */
export function todayISO(): string {
  return toISODate(new Date());
}

/** Дата через `offset` дней от сегодняшней */
export function dateFromToday(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return toISODate(d);
}

/** Дата уже прошла (сравнение по календарным дням) */
export function isPastDate(iso: string): boolean {
  return iso < todayISO();
}

/** Человекочитаемая дата: «25 октября, сб» */
export function formatDate(iso: string, withWeekday = true): string {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    ...(withWeekday ? { weekday: 'short' as const } : {}),
  });
}
