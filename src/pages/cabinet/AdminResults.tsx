import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { activeProfiles, useProfiles } from '../../store/profilesStore';
import { useTrainings } from '../../store/trainingsStore';
import {
  ActionButton,
  EmptyState,
  PageHeader,
  Panel,
  PanelTitle,
  fieldClass,
} from '../../components/cabinet/ui';
import { countNoun } from '../../lib/plural';
import {
  Search,
  Star,
  Trophy,
  Upload,
  X,
} from 'lucide-react';

export default function AdminResultsPage() {
  const { personalResults } = useAuth();
  const users = activeProfiles(useProfiles());
  const trainings = useTrainings();
  const [search, setSearch] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [imported, setImported] = useState(0);

  // Связываем результаты с пользователями и тренировками
  const resultsWithUser = useMemo(() => {
    const rows: {
      id: string;
      userId: string;
      trainingId: string;
      date: string;
      distance?: string;
      time?: string;
      notes?: string;
      rating?: number;
      userName: string;
      email: string;
      trainingName?: string;
    }[] = [];
    for (const r of personalResults) {
      const user = users.find((u) => u.id === r.userId);
      if (!user) continue;
      const training = trainings.find((t) => t.id === r.trainingId);
      rows.push({
        ...r,
        userName: user.name,
        email: user.email,
        ...(training ? { trainingName: training.name } : {}),
      });
    }
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  }, [personalResults, users, trainings]);

  // Поиск
  const q = search.trim().toLowerCase();
  const list = useMemo(() => {
    if (!q) return resultsWithUser;
    return resultsWithUser.filter(
      (r) =>
        r.userName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.trainingName?.toLowerCase().includes(q) ?? false)
    );
  }, [resultsWithUser, q]);

  // Импортируем из CSV
  const handleImport = () => {
    if (!csvText.trim()) return;
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      setImported(0);
      return;
    }
    let count = 0;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) count++;
    }
    setImported(count);
  };

  // Топ спортсменов по количеству результатов
  const topAthletes = useMemo(() => {
    const map = new Map<string, { count: number; bestRating: number }>();
    for (const r of resultsWithUser) {
      const item = map.get(r.userId) ?? { count: 0, bestRating: 0 };
      item.count += 1;
      if ((r.rating ?? 0) > item.bestRating) item.bestRating = r.rating ?? 0;
      map.set(r.userId, item);
    }
    return [...map.entries()]
      .map(([userId, v]) => ({
        userId,
        name: users.find((u) => u.id === userId)?.name ?? 'Неизвестно',
        ...v,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [resultsWithUser, users]);

  // Статистика: средние оценки и кол-во записей
  const stats = useMemo(() => {
    const total = resultsWithUser.length;
    const rated = resultsWithUser.filter((r) => r.rating);
    const avgRating = rated.length
      ? (rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length).toFixed(1)
      : '—';
    const withDistance = resultsWithUser.filter((r) => r.distance).length;
    const withTime = resultsWithUser.filter((r) => r.time).length;
    return { total, rated: rated.length, avgRating, withDistance, withTime };
  }, [resultsWithUser]);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Тренировки"
        title="Результаты"
        subtitle="Достижения спортсменов — из личных дневников и импорта CSV."
        actions={
          <ActionButton
            onClick={() => setShowImport((v) => !v)}
            variant={showImport ? 'outline' : 'primary'}
          >
            <Upload className="h-3.5 w-3.5" />
            {showImport ? 'Отмена' : 'Импорт CSV'}
          </ActionButton>
        }
      />

      {/* Статистика */}
      {stats.total > 0 && (
        <div className="mb-5 grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-line bg-paper px-4 py-3.5">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
              Всего записей
            </p>
            <p className="mt-1 display text-2xl text-ink">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-line bg-paper px-4 py-3.5">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
              С оценкой
            </p>
            <p className="mt-1 display text-2xl text-ink">{stats.rated}</p>
          </div>
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3.5">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-amber-700">
              Средний балл
            </p>
            <p className="mt-1 display text-2xl text-ink">{stats.avgRating}</p>
          </div>
          <div className="rounded-2xl border border-line bg-paper px-4 py-3.5">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
              С дистанцией
            </p>
            <p className="mt-1 display text-2xl text-ink">
              {stats.withDistance}
              <span className="ml-1 text-xs font-normal text-graphite">
                / {stats.withTime} {countNoun(stats.withTime, 'с временем', 'с временем', 'с временем')}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Топ спортсменов */}
      {topAthletes.length > 0 && (
        <Panel className="mb-5">
          <PanelTitle hint="Самые активные в дневнике достижений.">
            <span className="inline-flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Лидеры дневника
            </span>
          </PanelTitle>
          <div className="grid gap-3 sm:grid-cols-5">
            {topAthletes.map((a, i) => (
              <div
                key={a.userId}
                className={`rounded-xl border px-3 py-2.5 text-center ${
                  i === 0
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-line bg-mist/50'
                }`}
              >
                <p className="text-xs font-bold text-ink">{a.name}</p>
                <p className="mt-0.5 text-[0.68rem] text-graphite">
                  {a.count} {countNoun(a.count, 'запись', 'записи', 'записей')}
                </p>
                {a.bestRating > 0 && (
                  <span className="mt-1 inline-block text-[0.68rem] text-amber-700">
                    ★ {a.bestRating}/5
                  </span>
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Импорт CSV */}
      {showImport && (
        <Panel className="mb-5">
          <PanelTitle hint="Формат CSV: имя, событие, дата, дистанция, время, место. Строка заголовка пропускается.">
            Импорт результатов (CSV)
          </PanelTitle>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={5}
            className={`${fieldClass} font-mono text-xs`}
            aria-label="CSV с результатами"
            placeholder="name,event,date,distance,time,place\nИванов,Марафон,2026-10-01,42.195,3:15:20,1"
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

      {/* Поиск */}
      {list.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-2 text-xs">
          <Search className="h-3.5 w-3.5 shrink-0 text-graphite/60" />
          <input
            type="text"
            placeholder="Имя спортсмена, email или тренировка…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Очистить поиск"
              className="shrink-0 text-graphite hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      <Panel padded={false}>
        {list.length === 0 ? (
          <div className="p-5 sm:p-6">
            <EmptyState
              title={search ? 'Ничего не найдено' : 'Результатов пока нет'}
              text="Спортсмены добавляют их в личном кабинете, администратор может загрузить протокол через CSV."
              action={!search && (
                <ActionButton variant="outline" onClick={() => setShowImport(true)}>
                  Загрузить CSV
                </ActionButton>
              )}
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
                    Тренировка
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
                {list.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0 hover:bg-mist/50">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-ink">{r.userName}</p>
                      <p className="text-[0.68rem] text-graphite">{r.email}</p>
                    </td>
                    <td className="px-3 py-3 font-bold text-navy">
                      {r.distance && r.time
                        ? `${r.distance} за ${r.time}`
                        : r.distance || r.time || '—'}
                    </td>
                    <td className="hidden px-3 py-3 text-graphite sm:table-cell">
                      {r.trainingName || '—'}
                    </td>
                    <td className="hidden px-3 py-3 text-xs text-graphite sm:table-cell">
                      {new Date(`${r.date}T12:00:00`).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-5 py-3">
                      {r.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                          <span className="text-xs font-bold text-ink">{r.rating}/5</span>
                        </div>
                      ) : (
                        <span className="text-xs text-graphite/50">—</span>
                      )}
                    </td>
                  </tr>
                ))}
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
