import { SOCIAL_ICONS, type SocialId } from '../../data/socials';

/**
 * Иконка соцсети — один источник рисунка для шапки и подвала.
 *
 * Раньше пути SVG жили внутри Footer, и добавить Max в шапку можно было только
 * продублировав рисунок: копии разъезжаются при первой же правке.
 */
export default function SocialIcon({ id, className = 'h-5 w-5' }: { id: SocialId; className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d={SOCIAL_ICONS[id].path} />
    </svg>
  );
}