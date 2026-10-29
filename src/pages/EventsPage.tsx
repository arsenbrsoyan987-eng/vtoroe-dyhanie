import { useState } from 'react';
import { Link } from 'react-router-dom';
import SectionTitle from '../components/ui/SectionTitle';
import { useEvents } from '../store/eventsStore';

const categories = [
  { id: 'all', label: 'Все' },
  { id: 'training', label: 'Клубные тренировки' },
  { id: 'competition', label: 'Соревнования' },
  { id: 'hike', label: 'Походы и выезды' },
  { id: 'camp', label: 'Тренировочные сборы' },
  { id: 'public', label: 'Общественные' },
];

const categoryLabels: Record<string, string> = {
  training: 'Клубная тренировка',
  competition: 'Соревнование',
  hike: 'Поход',
  camp: 'Сборы',
  public: 'Общественное',
};

export default function EventsPage() {
  const events = useEvents();
  const [filter, setFilter] = useState('all');
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const filtered = filter === 'all' ? sorted : sorted.filter((e) => e.category === filter);

  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle subtitle="Календарь" title="Мероприятия и соревнования" align="center" as="h1" />

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-2 text-xs font-medium rounded-sm transition-colors ${
                filter === cat.id
                  ? 'bg-accent-red text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Events grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="group bg-surface border border-white/10 rounded-sm overflow-hidden hover:border-accent-blue/30 transition-all hover:-translate-y-1"
            >
              <div className="aspect-[16/9] overflow-hidden">
                {event.images[0] ? (
                  <img
                    src={event.images[0]}
                    alt={event.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-accent-blue/10 text-3xl font-bold text-accent-blue">
                    {event.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm bg-accent-blue/20 text-accent-blue">
                    {categoryLabels[event.category]}
                  </span>
                  {event.registrationOpen ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm bg-green-500/20 text-green-400">
                      Регистрация открыта
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm bg-gray-500/20 text-gray-400">
                      Регистрация закрыта
                    </span>
                  )}
                </div>
                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-accent-blue transition-colors">
                  {event.name}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-3">{event.description}</p>
                <div className="text-xs text-gray-500">
                  📅 {new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} · 📍 {event.location}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-500">
            В этой категории пока нет мероприятий.
          </p>
        )}
      </div>
    </div>
  );
}
