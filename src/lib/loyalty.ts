import { CLUB_EARN, CLUB_TIERS, CLUB_WELCOME_POINTS } from '../data/site';
import type { PersonalResult, TrainingRegistration } from '../store/database';
import type { Training } from '../types';

/**
 * Баллы клуба считаются на клиенте из журнала посещений: отдельной таблицы
 * начислений нет, поэтому баланс всегда сходится с историей тренировок.
 * Списания оформляет администратор при оплате — здесь они не вычитаются.
 */
export interface LoyaltyEntry {
  id: string;
  date: string;
  title: string;
  points: number;
  kind: 'welcome' | 'training' | 'camp' | 'race';
  /** Тренировка, за которую начислены баллы — для перехода в карточку */
  trainingId?: string;
  /** Дата сгорания, YYYY-MM-DD; пусто — срок не ограничен */
  expiresOn: string;
}

export interface LoyaltySummary {
  /** Всего начислено за всё время */
  earned: number;
  /** Начислено за последние 30 дней */
  recent: number;
  /** Баланс к списанию: начислено минус сгоревшее */
  balance: number;
  /** Уже сгорело */
  expired: number;
  /** Сгорит в ближайшие 30 дней */
  expiringSoon: number;
  entries: LoyaltyEntry[];
  /** Текущий статус клуба */
  tier: (typeof CLUB_TIERS)[number];
  nextTier: (typeof CLUB_TIERS)[number] | null;
  /** Сколько тренировок осталось до следующего статуса */
  toNext: number;
  /** Прогресс до следующего статуса, 0–100 */
  progress: number;
  /** Посещений всего */
  visits: number;
}

const POINTS_BY_FORMAT = {
  group: CLUB_EARN[0].points,
  individual: CLUB_EARN[1].points,
  camp: CLUB_EARN[2].points,
  race: CLUB_EARN[3].points,
} as const;

/** Сколько баллов даёт занятие: сбор и гонка определяются по названию */
export function pointsForTraining(training: Training | undefined): number {
  if (!training) return 0;
  const haystack = `${training.name} ${training.level ?? ''}`.toLowerCase();
  if (/гонк|забег|старт|соревнов/.test(haystack)) return POINTS_BY_FORMAT.race;
  if (/сбор|кемп|выезд/.test(haystack)) return POINTS_BY_FORMAT.camp;
  if (training.format === 'individual') return POINTS_BY_FORMAT.individual;
  return POINTS_BY_FORMAT.group;
}

/** Сколько тренировок нужно для статуса — из требования вида «30 тренировок» */
function tierThreshold(requirement: string): number {
  const match = requirement.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

/** Приветственные баллы живут 60 дней, остальные — 12 месяцев */
const WELCOME_TTL_DAYS = 60;
const POINTS_TTL_MONTHS = 12;

function expiresAfter(iso: string, kind: LoyaltyEntry['kind']): string {
  const date = new Date(`${iso}T12:00:00`);
  if (kind === 'welcome') {
    date.setDate(date.getDate() + WELCOME_TTL_DAYS);
  } else {
    date.setMonth(date.getMonth() + POINTS_TTL_MONTHS);
  }
  return toISO(date);
}

export function loyaltySummary(
  userId: string | undefined,
  registrations: TrainingRegistration[],
  trainings: Training[],
  results: PersonalResult[]
): LoyaltySummary {
  const entries: LoyaltyEntry[] = [];

  if (userId) {
    const attended = registrations.filter(
      (r) => r.userId === userId && r.attended && r.status !== 'cancelled'
    );

    for (const reg of attended) {
      const training = trainings.find((t) => t.id === reg.trainingId);
      const points = pointsForTraining(training);
      if (points === 0) continue;

      const haystack = `${training?.name ?? ''} ${training?.level ?? ''}`.toLowerCase();
      const kind: LoyaltyEntry['kind'] = /гонк|забег|старт|соревнов/.test(haystack)
        ? 'race'
        : /сбор|кемп|выезд/.test(haystack)
          ? 'camp'
          : 'training';
      const date = training?.date ?? reg.registeredAt;

      entries.push({
        id: reg.id,
        date,
        title: training?.name ?? 'Тренировка',
        points,
        kind,
        ...(training ? { trainingId: training.id } : {}),
        expiresOn: expiresAfter(date, kind),
      });
    }

    // Приветственные баллы начисляются один раз — в день регистрации
    if (attended.length > 0) {
      const first = [...attended].sort((a, b) => a.registeredAt.localeCompare(b.registeredAt))[0];
      entries.push({
        id: 'welcome',
        date: first.registeredAt,
        title: 'Приветственные баллы',
        points: CLUB_WELCOME_POINTS,
        kind: 'welcome',
        expiresOn: expiresAfter(first.registeredAt, 'welcome'),
      });
    }
  }

  entries.sort((a, b) => b.date.localeCompare(a.date));

  const earned = entries.reduce((sum, e) => sum + e.points, 0);
  const visits = registrations.filter(
    (r) => r.userId === userId && r.attended && r.status !== 'cancelled'
  ).length;

  const today = toISO(new Date());
  const expired = entries
    .filter((e) => e.expiresOn < today)
    .reduce((sum, e) => sum + e.points, 0);

  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const cutoff = monthAgo.toISOString().slice(0, 10);
  const recent = entries
    .filter((e) => e.date >= cutoff)
    .reduce((sum, e) => sum + e.points, 0);

  const soon = new Date();
  soon.setDate(soon.getDate() + 30);
  const soonCutoff = toISO(soon);
  const expiringSoon = entries
    .filter((e) => e.expiresOn >= today && e.expiresOn <= soonCutoff)
    .reduce((sum, e) => sum + e.points, 0);

  // Статус определяется числом посещений, а не баллами
  let tier = CLUB_TIERS[0];
  for (const candidate of CLUB_TIERS) {
    if (visits >= tierThreshold(candidate.requirement)) tier = candidate;
  }

  const index = CLUB_TIERS.indexOf(tier);
  const nextTier = CLUB_TIERS[index + 1] ?? null;
  const toNext = nextTier ? Math.max(0, tierThreshold(nextTier.requirement) - visits) : 0;
  const progress = nextTier
    ? Math.min(100, Math.round((visits / tierThreshold(nextTier.requirement)) * 100))
    : 100;

  // Личные результаты тоже влияют на вовлечённость: подсказываем, но не начисляем
  void results;

  return {
    earned,
    recent,
    balance: Math.max(0, earned - expired),
    expired,
    expiringSoon,
    entries,
    tier,
    nextTier,
    toNext,
    progress,
    visits,
  };
}

/**
 * Серия недель подряд с хотя бы одной посещённой тренировкой.
 * Считается назад от текущей недели — мотивирует не пропускать.
 */
export function weeklyStreak(
  userId: string | undefined,
  registrations: TrainingRegistration[],
  trainings: Training[]
): number {
  if (!userId) return 0;

  const weeks = new Set<string>();
  for (const reg of registrations) {
    if (reg.userId !== userId || !reg.attended || reg.status === 'cancelled') continue;
    const training = trainings.find((t) => t.id === reg.trainingId);
    if (!training) continue;
    weeks.add(isoWeek(training.date));
  }

  let streak = 0;
  const cursor = new Date();
  // Текущая неделя может быть ещё без тренировки — начинаем с неё, но
  // засчитываем только при наличии занятия
  for (let i = 0; i < 104; i += 1) {
    const key = isoWeek(toISO(cursor));
    if (weeks.has(key)) {
      streak += 1;
    } else if (i > 0) {
      break;
    }
    cursor.setDate(cursor.getDate() - 7);
  }

  return streak;
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Номер недели по ISO: понедельник — первый день */
function isoWeek(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return toISO(date);
}

/** «12 марта» без года — для журнала начислений */
export function shortDate(iso: string): string {
  if (!iso) return '—';
  return new Date(`${iso}T12:00:00`).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}
