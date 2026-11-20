import { Handshake } from 'lucide-react';
import { PARTNERS } from '../../data/site';

/**
 * Партнёры — бегущая строка.
 *
 * Дублируем список дважды: анимация marquee смещает ленту ровно на 50%,
 * поэтому стык не заметен и разрывов при зацикливании нет.
 */
export default function Partners() {
  const items = [...PARTNERS, ...PARTNERS];

  return (
    <section className="border-b border-line bg-mist py-14">
      <div className="container-x mb-8">
        <div className="flex items-center gap-3">
          <Handshake className="h-4 w-4 text-brand" />
          <span className="eyebrow">Партнёры и друзья школы</span>
        </div>
      </div>

      {/* Лента декоративная: абсолютное позиционирование внутри обрезки,
          чтобы трек не расширял документ и не давал горизонтального скролла */}
      <div className="relative h-16 overflow-hidden" aria-hidden="true">
        <div className="absolute left-0 top-0 flex w-max animate-marquee gap-4">
          {items.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex h-16 w-64 shrink-0 items-center justify-center rounded-xl border border-line bg-paper px-6 text-sm font-semibold uppercase tracking-wide text-graphite"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
