/**
 * Локации для тренировок.
 *
 * Данные взяты со страницы goldfinchteam.com/zones (за исключением
 * Битцевский лес, Волкуша, Дворец пионеров, Измайловский парк,
 * КСК Битца, Лосиный остров, Марина, Парк 850-летия, Поляны,
 * Усадьба Узкая). Добавлена локация «Одинцовский парк».
 */

export interface Zone {
  id: string;
  title: string;
  lat: number;
  lng: number;
  metro: string;
  metroLine: string;
  lineColor: 'red' | 'purple' | 'gray' | 'orange' | 'yellow' | 'blue' | 'green' | 'mc' | 'none';
  activities: string[];
  description: string;
  address: string;
  meetingPoint: string;
  photo: string;
}

export const zones: Zone[] = [
  {
    id: 'aleshkinsky-forest',
    title: 'Алёшкинский лес',
    lat: 55.864232,
    lng: 37.428149,
    metro: 'м. Планерная',
    metroLine: 'Фиолетовая линия',
    lineColor: 'purple',
    activities: ['Беговые лыжи', 'Лыжероллеры'],
    description: 'Лыжероллерная трасса. Есть раздевалка, часы работы с 10:00-21:00',
    address: 'ул. Вилиса Лациса, 26 — у входа в пункт проката',
    meetingPoint: 'ул. Вилиса Лациса, 26 — у входа в пункт проката',
    photo: '/images/zones/aleshkinsky-forest.jpg',
  },
  {
    id: 'bg-msu',
    title: 'БГ МГУ, Воробьёвы горы',
    lat: 55.702999,
    lng: 37.530883,
    metro: 'м. Воробьёвы горы',
    metroLine: 'Красная линия',
    lineColor: 'red',
    activities: ['Беговые лыжи'],
    description: 'Лыжная трасса на Большом Газоне МГУ.',
    address: 'ул. Косыгина, 28 ст2',
    meetingPoint: 'на парковке м. Воробьёвы горы, ул. Косыгина, 28 ст2, встреча на парковке',
    photo: '/images/zones/bg-msu.webp',
  },
  {
    id: 'vorobiev-yory',
    title: 'Воробьёвы горы',
    lat: 55.705954,
    lng: 37.55465,
    metro: 'м. Воробьёвы горы',
    metroLine: 'Красная линия',
    lineColor: 'red',
    activities: ['Бег', 'ОФП', 'Лыжероллеры', 'Лыжная имитация', 'Скандинавская ходьба'],
    description: 'Имитационные подъемы для тренировок.',
    address: '4-й Воробьевский проезд',
    meetingPoint: 'У остановки общественного транспорта 4-й Воробьевский проезд',
    photo: '/images/zones/vorobiev-yory.jpg',
  },
  {
    id: 'kant',
    title: 'Кант',
    lat: 55.676052,
    lng: 37.612414,
    metro: 'м. Нагорная',
    metroLine: 'Серая линия',
    lineColor: 'gray',
    activities: ['Лыжная имитация'],
    description: 'Спортивный комплекс, горнолыжный склон. Есть прокат, раздевалки и кафе.',
    address: 'Электролитный проезд, вл. 7Б, у раздевалки',
    meetingPoint: 'Электролитный проезд, вл. 7Б, у раздевалки',
    photo: '/images/zones/kant.png',
  },
  {
    id: 'krasnogorsk-zorkiy',
    title: 'Красногорск, Стадион Зоркий',
    lat: 55.82869,
    lng: 37.328249,
    metro: 'м. Митино; м. Пятницкое шоссе; м. Волоколамская',
    metroLine: 'Синяя линия',
    lineColor: 'blue',
    activities: ['Беговые лыжи'],
    description: 'Лыжная трасса, раздевалка, прокат. Часы работы: 09:00-21:00',
    address: 'г. Красногорск, ул. Речная, 37, у входа в пункт проката',
    meetingPoint: 'г. Красногорск, ул. Речная, 37, у входа в пункт проката',
    photo: '/images/zones/krasnogorsk-zorkiy.png',
  },
  {
    id: 'krylatskoe',
    title: 'Крылатское',
    lat: 55.762997,
    lng: 37.432977,
    metro: 'м. Молодёжная; м. Крылатское',
    metroLine: 'Синяя линия',
    lineColor: 'blue',
    activities: ['Бег', 'Лыжная имитация', 'Лыжероллеры'],
    description: 'Асфальтовые/лыжные дорожки вдоль Гребного канала.',
    address: 'Парковка, ближайшая к остановке "Гребной канал"',
    meetingPoint: 'Парковка, ближайшая к остановке "Гребной канал"',
    photo: '/images/zones/krylatskoe.webp',
  },
  {
    id: 'luzhniki',
    title: 'Лужники',
    lat: 55.716109,
    lng: 37.568695,
    metro: 'м. Воробьёвы горы',
    metroLine: 'Красная линия',
    lineColor: 'red',
    activities: ['Бег', 'Трейлраннинг'],
    description: 'Парковка платная от 300 р в час.',
    address: 'Лужнецкая наб., 24, стр. 4 (у Аквакомплекса)',
    meetingPoint: 'Лужнецкая наб., 24, стр. 4 (у Аквакомплекса)',
    photo: '/images/zones/luzhniki.jpg',
  },
  {
    id: 'meshchersky-park',
    title: 'Мещерский парк',
    lat: 55.663573,
    lng: 37.386705,
    metro: 'м. Солнцево; D4 ст. Солнечная',
    metroLine: 'Жёлтая линия; МЦД-4',
    lineColor: 'yellow',
    activities: ['ОФП', 'Бег', 'Лыжероллеры', 'Беговые лыжи', 'Лыжная имитация', 'Скандинавская ходьба', 'Хайкинг'],
    description: 'Лес с грунтовыми дорожками, асфальтовый круг. Есть раздевалка и прокат, часы работы с 9:00 до 21:00',
    address: 'Новомещерский проезд, 15',
    meetingPoint: 'Новомещерский проезд, 15',
    photo: '/images/zones/meshchersky-park.png',
  },
  {
    id: 'park-pobedy',
    title: 'Парк Победы',
    lat: 55.763182,
    lng: 37.390674,
    metro: 'м. Минская; D4 ст. Минская',
    metroLine: 'Жёлтая линия; МЦД-4',
    lineColor: 'yellow',
    activities: ['Лыжероллеры', 'ОФП'],
    description: 'Асфальтовые дорожки в парке.',
    address: 'ул. Минская',
    meetingPoint: 'Парковка, ул. Минская',
    photo: '/images/zones/park-pobedy.png',
  },
  {
    id: 'romashkovsky-forest',
    title: 'Ромашковский лес',
    lat: 55.763182,
    lng: 37.361379,
    metro: 'ст. Ромашково',
    metroLine: 'Без линии',
    lineColor: 'none',
    activities: ['Кросс-поход'],
    description: 'Лыжная трасса, раздевалка, прокат.',
    address: 'Одинцовский район, село Ромашково, улица Советская, дом 113',
    meetingPoint: 'Одинцовский район, село Ромашково, улица Советская, дом 113',
    photo: '/images/zones/romashkovsky-forest.png',
  },
  {
    id: 'odintsovo-park',
    title: 'Одинцовский парк',
    lat: 55.705437,
    lng: 37.295068,
    metro: 'D1 ст. Одинцово',
    metroLine: 'МЦД-1',
    lineColor: 'mc',
    activities: ['Лыжероллеры', 'Беговые лыжи', 'ОФП', 'Лыжная имитация', 'Кросс-поход'],
    description: 'Лыжероллерная трасса, есть раздевалка и кафе. Часы работы с 9:00 до 21:00',
    address: 'г. Одинцово, 3-й км Красногорского шоссе у входа в парк',
    meetingPoint: 'г. Одинцово, 3-й км Красногорского шоссе у входа в парк',
    photo: '/images/zones/odintsovo-park.png',
  },
];

export const lineColorMap: Record<string, string> = {
  red: '#E31E24',
  purple: '#9B23B4',
  gray: '#6B7280',
  orange: '#F59E0B',
  yellow: '#EAB308',
  blue: '#2563EB',
  green: '#16A34A',
  mc: '#00A650',
  none: '#9CA3AF',
};
