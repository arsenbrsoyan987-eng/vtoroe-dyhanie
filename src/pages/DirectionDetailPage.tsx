import { useParams, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { directions } from '../data/directions';
import { useTrainers } from '../store/trainersStore';
import { useTrainings } from '../store/trainingsStore';
import { displayValue, realValue } from '../lib/placeholder';
import { formatDate, isPastDate } from '../lib/date';

export default function DirectionDetailPage() {
  const trainings = useTrainings();
  const trainers = useTrainers();
  const { id } = useParams<{ id: string }>();
  const direction = directions.find((d) => d.id === id);

  if (!direction) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Направление не найдено</h1>
        <Button to="/directions" variant="outline">Все направления</Button>
      </div>
    );
  }

  const dirTrainers = trainers.filter((t) => t.directions.includes(direction.id));
  const dirTrainings = trainings
    .filter((t) => t.directionId === direction.id && !isPastDate(t.date))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-end">
        <div className="absolute inset-0">
          <img src={direction.imageUrl} alt={direction.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <span className="text-4xl mb-4 block">{direction.icon}</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">{direction.name}</h1>
          <p className="text-gray-300 text-lg max-w-2xl">{direction.description}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main */}
            <div className="lg:col-span-2 space-y-12">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">О направлении</h2>
                <p className="text-gray-300 leading-relaxed">{direction.fullDescription}</p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Для кого подходит</h2>
                <ul className="space-y-2">
                  {direction.suitableFor.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-gray-300">
                      <span className="w-2 h-2 bg-accent-red rounded-full shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trainings */}
              {dirTrainings.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Ближайшие тренировки</h2>
                  <div className="space-y-4">
                    {dirTrainings.map((t) => (
                      <div key={t.id} className="bg-surface border border-white/10 rounded-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-white font-semibold">{t.name}</h3>
                          <p className="text-gray-400 text-sm mt-1">
                            {formatDate(t.date, false)} · {t.time} ·{' '}
                            {displayValue(t.location, 'точка сбора в анонсе')}
                          </p>
                        </div>
                        <Button to={`/schedule/${t.id}`} variant="blue" size="sm">Подробнее</Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <div className="bg-surface border border-white/10 rounded-sm p-6">
                <h3 className="text-white font-bold mb-4">Необходимое снаряжение</h3>
                <ul className="space-y-2">
                  {direction.requiredEquipment.map((eq) => (
                    <li key={eq} className="text-gray-300 text-sm flex items-center gap-2">
                      <span className="text-accent-blue">•</span> {eq}
                    </li>
                  ))}
                </ul>
              </div>

              {dirTrainers.length > 0 && (
                <div className="bg-surface border border-white/10 rounded-sm p-6">
                  <h3 className="text-white font-bold mb-4">Тренеры направления</h3>
                  <div className="space-y-4">
                    {dirTrainers.map((tr) => (
                      <Link key={tr.id} to={`/trainers/${tr.id}`} className="flex items-center gap-3 group">
                        <img
                          src={tr.photo}
                          alt={displayValue(tr.name, tr.specialization)}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-white text-sm font-medium group-hover:text-accent-red transition-colors">
                            {displayValue(tr.name, tr.specialization)}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {realValue(tr.experience) || tr.specialization}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <Button to="/cabinet/registrations" variant="primary" size="lg" className="w-full">
                Записаться на тренировку
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
