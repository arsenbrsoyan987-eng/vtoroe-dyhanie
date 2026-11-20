import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { useNews } from '../store/newsStore';
import { isFilled } from '../lib/placeholder';
import { countNoun } from '../lib/plural';
import { readingMinutes } from '../lib/text';

export default function NewsPage() {
  const news = useNews();
  const [tag, setTag] = useState('all');

  // Новости-заглушки с «[Заголовок новости]» не показываем: три одинаковые
  // карточки выглядят как сломанная лента.
  const sorted = useMemo(
    () =>
      news
        .filter((item) => isFilled(item, ['title', 'summary', 'content']))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [news],
  );

  const tags = useMemo(
    () => [...new Set(sorted.map((item) => item.category).filter(Boolean))],
    [sorted],
  );

  const visible = tag === 'all' ? sorted : sorted.filter((n) => n.category === tag);
  const [lead, ...rest] = visible;

  return (
    <>
      <Breadcrumbs items={[{ label: 'Журнал' }]} />

      <section className="bg-ink pb-14 pt-8 text-paper lg:pb-20">
        <div className="container-x">
          <span className="eyebrow mb-4 text-brand">
            <span className="h-[2px] w-8 bg-brand" />
            Журнал
          </span>
          <h1 className="display max-w-3xl text-[2.5rem] sm:text-6xl lg:text-7xl">
            Статьи и заметки школы
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Разборы техники, подготовка к первому старту, питание на длинной
            дистанции и отчёты с выездов — без мотивационных лозунгов.
          </p>
        </div>
      </section>

      <section className="bg-paper py-12 lg:py-16">
        <div className="container-x">
          {sorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-mist px-6 py-16 text-center">
              <p className="mx-auto max-w-lg text-sm leading-relaxed text-graphite">
                Отчёты о стартах, анонсы тренировок и истории участников
                публикуем по мере появления. Самое свежее — в Telegram-канале школы.
              </p>
            </div>
          ) : (
            <>
              {tags.length > 1 && (
                <div className="mb-8 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setTag('all')}
                    aria-pressed={tag === 'all'}
                    className={`rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${
                      tag === 'all'
                        ? 'bg-brand text-white'
                        : 'border border-line bg-paper text-graphite hover:border-ink hover:text-ink'
                    }`}
                  >
                    Все темы
                  </button>
                  {tags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTag(t)}
                      aria-pressed={tag === t}
                      className={`rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${
                        tag === t
                          ? 'bg-brand text-white'
                          : 'border border-line bg-paper text-graphite hover:border-ink hover:text-ink'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}

              <p className="mb-6 text-xs uppercase tracking-[0.12em] text-graphite">
                {countNoun(visible.length, 'материал', 'материала', 'материалов')}
              </p>

              {/* Главный материал — крупной карточкой */}
              {lead && (
                <Link
                  to={`/news/${lead.id}`}
                  className="card-lift card-lift-hover group mb-6 grid overflow-hidden lg:grid-cols-2"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-mist lg:aspect-auto">
                    <img
                      src={lead.image}
                      alt={lead.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="eager"
                    />
                  </div>
                  <div className="flex flex-col justify-center p-6 lg:p-10">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-brand/10 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-brand">
                        {lead.category}
                      </span>
                      <span className="flex items-center gap-1.5 text-[0.7rem] text-graphite">
                        <Clock className="h-3.5 w-3.5" />
                        {countNoun(readingMinutes(lead.content), 'минута', 'минуты', 'минут')}
                      </span>
                    </div>
                    <h2 className="display text-2xl leading-tight text-ink group-hover:text-brand lg:text-3xl">
                      {lead.title}
                    </h2>
                    <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-graphite">
                      {lead.summary}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-ink">
                      Читать
                      <ArrowRight className="h-4 w-4 text-brand transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              )}

              {rest.length > 0 && (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={`/news/${item.id}`}
                        className="card-lift card-lift-hover group flex h-full flex-col overflow-hidden"
                      >
                        <div className="aspect-[16/10] overflow-hidden bg-mist">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <div className="mb-3 flex flex-wrap items-center gap-3">
                            <span className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-brand">
                              {item.category}
                            </span>
                            <span className="flex items-center gap-1.5 text-[0.68rem] text-graphite">
                              <Clock className="h-3 w-3" />
                              {readingMinutes(item.content)} мин
                            </span>
                          </div>
                          <h2 className="text-base font-bold leading-snug text-ink group-hover:text-brand">
                            {item.title}
                          </h2>
                          <p className="mt-2 line-clamp-3 flex-1 text-[0.82rem] leading-relaxed text-graphite">
                            {item.summary}
                          </p>
                          <time
                            dateTime={item.date}
                            className="mt-4 border-t border-line pt-4 text-[0.7rem] uppercase tracking-[0.1em] text-graphite"
                          >
                            {new Date(`${item.date}T12:00:00`).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                            })}
                          </time>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
