/** Контактные данные клуба — единый источник для футера, политики и контактов. */
export const CLUB = {
  name: 'Второе дыхание',
  fullName: 'Спортивный клуб «Второе дыхание»',
  city: 'Москва',
  addressNote: 'Тренировки проходят на городских площадках и в парках — точку сбора указываем в расписании',
  phones: ['+7 916 952-25-10', '+7 987 719-40-42'],
  email: 'vtoroedyhanie2@yandex.ru',
  telegram: 'https://t.me/vtotoedyhanieski',
  telegramLabel: '@vtotoedyhanieski',
  owner: {
    name: 'Брсоян Арсен Арменович',
    role: 'Основатель клуба',
    email: 'arsenbrsoyan@yandex.ru',
    phone: '+7 987 719-40-42',
  },
} as const;

/** `tel:`-ссылка из человекочитаемого номера */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
