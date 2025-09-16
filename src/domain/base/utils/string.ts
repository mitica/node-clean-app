/**
 * String utility functions
 */

/**
 * Truncates a string to the specified length and adds ellipsis
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Creates a URL-friendly slug from a string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Removes extra whitespace and normalizes string
 */
export function normalizeString(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Safely extracts text with a maximum length
 */
export function safeText(text: string | null | undefined, maxLength = 500): string | null {
  if (!text || typeof text !== 'string') {
    return null;
  }
  
  const normalized = normalizeString(text);
  return truncate(normalized, maxLength);
}

/**
 * Checks if a string is empty or only whitespace
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Escapes HTML characters in a string
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  
  return str.replace(/[&<>"']/g, char => htmlEscapes[char] || char);
}
