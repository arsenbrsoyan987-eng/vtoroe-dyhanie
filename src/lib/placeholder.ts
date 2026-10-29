/**
 * Данные-заглушки вида «[Имя тренера]», «[email@club.ru]» или
 * «[X] лет тренерского стажа».
 *
 * Пока владелец не заполнил карточки, эти строки видны на публичных страницах.
 * Показывать их посетителю хуже, чем не показывать ничего: посетитель решает,
 * что клуб не работает. Поэтому такие значения подменяем нейтральным текстом
 * или скрываем блок целиком.
 */
export function isPlaceholder(value: string | undefined | null): boolean {
  if (!value) return false;
  // Заглушка — либо строка целиком в скобках, либо строка, где скобки стоят
  // внутри: «[X] лет тренерского стажа».
  return /\[[^\]]*\]/.test(value);
}

/** Значение для вывода: пустая строка, если это заглушка */
export function realValue(value: string | undefined | null): string {
  if (!value || isPlaceholder(value)) return '';
  return value;
}

/** Значение для вывода с нейтральной подменой */
export function displayValue(
  value: string | undefined | null,
  fallback = '',
): string {
  return realValue(value) || fallback;
}

/** Есть ли в наборе хотя бы одна незаполненная строка */
export function anyPlaceholder(values: Array<string | undefined | null>): boolean {
  return values.some((v) => isPlaceholder(v));
}

/** Запись заполнена целиком: ни одного поля-заглушки */
export function isFilled<T extends object>(
  item: T,
  keys: Array<keyof T>,
): boolean {
  return keys.every((key) => {
    const value = item[key];
    if (Array.isArray(value)) {
      return value.length > 0 && value.every((v) => typeof v !== 'string' || !isPlaceholder(v));
    }
    if (typeof value === 'string') return !isPlaceholder(value);
    return true;
  });
}
