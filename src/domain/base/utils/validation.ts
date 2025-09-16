/**
 * Validation utility functions
 */

/**
 * Validates if a string is a valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates if a string is a valid YouTube video ID
 */
export function isValidYouTubeVideoId(videoId: string): boolean {
  if (!videoId || typeof videoId !== 'string') return false;
  
  // YouTube video IDs are typically 11 characters long
  // and contain only alphanumeric characters, hyphens, and underscores
  const videoIdRegex = /^[a-zA-Z0-9_-]{11}$/;
  return videoIdRegex.test(videoId);
}

/**
 * Validates if a value is a positive integer
 */
export function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

/**
 * Validates if a value is a non-negative number
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
}

/**
 * Validates if a string has a minimum length
 */
export function hasMinLength(str: string, minLength: number): boolean {
  return typeof str === 'string' && str.length >= minLength;
}

/**
 * Validates if a string has a maximum length
 */
export function hasMaxLength(str: string, maxLength: number): boolean {
  return typeof str === 'string' && str.length <= maxLength;
}

/**
 * Validates if a value is within a numeric range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return typeof value === 'number' && value >= min && value <= max;
}

/**
 * Validates if a string contains only alphanumeric characters
 */
export function isAlphanumeric(str: string): boolean {
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(str);
}
