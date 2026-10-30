import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTrainings } from '../../store/trainingsStore';
import {
  addTrainingPhoto,
  removeTrainingPhoto,
  useTrainingPhotos,
} from '../../store/trainingPhotosStore';
import { deleteStorageFile } from '../../lib/upload';
import { visibleTrainings } from '../../lib/access';
import { formatDate, isPastDate } from '../../lib/date';
import PhotoUploader from '../../components/ui/PhotoUploader';
import { Camera, Trash2 } from 'lucide-react';

/**
 * Фотографии тренировок: тренер выбирает своё занятие и загружает снимки.
 * Права проверяет база — в списке и так только свои тренировки.
 */
export default function TrainerPhotos() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const trainings = useTrainings();
  const photos = useTrainingPhotos();

  const mine = useMemo(() => {
    const list = visibleTrainings(trainings, currentUser);
    // Сначала прошедшие: фото делают после занятия
    return [...list].sort((a, b) => {
      const pastA = isPastDate(a.date) ? 0 : 1;
      const pastB = isPastDate(b.date) ? 0 : 1;
      if (pastA !== pastB) return pastA - pastB;
      return (b.date + b.time).localeCompare(a.date + a.time);
    });
  }, [trainings, currentUser]);

  const [selected, setSelected] = useState<string>('');
  const activeId = selected || mine[0]?.id || '';
  const active = mine.find((t) => t.id === activeId);
  const gallery = photos.filter((p) => p.trainingId === activeId);

  const handleUploaded = async (url: string) => {
    if (!currentUser || !activeId) return;
    await addTrainingPhoto({
      trainingId: activeId,
      url,
      authorId: currentUser.id,
      authorName: currentUser.name,
    });
  };

  const remove = async (id: string, url: string) => {
    try {
      await removeTrainingPhoto(id);
      await deleteStorageFile(url);
      toast('Фото удалено', 'info');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Не удалось удалить фото', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-white">Фото тренировок</h1>
        <p className="text-sm text-gray-400">
          {photos.filter((p) => mine.some((t) => t.id === p.trainingId)).length} фото · сразу
          появляются в галерее на странице тренировки
        </p>
      </div>

      {mine.length === 0 ? (
        <div className="rounded-sm border border-white/10 bg-surface p-8 text-center text-sm text-gray-400">
          За вами пока не закреплено тренировок. Обратитесь к администратору клуба.
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label
              htmlFor="photo-training"
              className="mb-1.5 block text-xs uppercase tracking-wider text-gray-400"
            >
              Тренировка
            </label>
            <select
              id="photo-training"
              value={activeId}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full rounded-sm border border-white/10 bg-primary px-3 py-2.5 text-sm text-white focus:border-accent-red focus:outline-none"
            >
              {mine.map((t) => (
                <option key={t.id} value={t.id}>
                  {formatDate(t.date, false)} · {t.name}
                  {isPastDate(t.date) ? ' (прошла)' : ''}
                </option>
              ))}
            </select>
            {active && (
              <p className="mt-2 text-xs text-gray-500">
                {active.directionName} · {active.location} · фото видно всем посетителям
              </p>
            )}
          </div>

          <div className="mb-8">
            <PhotoUploader trainingId={activeId} onUploaded={handleUploaded} />
          </div>

          {gallery.length === 0 ? (
            <div className="rounded-sm border border-white/10 bg-surface p-8 text-center">
              <Camera className="mx-auto mb-3 h-6 w-6 text-gray-600" />
              <p className="text-sm text-gray-400">
                Для этой тренировки фото ещё нет. Загрузите первые — они появятся
                в галерее на сайте.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gallery.map((photo) => (
                <figure
                  key={photo.id}
                  className="group relative overflow-hidden rounded-sm border border-white/10 bg-surface"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Фото тренировки'}
                    className="aspect-[4/3] w-full object-cover"
                    loading="lazy"
                  />
                  <button
                    onClick={() => void remove(photo.id, photo.url)}
                    className="absolute right-2 top-2 rounded-sm bg-black/70 p-1.5 text-gray-300 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Удалить фото"
                    title="Удалить"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  {photo.authorName && (
                    <figcaption className="px-3 py-1.5 text-[10px] text-gray-500">
                      {photo.authorName}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
