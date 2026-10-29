import type { Route } from '../types';

/**
 * Типовые форматы маршрутов клуба. Конкретные точки сбора и треки
 * публикуем в анонсе каждой тренировки — здесь только характеристики
 * формата: дистанция, набор и время.
 */
export const routes: Route[] = [
  {
    id: 'route-1',
    name: 'Парковая петля',
    type: 'running',
    image: '/images/route.svg',
    distance: '~5 км',
    elevation: 'Ровный',
    duration: '25–35 мин',
    difficulty: 'easy',
    description:
      'Ровная петля по парковым дорожкам и грунту. Формат для начинающих и восстановительных тренировок: держим комфортный темп и работаем над техникой.',
    startPoint: 'В анонсе',
    mapUrl: '',
  },
  {
    id: 'route-2',
    name: 'Холмистая тропа',
    type: 'trail',
    image: '/images/trail.svg',
    distance: '~12 км',
    elevation: '~350 м набора',
    duration: '1,5–2 часа',
    difficulty: 'medium',
    description:
      'Лесная тропа с подъёмами и спусками. Технически несложно, но нужна базовая выносливость: учимся работать с набором высоты и держать пульс на подъёмах.',
    startPoint: 'В анонсе',
    mapUrl: '',
  },
  {
    id: 'route-3',
    name: 'Пригородное кольцо',
    type: 'cycling',
    image: '/images/cycling.svg',
    distance: '~45 км',
    elevation: '~200 м набора',
    duration: '2–2,5 часа',
    difficulty: 'medium',
    description:
      'Кольцевой веломаршрут по дорогам с минимальным трафиком. Групповая езда в строю, работа над педальным кругом и равномерным темпом.',
    startPoint: 'В анонсе',
    mapUrl: '',
  },
  {
    id: 'route-4',
    name: 'Осенний лес',
    type: 'hiking',
    image: '/images/hiking.svg',
    distance: '~15 км',
    elevation: '~150 м набора',
    duration: '4–5 часов',
    difficulty: 'easy',
    description:
      'Однодневный пеший маршрут через смешанный лес с выходом к воде. Подходит для начинающих: темп спокойный, привал с обедом на природе.',
    startPoint: 'В анонсе',
    mapUrl: '',
  },
];