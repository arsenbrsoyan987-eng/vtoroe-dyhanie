/**
 * Блок «Расписание» и «Методика» для страницы «Лыжные гонки».
 *
 * Расписание недельное (день + время + группа), а не датированное, поэтому
 * данные читаются из ski-schedule.ts, а не из таблицы trainings: главное
 * расписание школы ведётся в админке, зимние группы публикуются волной сезона.
 *
 * Методика — шесть навыков конькового хода. Показываем их степпером:
 * навык выбирают, карточка перерисовывается с анимацией, прогресс-бар
 * заполняется по номеру шага. Так подчёркнута идея «каждый следующий
 * опирается на предыдущий», а не просто список карточек.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  SKI_GROUP_LABEL,
  SKI_SCHEDULE,
  SKI_SKILLS,
  SKI_TRAINER,
  type SkiGroupKind,
  type SkiPlace,
  type SkiSlot,
} from '../../data/ski-schedule';

/** Порядок чипов формата: фиксирован, чтобы не прыгало между локациями */
const FORMAT_ORDER: SkiGroupKind[] = ['school', 'group', 'mini'];

const DAY_ORDER = ['Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

export default function SkiScheduleSection() {
  return (
    <>
      <SkiSchedule />
      <SkiMethod />
    </>
  );
}

/* ─────────────────────────── Расписание ─────────────────────────── */

function SkiSchedule() {
  const [format, setFormat] = useState<SkiGroupKind | null>(null);
  const [day, setDay] = useState<string | null>(null);

  const allSlots = useMemo(
    () => SKI_SCHEDULE.flatMap((place) => place.slots),
    [],
  );

  /** Чипы без данных скрываем: формат или день мог исчезнуть из набора */
  const formatCounts = useMemo(() => {
    const counts = new Map<SkiGroupKind, number>();
    for (const s of allSlots) counts.set(s.kind, (counts.get(s.kind) ?? 0) + 1);
    return counts;
  }, [allSlots]);

  const dayCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of allSlots) counts.set(s.day, (counts.get(s.day) ?? 0) + 1);
    return counts;
  }, [allSlots]);

  const places = useMemo(
    () =>
      SKI_SCHEDULE.map((place) => ({
        ...place,
        slots: place.slots.filter(
          (s) => (!format || s.kind === format) && (!day || s.day === day),
        ),
      })).filter((place) => place.slots.length > 0),
    [format, day],
  );

  const filtered = format !== null || day !== null;

  return (
    <section id="ski-schedule" className="scroll-mt-24 bg-paper py-16 lg:py-24">
      <div className="container-x">
        <span className="eyebrow mb-4">Расписание</span>
        <h2 className="display max-w-3xl text-4xl text-ink sm:text-5xl">
          Расписание тренировок по лыжам
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-graphite">
          Лыжная школа, групповые тренировки и мини-группы в Мещерском парке,
          Одинцово и Лужниках. Все зимние группы ведёт Армен Брсоян — формат и
          время подбираем под ваш уровень на первой встрече.
        </p>

        {/* Фильтр по формату */}
        <div className="mt-8 flex flex-wrap gap-2.5">
          <Chip label="Все форматы" active={format === null} onClick={() => setFormat(null)} />
          {FORMAT_ORDER.filter((f) => (formatCounts.get(f) ?? 0) > 0).map((f) => (
            <Chip
              key={f}
              label={`${SKI_GROUP_LABEL[f]} (${formatCounts.get(f)})`}
              active={format === f}
              onClick={() => setFormat(format === f ? null : f)}
            />
          ))}
        </div>

        {/* Фильтр по дням */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip label="Все дни" small active={day === null} onClick={() => setDay(null)} />
          {DAY_ORDER.filter((d) => (dayCounts.get(d) ?? 0) > 0).map((d) => (
            <Chip
              key={d}
              label={d}
              small
              active={day === d}
              onClick={() => setDay(day === d ? null : d)}
            />
          ))}
        </div>

        {places.length === 0 ? (
          <div className="mt-8 flex flex-col gap-5 rounded-2xl border border-dashed border-line bg-mist p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="display text-lg text-ink">Под такой фильтр групп нет</h3>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-graphite">
                Волна набора обновляется ближе к сезону. Оставьте контакты —
                тренер напишет в первый день записи.
              </p>
            </div>
            <a
              href="#lead"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
            >
              Сообщить о наборе
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <div className="mt-10 space-y-10">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}

            {filtered && (
              <button
                type="button"
                onClick={() => {
                  setFormat(null);
                  setDay(null);
                }}
                className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-brand hover:text-brand-dark"
              >
                Сбросить фильтр
              </button>
            )}
          </div>
        )}

        <p className="mt-8 rounded-2xl bg-mist p-5 text-[0.78rem] leading-relaxed text-graphite">
          На все тренировки — только предварительная запись и оплата: без записи
          на занятие не попасть. Зимние трассы открываем с устойчивым снежным
          покровом, поэтому даты групп сдвигаем по погоде.
        </p>
      </div>
    </section>
  );
}

/** Локация: фото трассы, бытовые детали и строки расписания */
function PlaceCard({ place }: { place: SkiPlace }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-white">
      <div className="relative h-48 sm:h-56">
        <img
          src={place.photo}
          alt={place.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/35 to-ink/5" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <h3 className="display text-2xl text-white sm:text-3xl">{place.title}</h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85">{place.lead}</p>
        </div>
      </div>

      <dl className="grid gap-x-6 gap-y-2 border-b border-line bg-mist/60 px-5 py-4 text-[0.72rem] sm:grid-cols-3">
        <div className="flex flex-col gap-0.5">
          <dt className="font-bold uppercase tracking-[0.1em] text-graphite/60">Адрес</dt>
          <dd className="font-semibold leading-snug text-ink">{place.address}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="font-bold uppercase tracking-[0.1em] text-graphite/60">Раздевалки</dt>
          <dd className="font-semibold leading-snug text-ink">{place.changing}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="font-bold uppercase tracking-[0.1em] text-graphite/60">Прокат</dt>
          <dd className="font-semibold leading-snug text-ink">{place.rental}</dd>
        </div>
      </dl>

      <ul className="divide-y divide-line">
        {place.slots.map((slot) => (
          <SlotRow key={slot.id} slot={slot} />
        ))}
      </ul>
    </article>
  );
}

/**
 * Строка расписания. Колонки фиксированные: день, детали, кнопка — текст
 * каждой колонки ограничен min-w-0, поэтому строка переносится, а не налезает.
 */
function SlotRow({ slot }: { slot: SkiSlot }) {
  return (
    <li className="grid gap-4 px-5 py-5 lg:grid-cols-[9rem_minmax(0,1fr)_auto] lg:items-center lg:gap-6">
      <div className="min-w-0">
        <p className="display text-base leading-tight text-ink">{slot.day}</p>
        <p className="mt-1 text-sm font-semibold tabular-nums leading-tight text-brand">
          {slot.time}
        </p>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand/10 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-brand">
            {SKI_GROUP_LABEL[slot.kind]}
          </span>
          <span className="text-[0.72rem] leading-snug text-graphite">{slot.dates}</span>
          {slot.status === 'soon' && (
            <span className="rounded-full bg-navy px-2.5 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.1em] text-white">
              Скоро старт
            </span>
          )}
        </div>

        <p className="mt-2 text-sm leading-snug text-ink">{slot.note}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="flex flex-wrap items-baseline gap-x-1.5 text-[0.72rem]">
            <span className="text-sm font-bold tabular-nums text-ink">{slot.price}</span>
            <span className="text-graphite/70">{slot.priceNote}</span>
          </span>

          <span className="flex items-center gap-2">
            <img
              src={SKI_TRAINER.photo}
              alt={SKI_TRAINER.name}
              loading="lazy"
              className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-line"
            />
            <span className="text-[0.72rem] font-semibold text-graphite">
              {SKI_TRAINER.name}
            </span>
          </span>

          {slot.free && (
            <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-brand">
              {slot.free}
            </span>
          )}
        </div>
      </div>

      <a
        href="#lead"
        className="group inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full border border-line px-5 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:border-brand hover:bg-brand hover:text-white sm:w-auto lg:w-auto"
      >
        {slot.cta}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </a>
    </li>
  );
}

/** Чип фильтра: маленький — для дней, обычный — для форматов */
function Chip({
  label,
  active,
  onClick,
  small = false,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full font-bold uppercase tracking-[0.1em] transition-colors ${
        small ? 'px-4 py-2 text-[0.62rem]' : 'px-5 py-2.5 text-xs'
      } ${
        active
          ? 'bg-brand text-white'
          : 'border border-line bg-paper text-graphite hover:border-ink hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}

/* ─────────────────────────── Методика ─────────────────────────── */

function SkiMethod() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);

  /** Секция появляется целиком: анимация запускается, когда она в зоне видимости */
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const skill = SKI_SKILLS[active];
  const progress = ((active + 1) / SKI_SKILLS.length) * 100;

  return (
    <section
      ref={sectionRef}
      id="ski-method"
      className="relative overflow-hidden bg-ink py-16 text-paper lg:py-24"
    >
      {/* Диагональная разметка: намёк на след лыжни за контентом */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, transparent 0 46px, rgba(255,255,255,.9) 46px 47px)',
        }}
      />

      <div className="container-x relative z-10">
        <span className="eyebrow mb-4 text-brand">Методика</span>
        <h2 className="display max-w-3xl text-4xl sm:text-5xl">
          Из чего складывается техника беговых лыж
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65">
          Шесть навыков, каждый следующий опирается на предыдущий. Так тренировка
          превращается в понятную лесенку: сегодня баланс — через месяц уверенный
          коньковый ход по рельефу.
        </p>

        {/* Навигация по навыкам */}
        <ol className="mt-10 flex flex-wrap gap-2.5">
          {SKI_SKILLS.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={active === i}
                className={`flex items-center gap-2.5 rounded-full px-4 py-2.5 text-[0.68rem] font-bold uppercase tracking-[0.1em] transition-all duration-300 ${
                  active === i
                    ? 'bg-brand text-white'
                    : 'border border-white/20 text-white/60 hover:border-white/50 hover:text-white'
                }`}
              >
                <span className={active === i ? 'text-white/80' : 'text-brand'}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                {item.tag}
              </button>
            </li>
          ))}
        </ol>

        {/* Активный навык: key перезапускает анимацию появления */}
        <div
          key={skill.id}
          className={`mt-8 grid gap-8 rounded-3xl bg-white/5 p-7 ring-1 ring-white/10 lg:grid-cols-[1.1fr_1fr] lg:p-10 ${
            seen ? 'animate-reveal' : 'opacity-0'
          }`}
        >
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-brand">
              Шаг {String(active + 1).padStart(2, '0')} · {skill.tag}
            </p>
            <h3 className="display mt-3 text-3xl text-paper sm:text-4xl lg:text-5xl">
              {skill.title}
            </h3>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">
              {skill.body}
            </p>
          </div>

          {/* Схема-лесенка: шесть шагов, активный подсвечен */}
          <div className="flex flex-col justify-center gap-2.5">
            {SKI_SKILLS.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(i)}
                className={`group flex items-center gap-4 text-left transition-all duration-500 ${
                  seen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                }`}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.62rem] font-bold transition-colors ${
                    i === active
                      ? 'bg-brand text-white'
                      : i < active
                        ? 'bg-white/15 text-white'
                        : 'border border-white/15 text-white/40'
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`flex-1 border-b pb-2 text-sm transition-colors ${
                    i === active ? 'font-bold text-white' : 'text-white/45 group-hover:text-white/75'
                  }`}
                >
                  {item.title}
                </span>
              </button>
            ))}

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-brand transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-white/55">
            На тренировке тренер снимает вас на видео и разбирает технику по этим
            шести пунктам — видно, какой навык уже стоит, а какой тянуть дальше.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setActive((i) => (i - 1 + SKI_SKILLS.length) % SKI_SKILLS.length)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-brand hover:bg-brand"
              aria-label="Предыдущий навык"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => setActive((i) => (i + 1) % SKI_SKILLS.length)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-brand hover:bg-brand"
              aria-label="Следующий навык"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
