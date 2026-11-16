import { useParams, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import SectionTitle from '../components/ui/SectionTitle';
import { useSections, useCards } from '../store/sectionsStore';

export default function SectionDetailPage() {
  const { slug, cardId } = useParams<{ slug: string; cardId: string }>();
  const sections = useSections();
  const section = sections.find((s) => s.slug === slug);
  const cards = useCards(section?.id);
  const card = cards.find((c) => c.id === cardId);

  if (!section || !card) {
    return (
      <div className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionTitle subtitle="Карточка не найдена" title="404" align="center" as="h1" />
          <p className="text-gray-400 mb-6">Запрашиваемая карточка не существует.</p>
          <Link to={`/section/${slug}`} className="text-accent-blue hover:underline">
            ← Назад к разделу «{section?.title}»
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {card.image && (
          <div className="mb-8 aspect-[21/9] overflow-hidden rounded-sm">
            <img
              src={card.image}
              alt={card.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <SectionTitle subtitle="" title={card.title} align="left" as="h1" />
        <div
          className="mt-8 text-base leading-relaxed text-gray-300"
          dangerouslySetInnerHTML={{ __html: card.description }}
        />
        {card.link && (
          <div className="mt-8">
            <Button to={card.link} variant="primary" size="lg">
              Перейти →
            </Button>
          </div>
        )}
        <div className="mt-8">
          <Link to={`/section/${slug}`} className="text-accent-blue hover:underline">
            ← Назад к списку
          </Link>
        </div>
      </div>
    </div>
  );
}
