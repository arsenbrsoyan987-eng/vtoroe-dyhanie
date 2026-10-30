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

/**
 * Загружает фото тренировки и возвращает публичный URL.
 * Путь начинается с id тренировки: по первой папке RLS проверяет,
 * что файл грузит тренер именно этого занятия.
 */
export async function uploadTrainingPhoto(trainingId: string, file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Нужен файл изображения: JPG, PNG или WEBP');
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    throw new Error(`Файл больше ${MAX_FILE_MB} МБ — выберите фото поменьше`);
  }

  const blob = await compress(file);
  const path = `${trainingId}/${randomName()}.jpg`;

  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, {
    contentType: 'image/jpeg',
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
