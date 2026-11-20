import { useParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import LeadForm from '../components/ui/LeadForm';
import { useEvents } from '../store/eventsStore';
import { displayValue, realValue } from '../lib/placeholder';
import { CalendarDays, Clock, MapPin, Wallet } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  training: 'Школьная тренировка',
  competition: 'Соревнование',
  hike: 'Поход',
  camp: 'Сборы',
  public: 'Общественное',
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const events = useEvents();
  const event = events.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="display mb-4 text-3xl text-ink">Мероприятие не найдено</h1>
        <p className="mb-8 text-sm text-graphite">
          Возможно, событие отменили или оно прошло в прошлом сезоне.
        </p>
        <Button to="/events" variant="outline" size="sm">Все мероприятия</Button>
      </div>
    );
  }

  const requirements = event.requirements.map(realValue).filter(Boolean);
  const price = realValue(event.price);

  const dateLabel = new Date(`${event.date}T12:00:00`).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <Breadcrumbs items={[{ label: 'Мероприятия', to: '/events' }, { label: event.name }]} />

      {/* Hero: фото события под тёмной подложкой */}
      <section className="relative overflow-hidden bg-ink">
        {event.images[0] && (
          <div className="absolute inset-0">
            <img
              src={event.images[0]}
              alt={event.name}
              className="h-full w-full object-cover opacity-45"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/55 to-ink" />
          </div>
        )}

        <div className="container-x relative z-10 pb-14 pt-8 text-paper lg:pb-20">
          <div className="mb-5 flex flex-wrap items-center gap-2.5">
            <span className="eyebrow text-brand">
              <span className="h-[2px] w-8 bg-brand" />
              {categoryLabels[event.category] ?? 'Событие школы'}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] ${
                event.registrationOpen
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-white/10 text-white/60'
              }`}
            >
              {event.registrationOpen ? 'Регистрация открыта' : 'Регистрация закрыта'}
            </span>
          </div>

          <h1 className="display max-w-4xl text-[2.25rem] sm:text-5xl lg:text-6xl">
            {event.name}
          </h1>

          {event.description && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
              {event.description}
            </p>
          )}

          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/75">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-brand" />
              <dt className="sr-only">Дата</dt>
              <dd className="font-semibold">{dateLabel}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-brand" />
              <dt className="sr-only">Начало</dt>
              <dd className="font-semibold">{event.time}</dd>
            </div>
            {realValue(event.location) && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-brand" />
                <dt className="sr-only">Место</dt>
                <dd className="font-semibold">{event.location}</dd>
              </div>
            )}
            {price && (
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 shrink-0 text-brand" />
                <dt className="sr-only">Стоимость</dt>
                <dd className="font-semibold">{price}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      <section className="bg-paper py-14 lg:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="min-w-0 space-y-10">
            <div>
              <h2 className="display mb-4 text-2xl text-ink">О мероприятии</h2>
              <p className="whitespace-pre-line text-base leading-relaxed text-graphite">
                {displayValue(event.fullDescription, event.description)}
              </p>
            </div>

            {requirements.length > 0 && (
              <div>
                <h2 className="display mb-4 text-2xl text-ink">Условия участия</h2>
                <ul className="space-y-2.5">
                  {requirements.map((req) => (
                    <li
                      key={req}
                      className="flex items-start gap-3 rounded-xl bg-mist px-4 py-3 text-sm text-ink"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {event.images.length > 1 && (
              <div>
                <h2 className="display mb-4 text-2xl text-ink">Фотографии</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {event.images.slice(1).map((src, i) => (
                    <div key={`${src}-${i}`} className="overflow-hidden rounded-xl bg-mist">
                      <img
                        src={src}
                        alt={`${event.name} — фото ${i + 2}`}
                        className="aspect-[4/3] w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="rounded-2xl border border-line bg-paper p-6 shadow-card">
              <h2 className="display text-lg text-ink">Участие</h2>

              <dl className="mt-4 space-y-2.5 text-sm">
                {price && (
                  <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2.5">
                    <dt className="text-graphite">Стоимость</dt>
                    <dd className="font-bold text-ink">{price}</dd>
                  </div>
                )}
                <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2.5">
                  <dt className="text-graphite">Регистрация</dt>
                  <dd className={event.registrationOpen ? 'font-bold text-emerald-600' : 'font-bold text-brand'}>
                    {event.registrationOpen ? 'Открыта' : 'Закрыта'}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-graphite">Приём заявок до</dt>
                  <dd className="font-bold text-ink">
                    {new Date(`${event.registrationDeadline}T12:00:00`).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                    })}
                  </dd>
                </div>
              </dl>

              {event.registrationOpen && (
                <div className="mt-5 border-t border-line pt-5">
                  <LeadForm
                    source={`event:${event.id}`}
                    title="Заявка на участие"
                    subtitle="Перезвоним и расскажем, как подготовиться."
                    cta="Записаться"
                    message={`Мероприятие: ${event.name}`}
                  />
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
