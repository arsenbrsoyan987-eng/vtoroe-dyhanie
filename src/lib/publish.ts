import { getTrainers } from '../store/trainersStore';
import { getTrainings } from '../store/trainingsStore';
import { eventsStore } from '../store/eventsStore';
import { getNews } from '../store/newsStore';
import { getCamps } from '../store/campsStore';
import { testimonialsStore } from '../store/testimonialsStore';
import { resultsStore } from '../store/resultsStore';
import type { PublishedData } from '../data/published';

/**
 * Собирает всё, что владелец добавил в админке, в один объект.
 *
 * Админка хранит данные в localStorage — это память одного браузера,
 * поэтому другие устройства и посетители этих правок не видели.
 * Выгруженный файл коммитится в `src/data/published.json` и попадает
 * в сборку: после деплоя данные видят все.
 */
export function collectPublished(): PublishedData {
  return {
    updatedAt: new Date().toISOString(),
    trainers: getTrainers(),
    trainings: getTrainings(),
    events: eventsStore.get(),
    news: getNews(),
    testimonials: testimonialsStore.get(),
    results: resultsStore.get(),
    camps: getCamps(),
  };
}

/** Скачивает выгрузку как файл — его нужно положить в src/data/published.json */
export function downloadPublished(): void {
  const data = collectPublished();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'published.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
