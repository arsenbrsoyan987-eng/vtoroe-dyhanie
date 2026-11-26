import { useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEvents } from '../../store/eventsStore';
import QRCode from '../../components/ui/QRCode';
import { ActionButton, EmptyState, PageHeader, Panel, PanelTitle } from '../../components/cabinet/ui';
import { useToast } from '../../context/ToastContext';
import { formatDate, isPastDate } from '../../lib/date';
import { Calendar, Copy, Download, MapPin, Share2, Ticket } from 'lucide-react';

/**
 * QR участия и календарь мероприятия.
 *
 * Данные берутся из живого стора, а не из файла: админка правит событие
 * в базе, и QR не должен показывать устаревшее название. Ссылка на
 * мероприятие кодируется целиком — по ней администратор находит запись.
 */
export default function EventQRPage() {
  const { id } = useParams<{ id: string }>();
  const events = useEvents();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const event = events.find((e) => e.id === id);

  const shareUrl = useMemo(
    () => (typeof window === 'undefined' ? '' : `${window.location.origin}/events/${id}`),
    [id]
  );

  if (!event) {
    return (
      <div className="mx-auto max-w-lg">
        <EmptyState
          title="Мероприятие не найдено"
          text="Возможно, оно удалено или опубликовано под другим адресом."
          action={<ActionButton to="/events">К афише мероприятий</ActionButton>}
        />
      </div>
    );
  }

  const qrData = `EVENT:${event.id}|${event.name}|${event.date}|${event.location}`;
  const past = isPastDate(event.date);

  const generateICS = (e: typeof event) => {
    const startDate = e.date.replace(/-/g, '');
    const startTime = (e.time || '09:00').replace(/:/g, '');
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Vtoroe Dyhanie//RU
BEGIN:VEVENT
DTSTART:${startDate}T${startTime}00
SUMMARY:${e.name}
LOCATION:${e.location}
DESCRIPTION:${e.description}
URL:${shareUrl}
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
    toast('Файл для календаря скачан');
  };

  /** Ссылка для чата: по ней открывается страница события, а не сырой QR-текст */
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast('Ссылка скопирована');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Браузер не дал доступ к буферу обмена', 'error');
    }
  };

  /** Сохранить QR картинкой: пригодится для печати афиш и сторис */
  const downloadQR = () => {
    const svg = printRef.current?.querySelector('svg');
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${event.id}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast('QR-код сохранён');
  };

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        eyebrow="Мероприятие"
        title={event.name}
        subtitle={`${formatDate(event.date)}${event.time ? ` · ${event.time}` : ''}${
          past ? ' · уже прошло' : ''
        }`}
      />

      <Panel className="mb-4 text-center">
        <PanelTitle hint="Покажите QR-код на входе — администратор отметит участие.">
          QR-код участия
        </PanelTitle>
        <div ref={printRef} className="flex justify-center">
          <QRCode value={qrData} size={220} title={event.name} />
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <ActionButton variant="outline" onClick={downloadQR}>
            <Download className="h-3.5 w-3.5" /> Скачать QR
          </ActionButton>
          <ActionButton variant="outline" onClick={() => void copyLink()}>
            {copied ? <Copy className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
            {copied ? 'Скопировано' : 'Ссылка'}
          </ActionButton>
        </div>
      </Panel>

      <Panel className="mb-4">
        <PanelTitle>Детали</PanelTitle>
        <dl className="space-y-2 text-sm">
          <div className="flex items-start gap-2.5">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-graphite" />
            <div>
              <dt className="text-xs text-graphite">Дата и время</dt>
              <dd className="font-semibold text-ink">
                {formatDate(event.date)}
                {event.time ? `, ${event.time}` : ''}
              </dd>
            </div>
          </div>
          {event.location && (
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-graphite" />
              <div>
                <dt className="text-xs text-graphite">Место</dt>
                <dd className="font-semibold text-ink">{event.location}</dd>
              </div>
            </div>
          )}
          {event.price && (
            <div className="flex items-start gap-2.5">
              <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-graphite" />
              <div>
                <dt className="text-xs text-graphite">Стоимость</dt>
                <dd className="font-semibold text-ink">{event.price}</dd>
              </div>
            </div>
          )}
        </dl>
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