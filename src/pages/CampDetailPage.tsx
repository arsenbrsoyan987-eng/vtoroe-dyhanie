import { Link, useParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useCamp } from '../store/campsStore';
import { formatDate } from '../lib/date';
import { ArrowLeft, CalendarDays, Check, MapPin } from 'lucide-react';

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
  const { currentUser } = useAuth();

  if (!camp || !camp.published) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="mb-2 text-2xl font-bold text-white">Кэмп не найден</h1>
        <p className="mb-6 text-sm text-gray-400">
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
    <div className="py-12 lg:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/camps"
          className="mb-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Кэмпы
        </Link>

        <div className="overflow-hidden rounded-sm border border-white/10 bg-surface">
          {camp.image && (
            <div className="h-48 w-full overflow-hidden sm:h-72">
              <img src={camp.image} alt={camp.name} className="h-full w-full object-cover" />
            </div>
          )}

          <div className="p-6 lg:p-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-sm bg-accent-blue/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-blue">
                Тренировочный кэмп
              </span>
              <span
                className={`rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  camp.registrationOpen
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                {camp.registrationOpen ? 'Набор открыт' : 'Набор закрыт'}
              </span>
            </div>

            <h1 className="mb-4 text-2xl font-bold text-white lg:text-3xl">{camp.name}</h1>

            <dl className="mb-6 grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2 text-gray-300">
                <CalendarDays className="h-4 w-4 shrink-0 text-gray-500" />
                {dateRange(camp.startDate, camp.endDate)}
              </div>
              {camp.location && (
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="h-4 w-4 shrink-0 text-gray-500" />
                  {camp.location}
                </div>
              )}
            </dl>

            {camp.description && (
              <p className="mb-6 text-sm leading-relaxed text-gray-400">{camp.description}</p>
            )}

            {camp.fullDescription && (
              <div className="mb-8">
                <h2 className="mb-2 text-xs uppercase tracking-wider text-gray-500">
                  Программа сбора
                </h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-300">
                  {camp.fullDescription}
                </p>
              </div>
            )}

            {camp.program.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-2 text-xs uppercase tracking-wider text-gray-500">Распорядок</h2>
                <ul className="space-y-1.5">
                  {camp.program.map((line) => (
                    <li key={line} className="flex gap-2 text-sm text-gray-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-red" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {camp.includes.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-2 text-xs uppercase tracking-wider text-gray-500">
                  Что входит в стоимость
                </h2>
                <ul className="grid gap-1.5 sm:grid-cols-2">
                  {camp.includes.map((line) => (
                    <li key={line} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-8 flex flex-wrap items-center gap-6 rounded-sm border border-white/10 bg-primary px-4 py-3 text-sm">
              {camp.price && (
                <div>
                  <span className="text-xs uppercase tracking-wider text-gray-500">Стоимость</span>
                  <p className="font-semibold text-white">{camp.price}</p>
                </div>
              )}
              {camp.contact && (
                <div>
                  <span className="text-xs uppercase tracking-wider text-gray-500">Запись и вопросы</span>
                  <p className="font-semibold text-white">{camp.contact}</p>
                </div>
              )}
            </div>

            {camp.registrationOpen ? (
              <Button to={currentUser ? '/cabinet/notifications' : '/login'} variant="primary">
                {currentUser ? 'Оставить заявку' : 'Войти и записаться'}
              </Button>
            ) : (
              <p className="text-sm text-gray-500">
                Набор на этот сбор закрыт. Следите за анонсами в Telegram-канале клуба.
              </p>
            )}
          </div>
        </div>

        {gallery.length > 1 && (
          <div className="mt-8">
            <h2 className="mb-3 text-xs uppercase tracking-wider text-gray-500">Фотографии</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gallery.map((src, index) => (
                <div key={`${src}-${index}`} className="overflow-hidden rounded-sm border border-white/10">
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
    </div>
  );
}
