import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Search } from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { useTrainers } from '../store/trainersStore';
import { useDirections } from '../store/directionsStore';
import { displayValue, realValue } from '../lib/placeholder';
import { countNoun } from '../lib/plural';

/**
 * Команда школы: фильтр по направлениям и поиск по имени.
 *
 * Карточки с незаполненным именем не скрываем — подписываем специализацией:
 * пять одинаковых «[Имя тренера]» читались бы как сломанный сайт.
 */
export default function TrainersPage() {
  const trainers = useTrainers();
  const directions = useDirections();
  const [direction, setDirection] = useState('all');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trainers.filter((t) => {
      if (direction !== 'all' && !t.directions.includes(direction)) return false;
      if (!q) return true;
      return `${t.name} ${t.specialization}`.toLowerCase().includes(q);
    });
  }, [trainers, direction, query]);

  /** Сколько карточек реально заполнено — цифры для шапки */
  const namedCount = trainers.filter((t) => realValue(t.name)).length;

  return (
    <>
      <Breadcrumbs items={[{ label: 'Команда' }]} />

      <section className="bg-ink pb-14 pt-8 text-paper lg:pb-20">
        <div className="container-x">
          <span className="eyebrow mb-4 text-brand">
            <span className="h-[2px] w-8 bg-brand" />
            Команда
          </span>
          <h1 className="display max-w-3xl text-[2.5rem] sm:text-6xl lg:text-7xl">
            Тренеры школы
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Тренеры ведут группы по своим направлениям, ставят технику и сопровождают
            на стартах. Выбирайте по виду спорта — или найдите знакомое имя.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-white/15 pt-8 sm:grid-cols-4">
            <div>
              <dt className="sr-only">Тренеров в команде</dt>
              <dd className="display text-3xl text-white">{trainers.length}</dd>
              <dd className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-white/50">
                тренеров в команде
              </dd>
            </div>
            <div>
              <dt className="sr-only">Направлений</dt>
              <dd className="display text-3xl text-white">{directions.length}</dd>
              <dd className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-white/50">
                направлений
              </dd>
            </div>
            <div>
              <dt className="sr-only">Карточек заполнено</dt>
              <dd className="display text-3xl text-brand">{namedCount}</dd>
              <dd className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-white/50">
                с открытой карточкой
              </dd>
            </div>
            <div>
              <dt className="sr-only">Формат работы</dt>
              <dd className="display text-3xl text-white">1:1</dd>
              <dd className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-white/50">
                персональные занятия
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="bg-paper py-12 lg:py-16">
        <div className="container-x">
          {/* Фильтр по направлениям + поиск */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDirection('all')}
                aria-pressed={direction === 'all'}
                className={`rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${
                  direction === 'all'
                    ? 'bg-brand text-white'
                    : 'border border-line bg-paper text-graphite hover:border-ink hover:text-ink'
                }`}
              >
                Все направления
              </button>
              {directions.map((d) => {
                const count = trainers.filter((t) => t.directions.includes(d.id)).length;
                if (count === 0) return null;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDirection(d.id)}
                    aria-pressed={direction === d.id}
                    className={`rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${
                      direction === d.id
                        ? 'bg-brand text-white'
                        : 'border border-line bg-paper text-graphite hover:border-ink hover:text-ink'
                    }`}
                  >
                    {d.name} <span className="opacity-50">{count}</span>
                  </button>
                );
              })}
            </div>

            <label className="relative block lg:w-72">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по имени"
                aria-label="Поиск тренера по имени"
                className="w-full rounded-full border border-line bg-paper py-2.5 pl-11 pr-4 text-sm text-ink placeholder-graphite/60 focus:border-brand focus:outline-none"
              />
            </label>
          </div>

          <p className="mt-6 text-xs uppercase tracking-[0.12em] text-graphite">
            {countNoun(visible.length, 'тренер', 'тренера', 'тренеров')}
          </p>

          {visible.length === 0 ? (
            <p className="py-16 text-center text-sm text-graphite">
              Никого не нашлось. Попробуйте другое направление или имя.
            </p>
          ) : (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((trainer) => {
                const trainerDirs = trainer.directions
                  .map((id) => directions.find((d) => d.id === id)?.name)
                  .filter(Boolean) as string[];
                const realName = realValue(trainer.name);
                const name = displayValue(trainer.name, trainer.specialization);
                const experience = realValue(trainer.experience);
                const bio = realValue(trainer.biography);
                const certs = trainer.certifications.map(realValue).filter(Boolean);

                return (
                  <li key={trainer.id}>
                    <Link
                      to={`/trainers/${trainer.id}`}
                      className="card-lift card-lift-hover group flex h-full flex-col overflow-hidden"
                    >
                      <div className="aspect-[4/5] overflow-hidden bg-mist">
                        {trainer.photo ? (
                          <img
                            src={trainer.photo}
                            alt={name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-navy/5 text-5xl font-bold text-brand/70">
                            {name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <h2 className="text-base font-bold leading-snug text-ink group-hover:text-brand">
                          {name}
                        </h2>
                        <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-brand">
                          {trainer.specialization}
                        </p>
                        {experience && (
                          <p className="mt-2 text-xs text-graphite">{experience}</p>
                        )}
                        {bio && (
                          <p className="mt-3 line-clamp-3 flex-1 text-[0.82rem] leading-relaxed text-graphite">
                            {bio}
                          </p>
                        )}

                        {trainerDirs.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {trainerDirs.map((dir) => (
                              <span
                                key={dir}
                                className="rounded-full bg-mist px-2.5 py-1 text-[0.66rem] text-graphite"
                              >
                                {dir}
                              </span>
                            ))}
                          </div>
                        )}

                        {certs.length > 0 && (
                          <p className="mt-3 flex items-center gap-1.5 text-[0.68rem] text-graphite">
                            <Award className="h-3.5 w-3.5 shrink-0 text-brand" />
                            {certs[0]}
                          </p>
                        )}

                        {realName && (
                          <span className="mt-4 inline-flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-ink">
                            Профиль
                            <ArrowRight className="h-3.5 w-3.5 text-brand transition-transform group-hover:translate-x-1" />
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {trainers.length === 0 && (
            <p className="py-16 text-center text-sm text-graphite">
              Информация о тренерах скоро появится — карточки заполняются в кабинете.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
