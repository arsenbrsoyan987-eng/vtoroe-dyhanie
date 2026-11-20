import SettingField, { type Field } from './SettingField';
import { useSettings } from '../../store/settingsStore';
import { PageHeader, Panel, PanelTitle } from '../../components/cabinet/ui';

/**
 * Текстовые настройки сайта.
 *
 * Тексты секций главной и внешний вид живут в разделе «Внешний вид» —
 * здесь только SEO, контакты и данные для политики конфиденциальности.
 */
const SECTIONS: { key: string; label: string; hint: string; fields: Field[] }[] = [
  {
    key: 'site',
    label: 'Сайт и поиск',
    hint: 'Заголовок и описание главной попадают в метатеги и превью ссылок.',
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
    hint: 'Показываются в подвале, на странице тренировки и в политике.',
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
    hint: 'Реквизиты оператора персональных данных.',
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
      <PageHeader
        eyebrow="Настройки"
        title="Настройки сайта"
        subtitle="Данные для поисковиков, контакты и сведения для политики конфиденциальности. Значение сохраняется, когда вы уходите из поля, и сразу становится видно всем посетителям."
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
