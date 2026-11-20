import { useSetting } from '../../store/settingsStore';

/**
 * Call-to-action — финальный блок перед футером.
 *
 * Тексты берутся из настроек (admingui), фон — из admin-настроек.
 */
export default function CTA() {
  const title = useSetting('ctaTitle');
  const subtitle = useSetting('ctaSubtitle');
  const button = useSetting('ctaButton');
  const background = useSetting('ctaBackground');

  return (
    <section className="relative overflow-hidden bg-navy py-20 text-paper lg:py-28">
      {/* Фон */}
      <div className="absolute inset-0">
        <img
          src={background}
          alt=""
          className="h-full w-full object-cover opacity-20"
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.dataset.fallback) return;
            img.dataset.fallback = '1';
            img.src = '/images/cta.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/80 to-navy" />
      </div>

      <div className="container-x relative z-10 text-center">
        <span className="eyebrow mb-4 inline-block text-brand">
          <span className="h-[1px] w-8 bg-brand" />
        </span>
        <h2 className="display text-3xl leading-tight text-paper sm:text-4xl md:text-5xl">
          {title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
          {subtitle}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/register"
            className="rounded-full bg-brand px-8 py-4 text-sm font-semibold uppercase tracking-wide text-white transition-all hover:bg-brand-dark active:scale-95"
          >
            {button}
          </a>
          <a
            href="/schedule"
            className="rounded-full border border-white/30 px-8 py-4 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-ink"
          >
            Попробовать тренировку
          </a>
        </div>
      </div>
    </section>
  );
}