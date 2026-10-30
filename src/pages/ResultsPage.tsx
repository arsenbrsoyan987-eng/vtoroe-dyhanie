import SectionTitle from '../components/ui/SectionTitle';
import { useResults } from '../store/resultsStore';
import { anyPlaceholder } from '../lib/placeholder';

export default function ResultsPage() {
  const results = useResults();
  // Протоколы со «[Имя спортсмена]» в публичной таблице — хуже, чем пустая
  // страница: выглядит как неработающий сайт. Показываем только реальные строки.
  const real = results.filter(
    (r) => !anyPlaceholder([r.athleteName, r.event, r.discipline, r.result, r.place]),
  );

  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle subtitle="Спорт" title="Спортивные результаты" align="center" as="h1" />

        {real.length === 0 ? (
          <div className="rounded-sm border border-white/10 bg-surface px-6 py-16 text-center">
            <p className="mx-auto max-w-md text-sm leading-relaxed text-gray-400">
              Протоколы соревнований публикуем после каждого старта. Результаты
              участников появятся здесь, как только завершится ближайший забег.
            </p>
            <p className="mt-4 text-xs text-gray-500">
              Хотите попасть в список? Приходите на тренировку — подготовим к
              первому старту.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Спортсмен</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Соревнование</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium hidden md:table-cell">Дата</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium hidden sm:table-cell">Дисциплина</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Результат</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Место</th>
                </tr>
              </thead>
              <tbody>
                {real.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 text-white font-medium">{r.athleteName}</td>
                    <td className="py-4 px-4 text-gray-300">{r.event}</td>
                    <td className="py-4 px-4 text-gray-400 hidden md:table-cell">
                      {new Date(r.date).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="py-4 px-4 text-gray-400 hidden sm:table-cell">{r.discipline}</td>
                    <td className="py-4 px-4 text-accent-blue font-semibold">{r.result}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent-red/20 text-accent-red text-xs font-bold">
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
    </div>
  );
}