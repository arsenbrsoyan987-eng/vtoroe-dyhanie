import { useParams, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { useSections, useCards } from '../store/sectionsStore';
import { toHtml } from '../lib/html';
import { ArrowLeft } from 'lucide-react';

/** Единый стиль для HTML, который админ печатает в карточке */
const PROSE =
  'text-base leading-relaxed text-ink/85 [&_a]:font-semibold [&_a]:text-brand [&_a]:underline [&_h2]:display [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:text-ink [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-4 [&_p]:last:mb-0 [&_strong]:font-bold [&_strong]:text-ink [&_ul]:mb-4 [&_ul]:space-y-2';

export default function SectionDetailPage() {
  const { slug, cardId } = useParams<{ slug: string; cardId: string }>();
  const sections = useSections();
  const section = sections.find((s) => s.slug === slug);
  const cards = useCards(section?.id);
  const card = cards.find((c) => c.id === cardId);

  if (!section || !card) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="display mb-4 text-3xl text-ink">Карточка не найдена</h1>
        <p className="mb-8 text-sm text-graphite">Запрашиваемая карточка не существует.</p>
        {section && (
          <Button to={`/section/${slug}`} variant="outline" size="sm">
            К разделу «{section.title}»
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: section.title, to: `/section/${slug}` },
          { label: card.title },
        ]}
      />

      <article className="bg-paper pb-16 pt-6 lg:pb-24">
        <div className="container-x">
          <div className="mx-auto max-w-3xl">
            {card.image && (
              <div className="mb-8 overflow-hidden rounded-2xl bg-mist">
                <img
                  src={card.image}
                  alt={card.title}
                  className="aspect-[21/9] w-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            <span className="eyebrow mb-4">
              <span className="h-[2px] w-8 bg-brand" />
              {section.title}
            </span>
            <h1 className="display text-[2rem] leading-tight text-ink sm:text-4xl lg:text-5xl">
              {card.title}
            </h1>

            <div
              className={`mt-8 ${PROSE}`}
              dangerouslySetInnerHTML={{ __html: toHtml(card.description) }}
            />

            {card.link && (
              <div className="mt-8">
                <Button to={card.link} variant="primary" size="lg">
                  Перейти
                </Button>
              </div>
            )}

            <div className="mt-10 border-t border-line pt-6">
              <Link
                to={`/section/${slug}`}
                className="inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-graphite transition-colors hover:text-brand"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                К разделу «{section.title}»
              </Link>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}