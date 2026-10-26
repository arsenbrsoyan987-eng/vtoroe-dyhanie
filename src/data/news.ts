import type { NewsItem, SportResult, Testimonial } from '../types';

export const news: NewsItem[] = [
  {
    id: 'news-1',
    title: '[Заголовок новости]',
    summary: 'Демонстрационная новость. Здесь будет анонс предстоящего события или отчёт о прошедшем мероприятии клуба.',
    content: '[Полный текст новости]',
    date: '2026-10-20',
    category: 'События',
    image: '/images/about.svg-14dd04022da1?w=600&h=400&fit=crop',
  },
  {
    id: 'news-2',
    title: '[Заголовок новости]',
    summary: 'Демонстрационная новость. Здесь будет информация о достижениях участников клуба.',
    content: '[Полный текст новости]',
    date: '2026-10-15',
    category: 'Результаты',
    image: '/images/running.svg-db6ffd4facb5?w=600&h=400&fit=crop',
  },
  {
    id: 'news-3',
    title: '[Заголовок новости]',
    summary: 'Демонстрационная новость. Здесь будет анонс нового направления тренировок.',
    content: '[Полный текст новости]',
    date: '2026-10-10',
    category: 'Клуб',
    image: '/images/cycling.svg-2277a4c46182?w=600&h=400&fit=crop',
  },
];

export const results: SportResult[] = [
  {
    id: 'result-1',
    athleteName: '[Имя спортсмена]',
    event: '[Название соревнования]',
    date: '2026-10-01',
    discipline: '[Дисциплина, дистанция]',
    result: '[Результат]',
    place: '[Место]',
    protocolUrl: '',
  },
  {
    id: 'result-2',
    athleteName: '[Имя спортсмена]',
    event: '[Название соревнования]',
    date: '2026-09-15',
    discipline: '[Дисциплина, дистанция]',
    result: '[Результат]',
    place: '[Место]',
    protocolUrl: '',
  },
];

export const testimonials: Testimonial[] = [
  {
    id: 'testimonial-1',
    name: '[Имя участника]',
    photo: '/images/testimonial.svg-0a1dd7228f2d?w=150&h=150&fit=crop',
    text: '[Здесь будет отзыв участника клуба о тренировках, атмосфере и личном опыте.]',
    achievement: '[Личное достижение]',
    direction: 'Бег',
  },
  {
    id: 'testimonial-2',
    name: '[Имя участника]',
    photo: '/images/testimonial.svg-be9c29b29330?w=150&h=150&fit=crop',
    text: '[Здесь будет отзыв участника клуба о тренировках, атмосфере и личном опыте.]',
    achievement: '[Личное достижение]',
    direction: 'Велоспорт',
  },
  {
    id: 'testimonial-3',
    name: '[Имя участника]',
    photo: '/images/testimonial.svg-00dcc994a43e?w=150&h=150&fit=crop',
    text: '[Здесь будет отзыв участника клуба о тренировках, атмосфере и личном опыте.]',
    achievement: '[Личное достижение]',
    direction: 'Трейлраннинг',
  },
];
