import { useParams, Link } from 'react-router-dom';
import SectionTitle from '../components/ui/SectionTitle';
import { useSections, useCards } from '../store/sectionsStore';

export default function SectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const sections = useSections();
  const section = sections.find((s) => s.slug === slug);
  const cards = useCards(section?.id);

  if (!section) {
    return (
      <div className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionTitle subtitle="Раздел не найден" title="404" align="center" as="h1" />
          <p className="text-gray-400 mb-6">Раздел «/{slug}» не существует или не опубликован.</p>
          <Link to="/" className="text-accent-blue hover:underline">Вернуться на главную</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle={section.subtitle}
          title={section.title}
          align="center"
          as="h1"
        />

        {cards.length === 0 ? (
          <div className="rounded-sm border border-white/10 bg-surface px-6 py-16 text-center">
            <p className="text-gray-400">Карточки скоро появятся</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card) => (
              <Link
                key={card.id}
                to={`/section/${slug}/${card.id}`}
                className="group bg-surface border border-white/10 rounded-sm overflow-hidden hover:border-accent-red/30 transition-all hover:-translate-y-1"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-accent-red/10 text-4xl font-bold text-accent-red">
                      {card.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-white text-lg font-bold group-hover:text-accent-red transition-colors mb-2">
                    {card.title}
                  </h3>
                  {card.description && (
                    <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                      {card.description}
                    </p>
                  )}
                  {card.link && (
                    <span className="mt-3 inline-block text-accent-blue text-sm hover:underline">
                      Подробнее →
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
