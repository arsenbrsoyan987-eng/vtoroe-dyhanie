import { Link } from 'react-router-dom';
import SectionTitle from '../ui/SectionTitle';
import { directions } from '../../data/directions';

export default function Directions() {
  return (
    <section className="py-20 lg:py-28 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Направления"
          title="Выбери своё движение"
          align="center"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {directions.map((dir) => (
            <Link
              key={dir.id}
              to={`/directions/${dir.id}`}
              className="group relative overflow-hidden rounded-sm aspect-[4/3] block"
            >
              <img
                src={dir.imageUrl}
                alt={dir.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-3xl mb-2 block">{dir.icon}</span>
                <h3 className="text-white text-xl font-bold mb-1 group-hover:text-accent-red transition-colors">
                  {dir.name}
                </h3>
                <p className="text-gray-300 text-sm line-clamp-2">{dir.description}</p>
              </div>
            </Link>
          ))}

          {/* CTA card */}
          <Link
            to="/directions"
            className="group relative overflow-hidden rounded-sm aspect-[4/3] flex items-center justify-center bg-surface border border-white/10 hover:border-accent-red/50 transition-colors"
          >
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 border-2 border-accent-red rounded-full flex items-center justify-center group-hover:bg-accent-red transition-colors">
                <svg className="w-8 h-8 text-accent-red group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              <h3 className="text-white text-lg font-bold group-hover:text-accent-red transition-colors">
                Все направления
              </h3>
              <p className="text-gray-400 text-sm mt-2">
                Подробнее о каждом направлении
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
