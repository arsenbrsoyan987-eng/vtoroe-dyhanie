import { Link } from 'react-router-dom';
import SectionTitle from '../ui/SectionTitle';
import Button from '../ui/Button';
import { useEvents } from '../../store/eventsStore';

const categoryLabels: Record<string, string> = {
  training: 'Клубная тренировка',
  competition: 'Соревнование',
  hike: 'Поход',
  camp: 'Сборы',
  public: 'Общественное',
};

export default function Events() {
  const events = useEvents();
  const upcoming = [...events]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  return (
    <section className="py-20 lg:py-28 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <SectionTitle
            subtitle="Календарь"
            title="Мероприятия клуба"
          />
          <Button to="/events" variant="outline" size="sm" className="mb-12 md:mb-12 shrink-0">
            Все мероприятия
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcoming.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="group bg-surface border border-white/10 rounded-sm overflow-hidden hover:border-accent-blue/30 transition-colors"
            >
              <div className="aspect-[16/10] overflow-hidden">
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
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm bg-accent-blue/20 text-accent-blue">
                    {categoryLabels[event.category]}
                  </span>
                  {event.registrationOpen && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm bg-green-500/20 text-green-400">
                      Регистрация
                    </span>
                  )}
                </div>
                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-accent-blue transition-colors">
                  {event.name}
                </h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{event.description}</p>
                <div className="text-xs text-gray-500">
                  {new Date(event.date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}{' '}
                  · {event.location}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
