import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

/**
 * Общие блоки кабинета.
 *
 * Кабинет живёт в той же светлой палитре, что и витрина: карточки на бумаге,
 * серые подложки для полей, красный акцент только на действиях и статусах.
 */

export const fieldClass =
  'w-full rounded-xl border border-line bg-mist px-3 py-2.5 text-sm text-ink transition-colors placeholder-graphite/60 focus:border-brand focus:bg-paper focus:outline-none disabled:cursor-not-allowed disabled:opacity-60';

export const labelClass =
  'mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.1em] text-graphite';

/** Заголовок страницы кабинета: надзаголовок + h1 + пояснение */
export function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <span className="eyebrow mb-2.5">{eyebrow}</span>}
        <h1 className="display text-2xl text-ink sm:text-3xl">{title}</h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-graphite">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** Карточка-панель: белая поверхность на сером фоне кабинета */
export function Panel({
  children,
  className = '',
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border border-line bg-paper shadow-card ${
        padded ? 'p-5 sm:p-6' : ''
      } ${className}`}
    >
      {children}
    </section>
  );
}

/** Заголовок внутри панели */
export function PanelTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-bold text-ink">{children}</h2>
      {hint && <p className="mt-1 text-xs leading-relaxed text-graphite">{hint}</p>}
    </div>
  );
}

/** Плитка счётчика: цифра крупно, подпись мелко */
export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  to,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  hint?: string;
  to?: string;
}) {
  const body = (
    <>
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10">
          <Icon className="h-4.5 w-4.5 text-brand" />
        </span>
        <span className="display text-2xl text-ink">{value}</span>
      </div>
      <p className="text-sm font-semibold text-ink">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-graphite">{hint}</p>}
    </>
  );

  const cls =
    'block rounded-2xl border border-line bg-paper p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift';

  return to ? (
    <Link to={to} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** Пустое состояние: объясняем, что делать дальше, вместо голого «нет данных» */
export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-mist px-6 py-12 text-center">
      <p className="text-sm font-semibold text-ink">{title}</p>
      {text && <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-graphite">{text}</p>}
      {action && <div className="mt-5 flex justify-center gap-2">{action}</div>}
    </div>
  );
}

/** Переключатель вкладок */
export function Tabs<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (value: T) => void;
  items: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-full border border-line bg-paper p-1">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          aria-pressed={value === item.value}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
            value === item.value ? 'bg-ink text-white' : 'text-graphite hover:text-ink'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

const STATUS_TONE: Record<string, string> = {
  green: 'bg-emerald-500/10 text-emerald-700',
  yellow: 'bg-amber-500/10 text-amber-700',
  red: 'bg-brand/10 text-brand',
  blue: 'bg-navy/10 text-navy',
  gray: 'bg-mist text-graphite',
};

/** Статус-бейдж: тон задаёт смысл, а не конкретный цвет */
export function StatusBadge({
  children,
  tone = 'gray',
}: {
  children: ReactNode;
  tone?: keyof typeof STATUS_TONE;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.08em] ${STATUS_TONE[tone]}`}
    >
      {children}
    </span>
  );
}

/** Кнопка-действие внутри кабинета (без общей Button витрины) */
export function ActionButton({
  children,
  onClick,
  to,
  variant = 'primary',
  size = 'sm',
  disabled,
  type = 'button',
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  to?: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}) {
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-dark',
    outline: 'border border-line text-ink hover:border-ink/30 hover:bg-mist',
    ghost: 'text-graphite hover:bg-mist hover:text-ink',
    danger: 'bg-brand/10 text-brand hover:bg-brand/20',
  };
  const sizes = {
    sm: 'px-3.5 py-2 text-[0.7rem]',
    md: 'px-5 py-2.5 text-xs',
  };
  const cls = `inline-flex items-center justify-center gap-2 rounded-full font-bold uppercase tracking-[0.08em] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
