import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTrainings } from '../../store/trainingsStore';
import {
  addTrainingPhoto,
  removeTrainingPhoto,
  updateTrainingPhoto,
  useTrainingPhotos,
} from '../../store/trainingPhotosStore';
import { deleteStorageFile, isVideoUrl } from '../../lib/upload';
import { visibleTrainings } from '../../lib/access';
import { formatDate, isPastDate } from '../../lib/date';
import { countNoun } from '../../lib/plural';
import PhotoUploader from '../../components/ui/PhotoUploader';
import {
  EmptyState,
  PageHeader,
  Panel,
  StatusBadge,
  fieldClass,
  labelClass,
} from '../../components/cabinet/ui';
import { Camera, Check, Film, Image, Pencil, Trash2, X } from 'lucide-react';

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
  }, [trainings, currentUser, registrations]);

  const [selected, setSelected] = useState<string>('');
  const [onlyWithFiles, setOnlyWithFiles] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const activeId = selected || mine[0]?.id || '';
  const active = mine.find((t) => t.id === activeId);
  const gallery = photos.filter((p) => p.trainingId === activeId);

  /** Сколько файлов у каждой тренировки — по нему считаем итоги и фильтр */
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of photos) {
      map.set(p.trainingId, (map.get(p.trainingId) ?? 0) + 1);
    }
    return map;
  }, [photos]);

  const totalMine = mine.reduce((sum, t) => sum + (counts.get(t.id) ?? 0), 0);
  const covered = mine.filter((t) => (counts.get(t.id) ?? 0) > 0).length;

  const options = onlyWithFiles ? mine.filter((t) => (counts.get(t.id) ?? 0) > 0) : mine;
  const pastOptions = options.filter((t) => isPastDate(t.date));
  const futureOptions = options.filter((t) => !isPastDate(t.date));

  const galleryVideos = gallery.filter((p) => isVideoUrl(p.url)).length;

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
    if (!window.confirm('Удалить файл из галереи безвозвратно?')) return;
    try {
      await removeTrainingPhoto(id);
      await deleteStorageFile(url);
      toast('Файл удалён', 'info');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Не удалось удалить файл', 'error');
    }
  };

  const startEdit = (id: string, caption: string) => {
    setEditingId(id);
    setDraft(caption);
  };

  const saveCaption = async (id: string) => {
    try {
      await updateTrainingPhoto(id, draft.trim());
      toast('Подпись сохранена');
      setEditingId(null);
      setDraft('');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Не удалось сохранить подпись', 'error');
    }
  };

  const renderOption = (t: (typeof mine)[number]) => {
    const total = counts.get(t.id) ?? 0;
    return (
      <option key={t.id} value={t.id}>
        {formatDate(t.date, false)} · {t.name}
        {total > 0 ? ` — ${total}` : ''}
        {isPastDate(t.date) ? ' (прошла)' : ''}
      </option>
    );
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Контент"
        title="Фото и видео тренировок"
        subtitle={`${countNoun(totalMine, 'файл', 'файла', 'файлов')} — сразу появляются в галерее на странице тренировки.`}
      />

      {mine.length === 0 ? (
        <EmptyState
          title="Тренировок пока нет"
          text="За вами не закреплено занятий. Обратитесь к администратору школы — он ведёт расписание."
        />
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { icon: Image, label: 'Всего файлов', value: totalMine },
              { icon: Camera, label: 'С галереей', value: `${covered} из ${mine.length}` },
              {
                icon: Film,
                label: 'В этой тренировке',
                value: gallery.length,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-line bg-paper p-3.5 shadow-card"
              >
                <stat.icon className="mb-2 h-4 w-4 text-brand" />
                <p className="display text-xl text-ink">{stat.value}</p>
                <p className="text-[0.62rem] text-graphite">{stat.label}</p>
              </div>
            ))}
          </div>

          <Panel className="mb-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <label htmlFor="photo-training" className={`${labelClass} mb-0`}>
                Тренировка
              </label>
              <button
                type="button"
                onClick={() => setOnlyWithFiles((v) => !v)}
                aria-pressed={onlyWithFiles}
                className={`rounded-full border px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.08em] transition-colors ${
                  onlyWithFiles
                    ? 'border-brand/40 bg-brand/5 text-brand'
                    : 'border-line text-graphite hover:text-ink'
                }`}
              >
                Только с файлами
              </button>
            </div>
            <select
              id="photo-training"
              value={options.some((t) => t.id === activeId) ? activeId : (options[0]?.id ?? '')}
              onChange={(e) => setSelected(e.target.value)}
              className={`${fieldClass} mt-1.5`}
            >
              {pastOptions.length > 0 && (
                <optgroup label="Прошедшие">
                  {pastOptions.map(renderOption)}
                </optgroup>
              )}
              {futureOptions.length > 0 && (
                <optgroup label="Предстоящие">
                  {futureOptions.map(renderOption)}
                </optgroup>
              )}
            </select>
            {options.length === 0 && (
              <p className="mt-2 text-xs text-graphite">
                Ни у одной тренировки ещё нет файлов — снимите фильтр, чтобы выбрать занятие.
              </p>
            )}
            {active && (
              <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-graphite">
                {active.directionName} · {active.location} · файлы видит любой посетитель сайта
                {galleryVideos > 0 && (
                  <StatusBadge tone="blue">
                    {countNoun(galleryVideos, 'видео', 'видео', 'видео')}
                  </StatusBadge>
                )}
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

                  {editingId === photo.id ? (
                    <div className="flex items-center gap-1 px-2 py-1.5">
                      <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Подпись к файлу"
                        maxLength={120}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void saveCaption(photo.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="min-w-0 flex-1 rounded-lg border border-line bg-mist px-2 py-1 text-[0.68rem] text-ink focus:border-brand focus:outline-none"
                        aria-label="Подпись к файлу"
                      />
                      <button
                        type="button"
                        onClick={() => void saveCaption(photo.id)}
                        className="rounded-full p-1 text-emerald-700 hover:bg-emerald-500/10"
                        aria-label="Сохранить подпись"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-full p-1 text-graphite hover:bg-mist"
                        aria-label="Отменить"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <figcaption className="flex items-center gap-1.5 px-3 py-1.5 text-[0.62rem] text-graphite">
                      {isVideoUrl(photo.url) ? (
                        <Film className="h-3 w-3 shrink-0" />
                      ) : (
                        <Camera className="h-3 w-3 shrink-0" />
                      )}
                      <span className="min-w-0 flex-1 truncate">
                        {photo.caption || photo.authorName || 'Без подписи'}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit(photo.id, photo.caption)}
                        className="shrink-0 rounded-full p-1 text-graphite opacity-0 transition-opacity hover:text-ink group-hover:opacity-100 focus:opacity-100"
                        aria-label="Изменить подпись"
                        title="Изменить подпись"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}

          {gallery.length > 0 && (
            <p className="mt-4 text-[0.68rem] text-graphite">
              Подпись видна под файлом на странице тренировки. Нажмите на карандаш, чтобы
              добавить контекст: дистанцию, погоду, имена участников.
            </p>
          )}
        </>
      )}
    </div>
  );
}
