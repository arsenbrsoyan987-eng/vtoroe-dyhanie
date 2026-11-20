import { useTrainings } from '../../store/trainingsStore';
import { ActionButton, EmptyState, PageHeader, Panel } from '../../components/cabinet/ui';
import { Calendar, Download } from 'lucide-react';

export default function CalendarExportPage() {
  const trainings = useTrainings();
  const upcomingTrainings = trainings.filter((t) => new Date(t.date) >= new Date());

  const generateICS = (t: typeof trainings[0]) => {
    const startDate = t.date.replace(/-/g, '');
    const startTime = t.time.replace(/:/g, '');
    const duration = parseInt(t.duration) || 60;
    const endHour = parseInt(startTime.split(':')[0]) + Math.floor((parseInt(startTime.split(':')[1]) + duration) / 60);
    const endMin = (parseInt(startTime.split(':')[1]) + duration) % 60;
    const endDate = `${String(endHour).padStart(2, '0')}${String(endMin).padStart(2, '0')}`;

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Vtoroe Dyhanie//RU
BEGIN:VEVENT
DTSTART:${startDate}T${startTime}00
DTEND:${startDate}T${endDate}00
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
    upcomingTrainings.forEach((t) => {
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
        title="Календарь"
        subtitle="Экспорт тренировок в Google, Apple или Outlook — файл .ics открывается в любом календаре."
        actions={
          <ActionButton variant="outline" onClick={downloadAllICS} disabled={upcomingTrainings.length === 0}>
            <Download className="h-3.5 w-3.5" />
            Скачать все
          </ActionButton>
        }
      />

      {upcomingTrainings.length === 0 ? (
        <EmptyState
          title="Предстоящих тренировок нет"
          text="Как только в расписании появятся занятия, их можно будет выгрузить в календарь."
        />
      ) : (
        <div className="space-y-2.5">
          {upcomingTrainings.map((t) => (
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
