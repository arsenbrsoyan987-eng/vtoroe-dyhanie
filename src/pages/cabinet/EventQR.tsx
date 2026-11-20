import { useParams } from 'react-router-dom';
import { events } from '../../data/events';
import QRCode from '../../components/ui/QRCode';
import { ActionButton, PageHeader, Panel, PanelTitle } from '../../components/cabinet/ui';
import { Calendar } from 'lucide-react';

export default function EventQRPage() {
  const { id } = useParams<{ id: string }>();
  const event = events.find((e) => e.id === id);
  if (!event) return null;

  const qrData = `EVENT:${event.id}|${event.name}|${event.date}|${event.location}`;

  const generateICS = (e: typeof event) => {
    const startDate = e.date.replace(/-/g, '');
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Vtoroe Dyhanie//RU
BEGIN:VEVENT
DTSTART:${startDate}T${e.time.replace(/:/g, '')}
SUMMARY:${e.name}
LOCATION:${e.location}
DESCRIPTION:${e.description}
END:VEVENT
END:VCALENDAR`;
  };

  const downloadICS = () => {
    const blob = new Blob([generateICS(event)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.name.replace(/\s+/g, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        eyebrow="Мероприятие"
        title={event.name}
        subtitle="QR-код для входа и файл для календаря."
      />

      <Panel className="mb-4 text-center">
        <PanelTitle hint="Покажите QR-код на входе — администратор отметит участие.">
          QR-код участия
        </PanelTitle>
        <div className="flex justify-center">
          <QRCode value={qrData} size={220} title="Покажите на входе" />
        </div>
      </Panel>

      <Panel className="mb-4 text-center">
        <PanelTitle hint="Откроется в Google Календаре, Apple Calendar или Outlook.">
          Добавить в календарь
        </PanelTitle>
        <button
          onClick={downloadICS}
          className="mx-auto flex items-center gap-2.5 rounded-full bg-navy px-6 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-navy-soft"
        >
          <Calendar className="h-4 w-4" />
          Скачать .ics
        </button>
      </Panel>

      <div className="flex justify-center">
        <ActionButton to={`/events/${event.id}`} variant="outline">
          Назад к мероприятию
        </ActionButton>
      </div>
    </div>
  );
}
