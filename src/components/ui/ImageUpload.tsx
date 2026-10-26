import { useRef, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { ImagePlus, Link2, Trash2, Upload } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  /** Подпись поля */
  label?: string;
  /** Круглая рамка (аватар) вместо квадратной */
  circle?: boolean;
  /** Заглушка, если фото нет */
  fallback?: string;
}

/** Максимальная сторона сохранённого изображения, px */
const MAX_SIDE = 512;
/** Качество JPEG при сжатии */
const QUALITY = 0.82;
/** Ограничение на исходный файл, МБ */
const MAX_FILE_MB = 12;

/**
 * Читает файл, обрезает по центру до квадрата, уменьшает до 512px
 * и возвращает сжатый JPEG в виде data URL.
 */
function fileToSquareDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Файл повреждён или это не изображение'));
      img.onload = () => {
        const side = Math.min(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = MAX_SIDE;
        canvas.height = MAX_SIDE;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Браузер не поддерживает обработку изображений'));
          return;
        }
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
          img,
          (img.width - side) / 2,
          (img.height - side) / 2,
          side,
          side,
          0,
          0,
          MAX_SIDE,
          MAX_SIDE
        );
        resolve(canvas.toDataURL('image/jpeg', QUALITY));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Фото',
  circle = false,
  fallback,
}: ImageUploadProps) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast('Нужен файл изображения: JPG, PNG или WEBP', 'error');
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast(`Файл больше ${MAX_FILE_MB} МБ — выберите фото поменьше`, 'error');
      return;
    }

    setBusy(true);
    try {
      onChange(await fileToSquareDataUrl(file));
      toast('Фото загружено');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Не удалось загрузить фото', 'error');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const applyUrl = () => {
    const url = urlDraft.trim();
    if (!url) return;
    if (!/^https?:\/\/|^\//.test(url)) {
      toast('Ссылка должна начинаться с https:// или /', 'error');
      return;
    }
    onChange(url);
    setUrlDraft('');
    setShowUrl(false);
    toast('Фото привязано по ссылке');
  };

  const radius = circle ? 'rounded-full' : 'rounded-sm';

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="block text-xs uppercase tracking-wider text-gray-400">{label}</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-red-400"
          >
            <Trash2 className="h-3 w-3" />
            Убрать
          </button>
        )}
      </div>

      <div className="flex items-start gap-4">
        <div
          className={`relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-primary ${radius}`}
        >
          {value ? (
            <img src={value} alt="Предпросмотр" className="h-full w-full object-cover" />
          ) : fallback ? (
            <span className="text-2xl font-bold text-accent-red">{fallback}</span>
          ) : (
            <ImagePlus className="h-7 w-7 text-gray-600" />
          )}
          {busy && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-[10px] text-white">
              Обработка…
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              void handleFile(e.dataTransfer.files[0]);
            }}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-sm border border-dashed px-4 py-4 text-center transition-colors ${
              dragging
                ? 'border-accent-red bg-accent-red/10'
                : 'border-white/20 hover:border-white/40 hover:bg-white/5'
            }`}
          >
            <Upload className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-300">
              Перетащите фото или нажмите, чтобы выбрать
            </span>
            <span className="text-[10px] text-gray-600">
              JPG, PNG, WEBP · обрежем по центру и сожмём автоматически
            </span>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />

          {showUrl ? (
            <div className="mt-2 flex gap-2">
              <input
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyUrl();
                  }
                }}
                placeholder="https://… или /trainers/ivan.jpg"
                className="w-full rounded-sm border border-white/10 bg-primary px-3 py-2 text-xs text-white placeholder:text-gray-600 focus:border-accent-red focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={applyUrl}
                className="shrink-0 rounded-sm bg-white/10 px-3 text-xs text-gray-300 transition-colors hover:bg-white/20 hover:text-white"
              >
                ОК
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowUrl(true)}
              className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-accent-blue"
            >
              <Link2 className="h-3 w-3" />
              Или вставить ссылку
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
