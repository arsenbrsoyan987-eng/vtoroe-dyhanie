/**
 * Оценка времени чтения материала.
 *
 * 180 слов в минуту — средний темп для нетекнического текста. Меньше минуты
 * не показываем: «0 мин» на карточке выглядит как ошибка вёрстки.
 */
export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}
