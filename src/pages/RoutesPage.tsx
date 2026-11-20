import { useState } from 'react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { useRoutes } from '../store/routesStore';
import { countNoun } from '../lib/plural';

const typeLabels: Record<string, string> = {
  running: 'Бег',
  trail: 'Трейл',
  cycling: 'Вело',
  hiking: 'Поход',
};

const difficultyLabels: Record<string, string> = {
  easy: 'Лёгкий',
  medium: 'Средний',
  hard: 'Сложный',
  extreme: 'Экстремальный',
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-emerald-500/10 text-emerald-700',
  medium: 'bg-amber-500/10 text-amber-700',
  hard: 'bg-orange-500/10 text-orange-700',
  extreme: 'bg-brand/10 text-brand',
};

export default function RoutesPage() {
  const routes = useRoutes();
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? routes : routes.filter((r) => r.type === filter);

  return (
    <>
      <Breadcrumbs items={[{ label: 'Маршруты' }]} />

      <section className="bg-ink pb-14 pt-8 text-paper lg:pb-16">
        <div className="container-x">
          <span className="eyebrow mb-4 text-brand">
            <span className="h-[2px] w-8 bg-brand" />
            {countNoun(routes.length, 'маршрут', 'маршрута', 'маршрутов')} школы
          </span>
          <h1 className="display max-w-3xl text-[2.5rem] sm:text-6xl lg:text-7xl">
            Наши маршруты
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Проверенные трассы для тренировок и выездов: от городских петель
            до горного трейла. Дистанция, набор и точку старта указывает тренер.
          </p>
        </div>
      </section>

      <section className="bg-paper py-14 lg:py-20">
        <div className="container-x">
          <div className="mb-10 flex flex-wrap gap-2">
            {[
              ['all', 'Все'],
              ...Object.entries(typeLabels),
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  filter === id
                    ? 'bg-ink text-white'
                    : 'bg-mist text-graphite hover:bg-line hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-mist px-6 py-16 text-center">
              <p className="text-sm text-graphite">
                Маршрутов этого типа пока нет — загляните в другие категории.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {filtered.map((route) => (
                <article key={route.id} className="card-lift card-lift-hover group overflow-hidden">
                  <div className="aspect-[16/9] overflow-hidden bg-mist">
                    <img
                      src={route.image}
                      alt={route.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-navy px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-white">
                        {typeLabels[route.type] ?? route.type}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.1em] ${
                          difficultyColors[route.difficulty] ?? 'bg-mist text-graphite'
                        }`}
                      >
                        {difficultyLabels[route.difficulty] ?? route.difficulty}
                      </span>
                    </div>

                    <h2 className="display text-xl leading-tight text-ink">{route.name}</h2>
                    <p className="mt-2.5 text-sm leading-relaxed text-graphite">
                      {route.description}
                    </p>

                    <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-line sm:grid-cols-4">
                      {[
                        ['Дистанция', route.distance],
                        ['Набор', route.elevation],
                        ['Время', route.duration],
                        ['Старт', route.startPoint],
                      ].map(([label, value]) => (
                        <div key={label} className="bg-mist px-3 py-2.5">
                          <dt className="text-[0.6rem] uppercase tracking-[0.1em] text-graphite">
                            {label}
                          </dt>
                          <dd className="mt-0.5 truncate text-xs font-bold text-ink">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </article>
              ))}
            </div>
          )}

          <p className="mt-10 text-center text-sm text-graphite">
            Треки присылаем участникам перед выездом — в Telegram-канале школы.
          </p>
        </div>
      </section>
    </>
  );
}