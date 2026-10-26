import { Link } from 'react-router-dom';
import SectionTitle from '../components/ui/SectionTitle';
import { useNews } from '../store/newsStore';

export default function NewsPage() {
  const news = useNews();
  const sorted = [...news].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle subtitle="Медиа" title="Новости клуба" align="center" />
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
                    {new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
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
        {sorted.length === 0 && (
          <p className="mt-8 text-center text-sm text-gray-500">
            Новостей пока нет — загляните позже.
          </p>
        )}
      </div>
    </div>
  );
}
