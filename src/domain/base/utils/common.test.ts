import { describe, it, expect } from "vitest";
import { isValidId, safeJsonParse, chunkArray, generateId } from "./common";

describe("isValidId", () => {
  it("returns true for alphanumeric strings", () => {
    expect(isValidId("abc123")).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(isValidId("")).toBe(false);
  });

  it("returns false for strings with special chars", () => {
    expect(isValidId("abc-123")).toBe(false);
  });
});

describe("safeJsonParse", () => {
  it("parses valid JSON", () => {
    expect(safeJsonParse('{"a":1}')).toEqual({ a: 1 });
  });

  it("returns null for invalid JSON", () => {
    expect(safeJsonParse("not json")).toBeNull();
  });
});

describe("chunkArray", () => {
  it("splits array into chunks", () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("returns empty array for empty input", () => {
    expect(chunkArray([], 3)).toEqual([]);
  });
});

describe("generateId", () => {
  it("returns a non-empty string", () => {
    const id = generateId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe("string");
  });

  it("generates unique ids", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});
