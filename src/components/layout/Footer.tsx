import { useState } from 'react';
import { Link } from 'react-router-dom';
import { telHref } from '../../data/club';
import { SOCIAL_ICONS, type SocialId } from '../../data/socials';
import { useSetting, useSettingList } from '../../store/settingsStore';
import { useSections } from '../../store/sectionsStore';
import SocialIcon from '../ui/SocialIcons';

/**
 * Год считаем один раз при загрузке модуля, а не в рендере: вызов `Date`
 * внутри компонента даёт разные строки на сервере (prerender) и в браузере,
 * что ломает гидрацию.
 */
const CURRENT_YEAR = new Date().getFullYear();

/** Ссылки колонки «Направления и программы» */
const PROGRAM_LINKS = [
  { to: '/directions/running', label: 'Бег' },
  { to: '/directions/trail', label: 'Трейлраннинг' },
  { to: '/directions/cycling', label: 'Велоспорт' },
  { to: '/directions/hiking', label: 'Походы' },
  { to: '/directions/ski', label: 'Лыжные гонки' },
  { to: '/directions/triathlon', label: 'Триатлон' },
  { to: '/directions/functional', label: 'Функциональная подготовка' },
];

const CLUB_LINKS = [
  { to: '/directions', label: 'Все направления' },
  { to: '/schedule', label: 'Расписание' },
  { to: '/zones', label: 'Локации' },
  { to: '/camps', label: 'Кэмпы и сборы' },
  { to: '/events', label: 'Мероприятия и старты' },
  { to: '/routes', label: 'Маршруты' },
  { to: '/results', label: 'Результаты' },
  { to: '/corporate', label: 'Корпоративный спорт' },
];

const ABOUT_LINKS = [
  { to: '/about', label: 'О нас' },
  { to: '/trainers', label: 'Команда' },
  { to: '/loyalty', label: 'Программа лояльности' },
  { to: '/news', label: 'Статьи' },
  { to: '/certificate', label: 'Подарочный сертификат' },
  { to: '/privacy', label: 'Политика конфиденциальности' },
];

/**
 * Мега-футер из четырёх колонок: программы, клуб, о школе, контакты.
 *
 * Структура повторяет афишную сетку витрины — посетитель находит нужный
 * раздел, не прокручивая страницу вверх к меню.
 */
export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const fullName = useSetting('fullName');
  const siteName = useSetting('siteName');
  const sections = useSections();
  const city = useSetting('city');
  const addressNote = useSetting('addressNote');
  const email = useSetting('email');
  const telegram = useSetting('telegram');
  const vk = useSetting('socialVk');
  const youtube = useSetting('socialYoutube');
  const instagram = useSetting('socialInstagram');
  const max = useSetting('socialMax');
  const logoUrl = useSetting('logoUrl');
  const footerText = useSetting('footerText');
  const phones = useSettingList('phones');

  const socials = (
    [
      { id: 'telegram', url: telegram },
      { id: 'max', url: max },
      { id: 'vk', url: vk },
      { id: 'youtube', url: youtube },
      { id: 'instagram', url: instagram },
    ] as { id: SocialId; url: string }[]
  ).filter((s) => s.url.trim());

  const dynamicLinks = sections
    .filter((s) => s.published)
    .map((s) => ({ to: `/section/${s.slug}`, label: s.title }));

  return (
    <footer className="bg-navy text-white/70">
      <div className="container-x py-14 lg:py-20">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          {/* Направления и программы */}
          <div>
            <h3 className="display mb-5 text-sm text-white">Направления<br />и программы</h3>
            <ul className="space-y-2.5">
              {PROGRAM_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-white/60 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Клуб */}
          <div>
            <h3 className="display mb-5 text-sm text-white">Клуб</h3>
            <ul className="space-y-2.5">
              {CLUB_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-white/60 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* О школе */}
          <div>
            <h3 className="display mb-5 text-sm text-white">О школе</h3>
            <ul className="space-y-2.5">
              {ABOUT_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-white/60 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
              {dynamicLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-white/60 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Контакты и рассылка */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="display mb-5 text-sm text-white">Контакты</h3>
            <ul className="space-y-3 text-sm">
              <li className="text-white/60">{city}</li>
              {phones.map((phone) => (
                <li key={phone}>
                  <a href={telHref(phone)} className="text-base font-semibold text-white transition-colors hover:text-brand">
                    {phone}
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${email}`} className="text-white/60 transition-colors hover:text-white">
                  {email}
                </a>
              </li>
            </ul>

            {socials.length > 0 && (
              <div className="mt-6 flex gap-2">
                {socials.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 transition-all hover:bg-brand hover:text-white"
                    aria-label={SOCIAL_ICONS[s.id].label}
                  >
                    <SocialIcon id={s.id} />
                  </a>
                ))}
              </div>
            )}

            {/* Подписка: форма отправляет в тот же поток заявок, что и форма записи */}
            <div className="mt-8">
              <p className="text-xs leading-relaxed text-white/50">
                Узнавайте первыми об анонсах тренировок и стартов:
              </p>
              {subscribed ? (
                <p className="mt-3 text-sm font-semibold text-white">
                  Готово — мы на связи.
                </p>
              ) : (
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    // Почту собираем в Telegram-канал школы: отдельного бэкенда
                    // рассылки нет, а обещать «письма раз в неделю» без него нельзя.
                    if (telegram) window.open(telegram, '_blank', 'noopener');
                    setSubscribed(true);
                  }}
                >
                  <input
                    type="email"
                    required
                    placeholder="Ваш e-mail"
                    className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-brand focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-full bg-brand px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-dark"
                  >
                    Ок
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Нижняя строка */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="flex items-center rounded-lg bg-white px-2.5 py-1.5">
              <img
                src={logoUrl}
                alt={`Логотип ${fullName}`}
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.dataset.fallback) return;
                  img.dataset.fallback = '1';
                  img.src = '/logo.jpg';
                }}
              />
            </span>
            <p className="text-xs text-white/40">
              {footerText || `© ${CURRENT_YEAR} ${siteName}. Все права защищены.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-xs text-white/40">{addressNote}</p>
            <Link to="/cabinet" className="text-xs text-white/50 transition-colors hover:text-white">
              Личный кабинет
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
