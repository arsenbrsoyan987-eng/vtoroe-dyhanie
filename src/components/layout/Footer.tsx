import { Link } from 'react-router-dom';
import { telHref } from '../../data/club';
import { useSetting, useSettingList } from '../../store/settingsStore';

/** SVG-иконки соцсетей: показываем только те, ссылку на которые заполнили в админке */
const SOCIAL_ICONS: Record<string, { path: string; label: string }> = {
  telegram: {
    label: 'Telegram-канал школы',
    path: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z',
  },
  vk: {
    label: 'Сообщество ВКонтакте',
    path: 'M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.576-1.496c.588-.19 1.341 1.26 2.14 1.818.605.422 1.064.33 1.064.33l2.137-.03s1.117-.071.587-.964c-.043-.073-.308-.661-1.588-1.87-1.34-1.264-1.16-1.059.454-3.246.983-1.332 1.376-2.145 1.253-2.493-.117-.332-.84-.244-.84-.244l-2.406.015s-.178-.025-.31.056c-.13.079-.212.262-.212.262s-.382 1.03-.89 1.907c-1.07 1.85-1.499 1.948-1.674 1.832-.407-.267-.305-1.075-.305-1.648 0-1.793.267-2.54-.521-2.733-.262-.065-.454-.107-1.123-.114-.858-.009-1.585.003-1.996.208-.274.136-.485.44-.356.457.159.022.519.099.71.363.246.341.237 1.107.237 1.107s.142 2.11-.33 2.371c-.325.18-.77-.187-1.725-1.865-.489-.859-.859-1.81-.859-1.81s-.07-.176-.198-.272c-.154-.115-.37-.151-.37-.151l-2.286.015s-.343.01-.469.161C3.94 7.721 4.043 8 4.043 8s1.79 4.258 3.817 6.403c1.858 1.967 3.968 1.838 3.968 1.838h.957z',
  },
  youtube: {
    label: 'YouTube-канал школы',
    path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
  instagram: {
    label: 'Страница в Instagram',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z',
  },
};

export default function Footer() {
  const fullName = useSetting('fullName');
  const city = useSetting('city');
  const addressNote = useSetting('addressNote');
  const email = useSetting('email');
  const telegram = useSetting('telegram');
  const vk = useSetting('socialVk');
  const youtube = useSetting('socialYoutube');
  const instagram = useSetting('socialInstagram');
  const logoUrl = useSetting('logoUrl');
  const footerText = useSetting('footerText');
  const phones = useSettingList('phones');

  const socials = [
    { id: 'telegram', url: telegram },
    { id: 'vk', url: vk },
    { id: 'youtube', url: youtube },
    { id: 'instagram', url: instagram },
  ].filter((s) => s.url.trim());

  return (
    <footer className="bg-surface border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center mb-4" aria-label="Второе дыхание — на главную">
              <span className="bg-white rounded-md px-3 py-2 flex items-center">
                <img
                  src={logoUrl}
                  alt={`Логотип школы «${fullName}»`}
                  className="h-16 w-auto object-contain"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (img.dataset.fallback) return;
                    img.dataset.fallback = '1';
                    img.src = '/logo.jpg';
                  }}
                />
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Спортивная школа для тех, кто любит бег, велоспорт,
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
              <li className="text-gray-500">{city}</li>
              {phones.map((phone) => (
                <li key={phone}>
                  <a href={telHref(phone)} className="transition-colors hover:text-white">
                    {phone}
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${email}`} className="transition-colors hover:text-white">
                  {email}
                </a>
              </li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-gray-600">
              {addressNote}
            </p>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Мы в соцсетях
            </h3>
            <div className="flex gap-3">
              {socials.map((s) => {
                const icon = SOCIAL_ICONS[s.id];
                return (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-sm bg-white/10 text-gray-400 transition-all hover:bg-accent-blue hover:text-white"
                    aria-label={icon.label}
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d={icon.path} />
                    </svg>
                  </a>
                );
              })}
            </div>
            {telegram && (
              <p className="mt-4 text-xs text-gray-500">
                Новости школы и анонсы тренировок — в{' '}
                <a
                  href={telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-blue hover:underline"
                >
                  Telegram
                </a>
                .
              </p>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            {footerText || `© ${new Date().getFullYear()} ${fullName}. Все права защищены.`}
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
