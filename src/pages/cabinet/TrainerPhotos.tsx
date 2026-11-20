import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTrainings } from '../../store/trainingsStore';
import {
  addTrainingPhoto,
  removeTrainingPhoto,
  useTrainingPhotos,
} from '../../store/trainingPhotosStore';
import { deleteStorageFile, isVideoUrl } from '../../lib/upload';
import { visibleTrainings } from '../../lib/access';
import { formatDate, isPastDate } from '../../lib/date';
import PhotoUploader from '../../components/ui/PhotoUploader';
import { EmptyState, PageHeader, Panel, fieldClass, labelClass } from '../../components/cabinet/ui';
import { Camera, Trash2 } from 'lucide-react';

/**
 * Фото и видео тренировок: тренер выбирает своё занятие и загружает файлы.
 * Права проверяет база — в списке и так только свои тренировки.
 */
export default function TrainerPhotos() {
  const { currentUser, registrations } = useAuth();
  const { toast } = useToast();
  const trainings = useTrainings();
  const photos = useTrainingPhotos();

  const mine = useMemo(() => {
    const list = visibleTrainings(trainings, currentUser, registrations);
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
  const totalMine = photos.filter((p) => mine.some((t) => t.id === p.trainingId)).length;

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
      <PageHeader
        eyebrow="Контент"
        title="Фото и видео тренировок"
        subtitle={`${totalMine} файлов — сразу появляются в галерее на странице тренировки.`}
      />

      {mine.length === 0 ? (
        <EmptyState
          title="Тренировок пока нет"
          text="За вами не закреплено занятий. Обратитесь к администратору школы — он ведёт расписание."
        />
      ) : (
        <>
          <Panel className="mb-4">
            <label htmlFor="photo-training" className={labelClass}>
              Тренировка
            </label>
            <select
              id="photo-training"
              value={activeId}
              onChange={(e) => setSelected(e.target.value)}
              className={fieldClass}
            >
              {mine.map((t) => (
                <option key={t.id} value={t.id}>
                  {formatDate(t.date, false)} · {t.name}
                  {isPastDate(t.date) ? ' (прошла)' : ''}
                </option>
              ))}
            </select>
            {active && (
              <p className="mt-2 text-xs text-graphite">
                {active.directionName} · {active.location} · файлы видит любой посетитель сайта
              </p>
            )}
            <div className="mt-4">
              <PhotoUploader trainingId={activeId} onUploaded={handleUploaded} />
            </div>
          </Panel>

          {gallery.length === 0 ? (
            <EmptyState
              title="Файлов пока нет"
              text="Загрузите первые фото или видео — они появятся в галерее на странице тренировки."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gallery.map((photo) => (
                <figure
                  key={photo.id}
                  className="group relative overflow-hidden rounded-2xl border border-line bg-paper"
                >
                  {isVideoUrl(photo.url) ? (
                    <video
                      src={photo.url}
                      controls
                      preload="metadata"
                      playsInline
                      className="aspect-[4/3] w-full bg-ink object-cover"
                    />
                  ) : (
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Фото тренировки'}
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <button
                    onClick={() => void remove(photo.id, photo.url)}
                    className="absolute right-2 top-2 rounded-full bg-ink/70 p-1.5 text-white opacity-0 transition-opacity hover:bg-brand group-hover:opacity-100 focus:opacity-100"
                    aria-label="Удалить файл"
                    title="Удалить"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  {photo.authorName && (
                    <figcaption className="flex items-center gap-1.5 px-3 py-1.5 text-[0.62rem] text-graphite">
                      <Camera className="h-3 w-3" />
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