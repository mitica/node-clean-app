/**
 * Date utility functions
 */

import { DateGranularity } from "../data";

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

  const dateObj = typeof date === "string" ? new Date(date) : date;
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
  if (seconds < 0) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Calculates age from a date
 */
export function getAge(date: Date | string): number {
  const birthDate = typeof date === "string" ? new Date(date) : date;
  const today = new Date();

  if (!isValidDate(birthDate)) return 0;

  const diffTime = today.getTime() - birthDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return Math.floor(diffDays / 365.25);
}

export function dateAdd(
  interval: {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    months?: number;
    years?: number;
  },
  date: Date = new Date()
): Date {
  const newDate = new Date(date);
  if (interval.years)
    newDate.setFullYear(newDate.getFullYear() + interval.years);
  if (interval.months) newDate.setMonth(newDate.getMonth() + interval.months);
  if (interval.days) newDate.setDate(newDate.getDate() + interval.days);
  if (interval.hours) newDate.setHours(newDate.getHours() + interval.hours);
  if (interval.minutes)
    newDate.setMinutes(newDate.getMinutes() + interval.minutes);
  if (interval.seconds)
    newDate.setSeconds(newDate.getSeconds() + interval.seconds);
  return newDate;
}

/**
 * Converts a date to an integer in YYYYMMDD format.
 * Based on granularity it start of the period.
 * e.g. for month granularity, it returns YYYYMM01
 * @param granularity
 * @param date
 * @returns
 */
export const dateToInt = (
  granularity: DateGranularity | string,
  date: Date
) => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // Months are zero-based
  const day = date.getUTCDate();

  switch (granularity) {
    case DateGranularity.YEAR:
      return year * 10000 + 101; // YYYY0101
    case DateGranularity.QUARTER: {
      const quarterStartMonth = Math.floor((month - 1) / 3) * 3 + 1;
      return year * 10000 + quarterStartMonth * 100 + 1; // YYYYMM01
    }
    case DateGranularity.MONTH:
      return year * 10000 + month * 100 + 1; // YYYYMM01
    case DateGranularity.WEEK: {
      // Get the first day of the week (Monday)
      const firstDayOfWeek = new Date(date);
      const dayOfWeek = firstDayOfWeek.getUTCDay(); // 0 (Sun) to 6 (Sat)
      const diffToMonday = (dayOfWeek + 6) % 7; // Days since Monday
      firstDayOfWeek.setUTCDate(firstDayOfWeek.getUTCDate() - diffToMonday);
      const weekYear = firstDayOfWeek.getUTCFullYear();
      const weekMonth = firstDayOfWeek.getUTCMonth() + 1;
      const weekDay = firstDayOfWeek.getUTCDate();
      return weekYear * 10000 + weekMonth * 100 + weekDay; // YYYYMMDD
    }
    case DateGranularity.DAY:
      return year * 10000 + month * 100 + day; // YYYYMMDD
    default:
      throw new Error(`Unsupported granularity: ${granularity}`);
  }
};

export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};
export const daysInMonth = (year: number, month: number): number => {
  return [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ][month - 1];
};
