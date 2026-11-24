import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { useSetting } from '../store/settingsStore';

/**
 * «О нас» — обращение основателя школы.
 *
 * Текст идёт от первого лица: это личная история Армена Брсояна,
 * поэтому абзацы разбиты по смыслу, а не по «продающим» блокам.
 * Цитата про второе дыхание вынесена крупно — она объясняет название.
 */
export default function AboutPage() {
  const aboutImage = useSetting('aboutImage');

  return (
    <>
      <Breadcrumbs items={[{ label: 'О школе' }, { label: 'О нас' }]} />

      {/* Hero */}
      <section className="bg-ink pb-16 pt-8 text-paper lg:pb-20">
        <div className="container-x">
          <span className="eyebrow mb-4 text-brand">
            <span className="h-[2px] w-8 bg-brand" />
            О школе
          </span>
          <h1 className="display max-w-3xl text-[2.5rem] leading-[1.05] sm:text-6xl lg:text-7xl">
            Меня зовут
            <br />
            Армен Брсоян
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            Создатель школы циклических видов спорта «Второе Дыхание».
            Рассказываю, зачем она появилась и во что мы верим.
          </p>
        </div>
      </section>

      {/* Текст обращения */}
      <section className="bg-paper py-16 lg:py-24">
        <div className="container-x">
          <div className="mx-auto max-w-3xl">
            <p className="display text-2xl leading-snug text-ink sm:text-3xl">
              Почему школа? Школа — это семья.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-graphite">
              Самое главное, самое ценное, в чём нуждается человек, — и атлет
              не исключение.
            </p>

            <div className="mt-10 space-y-6 text-base leading-relaxed text-ink/85">
              <p>
                Я пришёл в спорт высших достижений, а именно в лыжные гонки,
                в 29 лет. И единственным человеком, не пропустившим ни одной моей
                лыжной гонки, марафона, на заре становления меня как атлета, стал
                мой отец — Брсоян Мушег. На финише он всегда задавал мне один
                вопрос:
              </p>

              {/* Цитата — смысловой центр страницы и название школы */}
              <blockquote className="my-10 border-l-2 border-brand pl-6 sm:pl-8">
                <p className="display text-2xl leading-snug text-ink sm:text-3xl">
                  «Открылось второе дыхание?»
                </p>
                <footer className="mt-3 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-graphite">
                  Брсоян Мушег — отец и первый болельщик
                </footer>
              </blockquote>

              <p>
                Сказать, что отец поддержал меня, — значит не сказать ничего.
                В одночасье он стал и спонсором, и менеджером, и сервисменом,
                и вдохновителем — всё в одном лице. На текущий момент у отца
                в копилке более 300 беговых марафонов, и это число стремительно
                растёт. Именно благодаря ему у меня возникла мысль создания школы.
              </p>

              <p>
                А ещё за моей спиной не было спортивно-юношеских школ, секций
                по лыжным гонкам, тем паче по триатлону. Поэтому я не понаслышке
                знаю, как сложно подобрать интересную и продуктивную тренировку
                лыжнику в бесснежный период и, напротив, — велосипедисту или
                триатлонисту тренироваться зимой. Как сложно придать мотивацию,
                чтобы выйти на одну из сложнейших тренировок лыжника-гонщика —
                имитацию.
              </p>

              <p>
                Будучи работающим человеком, воспитывающим двух сыновей, я так же,
                как и многие из вас, сталкивался с обыденными вопросами. Когда?
                Как и где? Как именно тренироваться? И самое главное — что делать
                на тренировке, как вообще на неё идти? Пришлось погружаться
                в недра физиологии и биомеханики, анализировать труды известных
                тренеров и атлетов, тестировать планы — прежде всего на себе.
                И как итог — систематизировать всё это в готовые решения.
              </p>

              <p>
                Отдельные слова благодарности хочу выразить своему тренеру
                и наставнику, гуру, человеку, фанатично преданному лыжному
                спорту, — Анатолию Нестерову.
              </p>

              <p>
                Отличительной особенностью школы нахожу то, чтобы атлет развивался
                всесторонне, гармонично, сбалансированно, сменяя направления
                по принципу изменения времени года. Владея двумя направлениями
                циклических видов спорта — лыжные гонки и триатлон, — поддерживаем
                функциональную готовность и возможность проводить тренировки
                и соревнования практически в любых природных и погодных условиях.
                Ну и, конечно же, — разносторонняя направленность тренировочного
                процесса и мотивация выйти завтра на тренировку.
              </p>
            </div>

            {/* Финальное обещание — отдельным блоком, чтобы не терялось в тексте */}
            <div className="mt-12 rounded-2xl bg-mist p-7 sm:p-9">
              <p className="text-base leading-relaxed text-ink/85 sm:text-lg">
                Друзья, главным приоритетом вижу то, чтобы тренироваться
                осмысленно, без травм, в гармонии с собой и в команде
                единомышленников, в удовольствие, — а не просто приходить
                в школу ради оплаченной тренировки!
              </p>
            </div>

            {aboutImage && (
              <div className="mt-12 overflow-hidden rounded-2xl bg-mist">
                <img
                  src={aboutImage}
                  alt="Атмосфера школы «Второе Дыхание»"
                  className="aspect-[16/9] w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.dataset.fallback) return;
                    img.dataset.fallback = '1';
                    img.src = '/images/about.svg';
                  }}
                />
              </div>
            )}

            {/* Дальше — остальные микроразделы «О школе» */}
            <div className="mt-14 border-t border-line pt-10">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-graphite">
                Дальше о школе
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Link
                  to="/trainers"
                  className="card-lift card-lift-hover group flex items-center justify-between gap-4 p-6"
                >
                  <div>
                    <h2 className="display text-lg text-ink">Команда</h2>
                    <p className="mt-1 text-sm text-graphite">
                      Тренеры, которые ведут группы
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-brand transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/loyalty"
                  className="card-lift card-lift-hover group flex items-center justify-between gap-4 p-6"
                >
                  <div>
                    <h2 className="display text-lg text-ink">Программа лояльности</h2>
                    <p className="mt-1 text-sm text-graphite">
                      Баллы за тренировки и старты
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-brand transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mist py-16 lg:py-20">
        <div className="container-x text-center">
          <h2 className="display text-3xl text-ink sm:text-4xl">
            Приходите на пробную тренировку
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-graphite">
            Первое занятие — по цене чашки кофе: посмотрите, как устроена школа изнутри,
            и познакомьтесь с тренером.
          </p>
          <Link
            to="/register"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-brand-dark active:scale-95"
          >
            Записаться
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
