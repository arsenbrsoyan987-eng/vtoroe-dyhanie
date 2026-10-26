import { Link } from 'react-router-dom';
import SectionTitle from '../components/ui/SectionTitle';
import { directions } from '../data/directions';

export default function DirectionsPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle subtitle="Спорт" title="Направления тренировок" align="center" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {directions.map((dir) => (
            <Link
              key={dir.id}
              to={`/directions/${dir.id}`}
              className="group bg-surface border border-white/10 rounded-sm overflow-hidden hover:border-accent-red/30 transition-all hover:-translate-y-1"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={dir.imageUrl}
                  alt={dir.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{dir.icon}</span>
                  <h3 className="text-white text-xl font-bold group-hover:text-accent-red transition-colors">
                    {dir.name}
                  </h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{dir.description}</p>
                <div className="flex flex-wrap gap-2">
                  {dir.suitableFor.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 bg-white/5 rounded-sm text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
