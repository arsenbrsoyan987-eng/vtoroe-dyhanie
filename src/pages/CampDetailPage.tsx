import { Link, useParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import LeadForm from '../components/ui/LeadForm';
import { useCamp } from '../store/campsStore';
import { formatDate } from '../lib/date';
import { ArrowLeft, CalendarDays, Check, MapPin, Wallet } from 'lucide-react';

function dateRange(start: string, end?: string) {
  if (!end || end === start) return formatDate(start, false);
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${end}T12:00:00`);
  const sameMonth = a.getMonth() === b.getMonth();
  const left = a.toLocaleDateString('ru-RU', {
    day: 'numeric',
    ...(sameMonth ? {} : { month: 'long' }),
  });
  const right = b.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  return `${left} — ${right}`;
}

export default function CampDetailPage() {
  const { id } = useParams<{ id: string }>();
  const camp = useCamp(id);

  if (!camp || !camp.published) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="display mb-4 text-3xl text-ink">Кэмп не найден</h1>
        <p className="mb-8 text-sm text-graphite">
          Возможно, сбор отменён или даты ещё не объявлены.
        </p>
        <Button to="/camps" variant="outline" size="sm">
          Все кэмпы
        </Button>
      </div>
    );
  }

  const gallery = camp.images.length > 0 ? camp.images : camp.image ? [camp.image] : [];

  return (
    <>
      <Breadcrumbs items={[{ label: 'Кэмпы', to: '/camps' }, { label: camp.name }]} />

      <section className="relative overflow-hidden bg-ink">
        {camp.image && (
          <div className="absolute inset-0">
            <img
              src={camp.image}
              alt={camp.name}
              className="h-full w-full object-cover opacity-40"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/55 to-ink" />
          </div>
        )}

        <div className="container-x relative z-10 pb-14 pt-8 text-paper lg:pb-20">
          <div className="mb-5 flex flex-wrap items-center gap-2.5">
            <span className="eyebrow text-brand">
              <span className="h-[2px] w-8 bg-brand" />
              Тренировочный кэмп
            </span>
            <span
              className={`rounded-full px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] ${
                camp.registrationOpen
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-white/10 text-white/60'
              }`}
            >
              {camp.registrationOpen ? 'Набор открыт' : 'Набор закрыт'}
            </span>
          </div>

          <h1 className="display max-w-4xl text-[2.25rem] sm:text-5xl lg:text-6xl">
            {camp.name}
          </h1>

          {camp.description && (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
              {camp.description}
            </p>
          )}

          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/75">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-brand" />
              <dt className="sr-only">Даты</dt>
              <dd className="font-semibold">{dateRange(camp.startDate, camp.endDate)}</dd>
            </div>
            {camp.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-brand" />
                <dt className="sr-only">Место</dt>
                <dd className="font-semibold">{camp.location}</dd>
              </div>
            )}
            {camp.price && (
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 shrink-0 text-brand" />
                <dt className="sr-only">Стоимость</dt>
                <dd className="font-semibold">{camp.price}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      <section className="bg-paper py-14 lg:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="min-w-0">
            {camp.fullDescription && (
              <div>
                <h2 className="display mb-4 text-2xl text-ink">Программа сбора</h2>
                <p className="whitespace-pre-line text-base leading-relaxed text-graphite">
                  {camp.fullDescription}
                </p>
              </div>
            )}

            {camp.program.length > 0 && (
              <div className="mt-10">
                <h2 className="display mb-4 text-2xl text-ink">Распорядок дня</h2>
                <ol className="space-y-2.5">
                  {camp.program.map((line, i) => (
                    <li
                      key={line}
                      className="flex items-start gap-3 rounded-xl bg-mist px-4 py-3 text-sm text-ink"
                    >
                      <span className="display text-base text-brand/40">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {line}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {camp.includes.length > 0 && (
              <div className="mt-10">
                <h2 className="display mb-4 text-2xl text-ink">Что входит в стоимость</h2>
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {camp.includes.map((line) => (
                    <li key={line} className="flex items-start gap-2.5 text-sm text-ink">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10">
                        <Check className="h-3 w-3 text-brand" />
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {gallery.length > 1 && (
              <div className="mt-10">
                <h2 className="display mb-4 text-2xl text-ink">Фотографии</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {gallery.map((src, index) => (
                    <div key={`${src}-${index}`} className="overflow-hidden rounded-xl bg-mist">
                      <img
                        src={src}
                        alt={`${camp.name} — фото ${index + 1}`}
                        className="aspect-[4/3] w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Запись на сбор */}
          <aside className="lg:sticky lg:top-28">
            <div className="rounded-2xl border border-line bg-paper p-6 shadow-card">
              {camp.registrationOpen ? (
                <>
                  {camp.price && (
                    <p className="display text-2xl text-ink">{camp.price}</p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-graphite">
                    {camp.contact
                      ? `Запись и вопросы: ${camp.contact}`
                      : 'Оставьте контакты — тренер расскажет про сбор и забронирует место.'}
                  </p>

                  <div className="mt-5 border-t border-line pt-5">
                    <LeadForm
                      source={`camp:${camp.id}`}
                      title="Заявка на кэмп"
                      subtitle="Перезвоним и расскажем детали."
                      cta="Забронировать место"
                      message={`Кэмп: ${camp.name}`}
                    />
                  </div>
                </>
              ) : (
                <>
                  <h2 className="display text-lg text-ink">Набор закрыт</h2>
                  <p className="mt-2 text-sm leading-relaxed text-graphite">
                    Следите за анонсами — новый сбор появится в разделе кэмпов
                    и в Telegram-канале школы.
                  </p>
                  <Button to="/camps" variant="outline" size="sm" className="mt-4 w-full">
                    Все кэмпы
                  </Button>
                </>
              )}
            </div>

            <Link
              to="/camps"
              className="mt-4 inline-flex items-center gap-2 px-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-graphite transition-colors hover:text-brand"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Все кэмпы
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}