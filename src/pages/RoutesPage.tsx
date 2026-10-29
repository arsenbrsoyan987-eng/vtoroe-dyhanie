import { useState } from 'react';
import SectionTitle from '../components/ui/SectionTitle';
import { routes } from '../data/routes';

const typeLabels: Record<string, string> = {
  running: 'Бег',
  trail: 'Трейл',
  cycling: 'Вело',
  hiking: 'Поход',
};

const difficultyLabels: Record<string, string> = {
  easy: 'Лёгкий',
  medium: 'Средний',
  hard: 'Сложный',
  extreme: 'Экстремальный',
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  hard: 'bg-orange-500/20 text-orange-400',
  extreme: 'bg-red-500/20 text-red-400',
};

export default function RoutesPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? routes : routes.filter((r) => r.type === filter);

  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle subtitle="Маршруты" title="Наши маршруты" align="center" as="h1" />

        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-xs font-medium rounded-sm transition-colors ${filter === 'all' ? 'bg-accent-red text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
          >
            Все
          </button>
          {Object.entries(typeLabels).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-4 py-2 text-xs font-medium rounded-sm transition-colors ${filter === id ? 'bg-accent-red text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((route) => (
            <div key={route.id} className="bg-surface border border-white/10 rounded-sm overflow-hidden hover:border-accent-red/30 transition-colors group">
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={route.image}
                  alt={route.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm bg-accent-blue/20 text-accent-blue">
                    {typeLabels[route.type]}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm ${difficultyColors[route.difficulty]}`}>
                    {difficultyLabels[route.difficulty]}
                  </span>
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{route.name}</h3>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">{route.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white/5 rounded-sm p-2 text-center">
                    <div className="text-gray-500 mb-1">Дистанция</div>
                    <div className="text-white font-semibold">{route.distance}</div>
                  </div>
                  <div className="bg-white/5 rounded-sm p-2 text-center">
                    <div className="text-gray-500 mb-1">Набор</div>
                    <div className="text-white font-semibold">{route.elevation}</div>
                  </div>
                  <div className="bg-white/5 rounded-sm p-2 text-center">
                    <div className="text-gray-500 mb-1">Время</div>
                    <div className="text-white font-semibold">{route.duration}</div>
                  </div>
                  <div className="bg-white/5 rounded-sm p-2 text-center">
                    <div className="text-gray-500 mb-1">Старт</div>
                    <div className="text-white font-semibold truncate">{route.startPoint}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-gray-500 text-sm text-center mt-8">
          Треки присылаем участникам перед выездом — в Telegram-канале клуба.
        </p>
      </div>
    </div>
  );
}
