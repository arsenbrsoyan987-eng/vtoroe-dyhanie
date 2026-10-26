import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { LayoutDashboard, Menu, X } from 'lucide-react';

const navLinks = [
  { path: '/directions', label: 'Направления' },
  { path: '/schedule', label: 'Расписание' },
  { path: '/trainers', label: 'Тренеры' },
  { path: '/events', label: 'Мероприятия' },
  { path: '/routes', label: 'Маршруты' },
  { path: '/news', label: 'Новости' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { currentUser } = useAuth();

  // Закрываем мобильное меню при переходе
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Блокируем прокрутку под открытым меню
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-primary/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          <Link to="/" className="flex shrink-0 items-center" aria-label="Второе дыхание — на главную">
            <span className="flex items-center rounded-md bg-white px-2 py-1 transition-all hover:ring-2 hover:ring-accent-red/50">
              <img
                src="/logo.jpg"
                alt="Логотип клуба «Второе дыхание»"
                className="h-10 w-auto object-contain lg:h-12"
              />
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Основная навигация">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={() =>
                  `relative rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(link.path) ? 'text-accent-red' : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                {link.label}
                {isActive(link.path) && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent-red" />
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              {currentUser ? (
                <Button to="/cabinet" variant="outline" size="sm">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Кабинет
                </Button>
              ) : (
                <Button to="/login" variant="outline" size="sm">
                  Войти
                </Button>
              )}
            </div>
            <button
              className="rounded-sm p-2 text-white transition-colors hover:bg-white/5 lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={open}
              aria-controls="mobile-nav"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      <div
        id="mobile-nav"
        className={`overflow-hidden border-t border-white/10 bg-surface transition-[max-height] duration-300 lg:hidden ${
          open ? 'max-h-[calc(100vh-4rem)] overflow-y-auto' : 'max-h-0 border-t-0'
        }`}
      >
        <nav className="space-y-1 px-4 py-4" aria-label="Мобильная навигация">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={() =>
                `block rounded-sm px-4 py-3 text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-accent-red/10 text-accent-red'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-3">
            <Button to={currentUser ? '/cabinet' : '/login'} variant="outline" size="sm" className="w-full">
              {currentUser ? 'Личный кабинет' : 'Войти в кабинет'}
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
