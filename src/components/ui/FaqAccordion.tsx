import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FaqItem } from '../../data/site';

/**
 * Аккордеон вопросов.
 *
 * Открытым держим один вопрос — так страница направления не превращается
 * в простыню текста, а скрывать ответы нельзя: их читает поисковик.
 */
export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-paper">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-mist sm:px-6"
            >
              <span className="text-sm font-bold text-ink sm:text-base">{item.q}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-brand transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="animate-reveal px-5 pb-5 text-sm leading-relaxed text-graphite sm:px-6 sm:pb-6">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
