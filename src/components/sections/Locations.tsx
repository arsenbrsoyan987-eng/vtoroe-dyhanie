import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { useTrainings } from '../../store/trainingsStore';
import { useSetting } from '../../store/settingsStore';
import { isPlaceholder } from '../../lib/placeholder';
import { countNoun } from '../../lib/plural';

/**
 * Блок «Где тренируемся».
 *
 * Площадки не заводятся отдельным справочником — они берутся из реального
 * расписания: если в карточке тренировки указана локация, значит группа там
 * действительно занимается. Пустые и заглушечные значения отбрасываем,
 * чтобы витрина не показывала «[Локация]».
 */
export default function Locations() {
  const trainings = useTrainings();
  const city = useSetting('city');

  const places = useMemo(() => {
    const counter = new Map<string, number>();
    for (const t of trainings) {
      const name = (t.location || '').trim();
      if (!name || isPlaceholder(name)) continue;
      counter.set(name, (counter.get(name) ?? 0) + 1);
    }
    return [...counter.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [trainings]);

  return (
    <section className="bg-mist py-20 lg:py-28">
      <div className="container-x">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow mb-4">Локации</span>
            <h2 className="display max-w-2xl text-4xl text-ink sm:text-5xl">
              Тренируемся рядом с домом
            </h2>
            <p className="mt-4 max-w-xl text-base text-graphite">
              {places.length > 0
                ? `Площадки в городе ${city}: стадионы, парки и манежи с раздевалками. Точку сбора присылаем в карточке группы.`
                : `Площадки подбираем под ваш район и день недели — актуальный список появится в расписании.`}
            </p>
          </div>
          <Link
            to="/schedule"
            className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink"
          >
            Смотреть расписание
            <ArrowRight className="h-4 w-4 text-brand transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {places.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-paper p-10 text-center text-sm text-graphite">
            Площадки появятся, как только заполним расписание.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {places.map(([name, count]) => (
              <li
                key={name}
                className="card-lift card-lift-hover flex items-start gap-4 p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/10">
                  <MapPin className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-snug text-ink">{name}</h3>
                  <p className="mt-1.5 text-[0.7rem] uppercase tracking-[0.12em] text-graphite">
                    {countNoun(count, 'тренировка', 'тренировки', 'тренировок')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
