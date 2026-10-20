import { format, differenceInCalendarDays, eachDayOfInterval, isWeekend, isBefore, startOfDay, addDays, isAfter, isSameDay } from "date-fns";

/**
 * Calculate working days between two dates (excluding weekends).
 * Holidays can be added later by passing an array of holiday dates.
 */
export function calculateWorkingDays(startDate, endDate, holidays = []) {
  if (!startDate || !endDate) return 0;
  
  const start = startOfDay(new Date(startDate));
  const end = startOfDay(new Date(endDate));
  
  if (isBefore(end, start)) return 0;

  const allDays = eachDayOfInterval({ start, end });
  const holidaySet = new Set(holidays.map(h => startOfDay(new Date(h)).getTime()));

  return allDays.filter(day => {
    if (isWeekend(day)) return false;
    if (holidaySet.has(day.getTime())) return false;
    return true;
  }).length;
}

/**
 * Format a date for display
 */
export function formatDate(date, formatStr = "MMM dd, yyyy") {
  if (!date) return "—";
  return format(new Date(date), formatStr);
}

/**
 * Format a date range
 */
export function formatDateRange(start, end) {
  if (!start || !end) return "—";
  const s = new Date(start);
  const e = new Date(end);
  if (isSameDay(s, e)) {
    return formatDate(s);
  }
  return `${formatDate(s)} — ${formatDate(e)}`;
}

/**
 * Get a greeting based on current time
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date) {
  return isBefore(startOfDay(new Date(date)), startOfDay(new Date()));
}

/**
 * Check if a date is today or future
 */
export function isTodayOrFuture(date) {
  const d = startOfDay(new Date(date));
  const today = startOfDay(new Date());
  return !isBefore(d, today);
}

/**
 * Get relative time description
 */
export function getRelativeTimeDesc(date) {
  const now = startOfDay(new Date());
  const target = startOfDay(new Date(date));
  const diff = differenceInCalendarDays(target, now);
  
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 0 && diff <= 7) return `In ${diff} days`;
  if (diff < 0 && diff >= -7) return `${Math.abs(diff)} days ago`;
  return formatDate(date);
}
