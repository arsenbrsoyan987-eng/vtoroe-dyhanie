import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  to?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

/**
 * Кнопка витрины: по умолчанию рассчитана на светлый фон.
 * На тёмных блоках (hero, подвал) варианты переопределяются через className.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  onClick,
  className = '',
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-semibold tracking-wide uppercase transition-all duration-200 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-dark active:scale-[0.98]',
    secondary: 'bg-ink text-white hover:bg-graphite active:scale-[0.98]',
    outline: 'border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-white',
    blue: 'bg-navy text-white hover:bg-navy-soft active:scale-[0.98]',
  };

  const sizes = {
    // min-h-10: на телефоне кнопка должна попадать под палец (40px)
    sm: 'min-h-10 px-4 py-2 text-xs',
    md: 'px-6 py-3 text-xs',
    lg: 'px-8 py-4 text-sm',
  };

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {children}
    </button>
  );
}