/**
 * Метаданные страниц для поисковиков.
 *
 * SPA меняет контент без перезагрузки, поэтому `<title>` и `<meta description>`
 * из index.html остаются прежними на всех маршрутах. Хук переписывает их при
 * смене страницы и возвращает исходные значения при размонтировании.
 */

import type { Trainer } from '../types';

const SITE_NAME = 'Второе дыхание';
const SITE_URL = 'https://vtoroe-dyhanie.ru';
const DEFAULT_TITLE = 'Второе дыхание — спортивный клуб: бег, трейл, вело, походы';
const DEFAULT_DESCRIPTION =
  'Спортивный клуб «Второе дыхание» в Москве: бег, трейлраннинг, велоспорт, походы и функциональные тренировки. Группы для начинающих и персональные занятия.';

interface SeoOptions {
  /** Заголовок без названия клуба — оно добавится само */
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

export function applySeo({ title, description, path = '/', image, noindex }: SeoOptions = {}) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = description ?? DEFAULT_DESCRIPTION;
  const url = `${SITE_URL}${path}`;
  const img = image ? (image.startsWith('http') ? image : `${SITE_URL}${image}`) : `${SITE_URL}/logo.jpg`;

  document.title = fullTitle;

  setMeta('meta[name="description"]', 'name', 'description', desc);
  setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
  setMeta('meta[property="og:description"]', 'property', 'og:description', desc);
  setMeta('meta[property="og:url"]', 'property', 'og:url', url);
  setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
  setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
  setMeta('meta[property="og:image"]', 'property', 'og:image', img);
  setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', desc);

  setLink('canonical', url);

  const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (noindex) {
    setMeta('meta[name="robots"]', 'name', 'robots', 'noindex, nofollow');
  } else if (robots) {
    robots.remove();
  }
}

/** Заглушка вида «[Имя тренера]» — реальных данных ещё нет */
function isPlaceholder(value: string) {
  return /^\s*\[.*\]\s*$/.test(value);
}

/**
 * Заголовок и описание карточки тренера.
 * Пока имя не заполнено, заголовок строится от специализации — иначе пять
 * страниц получили бы одинаковый `<title>` и конкурировали друг с другом.
 */
export function trainerSeo(
  trainer: Trainer,
  directionNames: string[],
): { title: string; description: string } {
  const spec = trainer.specialization.toLowerCase();
  const name = isPlaceholder(trainer.name) ? '' : trainer.name;
  const dirs = directionNames.join(', ');

  const title = name
    ? `${name} — тренер клуба «Второе дыхание» в Москве`
    : `Тренер в Москве: ${spec}`;

  const description = [
    name
      ? `${name} — тренер клуба «Второе дыхание».`
      : 'Тренер клуба «Второе дыхание» в Москве.',
    `Специализация: ${spec}.`,
    dirs && `Направления: ${dirs}.`,
    'Группы для начинающих и персональные тренировки.',
  ]
    .filter(Boolean)
    .join(' ');

  return { title, description };
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
      'Бег, трейлраннинг, велоспорт, походы и функциональная подготовка. Выберите направление, посмотрите программу и запишитесь на тренировку в клубе «Второе дыхание».',
  },
  '/schedule': {
    title: 'Расписание тренировок',
    description:
      'Актуальное расписание групповых тренировок клуба «Второе дыхание»: бег, трейл, велоспорт, ОФП и походы. Свободные места и запись онлайн.',
  },
  '/trainers': {
    title: 'Тренеры спортивного клуба в Москве',
    description:
      'Тренеры клуба «Второе дыхание» в Москве: бег и марафоны, трейлраннинг, велоспорт, ОФП и походы. Персональные тренировки и группы для начинающих.',
  },
  '/events': {
    title: 'Мероприятия и соревнования',
    description:
      'Клубные забеги, трейлы, велопробеги, походы и сборы клуба «Второе дыхание». Календарь событий и регистрация участников.',
  },
  '/routes': {
    title: 'Маршруты для бега и велосипеда',
    description:
      'Проверенные маршруты клуба «Второе дыхание»: беговые и велосипедные трассы, трейлы и пешие походы с описанием сложности.',
  },
  '/news': {
    title: 'Новости клуба',
    description:
      'Новости и отчёты спортивного клуба «Второе дыхание»: итоги стартов, анонсы тренировок и событий, истории участников.',
  },
  '/results': {
    title: 'Результаты спортсменов',
    description:
      'Результаты участников клуба «Второе дыхание» на забегах, трейлах и велогонках: дистанции, время и места.',
  },
  '/privacy': {
    title: 'Политика конфиденциальности',
    description:
      'Как клуб «Второе дыхание» обрабатывает персональные данные пользователей сайта и защищает пароли.',
  },
};

/** Заголовки и описания для страниц направлений */
export const DIRECTION_SEO: Record<string, { title: string; description: string }> = {
  running: {
    title: 'Тренировки по бегу в Москве',
    description:
      'Беговые тренировки для начинающих и опытных: техника бега, выносливость, подготовка к марафону. Групповые и персональные занятия в клубе «Второе дыхание».',
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
      'Пешие походы от однодневных прогулок до многодневных маршрутов: снаряжение, ориентирование, командная работа. Походы с клубом «Второе дыхание».',
  },
  functional: {
    title: 'Функциональные тренировки и ОФП',
    description:
      'Функциональная подготовка и ОФП: сила, выносливость, координация и гибкость. Тренировки с собственным весом и свободными весами для любого уровня.',
  },
};
