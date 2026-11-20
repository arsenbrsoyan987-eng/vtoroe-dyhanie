import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { activeProfiles, useProfiles } from '../../store/profilesStore';
import {
  ActionButton,
  EmptyState,
  PageHeader,
  Panel,
  PanelTitle,
  fieldClass,
} from '../../components/cabinet/ui';
import { Star, Trophy, Upload } from 'lucide-react';

export default function AdminResultsPage() {
  const { personalResults } = useAuth();
  const users = activeProfiles(useProfiles());
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
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Тренировки"
        title="Результаты"
        subtitle="Достижения спортсменов школы — из личных дневников и импорта CSV."
        actions={
          <ActionButton
            variant="outline"
            onClick={() =>
              setCsvText(
                csvText ? '' : 'name,event,date,distance,time,place\nИванов,Марафон,2026-10-01,42.195,3:15:20,1'
              )
            }
          >
            <Upload className="h-3.5 w-3.5" />
            Импорт CSV
          </ActionButton>
        }
      />

      {csvText && (
        <Panel className="mb-5">
          <PanelTitle hint="Заголовки: имя, событие, дата, дистанция, время, место.">
            Импорт результатов (CSV)
          </PanelTitle>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={5}
            className={`${fieldClass} font-mono text-xs`}
            aria-label="CSV с результатами"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <ActionButton onClick={handleImport}>Импортировать</ActionButton>
            {imported > 0 && (
              <span className="text-xs font-semibold text-emerald-700">
                Распознано строк: {imported}
              </span>
            )}
          </div>
        </Panel>
      )}

      <Panel padded={false}>
        {athleteResults.length === 0 ? (
          <div className="p-5 sm:p-6">
            <EmptyState
              title="Результатов пока нет"
              text="Спортсмены добавляют их в личном кабинете, администратор может загрузить протокол через CSV."
              action={
                <ActionButton variant="outline" onClick={() => setCsvText('name,event,date,distance,time,place\n')}>
                  Загрузить CSV
                </ActionButton>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-mist/60">
                  <th className="px-5 py-2.5 text-left text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
                    Спортсмен
                  </th>
                  <th className="px-3 py-2.5 text-left text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
                    Результат
                  </th>
                  <th className="hidden px-3 py-2.5 text-left text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite sm:table-cell">
                    Дистанция
                  </th>
                  <th className="hidden px-3 py-2.5 text-left text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite sm:table-cell">
                    Дата
                  </th>
                  <th className="px-5 py-2.5 text-left text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
                    Оценка
                  </th>
                </tr>
              </thead>
              <tbody>
                {athleteResults.map((r) => {
                  const user = users.find((u) => u.id === r.userId);
                  return (
                    <tr key={r.id} className="border-b border-line last:border-0 hover:bg-mist/50">
                      <td className="px-5 py-3 font-semibold text-ink">{user?.name || '—'}</td>
                      <td className="px-3 py-3 font-bold text-navy">
                        {r.distance && r.time
                          ? `${r.distance} за ${r.time}`
                          : r.distance || r.time || '—'}
                      </td>
                      <td className="hidden px-3 py-3 text-graphite sm:table-cell">
                        {r.distance || '—'}
                      </td>
                      <td className="hidden px-3 py-3 text-xs text-graphite sm:table-cell">
                        {new Date(r.date).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-5 py-3">
                        <span className="flex gap-0.5">
                          {Array.from({ length: r.rating || 0 }, (_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                          ))}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <p className="mt-4 flex items-center gap-1.5 text-xs text-graphite">
        <Trophy className="h-3.5 w-3.5" />
        Публичный протокол соревнований живёт на странице «Результаты» сайта.
      </p>
    </div>
  );
}