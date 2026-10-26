import { Link, useParams } from 'react-router-dom';
import { useNews } from '../store/newsStore';
import Button from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const news = useNews();
  const item = news.find((n) => n.id === id);

  if (!item) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="mb-2 text-2xl font-bold text-white">Новость не найдена</h1>
        <p className="mb-6 text-sm text-gray-400">Возможно, она была удалена.</p>
        <Button to="/news" variant="outline" size="sm">Все новости</Button>
      </div>
    );
  }

  const related = news
    .filter((n) => n.id !== item.id && n.category === item.category)
    .slice(0, 2);

  const paragraphs = (item.content || item.summary).split(/\n{2,}/).filter(Boolean);

  return (
    <div className="py-12 lg:py-20">
      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/news"
          className="mb-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Новости клуба
        </Link>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="rounded-sm bg-accent-red/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-red">
            {item.category}
          </span>
          <time className="text-xs text-gray-500">
            {new Date(`${item.date}T12:00:00`).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </time>
        </div>

        <h1 className="mb-4 text-3xl font-bold leading-tight text-white lg:text-4xl">
          {item.title}
        </h1>

        {item.summary && (
          <p className="mb-6 text-lg leading-relaxed text-gray-300">{item.summary}</p>
        )}

        {item.image && (
          <div className="mb-8 overflow-hidden rounded-sm">
            <img src={item.image} alt={item.title} className="w-full object-cover" />
          </div>
        )}

        <div className="space-y-4 text-base leading-relaxed text-gray-300">
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line">{p}</p>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <Button to="/news" variant="outline" size="sm">
            Все новости
          </Button>
        </div>
      </article>

      {related.length > 0 && (
        <div className="mx-auto mt-16 max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-lg font-bold text-white">Ещё по теме</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {related.map((n) => (
              <Link
                key={n.id}
                to={`/news/${n.id}`}
                className="group overflow-hidden rounded-sm border border-white/10 bg-surface transition-colors hover:border-accent-red/30"
              >
                {n.image && (
                  <img
                    src={n.image}
                    alt={n.title}
                    className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                <div className="p-4">
                  <p className="text-sm font-semibold text-white group-hover:text-accent-red transition-colors">
                    {n.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">{n.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
