import { Link } from 'react-router-dom';
import { CLUB, telHref } from '../../data/club';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center mb-4" aria-label="Второе дыхание — на главную">
              <span className="bg-white rounded-md px-3 py-2 flex items-center">
                <img
                  src="/logo.jpg"
                  alt="Логотип клуба «Второе дыхание»"
                  className="h-16 w-auto object-contain"
                />
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Спортивное сообщество для тех, кто любит бег, велоспорт,
              трейлраннинг, походы и функциональные тренировки.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Навигация
            </h3>
            <ul className="space-y-2">
              {[
                { to: '/directions', label: 'Направления' },
                { to: '/schedule', label: 'Расписание' },
                { to: '/trainers', label: 'Тренеры' },
                { to: '/camps', label: 'Кэмпы' },
                { to: '/events', label: 'Мероприятия' },
                { to: '/routes', label: 'Маршруты' },
                { to: '/news', label: 'Новости' },
                { to: '/results', label: 'Результаты' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Контакты
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="text-gray-500">{CLUB.city}</li>
              {CLUB.phones.map((phone) => (
                <li key={phone}>
                  <a href={telHref(phone)} className="transition-colors hover:text-white">
                    {phone}
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${CLUB.email}`} className="transition-colors hover:text-white">
                  {CLUB.email}
                </a>
              </li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-gray-600">
              {CLUB.addressNote}
            </p>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Мы в соцсетях
            </h3>
            <div className="flex gap-3">
              <a
                href={CLUB.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-sm bg-white/10 text-gray-400 transition-all hover:bg-accent-blue hover:text-white"
                aria-label="Telegram-канал клуба"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              Новости клуба и анонсы тренировок — в{' '}
              <a
                href={CLUB.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-blue hover:underline"
              >
                Telegram
              </a>
              .
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} {CLUB.fullName}. Все права защищены.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-xs text-gray-500 transition-colors hover:text-white">
              Политика конфиденциальности
            </Link>
            <Link to="/cabinet" className="text-xs text-gray-500 transition-colors hover:text-white">
              Личный кабинет
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
