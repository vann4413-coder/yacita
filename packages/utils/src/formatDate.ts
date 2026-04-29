const LOCALE = 'es-ES';

export function formatDatetime(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const time = formatTime(iso);

  if (isSameDay(d, today)) return `Hoy ${time}`;
  if (isSameDay(d, tomorrow)) return `Mañana ${time}`;

  return new Intl.DateTimeFormat(LOCALE, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function isUrgent(iso: string): boolean {
  const diffMs = new Date(iso).getTime() - Date.now();
  return diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000;
}
