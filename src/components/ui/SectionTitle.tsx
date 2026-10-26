interface SectionTitleProps {
  subtitle?: string;
  title: string;
  align?: 'left' | 'center';
}

export default function SectionTitle({
  subtitle,
  title,
  align = 'left',
}: SectionTitleProps) {
  const alignClass = align === 'center' ? 'text-center' : '';

  return (
    <div className={`mb-12 ${alignClass}`}>
      {subtitle && (
        <span className="block text-accent-red font-semibold uppercase tracking-widest text-sm mb-2">
          {subtitle}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
        {title}
      </h2>
    </div>
  );
}
