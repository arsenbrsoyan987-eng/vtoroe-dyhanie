import { Link } from 'react-router-dom';
import { ArrowRight, Coins } from 'lucide-react';
import { CLUB_EARN, CLUB_TIERS, CLUB_WELCOME_POINTS } from '../../data/site';

/**
 * Клуб лояльности: приветственные баллы, начисления и статусы.
 *
 * Блок сделан тёмным — он должен читаться как «внутренняя кухня» клуба
 * и контрастировать со светлой витриной вокруг.
 */
export default function ClubLoyalty() {
  const maxCashback = Math.max(...CLUB_TIERS.map((t) => t.cashback));

  return (
    <section className="bg-navy py-20 text-paper lg:py-28">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          {/* Заголовок + приветственные баллы */}
          <div>
            <span className="eyebrow mb-4 text-brand">Клуб «Второго дыхания»</span>
            <h2 className="display text-4xl sm:text-5xl">
              Тренировки, за которые возвращают деньги
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              Баллы приходят за каждое занятие и событие, а списать их можно до 100%
              стоимости абонемента, кемпа или мерча. 1 балл = 1 ₽.
            </p>

            <div className="mt-8 flex items-center gap-5 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand">
                <Coins className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="display text-3xl">
                  +{CLUB_WELCOME_POINTS.toLocaleString('ru-RU')}
                </div>
                <div className="text-xs uppercase tracking-[0.14em] text-white/55">
                  баллов сразу после регистрации
                </div>
              </div>
            </div>

            <Link
              to="/loyalty"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white"
            >
              Как это работает
              <ArrowRight className="h-4 w-4 text-brand transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Начисления + статусы */}
          <div className="grid gap-4">
            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-white/55">
                За что начисляются баллы
              </h3>
              <ul className="space-y-2.5">
                {CLUB_EARN.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center justify-between gap-4 text-sm"
                  >
                    <span className="text-white/85">{item.label}</span>
                    <span className="display text-lg text-brand">+{item.points}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-white/55">
                  Статусы клуба
                </h3>
                <span className="text-xs text-white/45">кэшбэк до {maxCashback}%</span>
              </div>
              <ul className="grid grid-cols-2 gap-2.5">
                {CLUB_TIERS.map((tier) => (
                  <li
                    key={tier.name}
                    className="rounded-xl border border-white/10 bg-white/5 p-3.5"
                  >
                    <div className="text-sm font-semibold text-white">{tier.name}</div>
                    <div className="mt-1 display text-xl text-brand">{tier.cashback}%</div>
                    <div className="mt-1 text-[0.7rem] text-white/45">{tier.requirement}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
