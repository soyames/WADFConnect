import type { Session } from "@shared/schema";

export function generateICSFile(session: Session): string {
  const startDate = new Date(`${session.scheduledDate}T${session.scheduledTime?.split('-')[0] || '09:00'}`);
  const endDate = new Date(startDate.getTime() + (session.duration || 60) * 60000);

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//WADF 2026//Conference Schedule//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${session.id}@wadf2026.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${session.title}
DESCRIPTION:${session.description || 'WADF 2026 Session'}
LOCATION:${session.room || 'Conference Venue (Location TBC)'}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT30M
ACTION:DISPLAY
DESCRIPTION:Session starts in 30 minutes
END:VALARM
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}

export function downloadICS(session: Session) {
  const icsContent = generateICSFile(session);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `wadf-${session.title.toLowerCase().replace(/\s+/g, '-')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export function getGoogleCalendarUrl(session: Session): string {
  const startDate = new Date(`${session.scheduledDate}T${session.scheduledTime?.split('-')[0] || '09:00'}`);
  const endDate = new Date(startDate.getTime() + (session.duration || 60) * 60000);

  const formatGoogleDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: session.title,
    details: session.description || 'WADF 2026 Session',
    location: session.room || 'Conference Venue (Location TBC)',
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function getOutlookCalendarUrl(session: Session): string {
  const startDate = new Date(`${session.scheduledDate}T${session.scheduledTime?.split('-')[0] || '09:00'}`);
  const endDate = new Date(startDate.getTime() + (session.duration || 60) * 60000);

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: session.title,
    body: session.description || 'WADF 2026 Session',
    location: session.room || 'Conference Venue (Location TBC)',
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
