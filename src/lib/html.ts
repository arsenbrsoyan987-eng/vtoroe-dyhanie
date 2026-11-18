/**
 * Администратор чаще печатает обычный текст, чем размечает HTML, поэтому
 * абзацы и списки собираем сами. Если в тексте уже есть теги — считаем,
 * что содержимое свёрстано вручную, и не трогаем его.
 */
export function toHtml(raw: string): string {
  if (raw.includes('<')) return raw;
  const blocks = raw
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      const isList = lines.every((l) => /^[-•*]\s+/.test(l));
      if (isList) {
        return `<ul>${lines.map((l) => `<li>${l.replace(/^[-•*]\s+/, '')}</li>`).join('')}</ul>`;
      }
      return `<p>${lines.join('<br />')}</p>`;
    })
    .join('');
}

/**
 * Текст карточки для списка: описание хранится как обычный текст или HTML,
 * а в плитке нужен один короткий абзац без разметки.
 */
export function plainExcerpt(raw: string, limit = 180): string {
  const text = raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const tail = cut.lastIndexOf(' ');
  return `${cut.slice(0, tail > 80 ? tail : limit).trimEnd()}…`;
}
