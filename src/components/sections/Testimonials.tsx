import SectionTitle from '../ui/SectionTitle';
import { useTestimonials } from '../../store/testimonialsStore';

export default function Testimonials() {
  const testimonials = useTestimonials();

  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Истории"
          title="Голоса сообщества"
          align="center"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-surface border border-white/10 rounded-sm p-6 hover:border-accent-red/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                {item.photo ? (
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-red/15 font-bold text-accent-red">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-white font-semibold text-sm">{item.name}</div>
                  <div className="text-accent-red text-xs">{item.direction}</div>
                </div>
              </div>
              <blockquote className="text-gray-300 text-sm leading-relaxed italic mb-4">
                «{item.text}»
              </blockquote>
              {item.achievement && (
                <div className="text-gray-500 text-xs">
                  🏆 {item.achievement}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
