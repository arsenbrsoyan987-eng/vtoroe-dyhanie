import SectionTitle from '../ui/SectionTitle';
import { directions } from '../../data/directions';

/** Плитки направлений: реальные фото, при желании заменяются снимками из админки */
const TILES = [
  { src: '/images/running.jpg', alt: 'Бег', span: 'col-span-2 row-span-2' },
  { src: '/images/trail.jpg', alt: 'Трейлраннинг', span: '' },
  { src: '/images/cycling.jpg', alt: 'Велоспорт', span: '' },
  { src: '/images/ski.jpg', alt: 'Лыжные гонки', span: '' },
  { src: '/images/triathlon.jpg', alt: 'Триатлон', span: '' },
  { src: '/images/hiking.jpg', alt: 'Походы', span: '' },
  { src: '/images/functional.jpg', alt: 'Функциональная подготовка', span: '' },
];

export default function Gallery() {
  return (
    <section className="py-20 lg:py-28 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle subtitle="Атмосфера" title="Как это выглядит" align="center" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px] md:auto-rows-[250px]">
          {TILES.map((img) => (
            <div key={img.src} className={`overflow-hidden rounded-sm group ${img.span}`}>
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-sm text-center mt-6">
          {directions.length} направления школы — от городских пробежек до
          многодневных походов.
        </p>
      </div>
    </section>
  );
}