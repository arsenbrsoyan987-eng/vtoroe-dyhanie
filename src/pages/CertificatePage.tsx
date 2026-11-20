import { Link } from 'react-router-dom';
import { ArrowRight, Check, Gift, Sparkles } from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import LeadForm from '../components/ui/LeadForm';
import { CERTIFICATE_NOMINALS } from '../data/site';

/**
 * Подарочный сертификат.
 *
 * Витрина сертификата без корзины: оплата картой, сам сертификат приходит
 * в личный кабинет получателя. Поэтому на странице — номиналы, условия и
 * форма, чтобы менеджер довёл заказ до оплаты.
 */
export default function CertificatePage() {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Подарочный сертификат' }]} />

      <section className="bg-ink pb-16 pt-8 text-paper lg:pb-20">
        <div className="container-x">
          <span className="eyebrow mb-4 text-brand">
            <span className="h-[2px] w-8 bg-brand" />
            Подарок
          </span>
          <h1 className="display max-w-3xl text-[2.5rem] sm:text-6xl lg:text-7xl">
            Подарочный сертификат
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Сертификат на абонемент, кемп или мерч. Получатель сам выбирает
            направление, формат и площадку — а срок действия не сгорает.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {CERTIFICATE_NOMINALS.map((nominal) => (
              <div
                key={nominal}
                className="rounded-2xl border border-white/15 bg-white/5 px-4 py-5 text-center"
              >
                <div className="display text-2xl text-white">
                  {nominal.toLocaleString('ru-RU')} ₽
                </div>
                <div className="mt-1 text-[0.62rem] uppercase tracking-[0.12em] text-white/45">
                  номинал
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper py-16 lg:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <span className="eyebrow mb-4">Условия</span>
            <h2 className="display max-w-xl text-4xl text-ink sm:text-5xl">
              Как это работает
            </h2>

            <ol className="mt-10 space-y-6">
              {[
                {
                  title: 'Выбираете номинал',
                  body: 'От 5 000 до 30 000 ₽. Сертификат можно потратить целиком или частями — остаток сохраняется.',
                },
                {
                  title: 'Оплачиваете картой',
                  body: 'Оформление занимает пару минут: реквизиты присылаем в ответ на заявку, чек и сертификат — на почту.',
                },
                {
                  title: 'Дарите код',
                  body: 'Получатель вводит его в личном кабинете — сумма зачисляется на баланс, а срок действия не ограничен.',
                },
              ].map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="display shrink-0 text-2xl text-brand/30">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-ink">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-graphite">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <ul className="mt-10 space-y-2.5 border-t border-line pt-8">
              {[
                'Оплачивает абонементы, кемпы, персональные занятия и мерч',
                'Не имеет срока действия и не сгорает при переносе тренировок',
                'Можно доплатить, если стоимость программы выше номинала',
                'Баллы лояльности начисляются получателю как за обычную покупку',
              ].map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-graphite">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/loyalty"
                className="group inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] text-ink hover:border-ink"
              >
                Программа лояльности
                <ArrowRight className="h-4 w-4 text-brand transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Превью сертификата */}
          <div className="relative">
            <div className="rounded-3xl bg-navy p-8 text-paper shadow-lift">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[0.62rem] uppercase tracking-[0.16em] text-white/50">
                    Подарочный сертификат
                  </div>
                  <div className="display mt-2 text-3xl">Второе дыхание</div>
                </div>
                <Gift className="h-8 w-8 text-brand" />
              </div>

              <div className="mt-10 border-t border-dashed border-white/20 pt-6">
                <div className="text-[0.62rem] uppercase tracking-[0.16em] text-white/50">
                  Номинал
                </div>
                <div className="display mt-1 text-4xl text-brand">10 000 ₽</div>
              </div>

              <div className="mt-8 flex items-end justify-between gap-4">
                <div>
                  <div className="text-[0.62rem] uppercase tracking-[0.16em] text-white/50">
                    Действует
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white">Без ограничения срока</div>
                </div>
                <Sparkles className="h-6 w-6 text-white/30" />
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-paper p-6 shadow-card sm:p-8">
              <LeadForm
                source="certificate"
                title="Заказать сертификат"
                subtitle="Оставьте контакты — пришлём реквизиты и поможем выбрать номинал."
                cta="Заказать сертификат"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
