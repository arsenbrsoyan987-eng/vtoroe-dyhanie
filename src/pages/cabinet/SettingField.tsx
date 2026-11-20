import { useEffect, useState } from 'react';
import { settingsStore, type SettingKey } from '../../store/settingsStore';
import { useToast } from '../../context/ToastContext';
import { fieldClass, labelClass } from '../../components/cabinet/ui';

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

  return (
    <div>
      <label className={labelClass}>{field.label}</label>
      {field.multiline ? (
        <textarea
          className={`${fieldClass} min-h-24 leading-relaxed`}
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
          className={fieldClass}
          value={draft}
          onChange={(e) => {
            setDirty(true);
            setDraft(e.target.value);
          }}
          onBlur={commit}
          disabled={saving}
        />
      )}
      {field.hint && <p className="mt-1.5 text-xs leading-relaxed text-graphite">{field.hint}</p>}
    </div>
  );
}
