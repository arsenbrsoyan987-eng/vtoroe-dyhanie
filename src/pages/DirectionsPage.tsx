import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { useDirections } from '../store/directionsStore';
import { useTrainings } from '../store/trainingsStore';
import { DIRECTION_SLOGAN, DIRECTION_TILE_NOTE } from '../data/site';
import { countNoun } from '../lib/plural';
import { isPastDate } from '../lib/date';

/**
 * Каталог направлений.
 *
 * В карточке показываем слоган и число ближайших тренировок — посетителю
 * важно понять, есть ли чем заняться сейчас, а не только что это за спорт.
 */
export default function DirectionsPage() {
  const directions = useDirections();
  const trainings = useTrainings();

  const upcomingCount = (id: string) =>
    trainings.filter((t) => t.directionId === id && !isPastDate(t.date)).length;

  return (
    <>
      <Breadcrumbs items={[{ label: 'Направления' }]} />

      <section className="bg-ink pb-16 pt-8 text-paper lg:pb-20">
        <div className="container-x">
          <span className="eyebrow mb-4 text-brand">
            <span className="h-[2px] w-8 bg-brand" />
            Семь видов движения
          </span>
          <h1 className="display max-w-3xl text-[2.5rem] sm:text-6xl lg:text-7xl">
            Направления тренировок
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            От первой пробежки в парке до горного кемпа и триатлонной дистанции.
            Выбирайте по интересу — внутри каждого направления есть школа для
            начинающих, регулярная группа и персональные занятия.
          </p>
        </div>
      </section>

      <section className="bg-paper py-16 lg:py-24">
        <div className="container-x">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {directions.map((dir) => {
              const count = upcomingCount(dir.id);
              return (
                <Link
                  key={dir.id}
                  to={`/directions/${dir.id}`}
                  className="card-lift card-lift-hover group flex flex-col overflow-hidden"
                >
                  <div className="relative aspect-[16/11] overflow-hidden bg-mist">
                    <img
                      src={dir.imageUrl}
                      alt={dir.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                    <h2 className="display absolute inset-x-0 bottom-0 p-5 text-xl text-paper">
                      {dir.name}
                    </h2>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-brand">
                      {DIRECTION_SLOGAN[dir.id] ?? dir.level}
                    </p>
                    <p className="mt-2.5 flex-1 text-sm leading-relaxed text-graphite">
                      {DIRECTION_TILE_NOTE[dir.id] ?? dir.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
                      <span className="text-[0.7rem] uppercase tracking-[0.1em] text-graphite">
                        {count > 0
                          ? countNoun(count, 'тренировка', 'тренировки', 'тренировок')
                          : 'набор волнами'}
                      </span>
                      <ArrowRight className="h-4 w-4 text-brand transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}