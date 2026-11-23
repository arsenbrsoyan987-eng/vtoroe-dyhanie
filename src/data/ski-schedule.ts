/**
 * Расписание и методика направления «Лыжные гонки».
 *
 * Структура недельная (день + время + группа), а не датированная, поэтому
 * данные живут отдельным файлом: главное расписание школы ведётся в админке,
 * а зимние группы публикуются волной сезона.
 */

export type SkiGroupKind = 'school' | 'group' | 'pro' | 'mini';

export interface SkiSlot {
  id: string;
  /** День недели целиком — для заголовка строки */
  day: string;
  /** Короткий день для чипов фильтра: Вт, Ср */
  dayShort: string;
  time: string;
  kind: SkiGroupKind;
  /** Подпись группы: чему учимся на этом слоте */
  note: string;
  /** Период занятий внутри сезона */
  dates: string;
  trainer: string;
  /** Пусто — цена согласуется при записи */
  price: string;
  priceNote: string;
  /** soon — группа стартует с первым снегом, открыта предзапись */
  status: 'open' | 'soon';
}

export interface SkiPlace {
  id: string;
  title: string;
  /** Чем хороша трасса для занятий */
  lead: string;
  address: string;
  changing: string;
  rental: string;
  slots: SkiSlot[];
}

export const SKI_GROUP_LABEL: Record<SkiGroupKind, string> = {
  school: 'Лыжная школа',
  group: 'Групповая тренировка',
  pro: 'Группа PRO',
  mini: 'Мини-группа',
};

/** Тренер направления: все зимние группы ведёт он */
const ARMEN = 'Армен';

export const SKI_SCHEDULE: SkiPlace[] = [
  {
    id: 'meshersky',
    title: 'Мещерский парк',
    lead: 'Пологие лесные трассы: удобно учиться с нуля',
    address: 'Новомещерский проезд, 15, вход № 6',
    changing: 'Тёплые раздевалки',
    rental: 'Прокат рядом',
    slots: [
      {
        id: 'mesh-tue-mini',
        day: 'Вторник',
        dayShort: 'Вт',
        time: '09:00–10:30',
        kind: 'mini',
        note: 'До 4 человек, свой инвентарь',
        dates: 'занятия Вт, Чт · 8 дек – 14 мар',
        trainer: ARMEN,
        price: '',
        priceNote: '90 минут, с человека',
        status: 'open',
      },
      {
        id: 'mesh-wed-mini',
        day: 'Среда',
        dayShort: 'Ср',
        time: '09:00–10:30',
        kind: 'mini',
        note: 'До 4 человек, свой инвентарь',
        dates: 'занятия Ср, Пт · 9 дек – 14 мар',
        trainer: ARMEN,
        price: '',
        priceNote: '90 минут, с человека',
        status: 'open',
      },
      {
        id: 'mesh-thu-mini',
        day: 'Четверг',
        dayShort: 'Чт',
        time: '09:00–10:30',
        kind: 'mini',
        note: 'До 4 человек, свой инвентарь',
        dates: 'занятия Вт, Чт · 8 дек – 14 мар',
        trainer: ARMEN,
        price: '',
        priceNote: '90 минут, с человека',
        status: 'open',
      },
      {
        id: 'mesh-fri-mini',
        day: 'Пятница',
        dayShort: 'Пт',
        time: '09:00–10:30',
        kind: 'mini',
        note: 'До 4 человек, свой инвентарь',
        dates: 'занятия Ср, Пт · 9 дек – 14 мар',
        trainer: ARMEN,
        price: '',
        priceNote: '90 минут, с человека',
        status: 'open',
      },
      {
        id: 'mesh-sat-school',
        day: 'Суббота',
        dayShort: 'Сб',
        time: '11:30–13:00',
        kind: 'school',
        note: 'Коньковый ход за 4 недели',
        dates: 'занятия Сб, Вс · 5–27 дек · 8 занятий',
        trainer: ARMEN,
        price: '11 900 ₽',
        priceNote: '8 занятий, бронь 5 900 ₽',
        status: 'open',
      },
      {
        id: 'mesh-sat-group',
        day: 'Суббота',
        dayShort: 'Сб',
        time: '13:30–15:00',
        kind: 'group',
        note: 'Для тех, кто освоил базу',
        dates: 'занятия Сб, Вс · 5 дек – 14 мар',
        trainer: ARMEN,
        price: '1 900 ₽',
        priceNote: '1 тренировка 90 минут',
        status: 'open',
      },
      {
        id: 'mesh-sun-school',
        day: 'Воскресенье',
        dayShort: 'Вс',
        time: '11:30–13:00',
        kind: 'school',
        note: 'Коньковый ход за 4 недели',
        dates: 'занятия Сб, Вс · 5–27 дек · 8 занятий',
        trainer: ARMEN,
        price: '11 900 ₽',
        priceNote: '8 занятий, бронь 5 900 ₽',
        status: 'open',
      },
      {
        id: 'mesh-sun-pro',
        day: 'Воскресенье',
        dayShort: 'Вс',
        time: '13:30–15:00',
        kind: 'pro',
        note: 'Темп, рельеф, подготовка к стартам',
        dates: 'занятия Сб, Вс · 5 дек – 14 мар',
        trainer: ARMEN,
        price: '1 900 ₽',
        priceNote: '1 тренировка 90 минут',
        status: 'open',
      },
    ],
  },
  {
    id: 'odintsovo',
    title: 'Одинцовский парк',
    lead: 'Трасса с рельефом и освещением: кольца 3, 5 и 6 км',
    address: 'г. Одинцово, парк им. Ларисы Лазутиной, Манжосовская ул., 1',
    changing: 'Тёплые раздевалки с душевыми',
    rental: 'Прокат в парке',
    slots: [
      {
        id: 'odin-tue-mini',
        day: 'Вторник',
        dayShort: 'Вт',
        time: '08:00–09:30',
        kind: 'mini',
        note: 'До 4 человек, свой инвентарь',
        dates: 'занятия Вт, Чт · 8 дек – 14 мар',
        trainer: ARMEN,
        price: '',
        priceNote: '90 минут, с человека',
        status: 'open',
      },
      {
        id: 'odin-tue-school',
        day: 'Вторник',
        dayShort: 'Вт',
        time: '19:15–20:45',
        kind: 'school',
        note: 'Коньковый ход за 4 недели',
        dates: 'занятия Вт, Чт · 3–29 дек · 8 занятий',
        trainer: ARMEN,
        price: '11 900 ₽',
        priceNote: '8 занятий, бронь 5 900 ₽',
        status: 'open',
      },
      {
        id: 'odin-wed-mini',
        day: 'Среда',
        dayShort: 'Ср',
        time: '19:15–20:45',
        kind: 'mini',
        note: 'До 4 человек, свой инвентарь',
        dates: 'занятия Ср, Пт · 9 дек – 14 мар',
        trainer: ARMEN,
        price: '',
        priceNote: '90 минут, с человека',
        status: 'open',
      },
      {
        id: 'odin-thu-mini',
        day: 'Четверг',
        dayShort: 'Чт',
        time: '08:00–09:30',
        kind: 'mini',
        note: 'До 4 человек, свой инвентарь',
        dates: 'занятия Вт, Чт · 8 дек – 14 мар',
        trainer: ARMEN,
        price: '',
        priceNote: '90 минут, с человека',
        status: 'open',
      },
      {
        id: 'odin-thu-school',
        day: 'Четверг',
        dayShort: 'Чт',
        time: '19:15–20:45',
        kind: 'school',
        note: 'Коньковый ход за 4 недели',
        dates: 'занятия Вт, Чт · 3–29 дек · 8 занятий',
        trainer: ARMEN,
        price: '11 900 ₽',
        priceNote: '8 занятий, бронь 5 900 ₽',
        status: 'open',
      },
      {
        id: 'odin-fri-mini',
        day: 'Пятница',
        dayShort: 'Пт',
        time: '19:15–20:45',
        kind: 'mini',
        note: 'До 4 человек, свой инвентарь',
        dates: 'занятия Ср, Пт · 9 дек – 14 мар',
        trainer: ARMEN,
        price: '',
        priceNote: '90 минут, с человека',
        status: 'open',
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
    slots: [
      {
        id: 'luzh-wed-school',
        day: 'Среда',
        dayShort: 'Ср',
        time: '19:30–21:00',
        kind: 'school',
        note: 'Коньковый ход за 4 недели',
        dates: 'занятия Ср, Пт · 13 янв – 5 фев · 8 занятий',
        trainer: ARMEN,
        price: '11 900 ₽',
        priceNote: '8 занятий, бронь 5 900 ₽',
        status: 'soon',
      },
      {
        id: 'luzh-fri-group',
        day: 'Пятница',
        dayShort: 'Пт',
        time: '19:30–21:00',
        kind: 'group',
        note: 'Для тех, кто освоил базу',
        dates: 'занятия Ср, Пт · 13 янв – 5 фев',
        trainer: ARMEN,
        price: '1 900 ₽',
        priceNote: '1 тренировка 90 минут',
        status: 'soon',
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
  /** Короткая метка над названием: «Одна лыжа» */
  tag: string;
  title: string;
  body: string;
}

export const SKI_SKILLS: SkiSkill[] = [
  {
    id: 'balance',
    tag: 'Одна лыжа',
    title: 'Баланс на одной лыже',
    body: 'Учимся держать вес на одной лыже.',
  },
  {
    id: 'push',
    tag: 'Полуконёк',
    title: 'Толчок ногой',
    body: 'Отталкиваемся лыжей с внутреннего канта.',
  },
  {
    id: 'skate',
    tag: 'Конёк',
    title: 'Конёк без палок',
    body: 'Едем коньком, толкаясь каждой ногой.',
  },
  {
    id: 'arms',
    tag: 'Бесшажный ход',
    title: 'Работа рук',
    body: 'Толкаемся палками корпусом, лыжи идут прямо.',
  },
  {
    id: 'together',
    tag: 'Одношажный ход',
    title: 'Руки и ноги вместе',
    body: 'Одношажный и двухшажный ход: руки и ноги в одном ритме.',
  },
  {
    id: 'terrain',
    tag: 'По рельефу',
    title: 'Трасса и рельеф',
    body: 'Повороты, спуски и подъёмы тем ходом, который вам удобен.',
  },
];
