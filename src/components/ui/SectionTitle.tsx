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
    <div className={`mb-10 ${alignClass}`}>
      {subtitle && (
        <span className={`eyebrow mb-4 ${align === 'center' ? 'justify-center' : ''}`}>
          <span className="h-[2px] w-8 bg-brand" />
          {subtitle}
        </span>
      )}
      <Tag className="display text-3xl text-ink sm:text-4xl lg:text-5xl">
        {title}
      </Tag>
    </div>
  );
}