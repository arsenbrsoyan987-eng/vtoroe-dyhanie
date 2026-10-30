import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getStoredUsers } from '../../store/database';
import { useTrainings } from '../../store/trainingsStore';
import { downloadPublished } from '../../lib/publish';
import { Users, ClipboardList, Calendar, Trophy, TrendingUp, Newspaper, PartyPopper, Download } from 'lucide-react';

export default function AdminDashboard() {
  const trainings = useTrainings();
  const { registrations } = useAuth();
  const { toast } = useToast();
  const users = getStoredUsers();
  const athletes = users.filter((u) => u.role === 'athlete').length;
  const trainers = users.filter((u) => u.role === 'trainer').length;
  const totalRegs = registrations.filter((r) => r.status !== 'cancelled').length;
  const totalAttended = registrations.filter((r) => r.attended).length;

  const handlePublish = () => {
    downloadPublished();
    toast('Файл published.json скачан — выполните npm run publish');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Панель администратора</h1>
      <p className="text-gray-400 text-sm mb-8">Управление клубом «Второе дыхание»</p>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-surface border border-white/10 rounded-sm p-5">
          <Users className="w-5 h-5 text-gray-400 mb-3" />
          <div className="text-2xl font-bold text-white">{users.length}</div>
          <div className="text-gray-400 text-sm">Пользователей</div>
        </div>
        <div className="bg-surface border border-white/10 rounded-sm p-5">
          <TrendingUp className="w-5 h-5 text-gray-400 mb-3" />
          <div className="text-2xl font-bold text-white">{athletes}</div>
          <div className="text-gray-400 text-sm">Спортсменов</div>
        </div>
        <div className="bg-surface border border-white/10 rounded-sm p-5">
          <Users className="w-5 h-5 text-gray-400 mb-3" />
          <div className="text-2xl font-bold text-white">{trainers}</div>
          <div className="text-gray-400 text-sm">Тренеров</div>
        </div>
        <div className="bg-surface border border-white/10 rounded-sm p-5">
          <ClipboardList className="w-5 h-5 text-gray-400 mb-3" />
          <div className="text-2xl font-bold text-white">{totalRegs}</div>
          <div className="text-gray-400 text-sm">Записей</div>
        </div>
        <div className="bg-surface border border-white/10 rounded-sm p-5">
          <ClipboardList className="w-5 h-5 text-gray-400 mb-3" />
          <div className="text-2xl font-bold text-white">{totalAttended}</div>
          <div className="text-gray-400 text-sm">Посещений</div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-white mb-4">Быстрые действия</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <Link to="/cabinet/admin/users" className="bg-surface border border-white/10 rounded-sm p-4 hover:border-accent-red/30 transition-colors text-center block group">
          <Users className="w-6 h-6 text-gray-400 group-hover:text-accent-red mx-auto mb-2 transition-colors" />
          <div className="text-white text-sm">Пользователи</div>
        </Link>
        <Link to="/cabinet/admin/trainers" className="bg-surface border border-white/10 rounded-sm p-4 hover:border-accent-red/30 transition-colors text-center block group">
          <Users className="w-6 h-6 text-gray-400 group-hover:text-accent-red mx-auto mb-2 transition-colors" />
          <div className="text-white text-sm">Тренеры</div>
        </Link>
        <Link to="/cabinet/admin/trainings" className="bg-surface border border-white/10 rounded-sm p-4 hover:border-accent-red/30 transition-colors text-center block group">
          <ClipboardList className="w-6 h-6 text-gray-400 group-hover:text-accent-red mx-auto mb-2 transition-colors" />
          <div className="text-white text-sm">Тренировки</div>
        </Link>
        <Link to="/cabinet/admin/notifications" className="bg-surface border border-white/10 rounded-sm p-4 hover:border-accent-red/30 transition-colors text-center block group">
          <Calendar className="w-6 h-6 text-gray-400 group-hover:text-accent-red mx-auto mb-2 transition-colors" />
          <div className="text-white text-sm">Рассылки</div>
        </Link>
        <Link to="/cabinet/admin/news" className="bg-surface border border-white/10 rounded-sm p-4 hover:border-accent-red/30 transition-colors text-center block group">
          <Newspaper className="w-6 h-6 text-gray-400 group-hover:text-accent-red mx-auto mb-2 transition-colors" />
          <div className="text-white text-sm">Новости</div>
        </Link>
        <Link to="/cabinet/admin/events" className="bg-surface border border-white/10 rounded-sm p-4 hover:border-accent-red/30 transition-colors text-center block group">
          <PartyPopper className="w-6 h-6 text-gray-400 group-hover:text-accent-red mx-auto mb-2 transition-colors" />
          <div className="text-white text-sm">Мероприятия</div>
        </Link>
        <Link to="/cabinet/admin/results" className="bg-surface border border-white/10 rounded-sm p-4 hover:border-accent-red/30 transition-colors text-center block group">
          <Trophy className="w-6 h-6 text-gray-400 group-hover:text-accent-red mx-auto mb-2 transition-colors" />
          <div className="text-white text-sm">Результаты</div>
        </Link>
        <button
          type="button"
          onClick={handlePublish}
          className="bg-surface border border-accent-red/40 rounded-sm p-4 hover:border-accent-red transition-colors text-center block group"
        >
          <Download className="w-6 h-6 text-accent-red mx-auto mb-2" />
          <div className="text-white text-sm">Опубликовать</div>
        </button>
      </div>

      <div className="mt-4 rounded-sm border border-accent-blue/30 bg-accent-blue/10 px-4 py-3">
        <p className="text-xs leading-relaxed text-blue-200">
          Кнопка «Опубликовать» скачивает файл <code className="font-mono">published.json</code> со
          всеми тренерами, тренировками, новостями и мероприятиями. Пока файл не
          загружен на сайт, ваши правки видны только в этом браузере. Чтобы их
          увидели все: скачайте файл и выполните в папке проекта{' '}
          <code className="font-mono">npm run publish</code>.
        </p>
      </div>

      {/* Recent registrations */}
      <h2 className="text-lg font-bold text-white mt-8 mb-4">Последние записи</h2>
      <div className="bg-surface border border-white/10 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs">Пользователь</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs hidden sm:table-cell">Тренировка</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs">Статус</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs hidden md:table-cell">Дата</th>
            </tr>
          </thead>
          <tbody>
            {registrations.slice(-5).reverse().map((r) => {
              const user = users.find((u) => u.id === r.userId);
              const training = trainings.find((t) => t.id === r.trainingId);
              return (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-white">{user?.name || '—'}</td>
                  <td className="py-3 px-4 text-gray-300 hidden sm:table-cell">{training?.name || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-sm ${
                      r.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                      r.status === 'waitlist' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {r.status === 'confirmed' ? 'Подтверждён' : r.status === 'waitlist' ? 'Ожидание' : 'Отменён'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs hidden md:table-cell">{r.registeredAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
