import SettingField, { type Field } from './SettingField';
import { useSettings } from '../../store/settingsStore';

const SECTIONS: { key: string; label: string; fields: Field[] }[] = [
  {
    key: 'logo',
    label: 'Логотип',
    fields: [
      { key: 'logoUrl', label: 'URL логотипа', hint: 'Прямая ссылка на изображение логотипа (120×40 или 200×60px)' },
      { key: 'logoAlt', label: 'Описание логотипа', hint: 'Альтернативный текст для поисковиков' },
    ],
  },
  {
    key: 'colors',
    label: 'Цвета сайта',
    fields: [
      { key: 'accentColor', label: 'Основной акцент', hint: 'Цвет кнопок, заголовков, ссылок. HEX: #dc2626' },
      { key: 'accentBlue', label: 'Вторичный акцент', hint: 'Цвет вторичных элементов, ссылок' },
      { key: 'primaryColor', label: 'Фон страницы', hint: 'Основной цвет фона сайта' },
      { key: 'secondaryColor', label: 'Фон секций', hint: 'Фон чётных секций главной' },
      { key: 'surfaceColor', label: 'Фон карточек', hint: 'Фон карточек, модалок, сайдбаров' },
    ],
  },
  {
    key: 'social',
    label: 'Социальные сети',
    fields: [
      { key: 'socialVk', label: 'ВКонтакте', hint: 'https://vk.com/yourgroup' },
      { key: 'socialYoutube', label: 'YouTube', hint: 'https://youtube.com/@yourchannel' },
      { key: 'socialInstagram', label: 'Instagram', hint: 'https://instagram.com/yourprofile' },
    ],
  },
  {
    key: 'hero',
    label: 'Первый экран',
    fields: [
      { key: 'heroTitle', label: 'Заголовок', hint: 'Часть после «—» подсвечивается акцентом' },
      { key: 'heroSubtitle', label: 'Подзаголовок', multiline: true },
      { key: 'heroBackground', label: 'URL фона', hint: 'Большое фоновое изображение для hero-секции' },
    ],
  },
  {
    key: 'about',
    label: 'Блок «О школе»',
    fields: [
      { key: 'aboutTitle', label: 'Заголовок' },
      { key: 'aboutSubtitle', label: 'Надзаголовок' },
      { key: 'aboutText1', label: 'Первый абзац', multiline: true },
      { key: 'aboutText2', label: 'Второй абзац', multiline: true },
      { key: 'aboutImage', label: 'URL фото', hint: 'Картинка рядом с текстом' },
    ],
  },
  {
    key: 'cta',
    label: 'Призыв к действию (внизу)',
    fields: [
      { key: 'ctaTitle', label: 'Заголовок' },
      { key: 'ctaSubtitle', label: 'Текст', multiline: true },
      { key: 'ctaBackground', label: 'URL фона', hint: 'Фоновое изображение для CTA-секции' },
    ],
  },
  {
    key: 'gallery',
    label: 'Галерея на главной',
    fields: [
      { key: 'galleryImages', label: 'Изображения', multiline: true, hint: 'Один URL на строку. Удалите строку — фото исчезнет.' },
    ],
  },
  {
    key: 'testimonials',
    label: 'Отзывы',
    fields: [
      { key: 'testimonialsTitle', label: 'Заголовок секции' },
      { key: 'testimonialsSubtitle', label: 'Подзаголовок' },
    ],
  },
  {
    key: 'footer',
    label: 'Подвал сайта',
    fields: [
      { key: 'footerText', label: 'Текст копирайта', hint: '© 2026 Спортивная школа «Второе дыхание»' },
    ],
  },
];

export default function AdminAppearance() {
  const settings = useSettings();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold text-white">Внешний вид</h1>
      <p className="mb-8 text-sm leading-relaxed text-gray-400">
        Логотип, цвета, соцсети, тексты секций. Изменения применяются мгновенно
        и видны всем посетителям.
      </p>

      {SECTIONS.map((section) => (
        <div key={section.key} className="mb-8 rounded-sm border border-white/10 bg-surface p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">{section.label}</h2>
          <div className="space-y-4">
            {section.fields.map((field) => (
              <SettingField key={field.key} field={field} value={settings[field.key] ?? ''} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}