import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Bell,
  Calendar,
  Camera,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Layers,
  LogOut,
  Newspaper,
  Palette,
  MapPin,
  PartyPopper,
  Quote,
  Settings,
  Shield,
  Tent,
  TrendingUp,
  Users,
} from 'lucide-react';

type NavItem = { to: string; icon: React.ElementType; label: string; end?: boolean };
type NavGroup = { title: string; items: NavItem[] };

const ATHLETE_NAV: NavGroup[] = [
  {
    title: 'Мой сезон',
    items: [
      { to: '/cabinet', icon: LayoutDashboard, label: 'Обзор', end: true },
      { to: '/cabinet/registrations', icon: ClipboardList, label: 'Мои записи' },
      { to: '/cabinet/calendar', icon: Calendar, label: 'Календарь' },
      { to: '/cabinet/results', icon: TrendingUp, label: 'Результаты' },
    ],
  },
  {
    title: 'Аккаунт',
    items: [
      { to: '/cabinet/payment', icon: CreditCard, label: 'Абонемент' },
      { to: '/cabinet/notifications', icon: Bell, label: 'Уведомления' },
      { to: '/cabinet/settings', icon: Settings, label: 'Настройки' },
    ],
  },
];

const TRAINER_NAV: NavGroup[] = [
  {
    title: 'Работа',
    items: [
      { to: '/cabinet', icon: LayoutDashboard, label: 'Обзор', end: true },
      { to: '/cabinet/schedule', icon: Calendar, label: 'Моё расписание' },
      { to: '/cabinet/admin/trainings', icon: ClipboardList, label: 'Тренировки' },
      { to: '/cabinet/attendance', icon: ClipboardList, label: 'Посещаемость' },
    ],
  },
  {
    title: 'Контент',
    items: [
      { to: '/cabinet/photos', icon: Camera, label: 'Фото тренировок' },
      { to: '/cabinet/admin/news', icon: Newspaper, label: 'Новости' },
    ],
  },
  {
    title: 'Люди и аккаунт',
    items: [
      { to: '/cabinet/students', icon: Users, label: 'Спортсмены' },
      { to: '/cabinet/notifications', icon: Bell, label: 'Уведомления' },
      { to: '/cabinet/settings', icon: Settings, label: 'Настройки' },
    ],
  },
];

const ADMIN_NAV: NavGroup[] = [
  {
    title: 'Обзор',
    items: [{ to: '/cabinet', icon: Shield, label: 'Дашборд', end: true }],
  },
  {
    title: 'Контент сайта',
    items: [
      { to: '/cabinet/admin/directions', icon: TrendingUp, label: 'Направления' },
      { to: '/cabinet/admin/news', icon: Newspaper, label: 'Новости' },
      { to: '/cabinet/admin/events', icon: PartyPopper, label: 'Мероприятия' },
      { to: '/cabinet/admin/camps', icon: Tent, label: 'Кэмпы' },
      { to: '/cabinet/admin/routes', icon: MapPin, label: 'Маршруты' },
      { to: '/cabinet/admin/testimonials', icon: Quote, label: 'Отзывы' },
      { to: '/cabinet/admin/pages', icon: FileText, label: 'Страницы' },
      { to: '/cabinet/admin/sections', icon: Layers, label: 'Разделы' },
    ],
  },
  {
    title: 'Тренировки',
    items: [
      { to: '/cabinet/admin/trainings', icon: ClipboardList, label: 'Расписание' },
      { to: '/cabinet/schedule', icon: Calendar, label: 'Моё расписание' },
      { to: '/cabinet/photos', icon: Camera, label: 'Фото тренировок' },
      { to: '/cabinet/admin/results', icon: TrendingUp, label: 'Результаты' },
    ],
  },
  {
    title: 'Люди',
    items: [
      { to: '/cabinet/admin/users', icon: Users, label: 'Пользователи' },
      { to: '/cabinet/admin/trainers', icon: GraduationCap, label: 'Тренеры' },
      { to: '/cabinet/admin/leads', icon: Inbox, label: 'Заявки' },
      { to: '/cabinet/admin/notifications', icon: Bell, label: 'Рассылки' },
    ],
  },
  {
    title: 'Настройки',
    items: [
      { to: '/cabinet/admin/appearance', icon: Palette, label: 'Внешний вид' },
      { to: '/cabinet/admin/site-settings', icon: Settings, label: 'Настройки сайта' },
      { to: '/cabinet/settings', icon: Settings, label: 'Мой аккаунт' },
    ],
  },
];

const ROLE_LABEL: Record<string, string> = {
  athlete: 'Спортсмен',
  trainer: 'Тренер',
  admin: 'Администратор',
};

export default function CabinetLayout() {
  const { currentUser, logout, notifications } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // ProtectedRoute гарантирует наличие пользователя
  if (!currentUser) return null;

  const groups =
    currentUser.role === 'admin'
      ? ADMIN_NAV
      : currentUser.role === 'trainer'
        ? TRAINER_NAV
        : ATHLETE_NAV;

  const unread = notifications.filter(
    (n) => n.userId === currentUser.id && !n.read
  ).length;

  const handleLogout = () => {
    logout();
    toast('Вы вышли из аккаунта', 'info');
    navigate('/');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
      isActive
        ? 'bg-brand/10 font-semibold text-brand'
        : 'text-graphite hover:bg-mist hover:text-ink'
    }`;

  const avatar = (size: string, text: string) =>
    currentUser.photo ? (
      <img
        src={currentUser.photo}
        alt={currentUser.name}
        className={`${size} shrink-0 rounded-full object-cover`}
      />
    ) : (
      <div
        className={`${size} flex shrink-0 items-center justify-center rounded-full bg-brand/10 font-bold text-brand ${text}`}
      >
        {currentUser.name.charAt(0).toUpperCase()}
      </div>
    );

  return (
    <div className="flex min-h-[calc(100vh-6.75rem)] bg-mist">
      {/* Desktop sidebar */}
      <aside className="sticky top-16 hidden h-[calc(100vh-6.75rem)] w-72 shrink-0 flex-col border-r border-line bg-paper md:top-[6.75rem] lg:flex">
        <div className="border-b border-line p-5">
          <div className="flex items-center gap-3">
            {avatar('h-11 w-11', 'text-base')}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{currentUser.name}</p>
              <p className="text-[0.7rem] uppercase tracking-[0.1em] text-graphite">
                {ROLE_LABEL[currentUser.role]}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Навигация кабинета">
          {groups.map((group) => (
            <div key={group.title} className="mb-5 last:mb-0">
              <p className="mb-1.5 px-3 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-graphite/70">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.label === 'Уведомления' && unread > 0 && (
                      <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {unread}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-graphite transition-colors hover:bg-mist hover:text-ink"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Mobile: кто вошёл и выход */}
        <div className="flex items-center justify-between gap-3 border-b border-line bg-paper px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2.5">
            {avatar('h-9 w-9', 'text-sm')}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{currentUser.name}</p>
              <p className="text-[0.62rem] uppercase tracking-[0.1em] text-graphite">
                {ROLE_LABEL[currentUser.role]}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[0.7rem] font-semibold text-graphite transition-colors hover:border-ink/25 hover:text-ink"
          >
            <LogOut className="h-3.5 w-3.5" />
            Выйти
          </button>
        </div>

        {/* Mobile: горизонтальные разделы вместо нижней навигации */}
        <nav
          className="sticky top-16 z-30 border-b border-line bg-paper/95 backdrop-blur md:top-[6.75rem] lg:hidden"
          aria-label="Разделы кабинета"
        >
          <div className="rail px-3 py-2.5">
            {groups.flatMap((g) => g.items).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-brand text-white'
                      : 'bg-mist text-graphite hover:text-ink'
                  }`
                }
              >
                <item.icon className="h-3.5 w-3.5 shrink-0" />
                {item.label}
                {item.label === 'Уведомления' && unread > 0 && (
                  <span className="rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
                    {unread}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          {currentUser.mustChangePassword && (
            <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3">
              <Shield className="h-4 w-4 shrink-0 text-amber-700" />
              <p className="flex-1 text-xs leading-relaxed text-amber-800">
                Вы используете стартовый пароль. Смените его, чтобы защитить аккаунт.
              </p>
              <NavLink
                to="/cabinet/settings"
                className="rounded-full bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-500/30"
              >
                Сменить пароль
              </NavLink>
            </div>
          )}
          <Outlet />
        </div>
      </div>
    </div>
  );
}