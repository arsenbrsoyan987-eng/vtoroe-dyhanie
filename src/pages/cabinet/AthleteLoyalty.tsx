import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTrainings } from '../../store/trainingsStore';
import { CLUB_EARN, CLUB_TIERS } from '../../data/site';
import { loyaltySummary, shortDate, weeklyStreak } from '../../lib/loyalty';
import { ActionButton, EmptyState, PageHeader, Panel, PanelTitle, StatCard } from '../../components/cabinet/ui';
import { countNoun } from '../../lib/plural';
import { Flame, Gift, Sparkles, Trophy } from 'lucide-react';

const KIND_STYLE: Record<string, string> = {
  welcome: 'bg-brand/10 text-brand',
  training: 'bg-emerald-500/10 text-emerald-700',
  camp: 'bg-navy/10 text-navy',
  race: 'bg-amber-500/10 text-amber-700',
};

const KIND_LABEL: Record<string, string> = {
  welcome: 'Приветствие',
  training: 'Тренировка',
  camp: 'Сбор',
  race: 'Гонка',
};

export default function AthleteLoyalty() {
  const { currentUser, registrations, personalResults } = useAuth();
  const trainings = useTrainings();

  const summary = useMemo(
    () => loyaltySummary(currentUser?.id, registrations, trainings, personalResults),
    [currentUser?.id, registrations, trainings, personalResults]
  );
  const streak = useMemo(
    () => weeklyStreak(currentUser?.id, registrations, trainings),
    [currentUser?.id, registrations, trainings]
  );

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Аккаунт"
        title="Баллы клуба"
        subtitle="Баллы приходят за посещённые тренировки, сборы и гонки. 1 балл = 1 ₽ — ими можно закрыть до 100% стоимости программ, кемпов и мерча."
        actions={
          <ActionButton to="/loyalty" variant="outline">
            Как работает клуб
          </ActionButton>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Sparkles} label="Баланс" value={`${summary.balance} ₽`} hint="к списанию" />
        <StatCard icon={Gift} label="За 30 дней" value={`+${summary.recent}`} hint="баллов" />
        <StatCard
          icon={Trophy}
          label="Посещений"
          value={summary.visits}
          hint={countNoun(summary.visits, 'тренировка', 'тренировки', 'тренировок')}
        />
        <StatCard
          icon={Flame}
          label="Серия"
          value={streak}
          hint={countNoun(streak, 'неделя подряд', 'недели подряд', 'недель подряд')}
        />
      </div>

      <Panel className="mb-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-graphite">
              Статус клуба
            </p>
            <p className="display mt-1 text-2xl text-ink">{summary.tier.name}</p>
            <p className="mt-1 text-xs text-graphite">
              Кэшбэк {summary.tier.cashback}% с покупок
            </p>
          </div>
          {summary.nextTier ? (
            <div className="text-right">
              <p className="text-xs text-graphite">
                До «{summary.nextTier.name}» —{' '}
                <span className="font-bold text-ink">{summary.toNext}</span>{' '}
                {countNoun(summary.toNext, 'тренировка', 'тренировки', 'тренировок')}
              </p>
              <p className="mt-0.5 text-[0.68rem] text-graphite">
                Кэшбэк вырастет до {summary.nextTier.cashback}%
              </p>
            </div>
          ) : (
            <p className="text-xs font-semibold text-brand">Максимальный статус достигнут</p>
          )}
        </div>

        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-mist"
          role="progressbar"
          aria-valuenow={summary.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Прогресс до следующего статуса"
        >
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: `${summary.progress}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CLUB_TIERS.map((tier) => {
            const active = tier.name === summary.tier.name;
            return (
              <div
                key={tier.name}
                className={`rounded-xl border px-3 py-2.5 ${
                  active ? 'border-brand/40 bg-brand/5' : 'border-line bg-mist/50'
                }`}
              >
                <p className={`text-xs font-bold ${active ? 'text-brand' : 'text-ink'}`}>
                  {tier.name}
                </p>
                <p className="mt-0.5 text-[0.62rem] text-graphite">{tier.requirement}</p>
                <p className="text-[0.62rem] font-semibold text-graphite">{tier.cashback}% кэшбэк</p>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Panel padded={false}>
          <div className="p-5 pb-3 sm:p-6 sm:pb-3">
            <PanelTitle hint="Каждое начисление сгорает через 12 месяцев, приветственные — через 60 дней.">
              История начислений
            </PanelTitle>
          </div>
          {summary.entries.length === 0 ? (
            <div className="px-5 pb-6 sm:px-6">
              <EmptyState
                title="Начислений пока нет"
                text="Посетите тренировку — тренер отметит её, и баллы придут автоматически."
                action={<ActionButton to="/schedule">Выбрать тренировку</ActionButton>}
              />
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {summary.entries.slice(0, 25).map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-3 px-5 py-3 sm:px-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.08em] ${KIND_STYLE[entry.kind]}`}
                      >
                        {KIND_LABEL[entry.kind]}
                      </span>
                      <span className="text-xs text-graphite">{shortDate(entry.date)}</span>
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold text-ink">{entry.title}</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-emerald-700">
                    +{entry.points}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          <PanelTitle hint="Баллы не сгорают при переходе между статусами.">
            За что начисляем
          </PanelTitle>
          <ul className="space-y-2">
            {CLUB_EARN.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between rounded-xl bg-mist/60 px-3 py-2.5"
              >
                <span className="text-xs font-semibold text-ink">{item.label}</span>
                <span className="text-xs font-bold text-brand">+{item.points}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl bg-navy/5 px-3 py-2.5 text-[0.68rem] leading-relaxed text-navy">
            Списать баллы можно у администратора при оплате абонемента, кемпа или
            мерча: скажите, сколько списать, — остаток доплатите картой.
          </p>
        </Panel>
      </div>
    </div>
  );
}
