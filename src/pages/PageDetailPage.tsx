import { useParams, Link } from 'react-router-dom';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Button from '../components/ui/Button';
import { usePages } from '../store/pagesStore';
import { toHtml } from '../lib/html';

/** Единый стиль для HTML, который админ печатает на произвольной странице */
const PROSE =
  'text-base leading-relaxed text-ink/85 [&_a]:font-semibold [&_a]:text-brand [&_a]:underline [&_h2]:display [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:text-ink [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-4 [&_p]:last:mb-0 [&_strong]:font-bold [&_strong]:text-ink [&_ul]:mb-4 [&_ul]:space-y-2';

export default function PageDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const pages = usePages();
  const page = pages.find((p) => p.slug === slug && p.published);

  if (!page) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="display mb-4 text-3xl text-ink">Страница не найдена</h1>
        <p className="mb-8 text-sm text-graphite">
          Страница «/{slug}» не существует или не опубликована.
        </p>
        <Button to="/" variant="outline" size="sm">На главную</Button>
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs items={[{ label: page.title }]} />

      <article className="bg-paper pb-16 pt-6 lg:pb-24">
        <div className="container-x">
          <div className="mx-auto max-w-3xl">
            {page.heroImage && (
              <div className="mb-8 overflow-hidden rounded-2xl bg-mist">
                <img
                  src={page.heroImage}
                  alt={page.title}
                  className="aspect-[21/9] w-full object-cover"
                  loading="lazy"
                />
              </div>
            )}

            <h1 className="display text-[2rem] leading-tight text-ink sm:text-4xl lg:text-5xl">
              {page.title}
            </h1>

            <div
              className={`mt-8 ${PROSE}`}
              dangerouslySetInnerHTML={{ __html: toHtml(page.content) }}
            />

            <div className="mt-10 border-t border-line pt-6">
              <Link
                to="/"
                className="text-[0.72rem] font-bold uppercase tracking-[0.12em] text-graphite transition-colors hover:text-brand"
              >
                На главную
              </Link>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}