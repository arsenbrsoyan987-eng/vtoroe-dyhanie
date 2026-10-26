import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTrainings } from '../../store/trainingsStore';
import Button from '../../components/ui/Button';
import { Calendar, ClipboardList, TrendingUp, Bell, Settings, CreditCard } from 'lucide-react';

function StatCard({ icon: Icon, label, value, to }: { icon: React.ElementType; label: string; value: string | number; to: string }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(to)} className="bg-surface border border-white/10 rounded-sm p-5 hover:border-accent-red/30 transition-all text-left w-full group">
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-5 h-5 text-gray-400 group-hover:text-accent-red transition-colors" />
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <div className="text-gray-400 text-sm">{label}</div>
    </button>
  );
}

export default function AthleteDashboard() {
  const trainings = useTrainings();
  const { currentUser, registrations, notifications, personalResults } = useAuth();
  const navigate = useNavigate();

  const activeRegs = registrations.filter((r) => r.userId === currentUser!.id && r.status !== 'cancelled');
  const upcomingRegs = activeRegs.filter((r) => {
    const training = trainings.find((t) => t.id === r.trainingId);
    return training && new Date(training.date) >= new Date();
  });
  const totalResults = personalResults.filter((r) => r.userId === currentUser!.id).length;
  const unread = notifications.filter((n) => n.userId === currentUser!.id && !n.read).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Добро пожаловать, {currentUser?.name}!</h1>
      <p className="text-gray-400 text-sm mb-8">Личный кабинет спортсмена</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={ClipboardList} label="Мои записи" value={upcomingRegs.length} to="/cabinet/registrations" />
        <StatCard icon={TrendingUp} label="Результаты" value={totalResults} to="/cabinet/results" />
        <StatCard icon={Bell} label="Уведомления" value={unread} to="/cabinet/notifications" />
        <StatCard icon={Calendar} label="Ближайшая тренировка" value={upcomingRegs.length > 0 ? '1' : '—'} to="/cabinet/registrations" />
      </div>

      {/* Upcoming */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Ближайшие тренировки</h2>
          <Button to="/schedule" variant="outline" size="sm">Все тренировки</Button>
        </div>
        {upcomingRegs.length === 0 ? (
          <div className="bg-surface border border-white/10 rounded-sm p-8 text-center">
            <p className="text-gray-400 text-sm mb-4">У вас пока нет записей на тренировки</p>
            <Button to="/schedule" variant="primary" size="sm">Записаться</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingRegs.slice(0, 3).map((reg) => {
              const training = trainings.find((t) => t.id === reg.trainingId);
              if (!training) return null;
              return (
                <div key={reg.id} className="bg-surface border border-white/10 rounded-sm p-4 flex items-center justify-between">
                  <div>
                    <div className="text-white font-semibold text-sm">{training.name}</div>
                    <div className="text-gray-400 text-xs mt-1">
                      {new Date(training.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} · {training.time} · {training.location}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-sm ${reg.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {reg.status === 'confirmed' ? 'Подтверждено' : 'Лист ожидания'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notifications */}
      {unread > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Новые уведомления</h2>
            <Button to="/cabinet/notifications" variant="outline" size="sm">Все</Button>
          </div>
          <div className="space-y-2">
            {notifications
              .filter((n) => n.userId === currentUser!.id && !n.read)
              .slice(0, 2)
              .map((n) => (
                <div key={n.id} className="bg-blue-500/10 border border-blue-500/20 rounded-sm p-4">
                  <div className="text-white text-sm font-medium">{n.title}</div>
                  <div className="text-gray-400 text-xs mt-1">{n.message}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button onClick={() => navigate('/cabinet/registrations')} className="bg-surface border border-white/10 rounded-sm p-4 hover:border-accent-red/30 transition-colors text-center group">
          <ClipboardList className="w-6 h-6 text-gray-400 group-hover:text-accent-red mx-auto mb-2 transition-colors" />
          <div className="text-white text-sm">Записи</div>
        </button>
        <button onClick={() => navigate('/cabinet/results')} className="bg-surface border border-white/10 rounded-sm p-4 hover:border-accent-red/30 transition-colors text-center group">
          <TrendingUp className="w-6 h-6 text-gray-400 group-hover:text-accent-red mx-auto mb-2 transition-colors" />
          <div className="text-white text-sm">Результаты</div>
        </button>
        <button onClick={() => navigate('/cabinet/calendar')} className="bg-surface border border-white/10 rounded-sm p-4 hover:border-accent-red/30 transition-colors text-center group">
          <Calendar className="w-6 h-6 text-gray-400 group-hover:text-accent-red mx-auto mb-2 transition-colors" />
          <div className="text-white text-sm">Календарь</div>
        </button>
        <Link to="/cabinet/payment" className="bg-surface border border-white/10 rounded-sm p-4 hover:border-accent-red/30 transition-colors text-center group block">
          <CreditCard className="w-6 h-6 text-gray-400 group-hover:text-accent-red mx-auto mb-2 transition-colors" />
          <div className="text-white text-sm">Абонемент</div>
        </Link>
        <Link to="/cabinet/calendar-export" className="bg-surface border border-white/10 rounded-sm p-4 hover:border-accent-red/30 transition-colors text-center group block">
          <Calendar className="w-6 h-6 text-gray-400 group-hover:text-accent-blue mx-auto mb-2 transition-colors" />
          <div className="text-white text-sm">Экспорт</div>
        </Link>
        <Link to="/cabinet/settings" className="bg-surface border border-white/10 rounded-sm p-4 hover:border-accent-red/30 transition-colors text-center group block">
          <Settings className="w-6 h-6 text-gray-400 group-hover:text-accent-red mx-auto mb-2 transition-colors" />
          <div className="text-white text-sm">Настройки</div>
        </Link>
      </div>
    </div>
  );
}
