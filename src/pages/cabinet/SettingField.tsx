import { useEffect, useState } from 'react';
import { settingsStore, type SettingKey } from '../../store/settingsStore';
import { useToast } from '../../context/ToastContext';

export interface Field {
  key: SettingKey;
  label: string;
  hint?: string;
  /** true — поле на несколько строк: абзацы текста или список URL */
  multiline?: boolean;
}

/**
 * Одно поле настройки с собственным черновиком.
 *
 * Пока администратор не начал печатать, поле следует за значениями из базы:
 * настройки подтягиваются асинхронно, и без этого форма показалась бы пустой.
 * Как только ввод начат, внешний синхронизатор отключается — иначе realtime
 * -событие от собственной записи затёрло бы несохранённый текст.
 */
export default function SettingField({ field, value }: { field: Field; value: string }) {
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
