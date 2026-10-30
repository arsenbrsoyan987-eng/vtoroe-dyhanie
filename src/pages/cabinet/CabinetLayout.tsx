import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Bell,
  Calendar,
  Camera,
  ClipboardList,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Newspaper,
  PartyPopper,
  Quote,
  Settings,
  Shield,
  Tent,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';

type NavItem = { to: string; icon: React.ElementType; label: string; end?: boolean };

const ATHLETE_NAV: NavItem[] = [
  { to: '/cabinet', icon: LayoutDashboard, label: 'Обзор', end: true },
  { to: '/cabinet/registrations', icon: ClipboardList, label: 'Мои записи' },
  { to: '/cabinet/calendar', icon: Calendar, label: 'Календарь' },
  { to: '/cabinet/results', icon: TrendingUp, label: 'Результаты' },
  { to: '/cabinet/payment', icon: CreditCard, label: 'Абонемент' },
  { to: '/cabinet/notifications', icon: Bell, label: 'Уведомления' },
  { to: '/cabinet/settings', icon: Settings, label: 'Настройки' },
];

const TRAINER_NAV: NavItem[] = [
  { to: '/cabinet', icon: LayoutDashboard, label: 'Обзор', end: true },
  { to: '/cabinet/schedule', icon: Calendar, label: 'Моё расписание' },
  { to: '/cabinet/admin/trainings', icon: ClipboardList, label: 'Тренировки' },
  { to: '/cabinet/photos', icon: Camera, label: 'Фото тренировок' },
  { to: '/cabinet/admin/news', icon: Newspaper, label: 'Новости' },
  { to: '/cabinet/students', icon: Users, label: 'Спортсмены' },
  { to: '/cabinet/attendance', icon: ClipboardList, label: 'Посещаемость' },
  { to: '/cabinet/notifications', icon: Bell, label: 'Уведомления' },
  { to: '/cabinet/settings', icon: Settings, label: 'Настройки' },
];

const ADMIN_NAV: NavItem[] = [
  { to: '/cabinet', icon: Shield, label: 'Дашборд', end: true },
  { to: '/cabinet/admin/users', icon: Users, label: 'Пользователи' },
  { to: '/cabinet/admin/trainers', icon: GraduationCap, label: 'Тренеры' },
  { to: '/cabinet/admin/trainings', icon: ClipboardList, label: 'Тренировки' },
  { to: '/cabinet/photos', icon: Camera, label: 'Фото тренировок' },
  { to: '/cabinet/admin/camps', icon: Tent, label: 'Кэмпы' },
  { to: '/cabinet/admin/news', icon: Newspaper, label: 'Новости' },
  { to: '/cabinet/admin/events', icon: PartyPopper, label: 'Мероприятия' },
  { to: '/cabinet/admin/testimonials', icon: Quote, label: 'Отзывы' },
  { to: '/cabinet/schedule', icon: Calendar, label: 'Расписание' },
  { to: '/cabinet/admin/results', icon: TrendingUp, label: 'Результаты' },
  { to: '/cabinet/admin/notifications', icon: Bell, label: 'Рассылки' },
  { to: '/cabinet/settings', icon: Settings, label: 'Настройки' },
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

  const nav =
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
    `flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors ${
      isActive
        ? 'bg-accent-red/15 font-semibold text-accent-red'
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
    }`;

  const mobileItems = nav.slice(0, 4);

  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      {/* Desktop sidebar */}
      <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-64 shrink-0 flex-col border-r border-white/10 bg-surface lg:flex">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            {currentUser.photo ? (
              <img
                src={currentUser.photo}
                alt={currentUser.name}
                className="h-11 w-11 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-red/15 text-base font-bold text-accent-red">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{ROLE_LABEL[currentUser.role]}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Навигация кабинета">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.label === 'Уведомления' && unread > 0 && (
                <span className="rounded-full bg-accent-red px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4.5 w-4.5" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="fixed inset-x-0 top-16 z-30 flex items-center justify-between border-b border-white/10 bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          {currentUser.photo ? (
            <img
              src={currentUser.photo}
              alt={currentUser.name}
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-red/15 text-xs font-bold text-accent-red">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-white">{currentUser.name}</p>
            <p className="text-[10px] text-gray-500">{ROLE_LABEL[currentUser.role]}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </button>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 px-4 pb-28 pt-20 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
        {currentUser.mustChangePassword && (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-sm border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
            <Shield className="h-4 w-4 shrink-0 text-yellow-400" />
            <p className="flex-1 text-xs text-yellow-200">
              Вы используете стартовый пароль. Смените его, чтобы защитить аккаунт.
            </p>
            <NavLink
              to="/cabinet/settings"
              className="rounded-sm bg-yellow-500/20 px-3 py-1.5 text-xs font-semibold text-yellow-200 transition-colors hover:bg-yellow-500/30"
            >
              Сменить пароль
            </NavLink>
          </div>
        )}
        <Outlet />
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 bg-surface/95 backdrop-blur lg:hidden"
        aria-label="Быстрая навигация"
      >
        {mobileItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] transition-colors ${
                isActive ? 'text-accent-red' : 'text-gray-500'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
            {item.label === 'Уведомления' && unread > 0 && (
              <span className="absolute right-1/4 top-2 h-2 w-2 rounded-full bg-accent-red" />
            )}
          </NavLink>
        ))}
        <NavLink
          to="/cabinet/settings"
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] transition-colors ${
              isActive ? 'text-accent-red' : 'text-gray-500'
            }`
          }
        >
          <User className="h-5 w-5" />
          <span>Профиль</span>
        </NavLink>
      </nav>
    </div>
  );
}
