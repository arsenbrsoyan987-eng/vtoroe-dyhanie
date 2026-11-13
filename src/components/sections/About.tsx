import SectionTitle from '../ui/SectionTitle';
import { useDirections } from '../../store/directionsStore';
import { useTrainers } from '../../store/trainersStore';
import { useSetting } from '../../store/settingsStore';

export default function About() {
  const directions = useDirections();
  const trainers = useTrainers();
  const aboutTitle = useSetting('aboutTitle');
  const aboutSubtitle = useSetting('aboutSubtitle');
  const aboutText1 = useSetting('aboutText1');
  const aboutText2 = useSetting('aboutText2');

  // Только проверяемые цифры: количество направлений и карточек тренеров.
  // Придуманные «500+ участников» на старте выглядят как обман.
  const stats = [
    { number: String(directions.length), label: 'Направлений' },
    { number: String(trainers.length), label: 'Тренеров' },
    { number: 'Москва', label: 'Парки и стадионы' },
    { number: '0 ₽', label: 'Первое занятие' },
  ];

  return (
    <section className="py-20 lg:py-28 bg-primary overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div>
            <SectionTitle
              subtitle={aboutSubtitle}
              title={aboutTitle}
              align="left"
            />
            <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6">
              {aboutText1}
            </p>
            <p className="text-gray-400 text-base leading-relaxed mb-8">
              {aboutText2}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl md:text-3xl font-bold text-accent-red mb-1">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 text-xs uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-sm overflow-hidden">
              <img
                src="/images/about.svg"
                alt="Атмосфера школы"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {/* Декор только на широких экранах: на мобильном он вылезает за край */}
            <div className="absolute -bottom-6 -left-6 hidden h-32 w-32 rounded-sm bg-accent-red/20 sm:block -z-10" />
            <div className="absolute -top-6 -right-6 hidden h-24 w-24 rounded-sm bg-accent-blue/20 sm:block -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}