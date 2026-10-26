import { useParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import { events } from '../data/events';

const categoryLabels: Record<string, string> = {
  training: 'Клубная тренировка',
  competition: 'Соревнование',
  hike: 'Поход',
  camp: 'Сборы',
  public: 'Общественное',
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const event = events.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Мероприятие не найдено</h1>
        <Button to="/events" variant="outline">Все мероприятия</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-end">
        <div className="absolute inset-0">
          <img src={event.images[0]} alt={event.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-sm bg-accent-blue/80 text-white inline-block mb-4">
            {categoryLabels[event.category]}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{event.name}</h1>
          <div className="flex flex-wrap gap-4 text-gray-300 text-sm">
            <span>📅 {new Date(event.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>🕐 {event.time}</span>
            <span>📍 {event.location}</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">О мероприятии</h2>
                <p className="text-gray-300 leading-relaxed">{event.fullDescription}</p>
              </div>

              {event.requirements.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Условия участия</h2>
                  <ul className="space-y-2">
                    {event.requirements.map((req) => (
                      <li key={req} className="flex items-center gap-3 text-gray-300">
                        <span className="w-2 h-2 bg-accent-blue rounded-full shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-surface border border-white/10 rounded-sm p-6">
                <h3 className="text-white font-bold mb-4">Информация</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Стоимость</span>
                    <span className="text-white">{event.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Регистрация</span>
                    <span className={event.registrationOpen ? 'text-green-400' : 'text-red-400'}>
                      {event.registrationOpen ? 'Открыта' : 'Закрыта'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">До</span>
                    <span className="text-white">{new Date(event.registrationDeadline).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              </div>

              {event.registrationOpen && (
                <Button to="/cabinet/registrations" variant="primary" size="lg" className="w-full">
                  Записаться на мероприятие
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
