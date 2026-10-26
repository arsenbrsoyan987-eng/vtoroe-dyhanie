// i18n — многоязычная поддержка (архитектура на будущее)
//
// Для подключения:
// 1. Установить библиотеку (например, i18next + react-i18next)
// 2. Добавить файлы переводов: src/i18n/en.ts, src/i18n/de.ts и т.д.
// 3. Настроить переключатель языка в Header
//
// Пример структуры переводов:
//
// const translations = {
//   ru: {
//     nav: { directions: 'Направления', schedule: 'Расписание' },
//     hero: { title: 'Второе дыхание', subtitle: 'Больше, чем спорт' },
//   },
//   en: {
//     nav: { directions: 'Directions', schedule: 'Schedule' },
//     hero: { title: 'Second Breath', subtitle: 'More than sport' },
//   },
// };
//
// Все тексты на сайте должны использовать ключи переводов,
// а не быть захардкоженными строками.

export const currentLocale = 'ru' as const;
export type Locale = typeof currentLocale;

export const supportedLocales: Locale[] = ['ru'];

// TODO: При подключении i18n заменить статические тексты
// на функции: t('hero.title'), t('nav.directions') и т.д.
