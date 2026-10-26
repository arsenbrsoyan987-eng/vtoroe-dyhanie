import { useParams } from 'react-router-dom';
import { events } from '../../data/events';
import QRCode from '../../components/ui/QRCode';
import Button from '../../components/ui/Button';
import { Calendar } from 'lucide-react';

export default function EventQRPage() {
  const { id } = useParams<{ id: string }>();
  const event = events.find((e) => e.id === id);
  if (!event) return null;

  const qrData = `EVENT:${event.id}|${event.name}|${event.date}|${event.location}`;

  const generateICS = (e: typeof event) => {
    const startDate = e.date.replace(/-/g, '');
    const title = e.name;
    const location = e.location;
    const desc = e.description;
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Vtoroe Dyhanie//RU
BEGIN:VEVENT
DTSTART:${startDate}T${e.time.replace(/:/g, '')}
SUMMARY:${title}
LOCATION:${location}
DESCRIPTION:${desc}
END:VEVENT
END:VCALENDAR`;
  };

  const ICSFile = generateICS(event);

  const downloadICS = () => {
    const blob = new Blob([ICSFile], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.name.replace(/\s+/g, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-lg mx-auto px-4 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">{event.name}</h1>
        <p className="text-gray-400 text-sm mb-8">QR-код и добавление в календарь</p>

        <div className="bg-surface border border-white/10 rounded-sm p-8 mb-6">
          <h2 className="text-white font-semibold mb-4">QR-код участия</h2>
          <QRCode value={qrData} size={220} title="Покажите на входе" />
        </div>

        <div className="bg-surface border border-white/10 rounded-sm p-8 mb-6">
          <h2 className="text-white font-semibold mb-4">Добавить в календарь</h2>
          <button onClick={downloadICS} className="flex items-center gap-3 mx-auto bg-accent-blue text-white text-sm px-6 py-3 rounded-sm hover:bg-accent-blue-hover transition-colors">
            <Calendar className="w-5 h-5" />
            Скачать .ics файл
          </button>
          <p className="text-gray-500 text-xs mt-3">Откройте файл в Google Календаре, Apple Calendar или Outlook</p>
        </div>

        <Button to={`/events/${event.id}`} variant="outline" size="sm">Назад к мероприятию</Button>
      </div>
    </div>
  );
}