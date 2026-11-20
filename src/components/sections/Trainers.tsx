import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTrainers } from '../../store/trainersStore';
import { displayValue, realValue } from '../../lib/placeholder';

/**
 * Тренеры — горизонтальная карусель со стрелками.
 *
 * Пустые карточки (нет ни имени, ни специализации) скрываем: заглушки
 * вида «[Имя тренера]» на витрине выглядят как незаполненный сайт.
 */
export default function Trainers() {
  const trainers = useTrainers();
  const railRef = useRef<HTMLDivElement>(null);

  const featured = trainers.filter(
    (t) => realValue(t.name) || realValue(t.specialization),
  );

  const scrollBy = (dir: 1 | -1) => {
    railRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <section className="bg-paper py-20 lg:py-28">
      <div className="container-x">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow mb-4">Команда</span>
            <h2 className="display max-w-xl text-4xl text-ink sm:text-5xl">
              Тренеры, с которыми не страшно начать
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/trainers"
              className="mr-2 hidden text-sm font-semibold uppercase tracking-wide text-ink hover:text-brand sm:inline"
            >
              Все тренеры
            </Link>
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Предыдущие тренеры"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper text-ink transition-colors hover:border-brand hover:bg-brand hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Следующие тренеры"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper text-ink transition-colors hover:border-brand hover:bg-brand hover:text-white"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {featured.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-mist p-10 text-center text-sm text-graphite">
            Карточки тренеров заполняются в личном кабинете — сразу после этого
            они появятся здесь.
          </div>
        ) : (
          <div ref={railRef} className="rail">
            {featured.slice(0, 8).map((trainer) => {
              const name = displayValue(trainer.name, trainer.specialization);
              const experience = realValue(trainer.experience);

              return (
                <Link
                  key={trainer.id}
                  to={`/trainers/${trainer.id}`}
                  className="card-lift card-lift-hover group w-[16rem] overflow-hidden sm:w-[18rem]"
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
                  <div className="p-5">
                    <h3 className="text-base font-bold leading-snug text-ink">{name}</h3>
                    {realValue(trainer.name) && (
                      <p className="mt-1 text-[0.7rem] uppercase tracking-[0.12em] text-brand">
                        {trainer.specialization}
                      </p>
                    )}
                    {experience && (
                      <p className="mt-2.5 text-xs leading-relaxed text-graphite">
                        {experience}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
