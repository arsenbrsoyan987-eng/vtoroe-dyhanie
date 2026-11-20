/**
 * Склонение существительных по числу.
 *
 * Витрина показывает счётчики («12 тренировок», «3 программы»), и без
 * склонения они читаются как машинный перевод. Правила русские: 1 —
 * единственная форма, 2–4 — родительный падеж единственного числа,
 * остальные — родительный множественного.
 */
export function plural(
  n: number,
  one: string,
  few: string,
  many: string,
): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

/** «12 тренировок» — число со словом */
export function countNoun(
  n: number,
  one: string,
  few: string,
  many: string,
): string {
  return `${n} ${plural(n, one, few, many)}`;
}
