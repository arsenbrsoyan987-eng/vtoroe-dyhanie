import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Gift,
  Info,
  Snowflake,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  SKI_GROUP_PLANS,
  SKI_PERSONAL_FINISH,
  SKI_PERSONAL_FLOW,
  SKI_PERSONAL_INCLUDED,
  SKI_PERSONAL_PLANS,
} from '../../data/ski-pricing';
import { CLUB_WELCOME_POINTS } from '../../data/site';
import { countNoun } from '../../lib/plural';

/**
 * Блок «Цены» для страницы «Лыжные гонки».
 *
 * Сверху — групповой набор сезона: он открывает школу, поэтому идёт первым.
 * Ниже — индивидуальные тренировки тремя тарифами. Это два разных продукта,
 * поэтому блоки разделены заголовками, а не смешаны в одну сетку карточек.
 */
export default function SkiPricing() {
  return (
    <>
      {/* ───────────── Объявление о наборе — перед всеми тарифами ───────────── */}
      <section className="border-t border-line bg-navy py-12 text-paper lg:py-14">
        <div className="container-x">
          <p className="eyebrow mb-4 text-brand">
            <span className="h-[2px] w-8 bg-brand" />
            Набор открыт
          </p>
          <p className="max-w-3xl text-base leading-relaxed text-white/80 sm:text-lg">
            В связи с открытием школы ведётся набор на сезон 2026–2027. Стартуем
            15 декабря 2026 года — или по мере того, как ляжет снежный покров,
            не препятствующий свободному передвижению на лыжах.
          </p>
        </div>
      </section>

      {/* ───────────── Групповые тренировки ───────────── */}
      <section id="group" className="scroll-mt-24 bg-paper py-16 lg:py-24">
        <div className="container-x">
          <span className="eyebrow mb-4">Набор 2026–2027</span>
          <h2 className="display max-w-3xl text-4xl text-ink sm:text-5xl">
            Групповые тренировки
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-graphite">
            Обучение лыжным гонкам — с нуля до первых стартов. Две группы:
            новички и PRO.
          </p>

          {/* Цены группового формата */}
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <div className="card-lift p-6">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-graphite">
                Одна тренировка
              </p>
              <p className="display mt-2 text-4xl text-ink">1 900 ₽</p>
              <p className="mt-3 text-sm leading-relaxed text-graphite">
                Первая тренировка обойдётся в 400 ₽: при регистрации на сайте
                на внутренний баланс возвращается {CLUB_WELCOME_POINTS} бонусов.
              </p>
            </div>

            <div className="card-lift p-6">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-graphite">
                Курс на 8 занятий
              </p>
              <p className="display mt-2 text-4xl text-ink">11 900 ₽</p>
              <p className="mt-3 text-sm leading-relaxed text-graphite">
                Восемь занятий в группе — выгоднее, чем платить за каждое
                отдельно.
              </p>
            </div>

            <div className="card-lift p-6">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-graphite">
                Группы
              </p>
              <p className="display mt-2 text-4xl text-ink">2 × 12</p>
              <p className="mt-3 text-sm leading-relaxed text-graphite">
                Всего 2 группы до 12 человек в каждой: новички и PRO. Место
                в группе закрепляется после регистрации и оплаты 6 000 рублей.
              </p>
            </div>
          </div>

          {/* Две группы */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {SKI_GROUP_PLANS.map((plan) => (
              <article key={plan.id} className="card-lift p-6 sm:p-7">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10">
                    <Users className="h-4 w-4 text-brand" />
                  </span>
                  <span className="rounded-full bg-navy px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-white">
                    {plan.tag}
                  </span>
                </div>
                <h3 className="display text-xl text-ink">{plan.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite">{plan.lead}</p>
                <ul className="mt-5 space-y-2.5">
                  {plan.points.map((p) => (
                    <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-ink/80">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-mist p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-3 text-sm leading-relaxed text-graphite">
              <Gift className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              <span>
                С любой тренировки — разовой, групповой или индивидуальной —
                на внутренний баланс атлета возвращается{' '}
                {countNoun(CLUB_WELCOME_POINTS, 'бонус', 'бонуса', 'бонусов')}.
                Один бонус равен одному рублю и используется на тренировках и сборах.
              </span>
            </p>
            <a
              href="#lead"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-dark"
            >
              Записаться в группу
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ───────────── Индивидуальные тренировки ───────────── */}
      <section id="personal" className="scroll-mt-24 bg-mist py-16 lg:py-24">
        <div className="container-x">
          <span className="eyebrow mb-4">Персонально</span>
          <h2 className="display max-w-3xl text-4xl text-ink sm:text-5xl">
            Индивидуальные тренировки
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-graphite">
            Занятия один на один с тренером: разовая тренировка, абонемент
            на серию или полное сопровождение на месяц. Отдельно от групповых.
          </p>

          {/* Как строится занятие */}
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {Object.values(SKI_PERSONAL_FLOW).map((flow) => (
              <article key={flow.title} className="rounded-2xl bg-paper p-6 sm:p-7">
                <h3 className="display text-lg text-ink">{flow.title}</h3>
                <ol className="mt-4 space-y-2.5">
                  {flow.steps.map((step, i) => (
                    <li key={step} className="flex gap-3 text-sm leading-relaxed text-graphite">
                      <span className="display shrink-0 text-sm text-brand/60">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 flex items-start gap-2 border-t border-line pt-4 text-sm font-semibold text-ink">
                  <Snowflake className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  {SKI_PERSONAL_FINISH}
                </p>
              </article>
            ))}
          </div>

          {/* Тарифы */}
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {SKI_PERSONAL_PLANS.map((plan) => (
              <article
                key={plan.id}
                className={`flex flex-col rounded-2xl p-6 sm:p-7 ${
                  plan.highlight
                    ? 'bg-ink text-paper ring-1 ring-ink'
                    : 'card-lift bg-paper'
                }`}
              >
                {plan.badge && (
                  <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-white">
                    <Sparkles className="h-3 w-3" />
                    {plan.badge}
                  </span>
                )}

                <h3
                  className={`display text-lg leading-snug ${
                    plan.highlight ? 'text-white' : 'text-ink'
                  }`}
                >
                  {plan.title}
                </h3>

                <div className="mt-3 flex items-baseline gap-2">
                  <span
                    className={`display text-3xl ${plan.highlight ? 'text-white' : 'text-ink'}`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-[0.68rem] uppercase tracking-[0.1em] ${
                      plan.highlight ? 'text-white/50' : 'text-graphite'
                    }`}
                  >
                    {plan.priceNote}
                  </span>
                </div>

                <p
                  className={`mt-3 text-sm leading-relaxed ${
                    plan.highlight ? 'text-white/70' : 'text-graphite'
                  }`}
                >
                  {plan.summary}
                </p>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={`flex gap-2.5 text-sm leading-relaxed ${
                        plan.highlight ? 'text-white/80' : 'text-ink/80'
                      }`}
                    >
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          plan.highlight ? 'text-brand' : 'text-brand'
                        }`}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#lead"
                  className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${
                    plan.highlight
                      ? 'bg-brand text-white hover:bg-brand-dark'
                      : 'bg-ink text-white hover:bg-brand'
                  }`}
                >
                  Выбрать
                  <ArrowRight className="h-4 w-4" />
                </a>
              </article>
            ))}
          </div>

          {/* Что включено во все тарифы */}
          <div className="mt-6 rounded-2xl bg-paper p-6 sm:p-7">
            <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-graphite">
              <Info className="h-4 w-4 text-brand" />
              Включено в любую индивидуальную тренировку
            </h3>
            <ul className="grid gap-3 sm:grid-cols-2">
              {SKI_PERSONAL_INCLUDED.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-ink/80">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-graphite">
              Если атлет на первой тренировке не поехал или посчитал, что тренировка
              ему не понравилась по любым причинам — стоимость возвращается.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────── Переход к заявке ───────────── */}
      <section className="bg-paper py-14">
        <div className="container-x">
          <div className="flex flex-col items-start justify-between gap-5 rounded-2xl bg-navy p-7 text-paper sm:flex-row sm:items-center sm:p-9">
            <div>
              <h3 className="display text-2xl text-white sm:text-3xl">
                Не определились с форматом?
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65">
                Напишите тренеру — он посмотрит на ваш уровень и предложит
                группу или персональные занятия.
              </p>
            </div>
            <Link
              to="/trainers"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-dark"
            >
              Выбрать тренера
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
