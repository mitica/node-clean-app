// import crypto from "crypto";
import objectHashFn from "object-hash";

/**
 * Common utility functions
 */

/**
 * Delays execution for the specified number of milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generates a random ID string
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Validates if a string is a valid ID format
 */
export function isValidId(id: string): boolean {
  return typeof id === "string" && id.length > 0 && /^[a-z0-9]+$/i.test(id);
}

/**
 * Safely parses JSON, returns null if invalid
 */
export function safeJsonParse<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * Retries a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelay?: number;
    maxDelay?: number;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, baseDelay = 1000, maxDelay = 10000 } = options;

  let lastError: Error = new Error("No attempts made");

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        throw lastError;
      }

      const delayMs = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      await delay(delayMs);
    }
  }

  throw lastError;
}

export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export const omitFieldsByValue = <T extends object>(
  obj: T,
  values: unknown[]
): T => {
  const result: any = { ...obj };
  for (const key of Object.keys(result))
    if (values.includes(result[key])) delete result[key];
  return result as T;
};

export const omitNullFields = <T extends object>(obj: T): T =>
  omitFieldsByValue(obj, [null]);

export const omitUndefinedFields = <T extends object>(obj: T): T =>
  omitFieldsByValue(obj, [undefined]);

export const uniq = <T>(arr: T[]) => [...new Set(arr)];

/**
 * Checks if value is not one of: undefined, null, or empty string
 * @param value any value
 * @returns
 */
export const hasValue = (value?: unknown) =>
  ![undefined, null, ""].includes(value as never);

export const isEmptyArray = (value: unknown) =>
  Array.isArray(value) && value.length === 0;

export const toArray = <T>(input?: T | T[]): T[] =>
  [null, undefined].includes(input as never)
    ? ([] as T[])
    : Array.isArray(input)
    ? (input as T[])
    : ([input] as T[]);

export const uniqBy = <T extends object | string>(
  arr: T[],
  prop: keyof T | ((item: T) => unknown)
): T[] => {
  const props = arr.map((item) =>
    typeof prop === "function" ? prop(item) : (item as any)[prop]
  );
  return arr.filter((_, index) => props.indexOf(props[index]) === index);
};

export const objectHash = (data: object): string =>
  objectHashFn(data, { algorithm: "sha1" }).toLowerCase();

export const dataIsEqual = (
  obj1: object,
  obj2: object,
  options?: objectHashFn.NormalOption
) => {
  if (obj1 === obj2) return true;
  return objectHashFn(obj1, options) === objectHashFn(obj2, options);
};
