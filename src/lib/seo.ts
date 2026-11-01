/**
 * Метаданные страниц для поисковиков.
 *
 * SPA меняет контент без перезагрузки, поэтому `<title>` и `<meta description>`
 * из index.html остаются прежними на всех маршрутах. Хук переписывает их при
 * смене страницы и возвращает исходные значения при размонтировании.
 */

import type { Trainer } from '../types';
import { isPlaceholder } from './placeholder';

const SITE_NAME = 'Второе дыхание';
const SITE_URL = 'https://vtoroe-dyhanie.ru';
const DEFAULT_TITLE = 'Второе дыхание — спортивная школа: бег, трейл, вело, походы';
const DEFAULT_DESCRIPTION =
  'Спортивная школа «Второе дыхание» в Москве: бег, трейлраннинг, велоспорт, походы, функциональная подготовка, лыжные гонки и триатлон. Группы для начинающих и персональные занятия.';

interface SeoOptions {
  /** Заголовок без названия школы — оно добавится само */
  title?: string;
  description?: string;
  /** Путь без домена: /trainers/trainer-1 */
  path?: string;
  /** Абсолютный или корневой путь к картинке для соцсетей */
  image?: string;
  /** Закрыть страницу от индексации (кабинет, формы входа) */
  noindex?: boolean;
}

function setMeta(selector: string, attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** GitHub Pages отдаёт страницы только с завершающим слэшем: /trainers → 301 → /trainers/ */
function canonicalPath(path: string) {
  if (path === '/' || path.endsWith('/')) return path;
  return `${path}/`;
}

export function applySeo({ title, description, path = '/', image, noindex }: SeoOptions = {}) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = description ?? DEFAULT_DESCRIPTION;
  const url = `${SITE_URL}${canonicalPath(path)}`;
  const img = image
    ? image.startsWith('http')
      ? image
      : `${SITE_URL}${image}`
    : `${SITE_URL}/og-image.jpg`;

  document.title = fullTitle;

  setMeta('meta[name="description"]', 'name', 'description', desc);
  setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
  setMeta('meta[property="og:description"]', 'property', 'og:description', desc);
  setMeta('meta[property="og:url"]', 'property', 'og:url', url);
  setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
  setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
  setMeta('meta[property="og:locale"]', 'property', 'og:locale', 'ru_RU');
  setMeta('meta[property="og:image"]', 'property', 'og:image', img);
  // Размеры нужны, чтобы Telegram и VK показали превью крупной карточкой
  setMeta('meta[property="og:image:width"]', 'property', 'og:image:width', '1200');
  setMeta('meta[property="og:image:height"]', 'property', 'og:image:height', '630');
  setMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', fullTitle);
  setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', desc);
  setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', img);

  setLink('canonical', url);

  const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (noindex) {
    setMeta('meta[name="robots"]', 'name', 'robots', 'noindex, nofollow');
  } else if (robots) {
    robots.remove();
  }
}

/**
 * Страница заполнена заглушками — в индекс её отдавать нельзя.
 * Пять карточек с «[Имя тренера]» и текстом в квадратных скобках выглядят для
 * поисковика как дорвей: он понижает весь сайт, а не только эти страницы.
 * Как только данные заполнят, проверка сама перестанет срабатывать.
 */
export function hasPlaceholders(values: string[]): boolean {
  return values.some((v) => isPlaceholder(v));
}

/**
 * Заголовок и описание карточки тренера.
 * Пока имя не заполнено, заголовок строится от специализации — иначе пять
 * страниц получили бы одинаковый `<title>` и конкурировали друг с другом.
 */
export function trainerSeo(
  trainer: Trainer,
  directionNames: string[],
): { title: string; description: string; incomplete: boolean } {
  const spec = trainer.specialization.toLowerCase();
  const name = isPlaceholder(trainer.name) ? '' : trainer.name;
  const dirs = directionNames.join(', ');
  const incomplete = hasPlaceholders([
    trainer.name,
    trainer.experience,
    trainer.biography,
    ...trainer.certifications,
  ]);

  const title = name
    ? `${name} — тренер школы «Второе дыхание» в Москве`
    : `Тренер в Москве: ${spec}`;

  const description = [
    name
      ? `${name} — тренер школы «Второе дыхание».`
      : 'Тренер школы «Второе дыхание» в Москве.',
    `Специализация: ${spec}.`,
    dirs && `Направления: ${dirs}.`,
    'Группы для начинающих и персональные тренировки.',
  ]
    .filter(Boolean)
    .join(' ');

  return { title, description, incomplete };
}

/** Мета для статических разделов: ключ — путь без завершающего слэша */
export const STATIC_SEO: Record<string, { title: string; description: string }> = {
  '/': {
    title: '',
    description: DEFAULT_DESCRIPTION,
  },
  '/directions': {
    title: 'Направления тренировок',
    description:
      'Бег, трейлраннинг, велоспорт, походы, функциональная подготовка, лыжные гонки и триатлон. Выберите направление, посмотрите программу и запишитесь на тренировку в школе «Второе дыхание».',
  },
  '/schedule': {
    title: 'Расписание тренировок',
    description:
      'Актуальное расписание групповых тренировок школы «Второе дыхание»: бег, трейл, велоспорт, ОФП, походы, лыжи и триатлон. Свободные места и запись онлайн.',
  },
  '/trainers': {
    title: 'Тренеры спортивной школы в Москве',
    description:
      'Тренеры школы «Второе дыхание» в Москве: бег и марафоны, трейлраннинг, велоспорт, ОФП, походы, лыжные гонки и триатлон. Персональные тренировки и группы для начинающих.',
  },
  '/events': {
    title: 'Мероприятия и соревнования',
    description:
      'Школьные забеги, трейлы, велопробеги, походы и сборы школы «Второе дыхание». Календарь событий и регистрация участников.',
  },
  '/camps': {
    title: 'Тренировочные кэмпы и сборы',
    description:
      'Тренировочные кэмпы школы «Второе дыхание»: несколько дней бега, трейла и ОФП на природе с тренерами. Программа, стоимость и запись.',
  },
  '/routes': {
    title: 'Маршруты для бега и велосипеда',
    description:
      'Проверенные маршруты школы «Второе дыхание»: беговые и велосипедные трассы, трейлы и пешие походы с описанием сложности.',
  },
  '/news': {
    title: 'Новости школы',
    description:
      'Новости и отчёты спортивной школы «Второе дыхание»: итоги стартов, анонсы тренировок и событий, истории участников.',
  },
  '/results': {
    title: 'Результаты спортсменов',
    description:
      'Результаты участников школы «Второе дыхание» на забегах, трейлах и велогонках: дистанции, время и места.',
  },
  '/privacy': {
    title: 'Политика конфиденциальности',
    description:
      'Как школа «Второе дыхание» обрабатывает персональные данные пользователей сайта и защищает пароли.',
  },
};

/** Заголовки и описания для страниц направлений */
export const DIRECTION_SEO: Record<string, { title: string; description: string }> = {
  running: {
    title: 'Тренировки по бегу в Москве',
    description:
      'Беговые тренировки для начинающих и опытных: техника бега, выносливость, подготовка к марафону. Групповые и персональные занятия в школе «Второе дыхание».',
  },
  trail: {
    title: 'Трейлраннинг: бег по пересечённой местности',
    description:
      'Тренировки по трейлраннингу: работа с набором высоты, техника на спусках и подъёмах, подготовка к трейловым гонкам. Занятия на природе с тренером.',
  },
  cycling: {
    title: 'Велотренировки и велопрогулки',
    description:
      'Групповые велотренировки и поездки по городу и пригороду, работа над педальным кругом и выносливостью, подготовка к велозаездам.',
  },
  hiking: {
    title: 'Походы и пеший туризм',
    description:
      'Пешие походы от однодневных прогулок до многодневных маршрутов: снаряжение, ориентирование, командная работа. Походы с школаом «Второе дыхание».',
  },
  functional: {
    title: 'Функциональные тренировки и ОФП',
    description:
      'Функциональная подготовка и ОФП: сила, выносливость, координация и гибкость. Тренировки с собственным весом и свободными весами для любого уровня.',
  },
  ski: {
    title: 'Лыжные гонки: тренировки и подготовка',
    description:
      'Лыжные гонки в школе «Второе дыхание»: классический и коньковый ход, техника отталкивания и работа рук. Тренировки зимой на лыжне и ОФП летом.',
  },
  triathlon: {
    title: 'Триатлон: плавание, велосипед, бег',
    description:
      'Триатлон в школе «Второе дыхание»: техника плавания в бассейне, экономичная езда на велосипеде и беговой этап после нагрузки. Подготовка к спринту и олимпийской дистанции.',
  },
};
