import { useEffect } from 'react';
import { useSettings } from '../store/settingsStore';

/**
 * Палитра сайта правится из админки.
 *
 * Tailwind собирает утилиты вида `bg-accent-red` как `var(--color-accent-red)`,
 * поэтому достаточно переопределить CSS-переменные на <html> — и весь сайт
 * перекрасится без пересборки. Значения по умолчанию берёт @theme из index.css,
 * поэтому при пустых настройках здесь ничего не записываем.
 */

/** Пары: настраиваемый ключ → переменные, которые он задаёт (база и hover) */
const COLOR_MAP: { key: string; vars: [string, string] }[] = [
  { key: 'accentColor', vars: ['--color-accent-red', '--color-accent-red-hover'] },
  { key: 'accentBlue', vars: ['--color-accent-blue', '--color-accent-blue-hover'] },
  { key: 'primaryColor', vars: ['--color-primary', ''] },
  { key: 'secondaryColor', vars: ['--color-secondary', ''] },
  { key: 'surfaceColor', vars: ['--color-surface', ''] },
];

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Оттеняет HEX на долю 0..1 (минус — темнее, плюс — светлее) */
function shade(hex: string, ratio: number): string {
  const full =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;
  const num = parseInt(full.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const part = (shift: number) => {
    const channel = (num >> shift) & 0xff;
    return clamp(ratio < 0 ? channel * (1 + ratio) : channel + (255 - channel) * ratio);
  };
  return `#${((1 << 24) + (part(16) << 16) + (part(8) << 8) + part(0)).toString(16).slice(1)}`;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = useSettings();

  useEffect(() => {
    const root = document.documentElement;

    for (const { key, vars } of COLOR_MAP) {
      const raw = (settings[key] ?? '').trim();
      const base = vars[0];
      const hover = vars[1];

      // Пустое или некорректное значение — возвращаем сборке дефолт из @theme
      if (!HEX.test(raw)) {
        root.style.removeProperty(base);
        if (hover) root.style.removeProperty(hover);
        continue;
      }

      root.style.setProperty(base, raw);
      // Hover-оттенок выводим из базового, чтобы палитра не разъезжалась
      if (hover) root.style.setProperty(hover, shade(raw, -0.15));
    }
  }, [settings]);

  return <>{children}</>;
}