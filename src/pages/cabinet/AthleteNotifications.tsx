import { useAuth } from '../../context/AuthContext';

export default function AthleteNotificationsPage() {
  const { currentUser, notifications, markNotificationRead } = useAuth();

  const userNotifs = notifications.filter((n) => n.userId === currentUser!.id);
  const unread = userNotifs.filter((n) => !n.read);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Уведомления</h1>
          <p className="text-gray-400 text-sm">
            {unread.length > 0 && <span>{unread.length} непрочитанных</span>}
          </p>
        </div>
        {unread.length > 0 && (
          <button
            onClick={() => unread.forEach((n) => markNotificationRead(n.id))}
            className="text-accent-blue text-sm hover:underline"
          >
            Прочитать все
          </button>
        )}
      </div>

      {userNotifs.length === 0 ? (
        <div className="bg-surface border border-white/10 rounded-sm p-8 text-center">
          <p className="text-gray-400">У вас нет уведомлений</p>
        </div>
      ) : (
        <div className="space-y-3">
          {userNotifs
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`bg-surface border rounded-sm p-4 cursor-pointer transition-colors ${
                  n.read ? 'border-white/5' : 'border-accent-blue/30 bg-blue-500/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.read ? 'bg-gray-600' : 'bg-accent-blue'}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-sm ${
                        n.type === 'success' ? 'bg-green-500/20 text-green-400' :
                        n.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {n.type === 'success' ? 'Успех' : n.type === 'warning' ? 'Внимание' : 'Инфо'}
                      </span>
                      <span className="text-gray-500 text-xs">{n.createdAt}</span>
                    </div>
                    <div className="text-white font-medium text-sm">{n.title}</div>
                    <div className="text-gray-400 text-xs mt-1">{n.message}</div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
