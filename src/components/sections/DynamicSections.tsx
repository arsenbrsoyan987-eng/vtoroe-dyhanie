import { Link } from 'react-router-dom';
import SectionTitle from '../ui/SectionTitle';
import { useCards, useSections } from '../../store/sectionsStore';

/**
 * Плитки разделов, созданных администратором.
 *
 * Обложкой служит фото первой карточки раздела: отдельное поле для
 * картинки заводить не нужно, а раздел без карточек и так неинтересно
 * показывать на главной.
 */
export default function DynamicSections() {
  const sections = useSections().filter((s) => s.published);
  const cards = useCards();

  const visible = sections
    .map((sec) => ({
      sec,
      cover: cards.find((c) => c.section_id === sec.id && c.image)?.image ?? '',
      count: cards.filter((c) => c.section_id === sec.id).length,
    }))
    .filter((x) => x.count > 0);

  if (visible.length === 0) return null;

  return (
    <section className="bg-primary py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle subtitle="Разделы" title="Другое о школе" align="center" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map(({ sec, cover }) => (
            <Link
              key={sec.id}
              to={`/section/${sec.slug}`}
              className="group relative overflow-hidden rounded-sm aspect-[4/3] block border border-white/10 hover:border-accent-red/50 transition-colors"
            >
              {cover ? (
                <img
                  src={cover}
                  alt={sec.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-accent-red/10 text-4xl font-bold text-accent-red">
                  {sec.title.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                {sec.icon && <span className="text-3xl mb-2 block">{sec.icon}</span>}
                <h3 className="text-white text-xl font-bold group-hover:text-accent-red transition-colors">
                  {sec.title}
                </h3>
                {sec.subtitle && (
                  <p className="text-gray-300 text-sm mt-1 line-clamp-2">{sec.subtitle}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}