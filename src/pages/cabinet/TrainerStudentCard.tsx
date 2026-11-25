import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { activeProfiles, useProfiles } from '../../store/profilesStore';
import { useTrainings } from '../../store/trainingsStore';
import { visibleTrainings } from '../../lib/access';
import { formatDate, isPastDate } from '../../lib/date';
import { loyaltySummary } from '../../lib/loyalty';
import {
  ActionButton,
  EmptyState,
  PageHeader,
  Panel,
  PanelTitle,
  StatCard,
  StatusBadge,
} from '../../components/cabinet/ui';
import { ArrowLeft, CalendarDays, Clock, Mail, MapPin, Phone, Star, TrendingUp } from 'lucide-react';

/**
 * Карточка спортсмена глазами тренера.
 *
 * Тренер видит только тех, кто записан на его занятия: список профилей уже
 * ограничен политикой RLS (`teaches`), а записи — `coaches`.
 */
export default function TrainerStudentCard() {
  const { id } = useParams<{ id: string }>();
  const { currentUser, registrations } = useAuth();
  const profiles = activeProfiles(useProfiles());
  const trainings = useTrainings();
  const [tab, setTab] = useState<'visits' | 'results'>('visits');

  const athlete = profiles.find((p) => p.id === id);
  const myTrainings = visibleTrainings(trainings, currentUser, registrations);
  const myIds = new Set(myTrainings.map((t) => t.id));

  const regs = useMemo(
    () =>
      registrations
        .filter((r) => r.userId === id && myIds.has(r.trainingId))
        .sort((a, b) => {
          const ta = trainings.find((t) => t.id === a.trainingId);
          const tb = trainings.find((t) => t.id === b.trainingId);
          return `${tb?.date ?? ''}`.localeCompare(`${ta?.date ?? ''}`);
        }),
    // myIds пересобирается каждый рендер — зависим от самих тренировок
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [registrations, id, trainings, myTrainings.length]
  );

  if (!athlete) {
    return (
      <div className="mx-auto max-w-4xl">
        <EmptyState
          title="Спортсмен не найден"
          text="Возможно, он ещё не записывался на ваши тренировки или аккаунт удалён."
          action={<ActionButton to="/cabinet/students">К списку</ActionButton>}
        />
      </div>
    );
  }

  const attended = regs.filter((r) => r.attended).length;
  const upcoming = regs.filter((r) => {
    const t = trainings.find((x) => x.id === r.trainingId);
    return t && !isPastDate(t.date);
  }).length;
  const loyalty = loyaltySummary(athlete.id, registrations, trainings, []);
  const last = regs.find((r) => r.attended);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/cabinet/students"
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-graphite transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Мои спортсмены
      </Link>

      <PageHeader
        eyebrow="Карточка спортсмена"
        title={athlete.name}
        subtitle={`Записей на ваши тренировки: ${regs.length} · посещений: ${attended}`}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={CalendarDays} label="Посещений" value={attended} hint="у вас" />
        <StatCard icon={Clock} label="Предстоящих" value={upcoming} hint="записей" />
        <StatCard
          icon={TrendingUp}
          label="Баллы клуба"
          value={loyalty.balance}
          hint={`статус «${loyalty.tier.name}»`}
        />
        <StatCard
          icon={Star}
          label="Последний визит"
          value={last ? formatDate(last.registeredAt, false) : '—'}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr]">
        <Panel>
          <PanelTitle>Контакты</PanelTitle>
          <div className="flex items-center gap-3">
            {athlete.photo ? (
              <img
                src={athlete.photo}
                alt={athlete.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-xl font-bold text-brand">
                {athlete.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{athlete.name}</p>
              <p className="text-xs text-graphite">
                В школе с{' '}
                {athlete.created
                  ? new Date(`${athlete.created}T12:00:00`).toLocaleDateString('ru-RU', {
                      month: 'long',
                      year: 'numeric',
                    })
                  : '—'}
              </p>
            </div>
          </div>

          <ul className="mt-4 space-y-2">
            {athlete.phone && (
              <li>
                <a
                  href={`tel:${athlete.phone}`}
                  className="flex items-center gap-2 rounded-xl border border-line bg-mist/50 px-3 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-paper"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  {athlete.phone}
                </a>
              </li>
            )}
            {athlete.email && (
              <li>
                <a
                  href={`mailto:${athlete.email}`}
                  className="flex items-center gap-2 rounded-xl border border-line bg-mist/50 px-3 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-paper"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{athlete.email}</span>
                </a>
              </li>
            )}
          </ul>

          <p className="mt-4 rounded-xl bg-navy/5 px-3 py-2.5 text-[0.68rem] leading-relaxed text-navy">
            Телефон и почта доступны только тренеру, у которого спортсмен
            записан на занятие. Другим участникам они не видны.
          </p>
        </Panel>

        <Panel padded={false}>
          <div className="flex items-center justify-between gap-3 p-5 pb-3 sm:p-6 sm:pb-3">
            <div className="inline-flex flex-wrap gap-1 rounded-full border border-line bg-paper p-1">
              {(
                [
                  { value: 'visits', label: 'Посещения' },
                  { value: 'results', label: 'Результаты' },
                ] as const
              ).map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTab(item.value)}
                  aria-pressed={tab === item.value}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    tab === item.value ? 'bg-ink text-white' : 'text-graphite hover:text-ink'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {tab === 'visits' && (
            <>
              {regs.length === 0 ? (
                <div className="px-5 pb-6 sm:px-6">
                  <EmptyState title="Записей нет" text="Спортсмен ещё не записывался на ваши тренировки." />
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {regs.map((reg) => {
                    const training = trainings.find((t) => t.id === reg.trainingId);
                    if (!training) return null;
                    const past = isPastDate(training.date);
                    return (
                      <li key={reg.id} className="px-5 py-3 sm:px-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink">{training.name}</p>
                            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-graphite">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {formatDate(training.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {training.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {training.location}
                              </span>
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-1.5">
                            {reg.attended && <StatusBadge tone="green">Посетил</StatusBadge>}
                            {!reg.attended && past && <StatusBadge tone="red">Пропуск</StatusBadge>}
                            {!past && reg.status === 'waitlist' && (
                              <StatusBadge tone="yellow">Ожидание</StatusBadge>
                            )}
                            {!past && reg.status === 'confirmed' && (
                              <StatusBadge tone="blue">Записан</StatusBadge>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}

          {tab === 'results' && (
            <div className="px-5 pb-6 sm:px-6">
              <EmptyState
                title="Дневник ведёт сам спортсмен"
                text="Личные результаты видны только автору: тренер не читает чужие записи, чтобы сохранить доверие."
              />
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
