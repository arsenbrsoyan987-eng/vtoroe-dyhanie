import { Link, useParams } from 'react-router-dom';
import { useTrainer, useTrainers } from '../store/trainersStore';
import { useTrainings } from '../store/trainingsStore';
import { directions } from '../data/directions';
import { formatDate, isPastDate } from '../lib/date';
import Button from '../components/ui/Button';
import { ArrowLeft, Mail, Phone } from 'lucide-react';

export default function TrainerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const trainer = useTrainer(id);
  const all = useTrainers();
  const trainings = useTrainings();

  if (!trainer) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="mb-2 text-2xl font-bold text-white">Тренер не найден</h1>
        <p className="mb-6 text-sm text-gray-400">Возможно, профиль был удалён.</p>
        <Button to="/trainers" variant="outline" size="sm">Все тренеры</Button>
      </div>
    );
  }

  const dirNames = trainer.directions
    .map((d) => directions.find((x) => x.id === d)?.name)
    .filter(Boolean);

  const sessions = trainings
    .filter((t) => t.trainerId === trainer.id && !isPastDate(t.date))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const others = all.filter((t) => t.id !== trainer.id).slice(0, 3);

  return (
    <div className="py-12 lg:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/trainers"
          className="mb-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Тренерский состав
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-sm border border-white/10">
              {trainer.photo ? (
                <img
                  src={trainer.photo}
                  alt={trainer.name}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-accent-red/10 text-6xl font-bold text-accent-red">
                  {trainer.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              {trainer.phone && (
                <a
                  href={`tel:${trainer.phone.replace(/[^\d+]/g, '')}`}
                  className="flex items-center gap-2 rounded-sm bg-white/5 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Phone className="h-4 w-4 text-gray-500" />
                  {trainer.phone}
                </a>
              )}
              {trainer.email && (
                <a
                  href={`mailto:${trainer.email}`}
                  className="flex items-center gap-2 rounded-sm bg-white/5 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="truncate">{trainer.email}</span>
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h1 className="mb-1 text-3xl font-bold text-white">{trainer.name}</h1>
            <p className="mb-2 text-base font-medium text-accent-red">{trainer.specialization}</p>
            <p className="mb-6 text-sm text-gray-500">{trainer.experience}</p>

            <div className="mb-6 flex flex-wrap gap-2">
              {dirNames.map((d) => (
                <span
                  key={d}
                  className="rounded-sm bg-accent-blue/10 px-2.5 py-1 text-xs text-accent-blue"
                >
                  {d}
                </span>
              ))}
            </div>

            {trainer.biography && (
              <div className="mb-6">
                <h2 className="mb-2 text-xs uppercase tracking-wider text-gray-500">О тренере</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-300">
                  {trainer.biography}
                </p>
              </div>
            )}

            {trainer.certifications.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-2 text-xs uppercase tracking-wider text-gray-500">
                  Квалификация
                </h2>
                <ul className="space-y-1.5">
                  {trainer.certifications.map((c) => (
                    <li key={c} className="text-sm text-gray-300">📜 {c}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h2 className="mb-3 text-xs uppercase tracking-wider text-gray-500">
                Ближайшие тренировки
              </h2>
              {sessions.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Пока нет запланированных тренировок у этого тренера.
                </p>
              ) : (
                <div className="space-y-2">
                  {sessions.map((t) => (
                    <Link
                      key={t.id}
                      to={`/schedule/${t.id}`}
                      className="flex items-center justify-between rounded-sm border border-white/10 bg-surface px-4 py-3 transition-colors hover:border-accent-red/30"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-white">{t.name}</span>
                        <span className="block text-xs text-gray-500">
                          {formatDate(t.date)} · {t.time} · {t.location}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-accent-blue">Записаться →</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {others.length > 0 && (
          <div className="mt-16 border-t border-white/10 pt-8">
            <h2 className="mb-4 text-lg font-bold text-white">Другие тренеры</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {others.map((t) => (
                <Link
                  key={t.id}
                  to={`/trainers/${t.id}`}
                  className="group overflow-hidden rounded-sm border border-white/10 bg-surface transition-colors hover:border-accent-red/30"
                >
                  {t.photo ? (
                    <img
                      src={t.photo}
                      alt={t.name}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] w-full items-center justify-center bg-accent-red/10 text-3xl font-bold text-accent-red">
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.specialization}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
