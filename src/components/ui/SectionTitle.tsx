interface SectionTitleProps {
  subtitle?: string;
  title: string;
  align?: 'left' | 'center';
  /** Заголовок страницы должен быть h1 — для поисковиков это главный текст */
  as?: 'h1' | 'h2';
}

export default function SectionTitle({
  subtitle,
  title,
  align = 'left',
  as: Tag = 'h2',
}: SectionTitleProps) {
  const alignClass = align === 'center' ? 'text-center' : '';

  return (
    <div className={`mb-12 ${alignClass}`}>
      {subtitle && (
        <span className="block text-accent-red font-semibold uppercase tracking-widest text-sm mb-2">
          {subtitle}
        </span>
      )}
      <Tag className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
        {title}
      </Tag>
    </div>
  );
}
