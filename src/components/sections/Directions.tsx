import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useDirections } from '../../store/directionsStore';
import { DIRECTION_TILE_NOTE } from '../../data/site';

/**
 * Сетка направлений — витрина из плиток с фото.
 *
 * Плитки идут в две колонки на мобильном и в четыре на широком экране:
 * так первые четыре направления помещаются в один ряд без «хвоста».
 */
export default function Directions() {
  const directions = useDirections();

  return (
    <section className="bg-paper py-20 lg:py-28">
      <div className="container-x">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow mb-4">Направления</span>
            <h2 className="display max-w-2xl text-4xl text-ink sm:text-5xl">
              Выбери своё движение
            </h2>
          </div>
          <Link
            to="/directions"
            className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink"
          >
            Все направления
            <ArrowRight className="h-4 w-4 text-brand transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {directions.map((dir) => (
            <Link
              key={dir.id}
              to={`/directions/${dir.id}`}
              className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-mist"
            >
              <img
                src={dir.imageUrl}
                alt={dir.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="display text-xl text-paper">{dir.name}</h3>
                <p className="mt-1.5 text-[0.7rem] uppercase tracking-[0.12em] text-white/60">
                  {DIRECTION_TILE_NOTE[dir.id] ?? dir.level}
                </p>
                <span className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}

          {/* Плитка-призыв замыкает сетку, если направлений не кратно четырём */}
          <Link
            to="/schedule"
            className="group relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-2xl bg-navy p-5 text-paper transition-colors hover:bg-navy-soft"
          >
            <span className="eyebrow text-brand">Расписание</span>
            <div>
              <h3 className="display text-xl">Ближайшие тренировки</h3>
              <p className="mt-1.5 text-[0.7rem] uppercase tracking-[0.12em] text-white/55">
                Свободные места на этой неделе
              </p>
              <span className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white transition-transform group-hover:translate-x-1">
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}