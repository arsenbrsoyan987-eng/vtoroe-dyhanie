import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Award, Mail, Phone } from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Button from '../components/ui/Button';
import { useTrainer, useTrainers } from '../store/trainersStore';
import { useTrainings } from '../store/trainingsStore';
import { useDirections } from '../store/directionsStore';
import { formatDate, isPastDate } from '../lib/date';
import { displayValue, realValue } from '../lib/placeholder';

export default function TrainerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const trainer = useTrainer(id);
  const all = useTrainers();
  const directions = useDirections();
  const trainings = useTrainings();

  if (!trainer) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="display mb-4 text-3xl text-ink">Тренер не найден</h1>
        <p className="mb-8 text-sm text-graphite">Возможно, профиль был удалён.</p>
        <Button to="/trainers" variant="outline" size="sm">Все тренеры</Button>
      </div>
    );
  }

  const realName = realValue(trainer.name);
  const name = displayValue(trainer.name, trainer.specialization);
  const experience = realValue(trainer.experience);
  const biography = realValue(trainer.biography);
  const certifications = trainer.certifications.map(realValue).filter(Boolean);
  const phone = realValue(trainer.phone);
  const email = realValue(trainer.email);

  const dirNames = trainer.directions
    .map((d) => directions.find((x) => x.id === d)?.name)
    .filter(Boolean);

  const sessions = trainings
    .filter((t) => t.trainerId === trainer.id && !isPastDate(t.date))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const others = all
    .filter((t) => t.id !== trainer.id)
    .slice(0, 3)
    .map((t) => ({
      ...t,
      label: displayValue(t.name, t.specialization),
      hasName: Boolean(realValue(t.name)),
    }));

  return (
    <>
      <Breadcrumbs
        items={[{ label: 'Команда', to: '/trainers' }, { label: name }]}
      />

      <section className="bg-ink pb-14 pt-6 text-paper lg:pb-20">
        <div className="container-x grid items-end gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
          <div className="overflow-hidden rounded-2xl bg-white/5">
            {trainer.photo ? (
              <img
                src={trainer.photo}
                alt={name}
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/5] w-full items-center justify-center bg-white/5 text-6xl font-bold text-brand">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <span className="eyebrow mb-4 text-brand">
              <span className="h-[2px] w-8 bg-brand" />
              {trainer.specialization}
            </span>
            <h1 className="display text-[2.25rem] sm:text-5xl lg:text-6xl">{name}</h1>
            {realName && experience && (
              <p className="mt-4 text-sm text-white/60">{experience}</p>
            )}

            {dirNames.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {dirNames.map((d) => (
                  <span
                    key={d}
                    className="rounded-full bg-white/10 px-3 py-1.5 text-[0.7rem] font-semibold text-white/80"
                  >
                    {d}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <Button to="/schedule" variant="primary" size="sm">
                Записаться на тренировку
              </Button>
              {phone && (
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-ink"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {phone}
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-ink"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span className="max-w-[12rem] truncate">{email}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper py-14 lg:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="min-w-0">
            {biography ? (
              <>
                <h2 className="display mb-4 text-2xl text-ink">О тренере</h2>
                <p className="whitespace-pre-line text-base leading-relaxed text-graphite">
                  {biography}
                </p>
              </>
            ) : (
              <p className="text-sm leading-relaxed text-graphite">
                Карточка тренера заполняется в кабинете школы — биография
                и квалификация появятся здесь.
              </p>
            )}

            {certifications.length > 0 && (
              <div className="mt-10">
                <h2 className="display mb-4 text-2xl text-ink">Квалификация</h2>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {certifications.map((c) => (
                    <li
                      key={c}
                      className="flex items-start gap-2.5 rounded-xl bg-mist px-4 py-3 text-sm text-ink"
                    >
                      <Award className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Ближайшие тренировки тренера */}
          <aside className="lg:sticky lg:top-28">
            <h2 className="display mb-4 text-xl text-ink">Ближайшие тренировки</h2>
            {sessions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line bg-mist px-4 py-6 text-sm text-graphite">
                Пока нет запланированных тренировок у этого тренера.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {sessions.slice(0, 5).map((t) => (
                  <li key={t.id}>
                    <Link
                      to={`/schedule/${t.id}`}
                      className="card-lift card-lift-hover group flex items-center gap-3 p-4"
                    >
                      <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-navy py-2 text-paper">
                        <span className="display text-lg leading-none">
                          {t.date.split('-')[2]}
                        </span>
                        <span className="mt-0.5 text-[0.55rem] uppercase tracking-[0.1em] text-white/60">
                          {new Date(`${t.date}T12:00:00`).toLocaleDateString('ru-RU', {
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink group-hover:text-brand">
                          {t.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-graphite">
                          {formatDate(t.date)} · {t.time}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-brand transition-transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </section>

      {others.length > 0 && (
        <section className="bg-mist py-14 lg:py-16">
          <div className="container-x">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="display text-2xl text-ink sm:text-3xl">Другие тренеры</h2>
              <Link
                to="/trainers"
                className="group inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-ink hover:text-brand"
              >
                Вся команда
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <ul className="grid gap-4 sm:grid-cols-3">
              {others.map((t) => (
                <li key={t.id}>
                  <Link
                    to={`/trainers/${t.id}`}
                    className="card-lift card-lift-hover group block overflow-hidden"
                  >
                    {t.photo ? (
                      <img
                        src={t.photo}
                        alt={t.label}
                        className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex aspect-[4/3] w-full items-center justify-center bg-navy/5 text-3xl font-bold text-brand/70">
                        {t.label.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-sm font-bold text-ink group-hover:text-brand">{t.label}</p>
                      <p className="mt-0.5 text-xs text-graphite">{t.specialization}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="container-x py-8">
        <Link
          to="/trainers"
          className="inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-graphite transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Тренерский состав
        </Link>
      </div>
    </>
  );
}