import { Link } from 'react-router-dom';
import SectionTitle from '../components/ui/SectionTitle';
import { useTrainers } from '../store/trainersStore';
import { directions } from '../data/directions';

export default function TrainersPage() {
  const trainers = useTrainers();

  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle subtitle="Команда" title="Тренерский состав" align="center" as="h1" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainers.map((trainer) => {
            const trainerDirs = trainer.directions
              .map((id) => directions.find((d) => d.id === id)?.name)
              .filter(Boolean);

            return (
              <Link
                key={trainer.id}
                to={`/trainers/${trainer.id}`}
                className="group bg-surface border border-white/10 rounded-sm overflow-hidden hover:border-accent-red/30 transition-colors block"
              >
                <div className="aspect-[4/3] overflow-hidden">
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
                <div className="p-6">
                  <h3 className="text-white text-xl font-bold mb-1">{trainer.name}</h3>
                  <p className="text-accent-red text-sm font-medium mb-2">{trainer.specialization}</p>
                  <p className="text-gray-500 text-xs mb-4">{trainer.experience}</p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{trainer.biography}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {trainerDirs.map((dir) => (
                      <span key={dir} className="text-xs px-2 py-1 bg-accent-blue/10 text-accent-blue rounded-sm">
                        {dir}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-1 text-xs text-gray-500">
                    {trainer.certifications.map((cert) => (
                      <p key={cert}>📜 {cert}</p>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        {trainers.length === 0 && (
          <p className="mt-8 text-center text-sm text-gray-500">
            Информация о тренерах скоро появится.
          </p>
        )}
      </div>
    </div>
  );
}
