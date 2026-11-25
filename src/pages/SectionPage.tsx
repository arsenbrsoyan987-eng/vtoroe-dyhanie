import { useParams, Link } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { useSections, useCards } from '../store/sectionsStore';
import { plainExcerpt, toHtml } from '../lib/html';
import { countNoun } from '../lib/plural';
import { ArrowRight } from 'lucide-react';

/** Единый стиль для HTML, который админ печатает в разделе */
const PROSE =
  'text-base leading-relaxed text-ink/85 [&_a]:font-semibold [&_a]:text-brand [&_a]:underline [&_h2]:display [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:text-ink [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-4 [&_p]:last:mb-0 [&_strong]:font-bold [&_strong]:text-ink [&_ul]:mb-4 [&_ul]:space-y-2';

export default function SectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const sections = useSections();
  const section = sections.find((s) => s.slug === slug);
  const cards = useCards(section?.id);

  if (!section) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="display mb-4 text-3xl text-ink">Раздел не найден</h1>
        <p className="mb-8 text-sm text-graphite">
          Раздел «/{slug}» не существует или не опубликован.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
        >
          На главную
        </Link>
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs items={[{ label: section.title }]} />

      <section className="bg-ink pb-14 pt-8 text-paper lg:pb-16">
        <div className="container-x">
          {section.subtitle && (
            <span className="eyebrow mb-4 text-brand">
              <span className="h-[2px] w-8 bg-brand" />
              {section.subtitle}
            </span>
          )}
          <h1 className="display max-w-3xl text-[2.5rem] sm:text-6xl lg:text-7xl">
            {section.title}
          </h1>
          {cards.length > 0 && (
            <p className="mt-5 text-[0.7rem] uppercase tracking-[0.14em] text-white/50">
              {countNoun(cards.length, 'материал', 'материала', 'материалов')}
            </p>
          )}
        </div>
      </section>

      <section className="bg-paper py-14 lg:py-20">
        <div className="container-x">
          {section.description && (
            <div
              className={`mx-auto mb-12 max-w-3xl ${PROSE}`}
              dangerouslySetInnerHTML={{ __html: toHtml(section.description) }}
            />
          )}

          {cards.length === 0 ? (
            !section.description?.trim() && (
              <div className="rounded-2xl border border-dashed border-line bg-mist px-6 py-16 text-center">
                <p className="text-sm text-graphite">Материалы скоро появятся</p>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <Link
                  key={card.id}
                  to={`/section/${slug}/${card.id}`}
                  className="card-lift card-lift-hover group flex flex-col overflow-hidden"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-mist">
                    {card.image ? (
                      <img
                        src={card.image}
                        alt={card.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-navy text-4xl font-bold text-white">
                        {card.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="display text-lg leading-tight text-ink group-hover:text-brand">
                      {card.title}
                    </h2>
                    {card.description && (
                      <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-relaxed text-graphite">
                        {plainExcerpt(card.description)}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-ink">
                      Подробнее
                      <ArrowRight className="h-3.5 w-3.5 text-brand transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}