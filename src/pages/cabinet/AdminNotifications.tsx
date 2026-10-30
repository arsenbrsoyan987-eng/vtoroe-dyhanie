import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProfiles } from '../../store/profilesStore';
import { activeProfiles } from '../../store/profilesStore';
import { Bell } from 'lucide-react';

export default function AdminNotificationsPage() {
  const { notifications, addNotification } = useAuth();
  const profiles = useProfiles();
  // Рассылка идёт по живому списку из общей базы, а не по локальным копиям
  const users = activeProfiles(profiles);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', userId: 'all' });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.userId === 'all') {
      for (const u of users) {
        await addNotification({ userId: u.id, title: form.title, message: form.message, type: 'info' });
      }
    } else {
      await addNotification({ userId: form.userId, title: form.title, message: form.message, type: 'info' });
    }
    setShowForm(false);
    setForm({ title: '', message: '', userId: 'all' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-accent-blue" />
          <div>
            <h1 className="text-2xl font-bold text-white">Уведомления</h1>
            <p className="text-gray-400 text-sm">Отправка сообщений участникам</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-accent-red text-white text-sm px-4 py-2 rounded-sm hover:bg-accent-red-hover transition-colors">
          + Создать уведомление
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSend} className="bg-surface border border-white/10 rounded-sm p-6 mb-6 space-y-4">
          <h3 className="text-white font-semibold">Новое уведомление</h3>
          <input placeholder="Заголовок" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-primary border border-white/10 rounded-sm px-3 py-2 text-white text-sm focus:border-accent-red focus:outline-none" required />
          <textarea placeholder="Сообщение" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="w-full bg-primary border border-white/10 rounded-sm px-3 py-2 text-white text-sm focus:border-accent-red focus:outline-none resize-none" required />
          <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className="w-full bg-primary border border-white/10 rounded-sm px-3 py-2 text-white text-sm focus:border-accent-red focus:outline-none">
            <option value="all">Всем участникам</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <div className="flex gap-2">
            <button type="submit" className="bg-accent-red text-white text-sm px-4 py-2 rounded-sm hover:bg-accent-red-hover transition-colors">Отправить</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 text-sm hover:text-white">Отмена</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-surface border border-white/10 rounded-sm p-8 text-center text-gray-400 text-sm">Нет отправленных уведомлений</div>
        ) : (
          notifications
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .slice(0, 20)
            .map((n) => {
              const user = users.find((u) => u.id === n.userId);
              return (
                <div key={n.id} className="bg-surface border border-white/10 rounded-sm p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <span>{n.createdAt}</span>
                    <span>→</span>
                    <span className="text-gray-300">{user?.name || 'Всем'}</span>
                  </div>
                  <div className="text-white text-sm font-medium">{n.title}</div>
                  <div className="text-gray-400 text-xs mt-1">{n.message}</div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
