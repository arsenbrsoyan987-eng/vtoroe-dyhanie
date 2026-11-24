import SettingField, { type Field } from './SettingField';
import { useSettings } from '../../store/settingsStore';
import { PageHeader, Panel, PanelTitle } from '../../components/cabinet/ui';

const SECTIONS: { key: string; label: string; hint?: string; fields: Field[] }[] = [
  {
    key: 'logo',
    label: 'Логотип',
    hint: 'Знак в шапке и подвале сайта.',
    fields: [
      { key: 'logoUrl', label: 'URL логотипа', hint: 'Прямая ссылка на изображение логотипа (120×40 или 200×60px)' },
      { key: 'logoAlt', label: 'Описание логотипа', hint: 'Альтернативный текст для поисковиков' },
      { key: 'logoDescriptor', label: 'Дескриптор (слоган)', hint: 'Подпись рядом с логотипом в шапке — повышает узнаваемость бренда. Пусто — скрыть' },
    ],
  },
  {
    key: 'colors',
    label: 'Цвета сайта',
    hint: 'Фон и поверхности заданы дизайн-системой: бумага, серые подложки, графит. Настраиваются только акценты.',
    fields: [
      { key: 'accentColor', label: 'Основной акцент', hint: 'Цвет кнопок и ссылок. HEX: #e2231a' },
      { key: 'accentBlue', label: 'Вторичный акцент', hint: 'Цвет вторичных элементов: тёмно-синий по умолчанию' },
    ],
  },
  {
    key: 'social',
    label: 'Социальные сети',
    fields: [
      { key: 'socialVk', label: 'ВКонтакте', hint: 'https://vk.com/yourgroup' },
      { key: 'socialYoutube', label: 'YouTube', hint: 'https://youtube.com/@yourchannel' },
      { key: 'socialInstagram', label: 'Instagram', hint: 'https://instagram.com/yourprofile' },
      { key: 'socialMax', label: 'Max', hint: 'Ссылка на чат в мессенджере Max' },
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
      {
        key: 'aboutText3',
        label: 'Приоритеты школы',
        multiline: true,
        hint: 'Первая строка — заголовок, каждая следующая — отдельный пункт столбиком',
      },
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
      <PageHeader
        eyebrow="Контент сайта"
        title="Внешний вид"
        subtitle="Логотип, акценты, соцсети и тексты секций главной. Изменения применяются мгновенно и видны всем посетителям."
      />

      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <Panel key={section.key}>
            <PanelTitle hint={section.hint}>{section.label}</PanelTitle>
            <div className="space-y-4">
              {section.fields.map((field) => (
                <SettingField key={field.key} field={field} value={settings[field.key] ?? ''} />
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}