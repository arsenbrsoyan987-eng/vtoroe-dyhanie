/**
 * Расписание и методика направления «Лыжные гонки».
 *
 * Структура недельная (день + время + группа), а не датированная, поэтому
 * данные живут отдельным файлом: главное расписание школы ведётся в админке,
 * а зимние группы публикуются волной сезона.
 */

export type SkiGroupKind = 'school' | 'group' | 'mini';

export interface SkiSlot {
  id: string;
  /** День недели целиком — для заголовка строки */
  day: string;
  time: string;
  kind: SkiGroupKind;
  /** Чему учимся на этом слоте */
  note: string;
  /** Дни и даты курса внутри сезона */
  dates: string;
  price: string;
  priceNote: string;
  /** Свободные места: пусто — бронирование курса */
  free: string;
  /** soon — группа стартует с первым снегом, открыта предзапись */
  status: 'open' | 'soon';
  /** Кнопка строки: Записаться / Забронировать / Предзапись */
  cta: string;
}

export interface SkiPlace {
  id: string;
  title: string;
  /** Чем хороша трасса для занятий */
  lead: string;
  address: string;
  changing: string;
  rental: string;
  photo: string;
  slots: SkiSlot[];
}

export const SKI_GROUP_LABEL: Record<SkiGroupKind, string> = {
  school: 'Лыжная школа',
  group: 'Групповая',
  mini: 'Мини-группа',
};

/** Все зимние группы ведёт Армен Брсоян — фото из админки школы */
export const SKI_TRAINER = {
  name: 'Армен Брсоян',
  title: 'Школа «Второе Дыхание»',
  photo: '/images/uploads/trainer-1793287265436-photo.jpg',
};

const MINI_NOTE = 'До 4 человек, свой инвентарь';
const MINI_PRICE_NOTE = '1 тренировка 90 минут, с человека';
const SCHOOL_NOTE = 'Коньковый ход за 4 недели';
const SCHOOL_PRICE_NOTE = '8 занятий, бронь 5 900 ₽';
const GROUP_NOTE = 'Для тех, кто освоил базу';

export const SKI_SCHEDULE: SkiPlace[] = [
  {
    id: 'meshersky',
    title: 'Мещерский парк',
    lead: 'Пологие лесные трассы: удобно учиться с нуля',
    address: 'Новомещерский пр., 15, вход № 6',
    changing: 'Тёплые раздевалки',
    rental: 'Есть рядом',
    photo: '/images/zones/meshchersky-park.png',
    slots: [
      {
        id: 'mesh-tue-mini',
        day: 'Вторник',
        time: '09:00–10:30',
        kind: 'mini',
        note: MINI_NOTE,
        dates: 'занятия Вт, Чт · 8 дек – 14 мар',
        price: '2 400 ₽',
        priceNote: MINI_PRICE_NOTE,
        free: 'Свободно 4 из 4',
        status: 'open',
        cta: 'Записаться',
      },
      {
        id: 'mesh-wed-mini',
        day: 'Среда',
        time: '09:00–10:30',
        kind: 'mini',
        note: MINI_NOTE,
        dates: 'занятия Ср, Пт · 9 дек – 14 мар',
        price: '2 400 ₽',
        priceNote: MINI_PRICE_NOTE,
        free: 'Свободно 4 из 4',
        status: 'open',
        cta: 'Записаться',
      },
      {
        id: 'mesh-thu-mini',
        day: 'Четверг',
        time: '09:00–10:30',
        kind: 'mini',
        note: MINI_NOTE,
        dates: 'занятия Вт, Чт · 8 дек – 14 мар',
        price: '2 400 ₽',
        priceNote: MINI_PRICE_NOTE,
        free: 'Свободно 4 из 4',
        status: 'open',
        cta: 'Записаться',
      },
      {
        id: 'mesh-fri-mini',
        day: 'Пятница',
        time: '09:00–10:30',
        kind: 'mini',
        note: MINI_NOTE,
        dates: 'занятия Ср, Пт · 9 дек – 14 мар',
        price: '2 400 ₽',
        priceNote: MINI_PRICE_NOTE,
        free: 'Свободно 4 из 4',
        status: 'open',
        cta: 'Записаться',
      },
      {
        id: 'mesh-sat-school-1',
        day: 'Суббота',
        time: '11:30–13:00',
        kind: 'school',
        note: SCHOOL_NOTE,
        dates: 'занятия Сб, Вс · 5–27 дек · 8 занятий',
        price: '11 900 ₽',
        priceNote: SCHOOL_PRICE_NOTE,
        free: '',
        status: 'open',
        cta: 'Забронировать',
      },
      {
        id: 'mesh-sat-group',
        day: 'Суббота',
        time: '11:30–13:00',
        kind: 'group',
        note: GROUP_NOTE,
        dates: 'занятия Сб, Вс · 5 дек – 14 мар',
        price: '1 800 ₽',
        priceNote: '1 тренировка',
        free: 'Свободно 10 из 10',
        status: 'open',
        cta: 'Записаться',
      },
      {
        id: 'mesh-sat-school-2',
        day: 'Суббота',
        time: '13:30–15:00',
        kind: 'school',
        note: SCHOOL_NOTE,
        dates: 'занятия Сб, Вс · 5–27 дек · 8 занятий',
        price: '11 900 ₽',
        priceNote: SCHOOL_PRICE_NOTE,
        free: '',
        status: 'open',
        cta: 'Забронировать',
      },
      {
        id: 'mesh-sun-school-1',
        day: 'Воскресенье',
        time: '11:30–13:00',
        kind: 'school',
        note: SCHOOL_NOTE,
        dates: 'занятия Сб, Вс · 5–27 дек · 8 занятий',
        price: '11 900 ₽',
        priceNote: SCHOOL_PRICE_NOTE,
        free: '',
        status: 'open',
        cta: 'Забронировать',
      },
      {
        id: 'mesh-sun-group',
        day: 'Воскресенье',
        time: '11:30–13:00',
        kind: 'group',
        note: GROUP_NOTE,
        dates: 'занятия Сб, Вс · 5 дек – 14 мар',
        price: '1 800 ₽',
        priceNote: '1 тренировка',
        free: 'Свободно 10 из 10',
        status: 'open',
        cta: 'Записаться',
      },
      {
        id: 'mesh-sun-school-2',
        day: 'Воскресенье',
        time: '13:30–15:00',
        kind: 'school',
        note: SCHOOL_NOTE,
        dates: 'занятия Сб, Вс · 5–27 дек · 8 занятий',
        price: '11 900 ₽',
        priceNote: SCHOOL_PRICE_NOTE,
        free: '',
        status: 'open',
        cta: 'Забронировать',
      },
    ],
  },
  {
    id: 'odintsovo',
    title: 'Одинцово',
    lead: 'Трасса с рельефом и освещением: кольца 3, 5 и 6 км',
    address: 'Парк им. Ларисы Лазутиной, Манжосовская ул., 1',
    changing: 'Тёплые, с душевыми',
    rental: 'Есть прокат в парке',
    photo: '/images/zones/odintsovo-park.png',
    slots: [
      {
        id: 'odin-tue-mini',
        day: 'Вторник',
        time: '08:00–09:30',
        kind: 'mini',
        note: MINI_NOTE,
        dates: 'занятия Вт, Чт · 8 дек – 14 мар',
        price: '2 400 ₽',
        priceNote: MINI_PRICE_NOTE,
        free: 'Свободно 4 из 4',
        status: 'open',
        cta: 'Записаться',
      },
      {
        id: 'odin-tue-school',
        day: 'Вторник',
        time: '19:15–20:45',
        kind: 'school',
        note: SCHOOL_NOTE,
        dates: 'занятия Вт, Чт · 3–29 дек · 8 занятий',
        price: '11 900 ₽',
        priceNote: SCHOOL_PRICE_NOTE,
        free: '',
        status: 'open',
        cta: 'Забронировать',
      },
      {
        id: 'odin-wed-mini',
        day: 'Среда',
        time: '19:15–20:45',
        kind: 'mini',
        note: MINI_NOTE,
        dates: 'занятия Ср, Пт · 9 дек – 14 мар',
        price: '2 400 ₽',
        priceNote: MINI_PRICE_NOTE,
        free: 'Свободно 4 из 4',
        status: 'open',
        cta: 'Записаться',
      },
      {
        id: 'odin-thu-mini',
        day: 'Четверг',
        time: '08:00–09:30',
        kind: 'mini',
        note: MINI_NOTE,
        dates: 'занятия Вт, Чт · 8 дек – 14 мар',
        price: '2 400 ₽',
        priceNote: MINI_PRICE_NOTE,
        free: 'Свободно 4 из 4',
        status: 'open',
        cta: 'Записаться',
      },
      {
        id: 'odin-thu-school',
        day: 'Четверг',
        time: '19:15–20:45',
        kind: 'school',
        note: SCHOOL_NOTE,
        dates: 'занятия Вт, Чт · 3–29 дек · 8 занятий',
        price: '11 900 ₽',
        priceNote: SCHOOL_PRICE_NOTE,
        free: '',
        status: 'open',
        cta: 'Забронировать',
      },
      {
        id: 'odin-fri-mini',
        day: 'Пятница',
        time: '19:15–20:45',
        kind: 'mini',
        note: MINI_NOTE,
        dates: 'занятия Ср, Пт · 9 дек – 14 мар',
        price: '2 400 ₽',
        priceNote: MINI_PRICE_NOTE,
        free: 'Свободно 4 из 4',
        status: 'open',
        cta: 'Записаться',
      },
    ],
  },
  {
    id: 'luzhniki',
    title: 'Лужники',
    lead: 'Центр города, удобная инфраструктура и освещённые трассы',
    address: 'Лыжная трасса «Лужники», м. Спортивная',
    changing: 'Тёплые раздевалки',
    rental: 'Есть прокат',
    photo: '/images/zones/luzhniki.jpg',
    slots: [
      {
        id: 'luzh-wed-school',
        day: 'Среда',
        time: '19:30–21:00',
        kind: 'school',
        note: SCHOOL_NOTE,
        dates: 'занятия Ср, Пт · 13 янв – 5 фев · 8 занятий',
        price: '11 900 ₽',
        priceNote: SCHOOL_PRICE_NOTE,
        free: '',
        status: 'soon',
        cta: 'Предзапись',
      },
      {
        id: 'luzh-fri-school',
        day: 'Пятница',
        time: '19:30–21:00',
        kind: 'school',
        note: SCHOOL_NOTE,
        dates: 'занятия Ср, Пт · 13 янв – 5 фев · 8 занятий',
        price: '11 900 ₽',
        priceNote: SCHOOL_PRICE_NOTE,
        free: '',
        status: 'soon',
        cta: 'Предзапись',
      },
    ],
  },
];

/**
 * Методика: шесть навыков конькового хода.
 * Порядок обязателен — каждый навык опирается на предыдущий.
 */
export interface SkiSkill {
  id: string;
  /** Короткая метка над названием: «Баланс» */
  tag: string;
  title: string;
  body: string;
}

export const SKI_SKILLS: SkiSkill[] = [
  {
    id: 'balance',
    tag: 'Баланс',
    title: 'Баланс на одной лыже',
    body: 'Учимся держать вес на одной лыже.',
  },
  {
    id: 'glide',
    tag: 'Прокат',
    title: 'Скольжение на одной лыже',
    body: 'Учимся скользить на одной лыже.',
  },
  {
    id: 'skate',
    tag: 'Конёк',
    title: 'Конёк без палок',
    body: 'Скользим коньком без рук.',
  },
  {
    id: 'arms',
    tag: 'Дабл-полинг',
    title: 'Работа рук',
    body: 'Классический одновременный бесшажный ход: работают руки и корпус, лыжи идут параллельно.',
  },
  {
    id: 'together',
    tag: 'Коньковый ход',
    title: 'Синхронность рук и ног',
    body: 'Коньковый ход в полной координации: руки и ноги работают в одном ритме.',
  },
  {
    id: 'terrain',
    tag: 'По рельефу',
    title: 'Трасса и рельеф',
    body: 'Повороты, спуски и подъёмы тем ходом, который вам удобен.',
  },
];