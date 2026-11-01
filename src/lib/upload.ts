import { supabase } from '../lib/supabase';

/**
 * Загрузка фотографий в Supabase Storage.
 *
 * В отличие от `ImageUpload` (data URL в localStorage — только для одного
 * браузера), здесь файл уходит в публичный бакет: снимки с тренировок
 * видят все посетители, а размер бандла и localStorage не растёт.
 */

export const PHOTO_BUCKET = 'training-photos';

/** Большая сторона после сжатия, px */
const MAX_SIDE = 1600;
const QUALITY = 0.82;
const MAX_FILE_MB = 20;
/** Видео не пережимаем, поэтому потолок выше — лимит бесплатного тарифа Supabase */
const MAX_VIDEO_MB = 50;

const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.m4v'];

/**
 * Медиа может быть фото или видео: различаем по расширению в URL.
 * Пути генерируем сами (см. uploadTrainingMedia), поэтому расширение всегда известно.
 */
export function isVideoUrl(url: string): boolean {
  const clean = url.split('?')[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => clean.endsWith(ext));
}

/** Сжимает фото до разумного веса: снимки с телефона весят по 4–8 МБ */
function compress(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Файл повреждён или это не изображение'));
      img.onload = () => {
        const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Браузер не поддерживает обработку изображений'));
          return;
        }
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Не удалось сжать фото'))),
          'image/jpeg',
          QUALITY
        );
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function randomName() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Расширение файла по MIME, чтобы путь в бакете соответствовал содержимому */
function videoExtension(file: File): string {
  const fromName = file.name.toLowerCase().match(/\.(mp4|mov|webm|m4v)$/)?.[1];
  if (fromName) return fromName;
  const fromType = file.type.split('/')[1]?.split(';')[0];
  return fromType === 'quicktime' ? 'mov' : (fromType ?? 'mp4');
}

/**
 * Загружает фото или видео тренировки и возвращает публичный URL.
 * Путь начинается с id тренировки: по первой папке RLS проверяет,
 * что файл грузит тренер именно этого занятия.
 */
export async function uploadTrainingMedia(trainingId: string, file: File): Promise<string> {
  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');

  if (!isVideo && !isImage) {
    throw new Error('Нужен файл фото (JPG, PNG, WEBP) или видео (MP4, MOV, WEBM)');
  }

  const limitMb = isVideo ? MAX_VIDEO_MB : MAX_FILE_MB;
  if (file.size > limitMb * 1024 * 1024) {
    throw new Error(`Файл больше ${limitMb} МБ — выберите файл поменьше`);
  }

  // Видео отдаём как есть: пережатие в браузере требует WebCodecs и долго
  const blob: Blob = isVideo ? file : await compress(file);
  const path = isVideo
    ? `${trainingId}/${randomName()}.${videoExtension(file)}`
    : `${trainingId}/${randomName()}.jpg`;

  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, {
    contentType: isVideo ? `video/${videoExtension(file) === 'mov' ? 'quicktime' : videoExtension(file)}` : 'image/jpeg',
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Удаляет файл из бакета по публичному URL */
export async function deleteStorageFile(url: string): Promise<void> {
  const marker = `/object/public/${PHOTO_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return;
  const path = decodeURIComponent(url.slice(index + marker.length));
  await supabase.storage.from(PHOTO_BUCKET).remove([path]);
}
