import SectionTitle from '../ui/SectionTitle';

export default function About() {
  return (
    <section className="py-20 lg:py-28 bg-primary overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div>
            <SectionTitle
              subtitle="О клубе"
              title="Движение — это жизнь"
              align="left"
            />
            <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6">
              «Второе дыхание» — это спортивное сообщество, объединяющее людей,
              которые любят движение. Мы верим, что спорт — это не только
              результаты на соревнованиях, но и свобода, общение, преодоление
              себя и открытие новых горизонтов.
            </p>
            <p className="text-gray-400 text-base leading-relaxed mb-8">
              Наш клуб основан на принципах взаимной поддержки, постоянных
              тренировок и активного отдыха на природе. Мы бегаем по городским
              паркам и горным тропам, крутим педали по пригородным дорогам,
              ходим в походы и тренируемся функционально — в зале и на улице.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { number: '[XXX]+', label: 'Участников' },
                { number: '[5]', label: 'Направлений' },
                { number: '[5]', label: 'Тренеров' },
                { number: '[50]+', label: 'Мероприятий в год' },
              ].map((stat) => (
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
                alt="Атмосфера клуба"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent-red/20 rounded-sm -z-10" />
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-accent-blue/20 rounded-sm -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
