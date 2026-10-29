import Button from '../ui/Button';

export default function CTA() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/images/cta.svg"
          alt="Бегущие люди"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/75" />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Стань частью{' '}
          <span className="text-accent-red">нашего сообщества</span>
        </h2>
        <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
          Присоединяйся к тренировкам, находи новых друзей и достигай целей
          вместе с нами. Первое занятие — бесплатно.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button to="/register" variant="primary" size="lg">
            Присоединиться
          </Button>
          <Button to="/schedule" variant="outline" size="lg">
            Попробовать тренировку
          </Button>
        </div>
      </div>
    </section>
  );
}
