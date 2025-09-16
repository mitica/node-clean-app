export const isNumber = (
  value: unknown | null | undefined
): value is number => {
  return typeof value === "number" && !isNaN(value);
};

/** Is number and >= 0 */
export const isPositiveNumber = (value: unknown): value is number =>
  isNumber(value) && value >= 0;
