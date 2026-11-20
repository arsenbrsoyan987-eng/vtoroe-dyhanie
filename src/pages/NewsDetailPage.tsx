import { Link, useParams } from 'react-router-dom';
import { useNews } from '../store/newsStore';
import Button from '../components/ui/Button';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { readingMinutes } from '../lib/text';

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const news = useNews();
  const item = news.find((n) => n.id === id);

  if (!item) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="display mb-4 text-3xl text-ink">Новость не найдена</h1>
        <p className="mb-8 text-sm text-graphite">Возможно, она была удалена.</p>
        <Button to="/news" variant="outline" size="sm">Все новости</Button>
      </div>
    );
  }

  const related = news
    .filter((n) => n.id !== item.id && n.category === item.category)
    .slice(0, 2);

  const paragraphs = (item.content || item.summary).split(/\n{2,}/).filter(Boolean);

  return (
    <>
      <Breadcrumbs items={[{ label: 'Новости', to: '/news' }, { label: item.title }]} />

      <article className="bg-paper pb-16 pt-6 lg:pb-24">
        <div className="container-x">
          <div className="mx-auto max-w-3xl">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-brand/10 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-brand">
                {item.category}
              </span>
              <time className="text-xs text-graphite">
                {new Date(`${item.date}T12:00:00`).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
              <span className="flex items-center gap-1.5 text-xs text-graphite">
                <Clock className="h-3.5 w-3.5" />
                {readingMinutes(item.content || item.summary)} мин чтения
              </span>
            </div>

            <h1 className="display text-[2rem] leading-tight text-ink sm:text-4xl lg:text-5xl">
              {item.title}
            </h1>

            {item.summary && (
              <p className="mt-5 text-lg leading-relaxed text-graphite">{item.summary}</p>
            )}

            {item.image && (
              <div className="mt-8 overflow-hidden rounded-2xl bg-mist">
                <img
                  src={item.image}
                  alt={item.title}
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            )}

            <div className="mt-8 space-y-4 text-base leading-relaxed text-ink/85">
              {paragraphs.map((p, i) => (
                <p key={i} className="whitespace-pre-line">{p}</p>
              ))}
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              <Link
                to="/news"
                className="inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-graphite transition-colors hover:text-brand"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Все новости
              </Link>
              <Button to="/schedule" variant="primary" size="sm">
                Записаться на тренировку
              </Button>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-mist py-14 lg:py-16">
          <div className="container-x">
            <h2 className="display mb-6 text-2xl text-ink sm:text-3xl">Ещё по теме</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((n) => (
                <Link
                  key={n.id}
                  to={`/news/${n.id}`}
                  className="card-lift card-lift-hover group flex flex-col overflow-hidden"
                >
                  {n.image && (
                    <img
                      src={n.image}
                      alt={n.title}
                      className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.1em] text-brand">
                      {n.category}
                    </p>
                    <h3 className="mt-2 text-base font-bold leading-snug text-ink group-hover:text-brand">
                      {n.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-graphite">
                      {n.summary}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-ink">
                      Читать
                      <ArrowRight className="h-3.5 w-3.5 text-brand transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}