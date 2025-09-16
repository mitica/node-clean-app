/**
 * Date utility functions
 */

/**
 * Formats a date to ISO string with timezone
 */
export function formatDateToISO(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Safely parses a date string
 */
export function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;

  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Checks if a date is valid
 */
export function isValidDate(date: Date | string | null | undefined): boolean {
  if (!date) return false;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return !isNaN(dateObj.getTime());
}

/**
 * Gets the current timestamp as ISO string
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * Formats duration in seconds to human readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculates age from a date
 */
export function getAge(date: Date | string): number {
  const birthDate = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();

  if (!isValidDate(birthDate)) return 0;

  const diffTime = today.getTime() - birthDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return Math.floor(diffDays / 365.25);
}

export function dateAdd(
  interval: { days?: number; hours?: number; minutes?: number; seconds?: number },
  date: Date = new Date()
): Date {
  const newDate = new Date(date);
  if (interval.days) newDate.setDate(newDate.getDate() + interval.days);
  if (interval.hours) newDate.setHours(newDate.getHours() + interval.hours);
  if (interval.minutes) newDate.setMinutes(newDate.getMinutes() + interval.minutes);
  if (interval.seconds) newDate.setSeconds(newDate.getSeconds() + interval.seconds);
  return newDate;
}
