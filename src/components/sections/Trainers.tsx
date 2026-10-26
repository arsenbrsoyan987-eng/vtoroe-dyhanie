import { Link } from 'react-router-dom';
import SectionTitle from '../ui/SectionTitle';
import Button from '../ui/Button';
import { useTrainers } from '../../store/trainersStore';

export default function Trainers() {
  const trainers = useTrainers();
  const featured = trainers.slice(0, 4);

  return (
    <section className="py-20 lg:py-28 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <SectionTitle
            subtitle="Команда"
            title="Наши тренеры"
          />
          <Button to="/trainers" variant="outline" size="sm" className="mb-12 md:mb-12 shrink-0">
            Все тренеры
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((trainer) => (
            <Link
              key={trainer.id}
              to={`/trainers/${trainer.id}`}
              className="group bg-surface border border-white/10 rounded-sm overflow-hidden hover:border-accent-red/30 transition-colors block"
            >
              <div className="aspect-square overflow-hidden">
                {trainer.photo ? (
                  <img
                    src={trainer.photo}
                    alt={trainer.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-accent-red/10 text-4xl font-bold text-accent-red">
                    {trainer.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-white font-bold text-lg mb-1">{trainer.name}</h3>
                <p className="text-accent-red text-sm font-medium mb-2">
                  {trainer.specialization}
                </p>
                <p className="text-gray-400 text-xs">{trainer.experience}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
