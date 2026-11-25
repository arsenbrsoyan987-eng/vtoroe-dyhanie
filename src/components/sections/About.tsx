import { Check } from 'lucide-react';
import { useDirections } from '../../store/directionsStore';
import { useTrainers } from '../../store/trainersStore';
import { useSetting } from '../../store/settingsStore';

/**
 * Миссия школы — крупный типографический блок с фото и честными цифрами.
 *
 * В статистике только то, что видно в админке: направления и тренеры.
 * Придуманные «500+ учеников» на незаполненном сайте читаются как обман.
 */
export default function About() {
  const directions = useDirections();
  const trainers = useTrainers();
  const city = useSetting('city');
  const aboutTitle = useSetting('aboutTitle');
  const aboutSubtitle = useSetting('aboutSubtitle');
  const aboutText1 = useSetting('aboutText1');
  const aboutText2 = useSetting('aboutText2');
  const aboutText3 = useSetting('aboutText3');
  const aboutImage = useSetting('aboutImage');

  /**
   * Приоритеты школы: первая строка настройки — подпись, остальные — пункты.
   * Если администратор вписал всё в одну строку, показываем её как абзац,
   * чтобы блок не остался пустым.
   */
  const priorities = aboutText3
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const prioritiesTitle = priorities[0] ?? '';
  const priorityItems = priorities.slice(1);

  /** Пустая строка в настройке = новый абзац: один <p> на весь текст читается стеной */
  const aboutParagraphs = aboutText1
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const stats = [
    { value: String(directions.length), label: 'Направления' },
    { value: String(trainers.length), label: 'Тренера в команде' },
    { value: city, label: 'Город и площадки' },
    { value: 'чашка кофе', label: 'Первое занятие' },
  ];

  return (
    <section className="border-b border-line bg-paper py-20 lg:py-28">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          {/* Текст */}
          <div>
            <span className="eyebrow mb-4">{aboutSubtitle}</span>
            <h2 className="display text-4xl text-ink sm:text-5xl">{aboutTitle}</h2>
            {aboutParagraphs.map((block, i) => (
              <p
                key={block.slice(0, 24)}
                className={`text-base leading-relaxed text-graphite ${
                  i === 0 ? 'mt-6 sm:text-lg' : 'mt-4'
                }`}
              >
                {block}
              </p>
            ))}
            <p className="mt-4 text-base leading-relaxed text-graphite">{aboutText2}</p>

            {priorities.length > 0 &&
              (priorityItems.length > 0 ? (
                <div className="mt-6">
                  <div className="display text-lg text-ink">{prioritiesTitle}</div>
                  <ul className="mt-3 space-y-2.5">
                    {priorityItems.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10">
                          <Check className="h-3 w-3 text-brand" />
                        </div>
                        <span className="text-sm text-ink sm:text-base">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-6 text-base leading-relaxed text-graphite">{prioritiesTitle}</p>
              ))}

            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="display text-2xl text-ink sm:text-3xl">{stat.value}</dd>
                  <dd className="mt-1.5 text-[0.68rem] uppercase tracking-[0.12em] text-graphite">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Фото */}
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-mist">
              <img
                src={aboutImage}
                alt="Атмосфера школы"
                className="h-full w-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.dataset.fallback) return;
                  img.dataset.fallback = '1';
                  img.src = '/images/about.svg';
                }}
              />
            </div>
            {/* Плашка с обещанием — держит взгляд на фото */}
            <div className="absolute -bottom-5 left-5 rounded-2xl bg-brand px-5 py-4 text-white shadow-lift">
              <div className="display text-xl">Первое занятие</div>
              <div className="text-[0.7rem] uppercase tracking-[0.14em] text-white/80">
                по цене чашки кофе
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
