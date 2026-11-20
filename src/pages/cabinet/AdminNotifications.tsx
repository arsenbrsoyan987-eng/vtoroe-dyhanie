import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProfiles } from '../../store/profilesStore';
import { activeProfiles } from '../../store/profilesStore';
import {
  ActionButton,
  EmptyState,
  PageHeader,
  Panel,
  PanelTitle,
  fieldClass,
  labelClass,
} from '../../components/cabinet/ui';

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

  const feed = [...notifications]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Люди"
        title="Рассылки"
        subtitle="Сообщения появляются в кабинете спортсмена и тренера сразу после отправки."
        actions={
          <ActionButton onClick={() => setShowForm((v) => !v)} variant={showForm ? 'outline' : 'primary'}>
            {showForm ? 'Отмена' : '+ Создать уведомление'}
          </ActionButton>
        }
      />

      {showForm && (
        <Panel className="mb-5">
          <PanelTitle hint="Выберите «Всем участникам», чтобы разослать сообщение по всей школе.">
            Новое уведомление
          </PanelTitle>
          <form onSubmit={handleSend} className="space-y-3">
            <div>
              <label htmlFor="n-title" className={labelClass}>
                Заголовок
              </label>
              <input
                id="n-title"
                placeholder="Например: перенос тренировки"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label htmlFor="n-message" className={labelClass}>
                Сообщение
              </label>
              <textarea
                id="n-message"
                placeholder="Что нужно знать участникам"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={3}
                className={`${fieldClass} resize-none`}
                required
              />
            </div>
            <div>
              <label htmlFor="n-user" className={labelClass}>
                Получатель
              </label>
              <select
                id="n-user"
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                className={fieldClass}
              >
                <option value="all">Всем участникам</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <ActionButton type="submit">Отправить</ActionButton>
          </form>
        </Panel>
      )}

      <Panel>
        <PanelTitle hint="Последние 20 сообщений — от новых к старым.">История</PanelTitle>
        {feed.length === 0 ? (
          <EmptyState
            title="Уведомлений ещё не было"
            text="Создайте первое сообщение — оно появится в кабинетах участников."
          />
        ) : (
          <ul className="space-y-2.5">
            {feed.map((n) => {
              const user = users.find((u) => u.id === n.userId);
              return (
                <li key={n.id} className="rounded-xl border border-line bg-mist/50 p-4">
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-[0.68rem] text-graphite">
                    <span>{n.createdAt}</span>
                    <span aria-hidden>→</span>
                    <span className="font-semibold text-ink">{user?.name || 'Всем'}</span>
                  </div>
                  <p className="text-sm font-bold text-ink">{n.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-graphite">{n.message}</p>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}