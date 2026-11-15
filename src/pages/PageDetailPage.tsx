import { useParams, Link } from 'react-router-dom';
import SectionTitle from '../components/ui/SectionTitle';
import { usePages } from '../store/pagesStore';

/**
 * Администратор чаще печатает обычный текст, чем размечает HTML, поэтому
 * абзацы и списки собираем сами. Если в тексте уже есть теги — считаем,
 * что страница свёрстана вручную, и не трогаем её.
 */
function toHtml(raw: string): string {
  if (raw.includes('<')) return raw;
  const blocks = raw
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      const isList = lines.every((l) => /^[-•*]\s+/.test(l));
      if (isList) {
        return `<ul>${lines.map((l) => `<li>${l.replace(/^[-•*]\s+/, '')}</li>`).join('')}</ul>`;
      }
      return `<p>${lines.join('<br />')}</p>`;
    })
    .join('');
}

export default function PageDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const pages = usePages();
  const page = pages.find((p) => p.slug === slug && p.published);

  if (!page) {
    return (
      <div className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionTitle subtitle="Страница не найдена" title="404" align="center" as="h1" />
          <p className="text-gray-400 mb-6">Страница «/{slug}» не существует или не опубликована.</p>
          <Link to="/" className="text-accent-blue hover:underline">Вернуться на главную</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {page.heroImage && (
          <div className="mb-8 aspect-[21/9] overflow-hidden rounded-sm">
            <img
              src={page.heroImage}
              alt={page.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <SectionTitle subtitle="" title={page.title} align="left" as="h1" />
        <div
          className="mt-8 space-y-5 text-base leading-relaxed text-gray-300 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-white [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-white [&_ul]:space-y-2"
          dangerouslySetInnerHTML={{ __html: toHtml(page.content) }}
        />
      </div>
    </div>
  );
}

