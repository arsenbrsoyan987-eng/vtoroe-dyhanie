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
    'inline-flex items-center justify-center font-semibold tracking-wide uppercase transition-all duration-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black';

  const variants = {
    primary:
      'bg-accent-red text-white hover:bg-accent-red-hover focus:ring-accent-red active:scale-95',
    secondary:
      'bg-white text-primary hover:bg-gray-100 focus:ring-white active:scale-95',
    outline:
      'border-2 border-white text-white hover:bg-white hover:text-primary focus:ring-white active:scale-95',
    blue: 'bg-accent-blue text-white hover:bg-accent-blue-hover focus:ring-accent-blue active:scale-95',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-sm md:text-base',
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
