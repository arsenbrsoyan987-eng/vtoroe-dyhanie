import SectionTitle from '../components/ui/SectionTitle';
import Button from '../components/ui/Button';
import { useTrainings } from '../store/trainingsStore';

export default function CabinetPage() {
  const trainings = useTrainings();
  const upcomingTrainings = trainings.slice(0, 3);

  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle subtitle="Клуб" title="О клубе «Второе дыхание»" align="center" />

        {/* Info blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-surface border border-white/10 rounded-sm p-8">
            <h3 className="text-white text-xl font-bold mb-4">📍 Контакты</h3>
            <div className="space-y-3 text-gray-300 text-sm">
              <p>[Адрес клуба: город, улица, дом]</p>
              <p>📞 [Телефон]</p>
              <p>✉️ [email@club.ru]</p>
              <p className="pt-2">
                <a href="https://t.me/" className="text-accent-blue hover:underline" target="_blank" rel="noopener noreferrer">
                  Telegram-канал клуба
                </a>
              </p>
            </div>
          </div>

          <div className="bg-surface border border-white/10 rounded-sm p-8">
            <h3 className="text-white text-xl font-bold mb-4">📅 Ближайшие тренировки</h3>
            <div className="space-y-3">
              {upcomingTrainings.map((t) => (
                <div key={t.id} className="flex justify-between items-center text-sm">
                  <div>
                    <div className="text-white font-medium">{t.name}</div>
                    <div className="text-gray-400 text-xs">
                      {new Date(t.date).toLocaleDateString('ru-RU')} · {t.time}
                    </div>
                  </div>
                  <Button to="/schedule" variant="blue" size="sm">
                    Расписание
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-white/10 rounded-sm p-8">
            <h3 className="text-white text-xl font-bold mb-4">🏆 Наши направления</h3>
            <div className="space-y-2">
              {['Бег', 'Трейлраннинг', 'Велоспорт', 'Походы', 'Функциональная подготовка'].map((dir) => (
                <div key={dir} className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">{dir}</span>
                  <Button to="/directions" variant="outline" size="sm">
                    Подробнее
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-white/10 rounded-sm p-8">
            <h3 className="text-white text-xl font-bold mb-4">📰 Новости и результаты</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Последние новости</span>
                <Button to="/news" variant="outline" size="sm">
                  Читать
                </Button>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-300">Результаты соревнований</span>
                <Button to="/results" variant="outline" size="sm">
                  Смотреть
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-accent-red/20 to-accent-blue/20 border border-white/10 rounded-sm p-8 text-center">
          <h3 className="text-white text-2xl font-bold mb-3">Хотите присоединиться?</h3>
          <p className="text-gray-300 mb-6">
            Первое занятие — бесплатно. Просто приходите на ближайшую тренировку!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button to="/schedule" variant="primary" size="lg">
              Записаться на тренировку
            </Button>
            <Button to="/directions" variant="outline" size="lg">
              Выбрать направление
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
