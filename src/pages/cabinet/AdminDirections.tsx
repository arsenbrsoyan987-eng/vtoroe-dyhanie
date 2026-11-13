import { useState } from 'react';
import { useDirections, directionsStore } from '../../store/directionsStore';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';

export default function AdminDirections() {
  const directions = useDirections();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
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
  });

  const resetForm = () => {
    setForm({
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
    });
    setEditingId(null);
    setOpen(false);
  };

  const openForm = (dir?: typeof directions[0]) => {
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
      resetForm();
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
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-white">Направления</h1>
          <p className="text-sm text-gray-400">
            {directions.length} направлений — редактируются из админки
          </p>
        </div>
        <Button onClick={() => openForm()} variant="primary">
          + Добавить
        </Button>
      </div>

      {/* Список направлений */}
      <div className="space-y-4">
        {directions.map((dir) => (
          <div key={dir.id} className="bg-surface border border-white/10 rounded-sm p-5 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{dir.icon}</span>
                <h3 className="text-white font-bold text-lg">{dir.name}</h3>
              </div>
              <p className="text-gray-400 text-sm mb-1">{dir.description}</p>
              <p className="text-gray-500 text-xs">
                {dir.suitableFor.length} категорий · {dir.requiredEquipment.length} снаряжения
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button onClick={() => openForm(dir)} variant="outline" size="sm">
                Изменить
              </Button>
              <Button onClick={() => remove(dir.id, dir.name)} variant="outline" size="sm">
                Удалить
              </Button>
            </div>
          </div>
        ))}
        {directions.length === 0 && (
          <p className="text-center text-gray-500 mt-8">Нет направлений — добавьте первое</p>
        )}
      </div>

      {/* Форма */}
      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-start justify-center pt-10 pb-10 px-4 overflow-y-auto z-50">
          <div className="bg-surface border border-white/10 rounded-sm p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingId ? 'Редактировать' : 'Добавить'} направление
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Название *</label>
                <input
                  className="w-full bg-black/30 border border-white/10 rounded-sm px-3 py-2 text-white"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Лыжные гонки"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Короткое название</label>
                <input
                  className="w-full bg-black/30 border border-white/10 rounded-sm px-3 py-2 text-white"
                  value={form.nameShort}
                  onChange={(e) => setForm({ ...form, nameShort: e.target.value })}
                  placeholder="Лыжи"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Иконка (emoji)</label>
                <input
                  className="w-full bg-black/30 border border-white/10 rounded-sm px-3 py-2 text-white"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="⛷️"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">URL фото</label>
                <input
                  className="w-full bg-black/30 border border-white/10 rounded-sm px-3 py-2 text-white"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="/images/ski.jpg"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Краткое описание</label>
                <textarea
                  className="w-full bg-black/30 border border-white/10 rounded-sm px-3 py-2 text-white h-20"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Краткое описание для карточки"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Полное описание (слитно)</label>
                <textarea
                  className="w-full bg-black/30 border border-white/10 rounded-sm px-3 py-2 text-white h-32"
                  value={form.fullDescription}
                  onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
                  placeholder="Полное описание направления"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Подходит для (каждая с новой строки)</label>
                <textarea
                  className="w-full bg-black/30 border border-white/10 rounded-sm px-3 py-2 text-white h-20"
                  value={form.suitableFor}
                  onChange={(e) => setForm({ ...form, suitableFor: e.target.value })}
                  placeholder="Лыжники-любители&#10;Переходящие с бега"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Снаряжение (каждая с новой строки)</label>
                <textarea
                  className="w-full bg-black/30 border border-white/10 rounded-sm px-3 py-2 text-white h-20"
                  value={form.requiredEquipment}
                  onChange={(e) => setForm({ ...form, requiredEquipment: e.target.value })}
                  placeholder="Лыжи и палки&#10;Лыжный костюм"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Уровень</label>
                <input
                  className="w-full bg-black/30 border border-white/10 rounded-sm px-3 py-2 text-white"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  placeholder="Все уровни"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={save} variant="primary" className="flex-1">
                  {editingId ? 'Сохранить' : 'Создать'}
                </Button>
                <Button onClick={resetForm} variant="outline" className="flex-1">
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}