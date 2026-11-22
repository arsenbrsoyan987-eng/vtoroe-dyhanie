import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  CalendarX,
  ChevronDown,
  CircleAlert,
  Clock,
  MapPin,
  Snowflake,
  Target,
} from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import FaqAccordion from '../components/ui/FaqAccordion';
import LeadForm from '../components/ui/LeadForm';
import SkiPricing from '../components/sections/SkiPricing';
import { useDirections } from '../store/directionsStore';
import { useTrainings } from '../store/trainingsStore';
import { useTrainers } from '../store/trainersStore';
import { useTestimonials } from '../store/testimonialsStore';
import { useNews } from '../store/newsStore';
import { useRoutes } from '../store/routesStore';
import { useSetting } from '../store/settingsStore';
import {
  DIRECTION_FAQ,
  DIRECTION_SEO_TEXT,
  DIRECTION_SLOGAN,
  EQUIPMENT_NOTE,
  EQUIPMENT_NOTE_DEFAULT,
  FORMAT_LABEL,
  LESSON_STEPS,
  LEVEL_BLOCKS,
  WHY_US,
  WHY_US_BY_DIRECTION,
  directionHeroTitle,
  formatOf,
  type FormatKey,
} from '../data/site';
import { CLUB_WELCOME_POINTS } from '../data/site';
import { isFilled, realValue } from '../lib/placeholder';
import { plural } from '../lib/plural';
import { formatDate, isPastDate } from '../lib/date';

/** Формат, который показываем в чипах: порядок фиксирован для всех страниц */
const FORMAT_ORDER: FormatKey[] = ['school', 'club', 'individual', 'camp'];

/** Иконки шагов занятия: тексты живут в site.ts, порядок один для всех направлений */
const LESSON_ICONS = [Target, Activity, Snowflake, BadgeCheck];

export default function DirectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const city = useSetting('city');
  const addressNote = useSetting('addressNote');
  const directions = useDirections();
  const trainings = useTrainings();
  const trainers = useTrainers();
  const testimonials = useTestimonials();
  const news = useNews();
  const routes = useRoutes();

  const direction = directions.find((d) => d.id === id);

  /** Активный чип формата; null — показываем все занятия направления */
  const [format, setFormat] = useState<FormatKey | null>(null);
  const [seoOpen, setSeoOpen] = useState(false);

  const items = useMemo(() => {
    if (!direction) return [];
    return trainings
      .filter((t) => t.directionId === direction.id && !isPastDate(t.date))
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .map((t) => ({ training: t, format: formatOf(t.level, t.name) }));
  }, [trainings, direction]);

  /** Сколько занятий каждого формата реально есть — чипы без данных скрываем */
  const formatCounts = useMemo(() => {
    const counts = new Map<FormatKey, number>();
    for (const item of items) {
      counts.set(item.format, (counts.get(item.format) ?? 0) + 1);
    }
    return counts;
  }, [items]);

  const visible = format ? items.filter((i) => i.format === format) : items;

  if (!direction) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="display mb-4 text-3xl text-ink">Направление не найдено</h1>
        <p className="mb-8 text-sm text-graphite">
          Возможно, запись удалена из админки или адрес указан с опечаткой.
        </p>
        <Link
          to="/directions"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
        >
          Все направления
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const dirTrainers = trainers.filter(
    (t) =>
      t.directions.includes(direction.id) &&
      (realValue(t.name) || realValue(t.specialization)),
  );

  const dirTestimonials = testimonials
    .filter((t) => isFilled(t, ['name', 'text']) && t.direction === direction.name)
    .slice(0, 3);

  const dirNews = news
    .filter((n) => isFilled(n, ['title', 'content']) && !isPlaceholderCategory(n.category))
    .slice(0, 3);

  const dirRoutes = routes.filter((r) => r.type === direction.id).slice(0, 4);

  const slogan = DIRECTION_SLOGAN[direction.id] ?? direction.description;
  const seo = DIRECTION_SEO_TEXT[direction.id];
  const faq = DIRECTION_FAQ.common;

  /* ───────────── Hero ───────────── */
  // Нули на витрине читаются как «школа не работает», поэтому вместо пустых
  // счётиков показываем то, что верно всегда.
  const heroStats = [
    {
      value: items.length > 0 ? String(items.length) : '2 волны',
      label: items.length > 0 ? plural(items.length, 'программа', 'программы', 'программ') + ' в наборе' : 'набора в сезон',
    },
    {
      value: String(dirTrainers.length),
      label:
        dirTrainers.length > 0
          ? plural(dirTrainers.length, 'тренер', 'тренера', 'тренеров') + ' направления'
          : 'тренера в команде',
    },
    { value: `+${CLUB_WELCOME_POINTS}`, label: 'баллов после регистрации' },
    { value: '0 ₽', label: 'первое занятие' },
  ];

  return (
    <>
      <Breadcrumbs items={[{ label: 'Направления', to: '/directions' }, { label: direction.name }]} />

      {/* Hero: заголовок «НАПРАВЛЕНИЕ В ГОРОДЕ» + слоган + два CTA */}
      <section className="relative overflow-hidden bg-ink">
        <div className="absolute inset-0">
          <img
            src={direction.imageUrl}
            alt={direction.name}
            className="h-full w-full object-cover opacity-40"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/50 to-ink" />
        </div>

        <div className="container-x relative z-10 pb-14 pt-10 lg:pb-20 lg:pt-16">
          <span className="eyebrow mb-5 inline-flex text-brand">
            <span className="h-[2px] w-8 bg-brand" />
            {direction.level}
          </span>

          <h1 className="display max-w-4xl text-[2.5rem] text-paper sm:text-6xl lg:text-7xl">
            {directionHeroTitle(direction.name, city)}
          </h1>

          <p className="mt-5 max-w-2xl text-lg text-white/75 sm:text-xl">{slogan}</p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55">
            {direction.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#formats"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-brand-dark active:scale-95"
            >
              Выбрать формат
            </a>
            <a
              href="#lead"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/35 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-ink"
            >
              Записаться на пробное
            </a>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-white/15 pt-8 sm:grid-cols-4">
            {heroStats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="display text-2xl text-white sm:text-3xl">{s.value}</dd>
                <dd className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-white/50">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ───────────── Форматы ───────────── */}
      <section id="formats" className="scroll-mt-24 bg-paper py-16 lg:py-24">
        <div className="container-x">
          <span className="eyebrow mb-4">Форматы</span>
          <h2 className="display max-w-2xl text-4xl text-ink sm:text-5xl">Выберите формат</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-graphite">
            Одно направление — несколько способов заниматься: школа с нуля, постоянная
            группа, персональные занятия и выездные сборы.
          </p>

          <div className="mt-8 flex flex-wrap gap-2.5">
            <FilterChip
              label="Все форматы"
              active={format === null}
              onClick={() => setFormat(null)}
            />
            {FORMAT_ORDER.filter((f) => (formatCounts.get(f) ?? 0) > 0).map((f) => (
              <FilterChip
                key={f}
                label={`${FORMAT_LABEL[f]} (${formatCounts.get(f)})`}
                active={format === f}
                onClick={() => setFormat(format === f ? null : f)}
              />
            ))}
          </div>

          {visible.length === 0 ? (
            /* Сейчас без набора — не пустота, а подписка на анонс */
            <div className="mt-8 flex flex-col gap-6 rounded-2xl border border-dashed border-line bg-mist p-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy">
                  <CalendarX className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="display text-xl text-ink">Сейчас без активного набора</h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-graphite">
                    Группа по этому формату стартует волной — вместе с новой школой.
                    Оставьте контакты, и тренер напишет вам в первый день набора.
                  </p>
                </div>
              </div>
              <a
                href="#notify"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
              >
                Сообщить о наборе
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {visible.slice(0, 8).map(({ training: t, format: f }) => (
                <li key={t.id} className="card-lift card-lift-hover p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand/10 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-brand">
                      {FORMAT_LABEL[f]}
                    </span>
                    <span className="text-[0.7rem] text-graphite">{t.level}</span>
                  </div>
                  <h3 className="text-base font-bold leading-snug text-ink">
                    <Link to={`/schedule/${t.id}`} className="hover:text-brand">
                      {t.name}
                    </Link>
                  </h3>
                  <div className="mt-3 space-y-1.5 text-[0.8rem] text-graphite">
                    <p className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-brand" />
                      {formatDate(t.date, false)} · {t.time} · {t.duration}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" />
                      {realValue(t.location) || 'Точка сбора — в анонсе'}
                    </p>
                  </div>
                  <Link
                    to={`/schedule/${t.id}`}
                    className="group mt-4 inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-ink hover:text-brand"
                  >
                    Подробнее
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ───────────── Цены: группы и индивидуально (только лыжные гонки) ───────────── */}
      {direction.id === 'ski' && <SkiPricing />}

      {/* ───────────── Под ваш уровень ───────────── */}
      <section className="bg-mist py-16 lg:py-24">
        <div className="container-x">
          <span className="eyebrow mb-4">Уровни</span>
          <h2 className="display max-w-2xl text-4xl text-ink sm:text-5xl">Под ваш уровень</h2>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {LEVEL_BLOCKS.map((block) => (
              <article key={block.index} className="card-lift p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="display text-3xl text-brand">{block.index}</span>
                  <span className="rounded-full bg-navy px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-white">
                    {block.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold leading-snug text-ink">{block.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-graphite">{block.lead}</p>
                <p className="mt-3 text-sm leading-relaxed text-graphite/80">{block.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── Почему с нами ───────────── */}
      <section className="bg-paper py-16 lg:py-24">
        <div className="container-x">
          <span className="eyebrow mb-4">Почему с нами</span>
          <h2 className="display max-w-2xl text-4xl text-ink sm:text-5xl">
            Четыре причины остаться надолго
          </h2>

          <ol className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {(WHY_US_BY_DIRECTION[direction.id] ?? WHY_US).map((reason) => (
              <li key={reason.index} className="border-t-2 border-brand pt-5">
                <span className="display text-2xl text-brand/25">{reason.index}</span>
                <h3 className="display mt-1 text-lg text-ink">{reason.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-graphite">{reason.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────── Где тренируемся ───────────── */}
      <section className="bg-navy py-16 text-paper lg:py-24">
        <div className="container-x">
          <span className="eyebrow mb-4 text-brand">Локации</span>
          <h2 className="display max-w-2xl text-4xl sm:text-5xl">Где тренируемся</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">
              {addressNote}
            </p>

          {dirRoutes.length > 0 ? (
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {dirRoutes.map((r) => (
                <li key={r.id} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                  <h3 className="text-sm font-bold leading-snug text-white">{r.name}</h3>
                  <dl className="mt-3 space-y-1.5 text-[0.72rem] text-white/60">
                    <div className="flex justify-between gap-3">
                      <dt>Дистанция</dt>
                      <dd className="font-semibold text-white">{r.distance}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Набор</dt>
                      <dd className="font-semibold text-white">{r.elevation}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Время</dt>
                      <dd className="font-semibold text-white">{r.duration}</dd>
                    </div>
                  </dl>
                  <Link
                    to="/routes"
                    className="mt-4 inline-flex items-center gap-1.5 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-brand"
                  >
                    Маршрут целиком
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8 rounded-2xl border border-white/15 bg-white/5 p-6 text-sm text-white/65">
              Маршруты и площадки направления появятся в админке — тогда блок
              соберётся автоматически.
            </p>
          )}
        </div>
      </section>

      {/* ───────────── Тренеры ───────────── */}
      {dirTrainers.length > 0 && (
        <section className="bg-paper py-16 lg:py-24">
          <div className="container-x">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="eyebrow mb-4">Команда</span>
                <h2 className="display max-w-xl text-4xl text-ink sm:text-5xl">
                  Тренеры направления
                </h2>
              </div>
              <Link
                to="/trainers"
                className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink"
              >
                Вся команда
                <ArrowRight className="h-4 w-4 text-brand transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="rail">
              {dirTrainers.map((trainer) => {
                const name = realValue(trainer.name) || trainer.specialization;
                return (
                  <Link
                    key={trainer.id}
                    to={`/trainers/${trainer.id}`}
                    className="card-lift card-lift-hover group w-64 overflow-hidden"
                  >
                    <div className="aspect-[4/5] overflow-hidden bg-mist">
                      {trainer.photo ? (
                        <img
                          src={trainer.photo}
                          alt={name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-navy/5 text-4xl font-bold text-brand/70">
                          {name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-bold leading-snug text-ink">{name}</h3>
                      <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-brand">
                        {trainer.specialization}
                      </p>
                      {realValue(trainer.experience) && (
                        <p className="mt-2.5 text-xs leading-relaxed text-graphite">
                          {trainer.experience}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ───────────── Как проходят тренировки ───────────── */}
      <section className="bg-mist py-16 lg:py-24">
        <div className="container-x">
          <span className="eyebrow mb-4">Как это устроено</span>
          <h2 className="display max-w-2xl text-4xl text-ink sm:text-5xl">
            Как проходит занятие
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(LESSON_STEPS[direction.id] ?? LESSON_STEPS.common).map((step, i) => {
              const Icon = LESSON_ICONS[i] ?? BadgeCheck;
              return (
                <div key={step.title} className="card-lift p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand/10">
                    <Icon className="h-5 w-5 text-brand" />
                  </div>
                  <h3 className="text-sm font-bold leading-snug text-ink">{step.title}</h3>
                  {step.points ? (
                    <ul className="mt-2.5 space-y-1.5">
                      {step.points.map((p) => (
                        <li key={p} className="text-[0.82rem] leading-relaxed text-graphite">
                          {p}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2.5 text-[0.82rem] leading-relaxed text-graphite">{step.body}</p>
                  )}
                </div>
              );
            })}
          </div>

          {direction.requiredEquipment.length > 0 && (
            <div className="mt-8 rounded-2xl border border-line bg-paper p-6">
              <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-graphite">
                <CircleAlert className="h-4 w-4 text-brand" />
                Что понадобится
              </h3>
              <ul className="flex flex-wrap gap-2.5">
                {direction.requiredEquipment.map((eq) => (
                  <li
                    key={eq}
                    className="rounded-full bg-mist px-4 py-2 text-sm text-ink"
                  >
                    {eq}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[0.78rem] leading-relaxed text-graphite">
                {EQUIPMENT_NOTE[direction.id] ?? EQUIPMENT_NOTE_DEFAULT}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ───────────── Истории учеников ───────────── */}
      {dirTestimonials.length > 0 && (
        <section className="bg-paper py-16 lg:py-24">
          <div className="container-x">
            <span className="eyebrow mb-4">Истории</span>
            <h2 className="display max-w-2xl text-4xl text-ink sm:text-5xl">
              Что говорят про {direction.nameShort.toLowerCase()} в школе
            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {dirTestimonials.map((item) => (
                <figure key={item.id} className="card-lift flex flex-col p-6">
                  <blockquote className="flex-1 text-[0.9rem] leading-relaxed text-graphite">
                    «{item.text}»
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                    {item.photo && (
                      <img
                        src={item.photo}
                        alt={item.name}
                        className="h-10 w-10 rounded-full object-cover"
                        loading="lazy"
                      />
                    )}
                    <div>
                      <div className="text-sm font-bold text-ink">{item.name}</div>
                      <div className="text-[0.68rem] uppercase tracking-[0.12em] text-brand">
                        {item.achievement || item.direction}
                      </div>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────────── Заявка + подписка на набор ───────────── */}
      <section id="lead" className="scroll-mt-24 bg-navy py-16 text-paper lg:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <div>
            <span className="eyebrow mb-4 text-brand">Первый шаг</span>
            <h2 className="display text-4xl sm:text-5xl">Не знаете, с чего начать?</h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70">
              Расскажите о своём уровне и цели — тренер подберёт группу и формат.
              Первое занятие бесплатное и без абонемента.
            </p>

            {/* Отдельная заявка «сообщить о наборе» — для тех, кому сейчас нечего выбрать */}
            <div id="notify" className="mt-10 scroll-mt-24">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/55">
                <CalendarX className="h-4 w-4 text-brand" />
                Сейчас нет подходящей группы?
              </h3>
              <p className="text-sm leading-relaxed text-white/60">
                Поставьте себя в лист ожидания набора — напишем в тот день, когда
                откроется запись на {direction.name.toLowerCase()}.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 sm:p-8">
            <LeadForm
              source={`direction-${direction.id}`}
              title="Записаться на бесплатное занятие"
              subtitle="Имя и телефон — этого достаточно. Тренер свяжется и подберёт время."
              cta="Отправить заявку"
            />
          </div>
        </div>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section className="bg-paper py-16 lg:py-24">
        <div className="container-x">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow mb-4">Вопросы</span>
              <h2 className="display max-w-xl text-4xl text-ink sm:text-5xl">
                Частые вопросы про {direction.nameShort.toLowerCase()}
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-graphite">
              Не нашли ответ? Напишите в Telegram — отвечаем ежедневно, включая дни
              тренировок.
            </p>
          </div>

          <FaqAccordion items={faq} />
        </div>
      </section>

      {/* ───────────── Статьи ───────────── */}
      {dirNews.length > 0 && (
        <section className="bg-mist py-16 lg:py-24">
          <div className="container-x">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="eyebrow mb-4">Журнал</span>
                <h2 className="display max-w-xl text-4xl text-ink sm:text-5xl">
                  Почитать по теме
                </h2>
              </div>
              <Link
                to="/news"
                className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink"
              >
                Все статьи
                <ArrowRight className="h-4 w-4 text-brand transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {dirNews.map((item) => (
                <Link
                  key={item.id}
                  to={`/news/${item.id}`}
                  className="card-lift card-lift-hover group flex flex-col overflow-hidden"
                >
                  {item.image && (
                    <div className="aspect-[16/10] overflow-hidden bg-navy/5">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <span className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-brand">
                      {item.category}
                    </span>
                    <h3 className="mt-2 text-sm font-bold leading-snug text-ink group-hover:text-brand">
                      {item.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 flex-1 text-[0.82rem] leading-relaxed text-graphite">
                      {item.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────────── SEO-текст ───────────── */}
      {seo && (
        <section className="border-t border-line bg-paper py-16 lg:py-20">
          <div className="container-x">
            <button
              type="button"
              onClick={() => setSeoOpen((v) => !v)}
              aria-expanded={seoOpen}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <h2 className="display text-2xl text-ink sm:text-3xl">
                {direction.name} в школе «Второе дыхание»
              </h2>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-brand transition-transform duration-300 ${
                  seoOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {seoOpen && (
              <div className="animate-reveal mt-6 max-w-4xl space-y-5 text-sm leading-relaxed text-graphite">
                <p>{seo.lead}</p>
                <div>
                  <h3 className="mb-1.5 text-xs font-bold uppercase tracking-[0.12em] text-ink">
                    Кому подходит
                  </h3>
                  <p>{seo.audience}</p>
                </div>
                <div>
                  <h3 className="mb-1.5 text-xs font-bold uppercase tracking-[0.12em] text-ink">
                    Как построена подготовка
                  </h3>
                  <p>{seo.method}</p>
                </div>
                <div>
                  <h3 className="mb-1.5 text-xs font-bold uppercase tracking-[0.12em] text-ink">
                    Что вы получите
                  </h3>
                  <ul className="space-y-1.5">
                    {seo.outcomes.map((o) => (
                      <li key={o} className="flex gap-2.5">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p>{seo.closing}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}

/** Чип фильтра формата */
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${
        active
          ? 'bg-brand text-white'
          : 'border border-line bg-paper text-graphite hover:border-ink hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}

/** Категории-заглушки в новостях: «[Категория]» не показываем в блоке статей */
function isPlaceholderCategory(category: string): boolean {
  return /\[[^\]]*\]/.test(category);
}