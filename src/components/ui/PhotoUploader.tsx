import { useRef, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { uploadTrainingPhoto } from '../../lib/upload';
import { ImagePlus, Loader2 } from 'lucide-react';

interface PhotoUploaderProps {
  /** Тренировка, к которой относятся снимки: id уходит в путь файла */
  trainingId: string;
  /** Вызывается после успешной загрузки каждого файла */
  onUploaded: (url: string) => Promise<void> | void;
  disabled?: boolean;
}

/**
 * Загрузка нескольких фото за один раз: тренер снимает занятие на телефон
 * и закидывает всё сразу. Файлы сжимаются и уходят в Supabase Storage.
 */
export default function PhotoUploader({ trainingId, onUploaded, disabled }: PhotoUploaderProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const handleFiles = async (files: FileList | null) => {
    const list = Array.from(files ?? []);
    if (list.length === 0) return;

    setProgress({ done: 0, total: list.length });
    let uploaded = 0;

    for (const file of list) {
      try {
        const url = await uploadTrainingPhoto(trainingId, file);
        await onUploaded(url);
        uploaded += 1;
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Не удалось загрузить фото', 'error');
      } finally {
        setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
      }
    }

    setProgress(null);
    if (inputRef.current) inputRef.current.value = '';
    if (uploaded > 0) {
      toast(
        uploaded === 1 ? 'Фото добавлено в галерею' : `Загружено фото: ${uploaded}`
      );
    }
  };

  const busy = progress !== null;

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!busy && !disabled) void handleFiles(e.dataTransfer.files);
        }}
        onClick={() => {
          if (!busy && !disabled) inputRef.current?.click();
        }}
        role="button"
        tabIndex={0}
        aria-disabled={busy || disabled}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !busy && !disabled) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border border-dashed px-4 py-8 text-center transition-colors ${
          dragging
            ? 'border-accent-red bg-accent-red/10'
            : 'border-white/20 hover:border-white/40 hover:bg-white/5'
        } ${busy || disabled ? 'pointer-events-none opacity-60' : ''}`}
      >
        {busy ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-accent-red" />
            <span className="text-xs text-gray-300">
              Загружаем {progress.done + 1} из {progress.total}…
            </span>
          </>
        ) : (
          <>
            <ImagePlus className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-300">
              Перетащите фото или нажмите, чтобы выбрать
            </span>
            <span className="text-[10px] text-gray-600">
              Можно выбрать сразу несколько · JPG, PNG, WEBP · сожмём автоматически
            </span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
    </div>
  );
}
