import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStoredUsers } from '../../store/database';
import { Trophy, Upload } from 'lucide-react';

export default function AdminResultsPage() {
  const { personalResults } = useAuth();
  const users = getStoredUsers();
  const [csvText, setCsvText] = useState('');
  const [imported, setImported] = useState(0);

  const athleteResults = personalResults.filter((r) => r.userId && users.find((u) => u.id === r.userId));

  const handleImport = () => {
    if (!csvText.trim()) return;
    const lines = csvText.trim().split('\n');
    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    let count = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row: Record<string, string> = {};
      header.forEach((h, idx) => { row[h] = values[idx] || ''; });

      if (row['имя'] || row['athlete']) {
        count++;
      }
    }
    setImported(count);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Результаты</h1>
            <p className="text-gray-400 text-sm">Достижения спортсменов клуба</p>
          </div>
        </div>
        <button onClick={() => setCsvText(csvText ? '' : 'name,event,date,distance,time,place\nИванов,Марафон,2026-10-01,42.195,3:15:20,1')} className="bg-accent-blue text-white text-sm px-4 py-2 rounded-sm hover:bg-accent-blue-hover transition-colors flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Импорт CSV
        </button>
      </div>

      {csvText && (
        <div className="bg-surface border border-white/10 rounded-sm p-6 mb-6">
          <h3 className="text-white font-semibold mb-3">Импорт результатов (CSV)</h3>
          <p className="text-gray-400 text-xs mb-3">
            Заголовки: имя, событие, дата, дистанция, время, место
          </p>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={5}
            className="w-full bg-primary border border-white/10 rounded-sm px-3 py-2 text-white text-sm focus:border-accent-red focus:outline-none font-mono"
          />
          <div className="flex items-center gap-4 mt-3">
            <button onClick={handleImport} className="bg-accent-red text-white text-sm px-4 py-2 rounded-sm hover:bg-accent-red-hover transition-colors">
              Импортировать
            </button>
            {imported > 0 && <span className="text-green-400 text-sm">✓ Импортировано: {imported} строк</span>}
          </div>
        </div>
      )}

      <div className="bg-surface border border-white/10 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs">Спортсмен</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs">Результат</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs hidden sm:table-cell">Дистанция</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs hidden sm:table-cell">Дата</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs">Оценка</th>
            </tr>
          </thead>
          <tbody>
            {athleteResults.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                  Нет результатов. Добавьте данные через импорт или личный кабинет спортсмена.
                </td>
              </tr>
            ) : (
              athleteResults.map((r) => {
                const user = users.find((u) => u.id === r.userId);
                return (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white font-medium">{user?.name || '—'}</td>
                    <td className="py-3 px-4 text-accent-blue font-semibold">
                      {r.distance && r.time ? `${r.distance} за ${r.time}` : r.distance || r.time || '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-300 hidden sm:table-cell">{r.distance || '—'}</td>
                    <td className="py-3 px-4 text-gray-400 hidden sm:table-cell">{new Date(r.date).toLocaleDateString('ru-RU')}</td>
                    <td className="py-3 px-4 text-yellow-400">{'⭐'.repeat(r.rating || 0)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
