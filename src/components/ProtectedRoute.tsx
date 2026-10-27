import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Если указано — доступ только этим ролям */
  roles?: Array<'athlete' | 'trainer' | 'admin'>;
}

/**
 * Защита приватных разделов. Пока сессия восстанавливается — не редиректим,
 * чтобы не выкидывать пользователя при обновлении страницы.
 */
export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { currentUser, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-accent-red" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/vtoroe-dyhanie/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(currentUser.role)) {
    return <Navigate to="/cabinet" replace />;
  }

  return <>{children}</>;
}
