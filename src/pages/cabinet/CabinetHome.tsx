import { useAuth } from '../../context/AuthContext';
import AthleteDashboard from './AthleteDashboard';
import TrainerDashboard from './TrainerDashboard';
import AdminDashboard from './AdminDashboard';

/**
 * Главная страница кабинета зависит от роли пользователя.
 * Один маршрут /cabinet — три разных интерфейса.
 */
export default function CabinetHome() {
  const { currentUser } = useAuth();

  if (currentUser?.role === 'admin') return <AdminDashboard />;
  if (currentUser?.role === 'trainer') return <TrainerDashboard />;
  return <AthleteDashboard />;
}
