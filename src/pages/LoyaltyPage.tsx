import { Link } from 'react-router-dom';
import { ArrowRight, Coins, Gift, Percent, Sparkles } from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import FaqAccordion from '../components/ui/FaqAccordion';
import LeadForm from '../components/ui/LeadForm';
import {
  CLUB_EARN,
  CLUB_TIERS,
  CLUB_WELCOME_POINTS,
  LOYALTY_FAQ,
  LOYALTY_SPEND_STEPS,
  LOYALTY_STEPS,
} from '../data/site';

/**
 * Программа лояльности.
 *
 * Страница объясняет механику до конца: как вступить, за что дают баллы,
 * как их тратить, сколько они живут. Нижний блок — пример расчёта, потому
 * что «15 баллов за тренировку» без контекста ничего не говорит.
 */
export default function LoyaltyPage() {
  const example =
    CLUB_EARN[0].points * 8 + CLUB_EARN[2].points * 1 + CLUB_EARN[3].points * 1;

  return (
    <>
      <Breadcrumbs items={[{ label: 'Программа лояльности' }]} />

      <section className="bg-ink pb-16 pt-8 text-paper lg:pb-20">
        <div className="container-x">
          <span className="eyebrow mb-4 text-brand">
            <span className="h-[2px] w-8 bg-brand" />
            Клуб
          </span>
          <h1 className="display max-w-3xl text-[2.5rem] sm:text-6xl lg:text-7xl">
            Программа лояльности
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Баллы за тренировки, кэшбэк за статус и оплата ими до 100% стоимости
            программ. 1 балл = 1 ₽. Участие бесплатное.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-4 rounded-2xl bg-brand px-6 py-5">
              <Coins className="h-8 w-8 text-white" />
              <div>
                <div className="display text-3xl text-white">
                  +{CLUB_WELCOME_POINTS.toLocaleString('ru-RU')}
                </div>
                <div className="text-[0.68rem] uppercase tracking-[0.12em] text-white/80">
                  приветственных баллов
                </div>
              </div>
            </div>
            <Link
              to="/cabinet"
              className="group inline-flex items-center gap-2 rounded-full border border-white/35 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-white hover:text-ink"
            >
              Открыть кабинет
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Как вступить */}
      <section className="bg-paper py-16 lg:py-24">
        <div className="container-x">
          <span className="eyebrow mb-4">Старт</span>
          <h2 className="display max-w-2xl text-4xl text-ink sm:text-5xl">Как вступить</h2>

          <ol className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-3">
            {LOYALTY_STEPS.map((step, i) => (
              <li key={step} className="border-t-2 border-brand pt-5">
                <span className="display text-2xl text-brand/25">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="mt-2 text-sm leading-relaxed text-graphite">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Начисления */}
      <section className="bg-mist py-16 lg:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div>
            <span className="eyebrow mb-4">Начисления</span>
            <h2 className="display text-4xl text-ink sm:text-5xl">За что дают баллы</h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-graphite">
              Баллы приходят после занятия, на котором тренер отметил посещение.
              Смотреть баланс и историю начислений можно в личном кабинете.
            </p>

            <ul className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-paper">
              {CLUB_EARN.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <span className="text-sm text-ink">{item.label}</span>
                  <span className="display text-xl text-brand">+{item.points}</span>
                </li>
              ))}
            </ul>

            <p className="mt-4 flex items-start gap-2 text-sm text-graphite">
              <Percent className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              Плюс кэшбэк с покупок — от 2% до 5% в зависимости от статуса.
            </p>
          </div>

          {/* Статусы */}
          <div>
            <span className="eyebrow mb-4">Статусы</span>
            <h2 className="display text-4xl text-ink sm:text-5xl">Уровни клуба</h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-graphite">
              Статус растёт вместе с числом тренировок и открывает повышенный кэшбэк.
            </p>

            <ul className="mt-8 space-y-3">
              {CLUB_TIERS.map((tier) => (
                <li
                  key={tier.name}
                  className="card-lift flex items-center justify-between gap-4 p-5"
                >
                  <div>
                    <h3 className="text-base font-bold text-ink">{tier.name}</h3>
                    <p className="mt-1 text-[0.7rem] uppercase tracking-[0.12em] text-graphite">
                      {tier.requirement}
                    </p>
                  </div>
                  <div className="display text-2xl text-brand">{tier.cashback}%</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Как тратить */}
      <section className="bg-paper py-16 lg:py-24">
        <div className="container-x">
          <span className="eyebrow mb-4">Оплата</span>
          <h2 className="display max-w-2xl text-4xl text-ink sm:text-5xl">
            Как списывать баллы
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LOYALTY_SPEND_STEPS.map((step, i) => (
              <div key={step} className="card-lift p-5">
                <span className="display text-2xl text-brand/25">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="mt-2 text-sm leading-relaxed text-graphite">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-navy p-6 text-paper sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <Gift className="mt-0.5 h-6 w-6 shrink-0 text-brand" />
              <div>
                <h3 className="display text-lg">Подарочный сертификат</h3>
                <p className="mt-1 text-sm text-white/65">
                  Баллами оплачиваются программы, кемпы и мерч — но не сертификаты.
                </p>
              </div>
            </div>
            <Link
              to="/certificate"
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-brand-dark"
            >
              О сертификате
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Пример расчёта */}
      <section className="bg-mist py-16 lg:py-24">
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="eyebrow mb-4">Пример</span>
              <h2 className="display text-4xl text-ink sm:text-5xl">
                Сколько накопится за сезон
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-graphite">
                Восемь групповых тренировок в месяц, одно мероприятие и один кемп —
                это {example.toLocaleString('ru-RU')} баллов, то есть столько же рублей
                на следующую программу.
              </p>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-graphite">
                Баллы живут 12 месяцев с момента начисления, приветственные — 60 дней.
                При оплате первыми списываются те, что сгорят раньше.
              </p>
            </div>

            <div className="rounded-2xl bg-paper p-6 shadow-card">
              <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-graphite">
                <Sparkles className="h-4 w-4 text-brand" />
                Расчёт за месяц
              </div>
              <ul className="space-y-2.5 text-sm">
                <li className="flex justify-between gap-4">
                  <span className="text-graphite">8 тренировок × {CLUB_EARN[0].points}</span>
                  <span className="font-semibold text-ink">{CLUB_EARN[0].points * 8}</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span className="text-graphite">1 мероприятие</span>
                  <span className="font-semibold text-ink">{CLUB_EARN[2].points}</span>
                </li>
                <li className="flex justify-between gap-4">
                  <span className="text-graphite">1 кемп</span>
                  <span className="font-semibold text-ink">{CLUB_EARN[3].points}</span>
                </li>
                <li className="flex justify-between gap-4 border-t border-line pt-3 text-base">
                  <span className="font-bold text-ink">Итого</span>
                  <span className="display text-xl text-brand">{example}</span>
                </li>
              </ul>
            </div>
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
              Не нашли ответ? Напишите в Telegram — разберёмся вместе.
            </p>
          </div>
          <FaqAccordion items={LOYALTY_FAQ} />
        </div>
      </section>

      {/* Заявка */}
      <section className="bg-mist py-16 lg:py-24">
        <div className="container-x max-w-2xl">
          <div className="rounded-2xl bg-paper p-6 shadow-card sm:p-8">
            <LeadForm
              source="loyalty"
              title="Хотите начать копить баллы?"
              subtitle="Оставьте контакты — поможем выбрать первую программу, баллы начислятся сразу после регистрации."
              cta="Записаться на занятие"
            />
          </div>
        </div>
      </section>
    </>
  );
}
