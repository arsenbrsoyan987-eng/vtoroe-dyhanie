import Button from '../ui/Button';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/vtoroe-dyhanie/images/hero.svg"
          alt="Спортсмены на тренировке"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
          Второе дыхание —{' '}
          <span className="text-accent-red">больше, чем спорт</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-10 leading-relaxed">
          Бегаем, крутим педали, исследуем новые маршруты и становимся сильнее
          вместе
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button to="/register" variant="primary" size="lg">
            Присоединиться к клубу
          </Button>
          <Button to="/schedule" variant="outline" size="lg">
            Расписание тренировок
          </Button>
          <Button to="/directions" variant="secondary" size="lg">
            Наши направления
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-white/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
