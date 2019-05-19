const errorCodeSymbol = Symbol("error code");
/**
 * Error code RegExp. From E1000 to E9999.
 */
const ERROR_CODE_REG = /^E[1-9]\d{3}$/;

/**
 * A system base error. All errors must extend this one.
 * It could be named {MyAppName}Error.
 */
export class BaseError extends Error {
  private [errorCodeSymbol]: string;

  constructor(CODE: string, message: string) {
    super(message);
    this[errorCodeSymbol] = CODE;
    if (!ERROR_CODE_REG.test(CODE)) {
      throw new Error(`Invalid error CODE format: ${CODE}`);
    }
  }

  public get CODE(): string {
    return this[errorCodeSymbol];
  }
}
