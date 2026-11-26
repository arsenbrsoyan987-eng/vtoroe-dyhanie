/**
 * Линейный график прогресса дневника: значения по датам без библиотек.
 *
 * Ось Y перевёрнута для времени (меньше — лучше), поэтому «хорошо» всегда
 * вверху: спортсмен читает график как «линия идёт вверх — я расту».
 */

export interface ProgressPoint {
  date: string;
  /** Число в тех же единицах, что и остальные точки серии */
  value: number;
  /** Подпись под точкой для тултипа и оси */
  caption: string;
}

const W = 100;
const H = 44;
const PAD_Y = 6;

function niceDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

export function ProgressChart({
  points,
  lowerIsBetter = false,
  unit = '',
}: {
  points: ProgressPoint[];
  lowerIsBetter?: boolean;
  unit?: string;
}) {
  if (points.length < 2) {
    return (
      <p className="rounded-xl bg-mist px-3 py-3 text-xs text-graphite">
        Нужно минимум два результата, чтобы увидеть динамику.
      </p>
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * W;
    // Для времени лучший результат — меньший: инвертируем ось
    const norm = lowerIsBetter ? (max - p.value) / span : (p.value - min) / span;
    const y = H - PAD_Y - norm * (H - PAD_Y * 2);
    return { x, y, ...p };
  });

  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(' ');
  const area = `${line} L${W} ${H} L0 ${H} Z`;

  const first = points[0];
  const last = points[points.length - 1];
  const delta = last.value - first.value;
  const improved = lowerIsBetter ? delta < 0 : delta > 0;
  const flat = delta === 0;

  const best = lowerIsBetter ? min : max;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-graphite">
            Динамика
          </p>
          <p className="mt-0.5 text-sm font-bold text-ink">
            {niceDate(first.date)} — {niceDate(last.date)}
          </p>
        </div>
        <div className="text-right">
          <p
            className={`text-sm font-bold ${
              flat ? 'text-graphite' : improved ? 'text-emerald-700' : 'text-brand'
            }`}
          >
            {flat ? '±0' : `${delta > 0 ? '+' : ''}${delta.toFixed(1)}`} {unit}
          </p>
          <p className="text-[0.68rem] text-graphite">
            Лучший: {best.toFixed(1)} {unit}
          </p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-28 w-full overflow-visible"
        role="img"
        aria-label={`График прогресса: ${points.length} результатов`}
      >
        <defs>
          <linearGradient id="progress-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#progress-fill)" className="text-brand" />
        <path
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="text-brand"
        />
        {coords.map((c, i) => (
          <circle
            key={`${c.date}-${i}`}
            cx={c.x}
            cy={c.y}
            r={1.4}
            className="fill-paper stroke-brand"
            strokeWidth={1.4}
            vectorEffect="non-scaling-stroke"
          >
            <title>
              {c.caption}: {c.value.toFixed(1)} {unit}
            </title>
          </circle>
        ))}
      </svg>

      <div className="mt-1 flex justify-between text-[0.62rem] text-graphite">
        <span>{niceDate(first.date)}</span>
        <span>{niceDate(last.date)}</span>
      </div>
    </div>
  );
}
