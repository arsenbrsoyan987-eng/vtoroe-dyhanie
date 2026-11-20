import { Gift, Check, Star } from 'lucide-react';
import { CERTIFICATE_NOMINALS } from '../../data/site';
import Button from '../ui/Button';

/**
 * Подарочный сертификат: номиналы и что по ним входит.
 *
 * Оформляется как «купон» — превью справа даёт понять, что дарят физически,
 * даже если сертификат приходит в личный кабинет.
 */

export default function Certificate() {
  return (
    <section className="overflow-hidden bg-mist py-20 lg:py-28">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Левая часть: описание */}
          <div>
            <span className="eyebrow mb-4">Подарочный сертификат</span>
            <h2 className="display text-4xl text-ink sm:text-5xl">
              Подари здоровье, которое не лежит на полке
            </h2>
            <p className="mt-5 text-base leading-relaxed text-graphite sm:text-lg">
              Сертификат на абонемент — подарок, который работает каждый день.
              Получатель сам выбирает направление, формат и площадку.
            </p>

            <ul className="mt-8 space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10">
                  <Check className="h-3.5 w-3.5 text-brand" />
                </div>
                <span className="text-sm text-ink">
                  Номиналы от <strong>5 000 ₽</strong> до <strong>30 000 ₽</strong> — на абонемент, кемп или мерч.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10">
                  <Check className="h-3.5 w-3.5 text-brand" />
                </div>
                <span className="text-sm text-ink">
                  Сертификат не имеет срока действия и привязывается к аккаунту в личном кабинете.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10">
                  <Check className="h-3.5 w-3.5 text-brand" />
                </div>
                <span className="text-sm text-ink">
                  Можно подарить онлайн — оплата картой, сертификат приходит сразу.
                </span>
              </li>
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/register" variant="primary" size="lg">
                Купить сертификат
              </Button>
            </div>
          </div>

          {/* Правая часть: карточка-превью */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm card-lift p-8">
              {/* Блик: обрезается секцией, чтобы не расширять документ */}
              <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-brand/10 blur-2xl" />

              <div className="relative border border-line rounded-2xl bg-paper p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
                  <Gift className="h-8 w-8 text-brand" />
                </div>
                <h3 className="display text-2xl text-ink mb-4">Подарочный сертификат</h3>
                <p className="text-sm text-graphite mb-6">
                  Выберите номинал — от 5 000 ₽ до 30 000 ₽
                </p>
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {CERTIFICATE_NOMINALS.map((nom) => (
                    <div
                      key={nom}
                      className="rounded-lg bg-mist px-3 py-2 text-sm font-semibold text-ink"
                    >
                      {nom.toLocaleString('ru-RU')} ₽
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-graphite">
                  <Star className="h-3.5 w-3.5 text-brand fill-brand" />
                  <span>Можно потратить на абонемент, кемп или мерч</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
