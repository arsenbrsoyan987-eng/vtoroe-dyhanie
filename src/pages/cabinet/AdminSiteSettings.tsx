import { useEffect, useState } from 'react';
import { settingsStore, useSettings, type SettingKey } from '../../store/settingsStore';
import { useToast } from '../../context/ToastContext';

interface Field {
  key: SettingKey;
  label: string;
  hint?: string;
  /** true — поле на несколько строк: абзацы текста или список телефонов */
  multiline?: boolean;
}

const SECTIONS: { key: string; label: string; fields: Field[] }[] = [
  {
    key: 'site',
    label: 'Сайт и поиск',
    fields: [
      { key: 'siteName', label: 'Название школы', hint: 'Добавляется к заголовкам страниц и в og:site_name' },
      { key: 'siteTitle', label: 'Заголовок главной (SEO)', hint: 'До 60 символов' },
      { key: 'siteDescription', label: 'Описание главной (SEO)', multiline: true, hint: 'До 160 символов — его видит поисковик и превью в мессенджерах' },
    ],
  },
  {
    key: 'hero',
    label: 'Первый экран',
    fields: [
      { key: 'heroTitle', label: 'Заголовок', hint: 'Часть после «—» подсвечивается красным' },
      { key: 'heroSubtitle', label: 'Подзаголовок', multiline: true },
    ],
  },
  {
    key: 'about',
    label: 'Блок «О школе»',
    fields: [
      { key: 'aboutTitle', label: 'Заголовок' },
      { key: 'aboutSubtitle', label: 'Надзаголовок (мелкий текст сверху)' },
      { key: 'aboutText1', label: 'Первый абзац', multiline: true },
      { key: 'aboutText2', label: 'Второй абзац', multiline: true },
    ],
  },
  {
    key: 'cta',
    label: 'Приглашение в конце страницы',
    fields: [
      { key: 'ctaTitle', label: 'Заголовок' },
      { key: 'ctaSubtitle', label: 'Текст', multiline: true },
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

/**
 * Одно поле с собственным черновиком.
 *
 * Пока администратор не начал печатать, поле следует за значениями из базы:
 * настройки подтягиваются асинхронно, и без этого форма показалась бы пустой.
 * Как только ввод начат, внешний синхронизатор отключается — иначе realtime
 * -событие от собственной записи затёрло бы несохранённый текст.
 */
function SettingField({ field, value }: { field: Field; value: string }) {
  const { toast } = useToast();
  const [draft, setDraft] = useState(value);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!dirty) setDraft(value);
  }, [value, dirty]);

  const commit = () => {
    setDirty(false);
    if (draft === value) return;
    setSaving(true);
    settingsStore
      .update(field.key, draft)
      .then(() => toast(`«${field.label}» сохранено`))
      .catch(() => toast('Не удалось сохранить — проверьте, что вы администратор', 'error'))
      .finally(() => setSaving(false));
  };

  const cls =
    'w-full rounded-sm border border-white/10 bg-black/30 px-3 py-2 text-sm text-white transition-colors focus:border-accent-red focus:outline-none disabled:opacity-50';

  return (
    <div>
      <label className="mb-1 block text-sm text-gray-400">{field.label}</label>
      {field.multiline ? (
        <textarea
          className={`${cls} min-h-24 leading-relaxed`}
          value={draft}
          onChange={(e) => {
            setDirty(true);
            setDraft(e.target.value);
          }}
          onBlur={commit}
          disabled={saving}
        />
      ) : (
        <input
          className={cls}
          value={draft}
          onChange={(e) => {
            setDirty(true);
            setDraft(e.target.value);
          }}
          onBlur={commit}
          disabled={saving}
        />
      )}
      {field.hint && <p className="mt-1 text-xs text-gray-600">{field.hint}</p>}
    </div>
  );
}

export default function AdminSiteSettings() {
  const settings = useSettings();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold text-white">Настройки сайта</h1>
      <p className="mb-8 text-sm leading-relaxed text-gray-400">
        Тексты, контакты и данные для поисковиков. Значение сохраняется, когда вы
        уходите из поля, и сразу становится видно всем посетителям.
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