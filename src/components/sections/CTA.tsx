import { useSetting } from '../../store/settingsStore';
import Button from '../ui/Button';

export default function CTA() {
  const ctaTitle = useSetting('ctaTitle');
  const ctaSubtitle = useSetting('ctaSubtitle');
  const ctaBackground = useSetting('ctaBackground');
  const ctaButton = useSetting('ctaButton');

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={ctaBackground}
          alt="Бегущие люди"
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.dataset.fallback) return;
            img.dataset.fallback = '1';
            img.src = '/images/cta.svg';
          }}
        />
        <div className="absolute inset-0 bg-black/75" />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
          {ctaTitle}
        </h2>
        <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
          {ctaSubtitle}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button to="/register" variant="primary" size="lg">
            {ctaButton}
          </Button>
          <Button to="/schedule" variant="outline" size="lg">
            Попробовать тренировку
          </Button>
        </div>
      </div>
    </section>
  );
}
