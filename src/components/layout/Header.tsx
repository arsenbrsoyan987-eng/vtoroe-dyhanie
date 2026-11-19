import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSetting, useSettingList } from '../../store/settingsStore';
import { useSections } from '../../store/sectionsStore';
import { telHref } from '../../data/club';
import Button from '../ui/Button';
import { LayoutDashboard, Menu, Phone, Send, X } from 'lucide-react';

const navLinks = [
  { path: '/directions', label: 'Направления' },
  { path: '/schedule', label: 'Расписание' },
  { path: '/trainers', label: 'Тренеры' },
  { path: '/corporate', label: 'Корпоративный спорт' },
  { path: '/camps', label: 'Кэмпы' },
  { path: '/events', label: 'Мероприятия' },
  { path: '/routes', label: 'Маршруты' },
  { path: '/news', label: 'Новости' },
];

/**
 * Шапка. Контакты (телефон и Telegram) вынесены наверх намеренно: до этого
 * номер искали в подвале, и значительная часть обращений терялась. Значения
 * берутся из «Настроек сайта», а не зашиты здесь — телефон меняет владелец.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { currentUser } = useAuth();
  const sections = useSections();
  const logoUrl = useSetting('logoUrl') || '/logo.jpg';
  const logoAlt = useSetting('logoAlt') || 'Логотип школы «Второе дыхание»';
  const logoDescriptor = useSetting('logoDescriptor');
  const telegram = useSetting('telegram');
  const telegramLabel = useSetting('telegramLabel');
  const phones = useSettingList('phones');
  const phone = phones[0] ?? '';

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

  // Escape закрывает меню: без этого клавиатурный пользователь застревает в нём
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const dynamicLinks = sections
    .filter((s) => s.published)
    .map((s) => ({ path: `/section/${s.slug}`, label: s.title }));
  const allLinks = [...navLinks, ...dynamicLinks];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-primary/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          <Link to="/" className="flex shrink-0 items-center gap-3" aria-label={logoAlt}>
            <span className="flex items-center rounded-md bg-white px-2 py-1 transition-all hover:ring-2 hover:ring-accent-red/50">
              <img
                src={logoUrl}
                alt={logoAlt}
                className="h-10 w-auto object-contain lg:h-12"
                onError={(e) => {
                  // Ссылка из админки не открылась — возвращаем штатный логотип
                  const img = e.currentTarget;
                  if (img.dataset.fallback) return;
                  img.dataset.fallback = '1';
                  img.src = '/logo.jpg';
                }}
              />
            </span>
            {/* Дескриптор логотипа: сам знак мелкий, узнаваемость добирается слоганом */}
            {logoDescriptor && (
              <span className="hidden text-xs font-medium uppercase tracking-[0.18em] text-gray-400 sm:block">
                {logoDescriptor}
              </span>
            )}
          </Link>

          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Основная навигация">
            {allLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={() =>
                  `relative rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(link.path) ? 'text-accent-red' : 'text-gray-300 hover:text-white'
                  }`
                }
                aria-current={isActive(link.path) ? 'page' : undefined}
              >
                {link.label}
                {isActive(link.path) && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent-red" />
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {phone && (
              <a
                href={telHref(phone)}
                className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm font-semibold text-white transition-colors hover:text-accent-red"
                aria-label={`Позвонить: ${phone}`}
              >
                <Phone className="h-4 w-4 shrink-0 text-accent-red" />
                <span className="hidden sm:inline">{phone}</span>
              </a>
            )}

            {telegram && (
              <a
                href={telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:text-white"
                aria-label={`Написать в Telegram ${telegramLabel}`}
              >
                <Send className="h-4 w-4 shrink-0" />
                <span className="hidden lg:inline">Telegram</span>
              </a>
            )}

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
              className="rounded-sm p-2 text-white transition-colors hover:bg-white/5 xl:hidden"
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
        // Свёрнутое меню не должно ловить фокус и озвучиваться скринридером
        inert={!open}
        aria-hidden={!open}
        className={`overflow-hidden border-t border-white/10 bg-surface transition-[max-height] duration-300 xl:hidden ${
          open ? 'max-h-[calc(100vh-4rem)] overflow-y-auto' : 'max-h-0 border-t-0'
        }`}
      >
        <nav className="space-y-1 px-4 py-4" aria-label="Мобильная навигация">
          {allLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              aria-current={isActive(link.path) ? 'page' : undefined}
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

          <div className="space-y-1 border-t border-white/10 pt-3">
            {phone && (
              <a
                href={telHref(phone)}
                className="flex items-center gap-3 rounded-sm px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5"
              >
                <Phone className="h-4 w-4 shrink-0 text-accent-red" />
                Позвонить: {phone}
              </a>
            )}
            {telegram && (
              <a
                href={telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-sm px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Send className="h-4 w-4 shrink-0" />
                Написать в Telegram
              </a>
            )}
          </div>

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