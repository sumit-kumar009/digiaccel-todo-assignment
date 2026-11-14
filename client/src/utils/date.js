// Small date helpers. All calculations use the user's local time.

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Weeks start on Monday (getDay(): Sunday = 0, Monday = 1 ...)
export function startOfWeek(date) {
  const d = startOfDay(date);
  const offset = (d.getDay() + 6) % 7;
  return addDays(d, -offset);
}

export function weekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function isSameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function isToday(date) {
  return isSameDay(date, new Date());
}

const pad = (n) => String(n).padStart(2, '0');

// "2026-11-14" for <input type="date">
export function toDateInputValue(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// "09:30" for <input type="time">
export function toTimeInputValue(date) {
  const d = new Date(date);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Combine "2026-11-14" and "09:30" into a local Date
export function combineDateTime(dateValue, timeValue) {
  const [y, m, d] = dateValue.split('-').map(Number);
  const [h, min] = timeValue.split(':').map(Number);
  return new Date(y, m - 1, d, h, min);
}

export const formatDayName = (date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' });

// "Friday 14, January" – same format as the design
export function formatLongDate(date) {
  const d = new Date(date);
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const month = d.toLocaleDateString('en-US', { month: 'long' });
  return `${weekday} ${d.getDate()}, ${month}`;
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function formatShortDate(date) {
  return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

// "10 Nov – 16 Nov 2026"
export function formatWeekRange(weekStart) {
  const end = addDays(weekStart, 6);
  const opts = { day: 'numeric', month: 'short' };
  const startText = weekStart.toLocaleDateString('en-GB', opts);
  const endText = end.toLocaleDateString('en-GB', { ...opts, year: 'numeric' });
  return `${startText} – ${endText}`;
}
