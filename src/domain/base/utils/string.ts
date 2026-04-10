import { createHash } from "crypto";
import camelize from "camelize";
import decamelize from "decamelize";

const atonic = require("atonic");

export const toCamelCase = (str: string): string => {
  return camelize(str);
};

export const toSnakeCase = (str: string): string => {
  return decamelize(str, { separator: "_" });
};

export const camelCaseKeys = <T extends Record<string, unknown>>(obj: T): T => {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    result[toCamelCase(key)] = obj[key];
  }
  return result as T;
};

export const snakeCaseKeys = <T extends Record<string, unknown>>(obj: T): T => {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    result[toSnakeCase(key)] = obj[key];
  }
  return result as T;
};

export const sha256Hash = (data: string, truncate?: number): string => {
  const hash = createHash("sha256");
  hash.update(data);
  const value = hash.digest("hex");
  return truncate ? value.substring(0, truncate) : value;
};

/**
 * String utility functions
 */

/**
 * Truncates a string to the specified length and adds ellipsis
 */
export function truncate(str: string, maxLength: number, suffix = "..."): string {
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
  return atonic(searchNormString(str.trim().toLowerCase()))
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "") // remove invalid chars
    .replace(/-+/g, "-") // collapse dashes
    .replace(/^-+|-+$/g, ""); // trim dashes from start/end
}

/**
 * Removes extra whitespace and normalizes string
 */
export function removeExtraWhitespaces(str: string, multiline = false): string {
  if (multiline)
    return str
      .trim()
      .replace(/\s*\n\s*/g, "\n")
      .replace(/[\t\v\f\r]+/g, " ")
      .replace(/[ ]+/g, " ")
      .trim();
  return str.trim().replace(/\s+/g, " ");
}

/**
 * Safely extracts text with a maximum length
 */
export function safeText(text: string | null | undefined, maxLength = 500): string | null {
  if (!text || typeof text !== "string") {
    return null;
  }

  const normalized = removeExtraWhitespaces(text);
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
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}

export const searchNormString = (str: string): string => {
  return removeExtraWhitespaces(removePunctuation(removeDiacritics(str.toLowerCase())));
};

export const removeDiacritics = (str: string): string => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// trigrami în stil pg_trgm (cu padding spații la capete)
export function trigrams(s: string): Set<string> {
  const padded = `  ${s} `; // 2 spații la capete
  const grams = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) {
    grams.add(padded.slice(i, i + 3));
  }
  return grams;
}

// Jaccard similarity pe trigrami
export function trigramSim(a?: string, b?: string): number {
  const A = trigrams(a || "");
  const B = trigrams(b || "");
  if (A.size === 0 && B.size === 0) return 1;
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const g of A) if (B.has(g)) inter++;
  const uni = A.size + B.size - inter;
  return inter / uni; // [0..1]
}

export function removePunctuation(input: string): string {
  return (
    input
      // înlocuiește caracterele care pot rupe parserul (, . : ; " ' ? ! / etc.)
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      // elimină spațiile multiple
      .replace(/\s+/g, " ")
      .trim()
  );
}

export const countWords = (input: string, minLength: number = 1): number => {
  if (!input) return 0;
  const words = input.trim().split(/\s+/g);
  return words.filter((w) => w.length >= minLength).length;
};

export const fixTextCharacters = (input: string, lang: string): string => {
  if (lang.toLowerCase() === "ro") {
    return input.replace(/ş/g, "ș").replace(/ţ/g, "ț").replace(/Ş/g, "Ș").replace(/Ţ/g, "Ț");
  }
  return input;
};
