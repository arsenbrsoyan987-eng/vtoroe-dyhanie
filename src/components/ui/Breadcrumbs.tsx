import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface Crumb {
  label: string;
  to?: string;
}

/**
 * Хлебные крошки витрины.
 *
 * Последняя запись — текущая страница: ссылка на себя бесполезна и портит
 * сниппет в поиске, поэтому она отдаётся обычным текстом с aria-current.
 */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Хлебные крошки" className="container-x py-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-graphite">
        <li>
          <Link
            to="/"
            aria-label="На главную"
            className="inline-flex items-center gap-1 hover:text-brand"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
        </li>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3 text-line" />
              {last || !item.to ? (
                <span
                  aria-current={last ? 'page' : undefined}
                  className="max-w-[10rem] truncate font-medium text-ink"
                >
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="hover:text-brand">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
