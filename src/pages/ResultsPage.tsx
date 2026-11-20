import Breadcrumbs from '../components/ui/Breadcrumbs';
import Button from '../components/ui/Button';
import { useResults } from '../store/resultsStore';
import { anyPlaceholder } from '../lib/placeholder';
import { countNoun } from '../lib/plural';
import { Trophy } from 'lucide-react';

export default function ResultsPage() {
  const results = useResults();
  // Протоколы со «[Имя спортсмена]» в публичной таблице — хуже, чем пустая
  // страница: выглядит как неработающий сайт. Показываем только реальные строки.
  const real = results.filter(
    (r) => !anyPlaceholder([r.athleteName, r.event, r.discipline, r.result, r.place]),
  );

  return (
    <>
      <Breadcrumbs items={[{ label: 'Результаты' }]} />

      <section className="bg-ink pb-14 pt-8 text-paper lg:pb-16">
        <div className="container-x">
          <span className="eyebrow mb-4 text-brand">
            <span className="h-[2px] w-8 bg-brand" />
            {real.length > 0
              ? countNoun(real.length, 'протокол', 'протокола', 'протоколов')
              : 'Протоколы стартов'}
          </span>
          <h1 className="display max-w-3xl text-[2.5rem] sm:text-6xl lg:text-7xl">
            Спортивные результаты
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Забеги, триатлоны и трейлы, где стартовали наши спортсмены.
            Протоколы публикуем после каждого старта.
          </p>
        </div>
      </section>

      <section className="bg-paper py-14 lg:py-20">
        <div className="container-x">
          {real.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-mist px-6 py-16 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-paper shadow-card">
                <Trophy className="h-6 w-6 text-brand" />
              </div>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-graphite">
                Протоколы соревнований публикуем после каждого старта. Результаты
                участников появятся здесь, как только завершится ближайший забег.
              </p>
              <p className="mx-auto mt-4 max-w-sm text-xs text-graphite/80">
                Хотите попасть в список? Приходите на тренировку — подготовим
                к первому старту.
              </p>
              <Button to="/schedule" variant="primary" size="sm" className="mt-6">
                Посмотреть расписание
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[40rem] text-sm">
                <thead>
                  <tr className="border-b border-line bg-mist">
                    {[
                      ['Спортсмен', ''],
                      ['Соревнование', ''],
                      ['Дата', 'hidden md:table-cell'],
                      ['Дисциплина', 'hidden sm:table-cell'],
                      ['Результат', ''],
                      ['Место', ''],
                    ].map(([label, extra]) => (
                      <th
                        key={label}
                        className={`px-4 py-3 text-left text-[0.65rem] font-bold uppercase tracking-[0.12em] text-graphite ${extra}`}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {real.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-line last:border-0 transition-colors hover:bg-mist/60"
                    >
                      <td className="px-4 py-4 font-semibold text-ink">{r.athleteName}</td>
                      <td className="px-4 py-4 text-graphite">{r.event}</td>
                      <td className="hidden px-4 py-4 text-graphite md:table-cell">
                        {new Date(r.date).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="hidden px-4 py-4 text-graphite sm:table-cell">
                        {r.discipline}
                      </td>
                      <td className="px-4 py-4 font-bold text-ink">{r.result}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-brand/10 px-2 text-xs font-bold text-brand">
                          {r.place}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
