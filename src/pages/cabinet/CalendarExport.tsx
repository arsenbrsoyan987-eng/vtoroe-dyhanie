import { useTrainings } from '../../store/trainingsStore';
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

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vtoroe-dyhanie-trainings.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Календарь</h1>
            <p className="text-gray-400 text-sm">Экспорт тренировок в Google/Apple/Outlook Calendar</p>
          </div>
          <button onClick={downloadAllICS} className="flex items-center gap-2 bg-accent-blue text-white text-sm px-4 py-2 rounded-sm hover:bg-accent-blue-hover transition-colors">
            <Download className="w-4 h-4" />
            Скачать все
          </button>
        </div>

        <div className="space-y-3">
          {upcomingTrainings.map((t) => {
            const icsContent = generateICS(t);
            const downloadSingle = () => {
              const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${t.name.replace(/\s+/g, '_')}.ics`;
              a.click();
              URL.revokeObjectURL(url);
            };

            return (
              <div key={t.id} className="bg-surface border border-white/10 rounded-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">
                      {new Date(t.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} · {t.time} · {t.location}
                    </div>
                  </div>
                </div>
                <button onClick={downloadSingle} className="text-xs text-accent-blue bg-accent-blue/10 px-3 py-1.5 rounded-sm hover:bg-accent-blue/20 transition-colors shrink-0">
                  + Добавить в календарь
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-sm p-4">
          <p className="text-blue-300 text-xs">
            💡 <strong>Как использовать:</strong> Скачайте .ics файл и откройте его в Google Календаре, Apple Calendar, Outlook или любом другом календаре. Событие автоматически добавится с датой, временем и описанием.
          </p>
        </div>
      </div>
    </div>
  );
}