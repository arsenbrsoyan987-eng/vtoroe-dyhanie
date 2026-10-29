import SectionTitle from '../components/ui/SectionTitle';
import { results } from '../data/news';

export default function ResultsPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle subtitle="Спорт" title="Спортивные результаты" align="center" as="h1" />

        {/* Table */}
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
              {results.map((r) => (
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

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-between p-6 bg-surface border border-white/10 rounded-sm">
          <p className="text-gray-400 text-sm">
            [Результаты загружаются вручную или через импорт из CSV/Excel. Функционал импорта будет реализован в админ-панели.]
          </p>
          <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-sm shrink-0">
            CSV / Excel импорт — скоро
          </span>
        </div>
      </div>
    </div>
  );
}
