import { useSettingList } from '../../store/settingsStore';

/** Плитки направлений: реальные фото, при желании заменяются снимками из админки */
const PLACEHOLDER_TILES = [
  '/images/running.jpg',
  '/images/trail.jpg',
  '/images/cycling.jpg',
  '/images/ski.jpg',
  '/images/triathlon.jpg',
  '/images/hiking.jpg',
  '/images/functional.jpg',
];

const ALT_BY_FILE: Record<string, string> = {
  running: 'Бег',
  trail: 'Трейлраннинг',
  cycling: 'Велоспорт',
  ski: 'Лыжные гонки',
  triathlon: 'Триатлон',
  hiking: 'Походы',
  functional: 'Функциональная подготовка',
};

/**
 * Галерея — мозаика фотографий школы.
 *
 * Первая плитка занимает два слота, чтобы мозаика не выглядела таблицей.
 * Если администратор загрузил свои снимки, берём их, иначе — штатные фото
 * направлений.
 */
export default function Gallery() {
  const customImages = useSettingList('galleryImages');
  const sources = customImages.length > 0 ? customImages : PLACEHOLDER_TILES;

  return (
    <section className="bg-mist py-20 lg:py-28">
      <div className="container-x">
        <div className="mb-10">
          <span className="eyebrow mb-4">Атмосфера</span>
          <h2 className="display max-w-xl text-4xl text-ink sm:text-5xl">Как это выглядит</h2>
        </div>

        <div className="grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[220px] md:grid-cols-4">
          {sources.map((src, i) => {
            const key = src.split('/').pop()?.split('.')[0] ?? '';
            const span = i === 0 ? 'col-span-2 row-span-2' : '';
            return (
              <div
                key={`${src}-${i}`}
                className={`group overflow-hidden rounded-2xl bg-navy/5 ${span}`}
              >
                <img
                  src={src}
                  alt={ALT_BY_FILE[key] ?? `Фото школы ${i + 1}`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    // битая ссылка из админки — прячем плитку, чтобы не рвать сетку
                    e.currentTarget.closest('div')?.remove();
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
