import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applySeo, hasPlaceholders, trainerSeo, STATIC_SEO, DIRECTION_SEO } from '../lib/seo';
import { useTrainers } from '../store/trainersStore';
import { useTrainings } from '../store/trainingsStore';
import { useEvents } from '../store/eventsStore';
import { useNews } from '../store/newsStore';
import { useCamps } from '../store/campsStore';
import { directions } from '../data/directions';
import { realValue } from '../lib/placeholder';

/** Разделы без публичного контента — их не нужно показывать в поиске */
function isNoindex(pathname: string) {
  return (
    pathname.startsWith('/cabinet') ||
    pathname === '/login' ||
    pathname === '/register' ||
    /^\/events\/[^/]+\/qr$/.test(pathname)
  );
}

/** Карточка удалена, а адрес остался в карте сайта: показывать нечего */
const DETAIL_ROUTE = /^\/(trainers|schedule|events|news|camps)\/[^/]+$/;

/**
 * Подставляет заголовок и описание под текущий маршрут.
 * Один компонент на всё приложение: страницы не нужно править по одной.
 */
export default function Seo() {
  const { pathname: rawPathname } = useLocation();
  // GitHub Pages дописывает слэш (/trainers/trainer-1/), поэтому сравниваем без него
  const pathname = rawPathname !== '/' && rawPathname.endsWith('/')
    ? rawPathname.slice(0, -1)
    : rawPathname;
  const trainers = useTrainers();
  const trainings = useTrainings();
  const events = useEvents();
  const news = useNews();
  const camps = useCamps();

  useEffect(() => {
    // Детальные страницы: заголовок собираем из данных карточки
    const trainerMatch = pathname.match(/^\/trainers\/([^/]+)$/);
    if (trainerMatch) {
      const trainer = trainers.find((t) => t.id === trainerMatch[1]);
      if (trainer) {
        const dirNames = trainer.directions
          .map((d) => directions.find((x) => x.id === d)?.name)
          .filter((n): n is string => Boolean(n));
        const seo = trainerSeo(trainer, dirNames);
        applySeo({
          title: seo.title,
          description: seo.description,
          path: pathname,
          image: trainer.photo,
          noindex: seo.incomplete,
        });
        return;
      }
    }

    const directionMatch = pathname.match(/^\/directions\/([^/]+)$/);
    if (directionMatch) {
      const seo = DIRECTION_SEO[directionMatch[1]];
      const dir = directions.find((d) => d.id === directionMatch[1]);
      if (seo && dir) {
        applySeo({ ...seo, path: pathname, image: dir.imageUrl });
        return;
      }
    }

    const trainingMatch = pathname.match(/^\/schedule\/([^/]+)$/);
    if (trainingMatch) {
      const training = trainings.find((t) => t.id === trainingMatch[1]);
      if (training) {
        // В описание не должны попадать «[Парк, место сбора]» и «[Имя тренера]»
        const where = realValue(training.location);
        const who = realValue(training.trainer);
        applySeo({
          title: `${training.name} — ${training.directionName}`,
          description: [
            `${training.name}: ${training.date}, ${training.time}.`,
            where ? `Место: ${where}.` : '',
            who ? `Тренер: ${who}.` : '',
            `Уровень: ${training.level}. Запись на тренировку клуба «Второе дыхание».`,
          ]
            .filter(Boolean)
            .join(' '),
          path: pathname,
          noindex: hasPlaceholders([training.name, training.location, training.trainer]),
        });
        return;
      }
    }

    const eventMatch = pathname.match(/^\/events\/([^/]+)$/);
    if (eventMatch) {
      const event = events.find((e) => e.id === eventMatch[1]);
      if (event) {
        const where = realValue(event.location);
        applySeo({
          title: event.name,
          description: `${event.name} — ${event.date}${where ? `, ${where}` : ''}. ${event.description}`,
          path: pathname,
          image: event.images[0],
          noindex: hasPlaceholders([event.name, event.location, event.fullDescription]),
        });
        return;
      }
    }

    const newsMatch = pathname.match(/^\/news\/([^/]+)$/);
    if (newsMatch) {
      const item = news.find((n) => n.id === newsMatch[1]);
      if (item) {
        applySeo({
          title: item.title,
          description: item.summary,
          path: pathname,
          image: item.image,
          noindex: hasPlaceholders([item.title, item.content]),
        });
        return;
      }
    }

    const campMatch = pathname.match(/^\/camps\/([^/]+)$/);
    if (campMatch) {
      const camp = camps.find((c) => c.id === campMatch[1]);
      if (camp && camp.published) {
        const where = camp.location ? `, ${camp.location}` : '';
        applySeo({
          title: `${camp.name} — тренировочный кэмп`,
          description: `${camp.name}: ${camp.startDate}${where}. ${camp.description}`.slice(0, 300),
          path: pathname,
          image: camp.image,
        });
        return;
      }
    }

    if (isNoindex(pathname)) {
      applySeo({ path: pathname, noindex: true });
      return;
    }

    // Запись удалили, а адрес остался в sitemap.xml: страница отдаёт «не найдено».
    // Держать её в индексе нельзя — иначе сайт копит битые ссылки.
    if (DETAIL_ROUTE.test(pathname)) {
      applySeo({ title: 'Страница не найдена', path: pathname, noindex: true });
      return;
    }

    // Статические разделы: ключ уже без завершающего слэша
    const meta = STATIC_SEO[pathname];
    if (meta) {
      applySeo({ title: meta.title || undefined, description: meta.description, path: pathname });
      return;
    }

    // Неизвестный маршрут — отдаём общие метаданные главной
    applySeo({ path: '/' });
  }, [pathname, trainers, trainings, events, news, camps]);

  return null;
}