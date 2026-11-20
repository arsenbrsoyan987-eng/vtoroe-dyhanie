import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Check,
  Handshake,
  HeartPulse,
  Star,
  Target,
  Tent,
  Trophy,
  Users,
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import FaqAccordion from '../components/ui/FaqAccordion';
import LeadForm from '../components/ui/LeadForm';
import { useDirections } from '../store/directionsStore';
import { useSetting, useSettingList } from '../store/settingsStore';
import { telHref } from '../data/club';
import {
  CORPORATE_FAQ,
  CORPORATE_FORMATS,
  CORPORATE_STEPS,
  CORPORATE_TEAM_SIZES,
} from '../data/site';

/**
 * Корпоративный спорт для HR и организаторов.
 *
 * Страница устроена как коммерческое предложение: что предлагаем, как
 * внедряем, что спрашивают чаще всего — и большая заявка с чекбоксами
 * форматов и размером команды.
 */
const OFFERS = [
  {
    icon: Handshake,
    title: 'Тимбилдинг',
    desc: 'Спортивные квесты и эстафеты, которые сплачивают команду лучше семинара. От часа до полного дня.',
  },
  {
    icon: Trophy,
    title: 'Корпоративные соревнования',
    desc: 'Турнир «под ключ»: бег, вело, триатлон или ОФП. Судейство, протоколы, призы и фотоотчёт.',
  },
  {
    icon: Target,
    title: 'Спортивный день',
    desc: 'Сбор в парке, зарядка и несколько активностей на выбор. Подходит компании любого размера.',
  },
  {
    icon: Briefcase,
    title: 'Регулярные тренировки',
    desc: 'Тренер приезжает в офис или на площадку компании. Раз в неделю — результат через месяц.',
  },
  {
    icon: Tent,
    title: 'Командные кемпы',
    desc: 'Выезд на выходные: бег, трейл и ОФП на природе. Формат для тимбилдинга и корпоративов.',
  },
  {
    icon: HeartPulse,
    title: 'Wellness-программы',
    desc: 'Утренние зарядки, стретч-сессии, прогулки в перерыве — забота о здоровье без отрыва от работы.',
  },
];

const DIRECTION_ICONS: Record<string, string> = {
  running: '🏃',
  trail: '⛰️',
  cycling: '🚴',
  hiking: '🥾',
  functional: '💪',
  ski: '⛷️',
  triathlon: '🏊',
};

export default function CorporatePage() {
  const directions = useDirections();
  const phone = useSettingList('phones')[0] ?? '';
  const telegram = useSetting('telegram');

  return (
    <>
      <Breadcrumbs items={[{ label: 'Корпоративный спорт' }]} />

      {/* Hero */}
      <section className="bg-ink pb-16 pt-8 text-paper lg:pb-20">
        <div className="container-x">
          <span className="eyebrow mb-4 text-brand">
            <span className="h-[2px] w-8 bg-brand" />
            Для бизнеса
          </span>
          <h1 className="display max-w-3xl text-[2.5rem] sm:text-6xl lg:text-7xl">
            Спорт для вашей команды
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Организуем тренировки, соревнования и спортивные дни для компаний
            любого размера. Направления школы — бег, трейл, вело, походы, ОФП,
            лыжи и триатлон.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#corporate-lead"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
            >
              Обсудить формат
            </a>
            {phone && (
              <a
                href={telHref(phone)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/35 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-white hover:text-ink"
              >
                {phone}
              </a>
            )}
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-white/15 pt-8 sm:grid-cols-4">
            {[
              { v: String(OFFERS.length), l: 'форматов работы' },
              { v: String(directions.length), l: 'видов спорта' },
              { v: '4', l: 'шага до старта' },
              { v: '0', l: 'бюрократии' },
            ].map((s) => (
              <div key={s.l}>
                <dt className="sr-only">{s.l}</dt>
                <dd className="display text-3xl text-white">{s.v}</dd>
                <dd className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-white/50">
                  {s.l}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Форматы */}
      <section className="bg-paper py-16 lg:py-24">
        <div className="container-x">
          <span className="eyebrow mb-4">Форматы</span>
          <h2 className="display max-w-2xl text-4xl text-ink sm:text-5xl">
            Что можно провести
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OFFERS.map((item) => (
              <article key={item.title} className="card-lift p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand/10">
                  <item.icon className="h-5 w-5 text-brand" />
                </div>
                <h3 className="text-base font-bold leading-snug text-ink">{item.title}</h3>
                <p className="mt-2.5 text-[0.85rem] leading-relaxed text-graphite">
                  {item.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Направления */}
      <section className="bg-mist py-16 lg:py-24">
        <div className="container-x">
          <div className="mb-8 max-w-2xl">
            <span className="eyebrow mb-4">Направления</span>
            <h2 className="display text-4xl text-ink sm:text-5xl">
              Любой спорт под вашу задачу
            </h2>
            <p className="mt-4 text-base leading-relaxed text-graphite">
              Адаптируем программу под уровень участников и площадку рядом с офисом.
            </p>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {directions.map((d) => (
              <li key={d.id}>
                <Link
                  to={`/directions/${d.id}`}
                  className="card-lift card-lift-hover flex items-center gap-3 p-4"
                >
                  <span className="text-2xl">{DIRECTION_ICONS[d.id] ?? d.icon ?? '•'}</span>
                  <span className="text-sm font-semibold leading-snug text-ink">{d.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Шаги внедрения */}
      <section className="bg-paper py-16 lg:py-24">
        <div className="container-x">
          <span className="eyebrow mb-4">Процесс</span>
          <h2 className="display max-w-2xl text-4xl text-ink sm:text-5xl">
            Как мы внедряем спорт
          </h2>

          <ol className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {CORPORATE_STEPS.map((step, i) => (
              <li key={step} className="border-t-2 border-brand pt-5">
                <span className="display text-2xl text-brand/25">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-1 text-base font-bold leading-snug text-ink">{step}</h3>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Кемпы для команд */}
      <section className="bg-navy py-16 text-paper lg:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="eyebrow mb-4 text-brand">Выезды</span>
            <h2 className="display text-4xl sm:text-5xl">Кемпы для команд</h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70">
              Два-три дня на природе: тренировки утром, командные активности днём,
              разборы и баня вечером. Проживание, питание и логистику берём на себя.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                'Программа под уровень участников',
                'Тренеры и медицинское сопровождение',
                'Фото- и видеоотчёт для внутренних коммуникаций',
              ].map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-white/80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  {point}
                </li>
              ))}
            </ul>
            <Link
              to="/camps"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white"
            >
              Посмотреть кемпы
              <ArrowRight className="h-4 w-4 text-brand transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/55">
              <Users className="h-4 w-4 text-brand" />
              Размер команды
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {CORPORATE_TEAM_SIZES.map((size) => (
                <div
                  key={size}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  {size} чел.
                </div>
              ))}
            </div>
            <p className="mt-4 text-[0.78rem] leading-relaxed text-white/55">
              Для групп больше 200 человек собираем несколько потоков и площадок —
              формат обсудим отдельно.
            </p>
          </div>
        </div>
      </section>

      {/* Заявка */}
      <section id="corporate-lead" className="scroll-mt-24 bg-mist py-16 lg:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <span className="eyebrow mb-4">Заявка</span>
            <h2 className="display text-4xl text-ink sm:text-5xl">
              Рассчитаем программу под вас
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-graphite">
              Отметьте интересующие форматы и размер команды — подготовим
              предложение с вариантами, сроками и стоимостью.
            </p>

            <div className="mt-8 space-y-3 text-sm text-graphite">
              {phone && (
                <p>
                  Телефон:{' '}
                  <a href={telHref(phone)} className="font-semibold text-ink hover:text-brand">
                    {phone}
                  </a>
                </p>
              )}
              {telegram && (
                <p>
                  Telegram:{' '}
                  <a
                    href={telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-ink hover:text-brand"
                  >
                    написать в школу
                  </a>
                </p>
              )}
              <p className="flex items-start gap-2">
                <Star className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                Цены не публикуем: каждый проект считается отдельно.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-paper p-6 shadow-card sm:p-8">
            <LeadForm
              source="corporate"
              title="Заявка на корпоративную программу"
              subtitle="Ответим в рабочее время и предложим два-три варианта."
              cta="Получить предложение"
              options={CORPORATE_FORMATS}
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-paper py-16 lg:py-24">
        <div className="container-x">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow mb-4">Вопросы</span>
              <h2 className="display max-w-xl text-4xl text-ink sm:text-5xl">
                Частые вопросы
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-graphite">
              Остались детали? Напишите в Telegram — ответим в тот же день.
            </p>
          </div>
          <FaqAccordion items={CORPORATE_FAQ} />
        </div>
      </section>
    </>
  );
}