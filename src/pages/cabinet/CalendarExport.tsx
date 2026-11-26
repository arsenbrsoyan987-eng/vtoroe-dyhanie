import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTrainings } from '../../store/trainingsStore';
import { isPastDate } from '../../lib/date';
import { ActionButton, EmptyState, PageHeader, Panel } from '../../components/cabinet/ui';
import { Calendar, Download } from 'lucide-react';

/**
 * Экспорт в календарь.
 *
 * В файл попадают только тренировки, на которые спортсмен записан:
 * выгружать всё расписание школы бессмысленно — чужие занятия ему не нужны.
 */
export default function CalendarExportPage() {
  const trainings = useTrainings();
  const { currentUser, registrations } = useAuth();

  const mine = useMemo(() => {
    const ids = new Set(
      registrations
        .filter((r) => r.userId === currentUser?.id && r.status !== 'cancelled')
        .map((r) => r.trainingId)
    );
    return trainings
      .filter((t) => ids.has(t.id) && !isPastDate(t.date))
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  }, [trainings, registrations, currentUser?.id]);

  const generateICS = (t: (typeof trainings)[number]) => {
    const startDate = t.date.replace(/-/g, '');
    const startTime = (t.time || '09:00').replace(/:/g, '');
    const duration = parseInt(t.duration) || 60;
    const start = new Date(`${t.date}T${t.time || '09:00'}:00`);
    const end = new Date(start.getTime() + duration * 60000);
    const endDate = `${end.getFullYear()}${String(end.getMonth() + 1).padStart(2, '0')}${String(
      end.getDate()
    ).padStart(2, '0')}`;
    const endTime = `${String(end.getHours()).padStart(2, '0')}${String(end.getMinutes()).padStart(
      2,
      '0'
    )}`;

    return `BEGIN:VEVENT
DTSTART:${startDate}T${startTime}00
DTEND:${endDate}T${endTime}00
SUMMARY:${t.name}
LOCATION:${t.location}
DESCRIPTION:Направление: ${t.directionName}\\nУровень: ${t.level}\\nТренер: ${t.trainer}\\nПродолжительность: ${t.duration}`;
  };

  const saveFile = (ics: string, name: string) => {
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllICS = () => {
    let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Vtoroe Dyhanie//RU
`;
    mine.forEach((t) => {
      ics += generateICS(t);
      ics += '\nEND:VEVENT\n';
    });
    ics += 'END:VCALENDAR';
    saveFile(ics, 'vtoroe-dyhanie-trainings.ics');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="Аккаунт"
        title="Экспорт в календарь"
        subtitle="В файл попадают только ваши записи: чужие занятия в личном календаре не нужны."
        actions={
          <ActionButton variant="outline" onClick={downloadAllICS} disabled={mine.length === 0}>
            <Download className="h-3.5 w-3.5" />
            Скачать все
          </ActionButton>
        }
      />

      {mine.length === 0 ? (
        <EmptyState
          title="Записей на тренировки нет"
          text="Запишитесь на занятие в расписании — после этого его можно будет добавить в календарь."
        />
      ) : (
        <div className="space-y-2.5">
          {mine.map((t) => (
            <Panel key={t.id} className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <Calendar className="h-5 w-5 shrink-0 text-graphite" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">{t.name}</p>
                  <p className="text-xs text-graphite">
                    {new Date(t.date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                    })}{' '}
                    · {t.time} · {t.location}
                  </p>
                </div>
              </div>
              <button
                onClick={() => saveFile(generateICS(t), `${t.name.replace(/\s+/g, '_')}.ics`)}
                className="shrink-0 rounded-full bg-navy/10 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-navy transition-colors hover:bg-navy/15"
              >
                В календарь
              </button>
            </Panel>
          ))}
        </div>
      )}

      <Panel className="mt-5 border-navy/20 bg-navy/5">
        <p className="text-xs leading-relaxed text-navy">
          Скачайте .ics и откройте в Google Календаре, Apple Calendar или Outlook — событие
          добавится с датой, временем и описанием тренировки.
        </p>
      </Panel>
    </div>
  );
}
