import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applySeo, trainerSeo, STATIC_SEO, DIRECTION_SEO } from '../lib/seo';
import { useTrainers } from '../store/trainersStore';
import { useTrainings } from '../store/trainingsStore';
import { useEvents } from '../store/eventsStore';
import { useNews } from '../store/newsStore';
import { directions } from '../data/directions';

/** Разделы без публичного контента — их не нужно показывать в поиске */
function isNoindex(pathname: string) {
  return (
    pathname.startsWith('/cabinet') ||
    pathname === '/login' ||
    pathname === '/register' ||
    /^\/events\/[^/]+\/qr$/.test(pathname)
  );
}

/**
 * Подставляет заголовок и описание под текущий маршрут.
 * Один компонент на всё приложение: страницы не нужно править по одной.
 */
export default function Seo() {
  const { pathname } = useLocation();
  const trainers = useTrainers();
  const trainings = useTrainings();
  const events = useEvents();
  const news = useNews();

  useEffect(() => {
    // Детальные страницы: заголовок собираем из данных карточки
    const trainerMatch = pathname.match(/^\/trainers\/([^/]+)$/);
    if (trainerMatch) {
      const trainer = trainers.find((t) => t.id === trainerMatch[1]);
      if (trainer) {
        const dirNames = trainer.directions
          .map((d) => directions.find((x) => x.id === d)?.name)
          .filter((n): n is string => Boolean(n));
        applySeo({
          ...trainerSeo(trainer, dirNames),
          path: pathname,
          image: trainer.photo,
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
        applySeo({
          title: `${training.name} — ${training.directionName}`,
          description: `${training.name}: ${training.date}, ${training.time}, ${training.location}. Тренер: ${training.trainer}. Уровень: ${training.level}. Запись на тренировку клуба «Второе дыхание».`,
          path: pathname,
        });
        return;
      }
    }

    const eventMatch = pathname.match(/^\/events\/([^/]+)$/);
    if (eventMatch) {
      const event = events.find((e) => e.id === eventMatch[1]);
      if (event) {
        applySeo({
          title: event.name,
          description: `${event.name} — ${event.date}, ${event.location}. ${event.description}`,
          path: pathname,
          image: event.images[0],
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
        });
        return;
      }
    }

    if (isNoindex(pathname)) {
      applySeo({ path: pathname, noindex: true });
      return;
    }

    // Статические разделы: ключ без завершающего слэша
    const key = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const meta = STATIC_SEO[key];
    if (meta) {
      applySeo({ title: meta.title || undefined, description: meta.description, path: key });
      return;
    }

    // Неизвестный маршрут — отдаём общие метаданные главной
    applySeo({ path: '/' });
  }, [pathname, trainers, trainings, events, news]);

  return null;
}