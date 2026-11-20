import { useRef } from 'react';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import { useTestimonials } from '../../store/testimonialsStore';
import { useSetting } from '../../store/settingsStore';
import { isFilled } from '../../lib/placeholder';

/**
 * Истории учеников — карусель цитат.
 *
 * Блок целиком скрывается, если отзывов с содержательным текстом нет:
 * пустая секция «Истории» на витрине хуже, чем её отсутствие.
 */
export default function Testimonials() {
  const items = useTestimonials().filter((item) => isFilled(item, ['name', 'text']));
  const title = useSetting('testimonialsTitle');
  const railRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    railRef.current?.scrollBy({ left: dir * 420, behavior: 'smooth' });
  };

  return (
    <section className="bg-navy py-20 text-paper lg:py-28">
      <div className="container-x">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow mb-4 text-brand">Истории</span>
            <h2 className="display max-w-xl text-4xl sm:text-5xl">{title}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Предыдущие истории"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-brand hover:bg-brand"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Следующие истории"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-brand hover:bg-brand"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={railRef} className="rail">
          {items.map((item) => (
            <figure
              key={item.id}
              className="flex w-[20rem] flex-col rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 sm:w-[26rem]"
            >
              <Quote className="mb-4 h-6 w-6 shrink-0 text-brand" />
              <blockquote className="flex-1 text-[0.95rem] leading-relaxed text-white/85">
                {item.text}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                {item.photo ? (
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="h-11 w-11 rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/20 font-bold text-brand">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-white">{item.name}</div>
                  {item.achievement ? (
                    <div className="text-[0.7rem] uppercase tracking-[0.12em] text-white/50">
                      {item.achievement}
                    </div>
                  ) : (
                    <div className="text-[0.7rem] uppercase tracking-[0.12em] text-brand">
                      {item.direction}
                    </div>
                  )}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
