import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSetting, useSettingList } from '../../store/settingsStore';
import { useSections } from '../../store/sectionsStore';
import { telHref } from '../../data/club';
import Button from '../ui/Button';
import {
  LayoutDashboard,
  Menu,
  Phone,
  X,
  ChevronDown,
} from 'lucide-react';
import SocialIcon from '../ui/SocialIcons';

const NAV_GROUPS = [
  {
    label: 'Направления',
    items: [
      { path: '/directions/running', label: 'Бег' },
      { path: '/directions/trail', label: 'Трейлраннинг' },
      { path: '/directions/cycling', label: 'Велоспорт' },
      { path: '/directions/hiking', label: 'Походы' },
      { path: '/directions/ski', label: 'Лыжи' },
      { path: '/directions/triathlon', label: 'Триатлон' },
      { path: '/directions/functional', label: 'Функциональная подготовка' },
    ],
  },
  {
    label: 'Кемпы и сборы',
    items: [
      { path: '/camps', label: 'Все кемпы' },
      { path: '/zones', label: 'Локации' },
    ],
  },
  {
    label: 'О нас',
    items: [
      { path: '/section/about', label: 'О школе' },
      { path: '/trainers', label: 'Команда' },
      { path: '/loyalty', label: 'Программа лояльности' },
    ],
  },
  {
    label: 'Блог',
    items: [
      { path: '/news', label: 'Статьи' },
    ],
  },
];

/** Мега-шапка: шапка с выпадающими группами и контактами */
export default function MegaHeader() {
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const { pathname } = useLocation();
  const logoUrl = useSetting('logoUrl') || '/logo.jpg';
  const logoAlt = useSetting('logoAlt') || 'Логотип школы «Второе дыхание»';
  const telegram = useSetting('telegram');
  const phones = useSettingList('phones');
  const phone = phones[0] ?? '';
  const socialMax = useSetting('socialMax');
  const sections = useSections();
  const { currentUser } = useAuth();

  const dynamicLinks = sections
    .filter((s) => s.published)
    .map((s) => ({ path: `/section/${s.slug}`, label: s.title }));

  // Закрываем мобильное меню при переходе
  useEffect(() => {
    setOpen(false);
    setActiveGroup(null);
  }, [pathname]);

  // Блокируем прокрутку
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Escape закрывает меню
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-md border-b border-line">
      {/* Top bar: город + телефон */}
      <div className="hidden md:flex items-center justify-between bg-navy text-white/80 text-xs px-8 py-1.5">
        <span>Москва · Тренировки на городских площадках</span>
        <div className="flex items-center gap-4">
          {phone && (
            <a href={telHref(phone)} className="text-white hover:text-brand transition-colors">
              {phone}
            </a>
          )}
          {telegram && (
            <a href={telegram} target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors">
              <SocialIcon id="telegram" className="h-3.5 w-3.5" />
            </a>
          )}
          {socialMax && (
            <a href={socialMax} target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors">
              <SocialIcon id="max" className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Main row */}
      <div className="container-x flex h-16 md:h-20 items-center justify-between gap-4">
        <Link to="/" className="flex shrink-0 items-center" aria-label={logoAlt}>
          <img
            src={logoUrl}
            alt={logoAlt}
            className="h-10 w-auto object-contain md:h-12"
            onError={(e) => {
              const img = e.currentTarget;
              if (img.dataset.fallback) return;
              img.dataset.fallback = '1';
              img.src = '/logo.jpg';
            }}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `relative rounded-sm px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'text-brand' : 'text-graphite hover:text-ink'
              }`
            }
          >
            Главная
          </NavLink>

          {NAV_GROUPS.map((group) => (
            <div
              key={group.label}
              className="relative"
              onMouseEnter={() => setActiveGroup(group.label)}
              onMouseLeave={() => setActiveGroup(null)}
            >
              <button className="flex items-center gap-1 px-4 py-2.5 text-sm font-medium text-graphite hover:text-ink transition-colors">
                {group.label}
                <ChevronDown className="h-3 w-3 transition-transform" style={{ transform: activeGroup === group.label ? 'rotate(180deg)' : undefined }} />
              </button>

              {/* Mega dropdown */}
              {activeGroup === group.label && (
                <div className="absolute left-0 top-full z-50 w-72 rounded-xl bg-white shadow-lift border border-line p-4 animate-reveal">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive ? 'bg-brand/5 text-brand' : 'text-graphite hover:bg-mist hover:text-ink'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Dynamic sections */}
          {dynamicLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `relative rounded-sm px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'text-brand' : 'text-graphite hover:text-ink'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* CTA + Mobile burger */}
        <div className="flex items-center gap-2 md:gap-3">
          {phone && (
            <a
              href={telHref(phone)}
              className="hidden md:inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-all hover:bg-brand-dark active:scale-95"
            >
              <Phone className="h-3.5 w-3.5 shrink-0" />
              {phone}
            </a>
          )}

          {currentUser ? (
            <Button to="/cabinet" variant="outline" size="sm" className="hidden md:inline-flex border-ink text-ink hover:bg-ink hover:text-white">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Кабинет
            </Button>
          ) : (
            <Button to="/login" variant="outline" size="sm" className="hidden md:inline-flex border-ink text-ink hover:bg-ink hover:text-white">
              Войти
            </Button>
          )}

          <Button to="/register" variant="primary" size="sm" className="rounded-full">
            Записаться
          </Button>

          <button
            className="rounded-lg p-2 text-ink transition-colors hover:bg-mist lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-nav"
        inert={!open}
        aria-hidden={!open}
        className={`overflow-hidden border-t border-line bg-white transition-[max-height] duration-300 lg:hidden ${
          open ? 'max-h-[calc(100vh-5rem)] overflow-y-auto' : 'max-h-0 border-t-0'
        }`}
      >
        <nav className="space-y-1 px-4 py-4" aria-label="Мобильная навигация">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block rounded-lg px-4 py-3 text-sm font-medium ${
                isActive ? 'bg-brand/5 text-brand' : 'text-graphite hover:bg-mist'
              }`
            }
          >
            Главная
          </NavLink>

          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="border-t border-mist pt-2">
              <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-graphite">{group.label}</p>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `block rounded-lg px-4 py-2.5 text-sm ${
                      isActive ? 'bg-brand/5 text-brand' : 'text-graphite hover:bg-mist'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}

          {dynamicLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-2.5 text-sm ${
                  isActive ? 'bg-brand/5 text-brand' : 'text-graphite hover:bg-mist'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <div className="pt-4">
            <Button to="/register" variant="primary" size="lg" className="w-full rounded-full">
              Записаться
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
