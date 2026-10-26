import SectionTitle from '../ui/SectionTitle';

const galleryImages = [
  { src: '/images/running.svg-db6ffd4facb5?w=600&h=400&fit=crop', alt: 'Бег', span: 'col-span-2 row-span-2' },
  { src: '/images/trail.svg-6c3bdd6c93e5?w=600&h=400&fit=crop', alt: 'Горы', span: '' },
  { src: '/images/cycling.svg-2277a4c46182?w=600&h=400&fit=crop', alt: 'Велоспорт', span: '' },
  { src: '/images/hiking.svg-561732d1e306?w=600&h=400&fit=crop', alt: 'Поход', span: '' },
  { src: '/images/functional.svg-6ad2b056d712?w=600&h=400&fit=crop', alt: 'Тренировка', span: '' },
];

export default function Gallery() {
  return (
    <section className="py-20 lg:py-28 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Атмосфера"
          title="Фотографии и видео"
          align="center"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px] md:auto-rows-[250px]">
          {galleryImages.map((img, i) => (
            <div
              key={i}
              className={`overflow-hidden rounded-sm group ${img.span}`}
            >
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
          [Галерея будет заполнена реальными фотографиями клуба]
        </p>
      </div>
    </section>
  );
}
