import { Link } from 'react-router-dom';
import SectionTitle from '../components/ui/SectionTitle';
import { usePublishedCamps } from '../store/campsStore';
import { formatDate, isPastDate } from '../lib/date';

/** «12–19 июня» или «12 июня», если сбор однодневный */
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

export default function CampsPage() {
  const camps = usePublishedCamps();
  const upcoming = camps
    .filter((c) => !isPastDate(c.endDate || c.startDate))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const past = camps
    .filter((c) => isPastDate(c.endDate || c.startDate))
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <div className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Выезды"
          title="Тренировочные кэмпы"
          align="center"
          as="h1"
        />
        <p className="mx-auto -mt-6 mb-12 max-w-2xl text-center text-sm leading-relaxed text-gray-400">
          Несколько дней плотной работы вдали от города: бег, трейл и ОФП
          с тренерами клуба, восстановление и разбор техники. Сборы проводит
          владелец клуба — расписание и стоимость смотрите в карточке.
        </p>

        {camps.length === 0 ? (
          <div className="rounded-sm border border-white/10 bg-surface px-6 py-16 text-center">
            <p className="mx-auto max-w-lg text-sm leading-relaxed text-gray-400">
              Ближайшие сборы ещё не анонсированы. Как только даты и место
              определятся, кэмп появится в этом разделе — анонс также выходит
              в Telegram-канале клуба.
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {[
              { label: 'Ближайшие', items: upcoming },
              { label: 'Прошедшие', items: past },
            ]
              .filter((group) => group.items.length > 0)
              .map((group) => (
                <div key={group.label}>
                  <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-500">
                    {group.label}
                  </h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {group.items.map((camp) => (
                      <Link
                        key={camp.id}
                        to={`/camps/${camp.id}`}
                        className="group overflow-hidden rounded-sm border border-white/10 bg-surface transition-all hover:-translate-y-1 hover:border-accent-blue/30"
                      >
                        <div className="aspect-[16/9] overflow-hidden">
                          {camp.image ? (
                            <img
                              src={camp.image}
                              alt={camp.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-accent-blue/10 text-3xl font-bold text-accent-blue">
                              {camp.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="rounded-sm bg-accent-blue/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-blue">
                              {dateRange(camp.startDate, camp.endDate)}
                            </span>
                            <span
                              className={`rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                camp.registrationOpen
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}
                            >
                              {camp.registrationOpen ? 'Набор открыт' : 'Набор закрыт'}
                            </span>
                          </div>
                          <h3 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-accent-blue">
                            {camp.name}
                          </h3>
                          <p className="mb-3 line-clamp-2 text-sm text-gray-400">
                            {camp.description}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                            {camp.location && <span>📍 {camp.location}</span>}
                            {camp.price && <span>💳 {camp.price}</span>}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
