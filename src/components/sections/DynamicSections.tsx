import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
    <section className="bg-paper py-20 lg:py-28">
      <div className="container-x">
        <div className="mb-10">
          <span className="eyebrow mb-4">Разделы</span>
          <h2 className="display max-w-xl text-4xl text-ink sm:text-5xl">Другое о школе</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(({ sec, cover }) => (
            <Link
              key={sec.id}
              to={`/section/${sec.slug}`}
              className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-navy"
            >
              {cover ? (
                <img
                  src={cover}
                  alt={sec.title}
                  className="h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-navy text-5xl font-bold text-white/15">
                  {sec.title.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="display text-xl text-paper">{sec.title}</h3>
                {sec.subtitle && (
                  <p className="mt-2 line-clamp-2 text-[0.8rem] leading-relaxed text-white/65">
                    {sec.subtitle}
                  </p>
                )}
                <span className="mt-3 inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-brand">
                  Перейти
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
