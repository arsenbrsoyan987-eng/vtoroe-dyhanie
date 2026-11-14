import SectionTitle from '../ui/SectionTitle';
import { useDirections } from '../../store/directionsStore';
import { useSettingList } from '../../store/settingsStore';

/** Плитки направлений: реальные фото, при желании заменяются снимками из админки */
const PLACEHOLDER_TILES = [
  { src: '/images/running.jpg', alt: 'Бег', span: 'col-span-2 row-span-2' },
  { src: '/images/trail.jpg', alt: 'Трейлраннинг', span: '' },
  { src: '/images/cycling.jpg', alt: 'Велоспорт', span: '' },
  { src: '/images/ski.jpg', alt: 'Лыжные гонки', span: '' },
  { src: '/images/triathlon.jpg', alt: 'Триатлон', span: '' },
  { src: '/images/hiking.jpg', alt: 'Походы', span: '' },
  { src: '/images/functional.jpg', alt: 'Функциональная подготовка', span: '' },
];

export default function Gallery() {
  const directions = useDirections();
  const customImages = useSettingList('galleryImages');

  const tiles = customImages.length > 0
    ? customImages.map((url) => ({ src: url, alt: '', span: '' }))
    : PLACEHOLDER_TILES;

  const spanClass = ['col-span-2 row-span-2', 'col-span-1 row-span-2', 'col-span-1 row-span-1'];

  return (
    <section className="py-20 lg:py-28 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle subtitle="Атмосфера" title="Как это выглядит" align="center" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px] md:auto-rows-[250px]">
          {tiles.map((img, i) => {
            const span = img.span || spanClass[i % spanClass.length];
            const alt = img.alt || img.src.split('/').pop()?.split('.')[0] || `Фото ${i + 1}`;
            return (
              <div key={img.src || i} className={`overflow-hidden rounded-sm group ${span}`}>
                <img
                  src={img.src}
                  alt={alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                {!img.src && (
                  <div className="w-full h-full flex items-center justify-center bg-surface text-gray-600 text-sm">
                    Нет фото
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-gray-500 text-sm text-center mt-6">
          {directions.length} направления школы — от городских пробежек до
          многодневных походов.
        </p>
      </div>
    </section>
  );
}