import { useDirections } from '../../store/directionsStore';
import { useTrainers } from '../../store/trainersStore';
import { useSetting } from '../../store/settingsStore';
import Button from '../ui/Button';

/**
 * Заголовок из настроек правится одной строкой. Часть после «—» уходит
 * в акцентную полосу — так витрина читается как афиша, а не как абзац.
 */
function Title({ text }: { text: string }) {
  const idx = text.indexOf(' — ');
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx + 3)}
      <span className="text-brand">{text.slice(idx + 3)}</span>
    </>
  );
}

export default function Hero() {
  const heroTitle = useSetting('heroTitle');
  const heroSubtitle = useSetting('heroSubtitle');
  const heroBackground = useSetting('heroBackground');
  const heroButton = useSetting('heroButton');
  const city = useSetting('city');
  const directions = useDirections();
  const trainers = useTrainers();

  /** Только проверяемые цифры: их видно в админке, выдумывать нечего */
  const stats = [
    { value: String(directions.length), label: 'Направлений' },
    { value: String(trainers.length), label: 'Тренеров' },
    { value: city, label: 'Площадки в городе' },
    { value: '0 ₽', label: 'Первое занятие' },
  ];

  return (
    <section className="relative overflow-hidden bg-ink">
      {/* Фон */}
      <div className="absolute inset-0">
        <img
          src={heroBackground}
          alt="Спортсмены на тренировке"
          className="h-full w-full object-cover opacity-45"
          loading="eager"
          onError={(e) => {
            // Ссылка из админки не открылась — показываем штатное изображение
            const img = e.currentTarget;
            if (img.dataset.fallback) return;
            img.dataset.fallback = '1';
            img.src = '/images/hero.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/55 to-ink" />
      </div>

      <div className="container-x relative z-10 flex min-h-[calc(100vh-8rem)] flex-col justify-end pb-14 pt-20">
        <span className="eyebrow mb-6 inline-flex w-fit text-brand">
          <span className="h-[2px] w-8 bg-brand" />
          Спортивная школа для взрослых
        </span>

        <h1 className="display max-w-5xl text-[2.75rem] text-paper sm:text-6xl lg:text-7xl xl:text-8xl">
          <Title text={heroTitle} />
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg lg:text-xl">
          {heroSubtitle}
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button to="/register" variant="primary" size="lg" className="rounded-full">
            {heroButton}
          </Button>
          <Button
            to="/schedule"
            variant="outline"
            size="lg"
            className="rounded-full border-white/40 text-white hover:bg-white hover:text-ink"
          >
            Расписание тренировок
          </Button>
          <Button
            to="/directions"
            variant="secondary"
            size="lg"
            className="rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
          >
            Наши направления
          </Button>
        </div>

        {/* Цифры — нижняя полоса hero, как в афише */}
        <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/15 pt-8 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="display text-3xl text-white sm:text-4xl">{stat.value}</dd>
              <dd className="mt-1.5 text-[0.7rem] uppercase tracking-[0.14em] text-white/50">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
