import SettingField, { type Field } from './SettingField';
import { useSettings } from '../../store/settingsStore';

/**
 * Текстовые настройки сайта.
 *
 * Тексты секций главной и внешний вид живут в разделе «Внешний вид» —
 * здесь только SEO, контакты и данные для политики конфиденциальности.
 */
const SECTIONS: { key: string; label: string; fields: Field[] }[] = [
  {
    key: 'site',
    label: 'Сайт и поиск',
    fields: [
      { key: 'siteName', label: 'Название школы', hint: 'Добавляется к заголовкам страниц и в og:site_name' },
      { key: 'siteTitle', label: 'Заголовок главной (SEO)', hint: 'До 60 символов' },
      { key: 'siteDescription', label: 'Описание главной (SEO)', multiline: true, hint: 'До 160 символов — его видит поисковик и превью в мессенджерах' },
      { key: 'ogImage', label: 'Превью для соцсетей', hint: 'Картинка 1200×630, которую видят при пересылке ссылки. Пусто — штатная' },
    ],
  },
  {
    key: 'contacts',
    label: 'Контакты',
    fields: [
      { key: 'fullName', label: 'Полное название', hint: 'Например: Спортивная школа «Второе дыхание» — футер и политика' },
      { key: 'city', label: 'Город' },
      { key: 'phones', label: 'Телефоны', multiline: true, hint: 'По одному номеру в строке' },
      { key: 'email', label: 'Электронная почта' },
      { key: 'telegram', label: 'Ссылка на Telegram' },
      { key: 'telegramLabel', label: 'Имя канала' },
      { key: 'addressNote', label: 'Примечание о месте тренировок', multiline: true },
    ],
  },
  {
    key: 'owner',
    label: 'Владелец (для политики конфиденциальности)',
    fields: [
      { key: 'ownerName', label: 'Имя' },
      { key: 'ownerRole', label: 'Должность' },
      { key: 'ownerEmail', label: 'Почта' },
      { key: 'ownerPhone', label: 'Телефон' },
    ],
  },
];

export default function AdminSiteSettings() {
  const settings = useSettings();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold text-white">Настройки сайта</h1>
      <p className="mb-8 text-sm leading-relaxed text-gray-400">
        Данные для поисковиков, контакты и сведения для политики
        конфиденциальности. Значение сохраняется, когда вы уходите из поля, и
        сразу становится видно всем посетителям.
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
