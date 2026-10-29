import { Link } from 'react-router-dom';
import SectionTitle from '../components/ui/SectionTitle';
import { useNews } from '../store/newsStore';
import { isFilled } from '../lib/placeholder';

export default function NewsPage() {
  const news = useNews();
  // Новости-заглушки с «[Заголовок новости]» не показываем: три одинаковые
  // карточки выглядят как сломанная лента.
  const sorted = news
    .filter((item) => isFilled(item, ['title', 'summary', 'content']))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle subtitle="Медиа" title="Новости клуба" align="center" as="h1" />

        {sorted.length === 0 ? (
          <div className="rounded-sm border border-white/10 bg-surface px-6 py-16 text-center">
            <p className="mx-auto max-w-lg text-sm leading-relaxed text-gray-400">
              Отчёты о стартах, анонсы тренировок и истории участников
              публикуем по мере появления. Самое свежее — в Telegram-канале
              клуба.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((item) => (
              <Link
                key={item.id}
                to={`/news/${item.id}`}
                className="group block bg-surface border border-white/10 rounded-sm overflow-hidden hover:border-accent-red/30 transition-colors"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm bg-accent-red/20 text-accent-red">
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
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-accent-red transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{item.summary}</p>
                  <span className="mt-3 inline-block text-xs text-accent-blue transition-colors group-hover:text-accent-red">
                    Читать →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}