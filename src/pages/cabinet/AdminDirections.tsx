import { useState } from 'react';
import { useDirections, directionsStore } from '../../store/directionsStore';
import { useToast } from '../../context/ToastContext';
import {
  ActionButton,
  EmptyState,
  PageHeader,
  Panel,
  PanelTitle,
  fieldClass,
  labelClass,
} from '../../components/cabinet/ui';
import { countNoun } from '../../lib/plural';
import { X } from 'lucide-react';

const EMPTY_FORM = {
  id: '',
  name: '',
  nameShort: '',
  description: '',
  fullDescription: '',
  icon: '',
  imageUrl: '',
  suitableFor: '',
  requiredEquipment: '',
  level: '',
};

export default function AdminDirections() {
  const directions = useDirections();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setOpen(false);
  };

  const openForm = (dir?: (typeof directions)[0]) => {
    if (dir) {
      setForm({
        id: dir.id,
        name: dir.name,
        nameShort: dir.nameShort,
        description: dir.description,
        fullDescription: dir.fullDescription,
        icon: dir.icon,
        imageUrl: dir.imageUrl,
        suitableFor: dir.suitableFor.join('\n'),
        requiredEquipment: dir.requiredEquipment.join('\n'),
        level: dir.level,
      });
      setEditingId(dir.id);
    } else {
      setForm(EMPTY_FORM);
      setEditingId(null);
    }
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast('Укажите название направления', 'error');
      return;
    }

    const payload = {
      id: editingId || `dir-${Date.now()}`,
      name: form.name.trim(),
      nameShort: form.nameShort.trim() || form.name.trim(),
      description: form.description.trim(),
      fullDescription: form.fullDescription.trim(),
      icon: form.icon.trim() || '🏃',
      imageUrl: form.imageUrl.trim() || '/images/running.jpg',
      suitableFor: form.suitableFor.split('\n').map((s) => s.trim()).filter(Boolean),
      requiredEquipment: form.requiredEquipment.split('\n').map((s) => s.trim()).filter(Boolean),
      level: form.level.trim() || 'Все уровни',
    };

    try {
      if (editingId) {
        await directionsStore.update(editingId, payload);
        toast('Направление обновлено');
      } else {
        await directionsStore.add(payload);
        toast(`Направление создано: ${payload.name}`);
      }
      resetForm();
    } catch (err) {
      toast('Ошибка сохранения', 'error');
      console.error(err);
    }
  };

  const remove = async (id: string, name: string) => {
    if (!window.confirm(`Удалить «${name}»?`)) return;
    try {
      await directionsStore.remove(id);
      toast('Направление удалено', 'info');
    } catch (err) {
      toast('Ошибка удаления', 'error');
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Контент сайта"
        title="Направления"
        subtitle={`${countNoun(directions.length, 'направление', 'направления', 'направлений')} — карточки на главной и страницы направлений строятся из этих данных.`}
        actions={
          <ActionButton onClick={() => (open ? resetForm() : openForm())} variant={open ? 'outline' : 'primary'}>
            {open ? (
              <>
                <X className="h-3.5 w-3.5" /> Отмена
              </>
            ) : (
              '+ Добавить'
            )}
          </ActionButton>
        }
      />

      {open && (
        <Panel className="mb-5">
          <PanelTitle hint="Название и описание видны на сайте сразу после сохранения.">
            {editingId ? 'Редактирование направления' : 'Новое направление'}
          </PanelTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="d-name" className={labelClass}>
                Название *
              </label>
              <input
                id="d-name"
                className={fieldClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Лыжные гонки"
              />
            </div>
            <div>
              <label htmlFor="d-short" className={labelClass}>
                Короткое название
              </label>
              <input
                id="d-short"
                className={fieldClass}
                value={form.nameShort}
                onChange={(e) => setForm({ ...form, nameShort: e.target.value })}
                placeholder="Лыжи"
              />
            </div>
            <div>
              <label htmlFor="d-icon" className={labelClass}>
                Иконка (emoji)
              </label>
              <input
                id="d-icon"
                className={fieldClass}
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="⛷️"
              />
            </div>
            <div>
              <label htmlFor="d-image" className={labelClass}>
                URL фото
              </label>
              <input
                id="d-image"
                className={fieldClass}
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="/images/ski.jpg"
              />
            </div>
            <div>
              <label htmlFor="d-level" className={labelClass}>
                Уровень
              </label>
              <input
                id="d-level"
                className={fieldClass}
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                placeholder="Все уровни"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="d-desc" className={labelClass}>
                Краткое описание
              </label>
              <textarea
                id="d-desc"
                className={`${fieldClass} min-h-20 resize-none`}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Одна фраза для карточки на главной"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="d-full" className={labelClass}>
                Полное описание
              </label>
              <textarea
                id="d-full"
                className={`${fieldClass} min-h-32 resize-none`}
                value={form.fullDescription}
                onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
                placeholder="Текст для страницы направления"
              />
            </div>
            <div>
              <label htmlFor="d-suitable" className={labelClass}>
                Подходит для (по строке)
              </label>
              <textarea
                id="d-suitable"
                className={`${fieldClass} min-h-20 resize-none`}
                value={form.suitableFor}
                onChange={(e) => setForm({ ...form, suitableFor: e.target.value })}
                placeholder="Лыжники-любители&#10;Переходящие с бега"
              />
            </div>
            <div>
              <label htmlFor="d-equipment" className={labelClass}>
                Снаряжение (по строке)
              </label>
              <textarea
                id="d-equipment"
                className={`${fieldClass} min-h-20 resize-none`}
                value={form.requiredEquipment}
                onChange={(e) => setForm({ ...form, requiredEquipment: e.target.value })}
                placeholder="Лыжи и палки&#10;Лыжный костюм"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <ActionButton onClick={save}>{editingId ? 'Сохранить' : 'Создать'}</ActionButton>
            <ActionButton onClick={resetForm} variant="ghost">
              Отмена
            </ActionButton>
          </div>
        </Panel>
      )}

      {directions.length === 0 ? (
        <EmptyState
          title="Направлений пока нет"
          text="Добавьте первое — карточка сразу появится на главной и в расписании."
          action={<ActionButton onClick={() => openForm()}>Добавить направление</ActionButton>}
        />
      ) : (
        <div className="space-y-2.5">
          {directions.map((dir) => (
            <Panel key={dir.id} className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center gap-2.5">
                  <span className="text-xl">{dir.icon}</span>
                  <h3 className="text-base font-bold text-ink">{dir.name}</h3>
                  <span className="text-[0.62rem] uppercase tracking-[0.08em] text-graphite">
                    {dir.level}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-graphite">{dir.description}</p>
                <p className="mt-1 text-[0.68rem] text-graphite">
                  {countNoun(dir.suitableFor.length, 'категория', 'категории', 'категорий')} ·{' '}
                  {countNoun(dir.requiredEquipment.length, 'снаряжение', 'снаряжения', 'снаряжений')}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <ActionButton onClick={() => openForm(dir)} variant="outline">
                  Изменить
                </ActionButton>
                <ActionButton onClick={() => remove(dir.id, dir.name)} variant="danger">
                  Удалить
                </ActionButton>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
