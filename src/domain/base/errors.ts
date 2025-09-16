export enum BaseErrorCode {
  FORBIDDEN = "FORBIDDEN",
  NOT_AUTH_LIMIT = "NOT_AUTH_LIMIT",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHENTICATED = "UNAUTHENTICATED",
  VALIDATION = "VALIDATION",
  DUPLICATION = "DUPLICATION",
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ErrorData = Record<string, any>;

export interface IDomainError {
  readonly isDomainError: true;
  readonly name: string;
  readonly message: string;
  /**
   * We don't use 'code' because Node uses this name.
   * https://nodejs.org/api/errors.html#errors_error_code
   */
  readonly errorCode: string;
  readonly stack?: string;
  /**
   * Error extra data
   */
  readonly data?: Readonly<ErrorData>;
  readonly originalError?: object | string;
}

export interface ErrorParams {
  errorCode?: string;
  data?: ErrorData;
  originalError?: object | string;
  httpStatus?: number;
}

/**
 * Base domain error. Use this class to throw errors or extend it.
 */
export class DomainError extends Error implements IDomainError {
  public readonly isDomainError = true;
  public readonly errorCode: string;
  public readonly data?: Readonly<ErrorData>;
  public readonly originalError?: object | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public readonly extensions: Record<string, any>;
  public readonly httpStatus?: number;

  public constructor(message: string, codeOrParams: string | ErrorParams) {
    super(message);

    this.name = this.constructor.name;

    if (typeof codeOrParams === "string") {
      this.errorCode = codeOrParams;
    } else {
      this.errorCode =
        codeOrParams.errorCode || BaseErrorCode.INTERNAL_SERVER_ERROR;
      this.data = codeOrParams.data;
      this.originalError = codeOrParams.originalError;
    }

    this.extensions = { code: this.errorCode };
  }
}

export class ForbiddenError extends DomainError {
  public constructor(message: string) {
    super(message, { errorCode: BaseErrorCode.FORBIDDEN, httpStatus: 403 });
  }
}

export class NotAuthLimitError extends DomainError {
  public constructor(message: string) {
    super(message, {
      errorCode: BaseErrorCode.NOT_AUTH_LIMIT,
      httpStatus: 403,
    });
  }
}

export class AuthenticationError extends DomainError {
  public constructor(message: string) {
    super(message, BaseErrorCode.UNAUTHENTICATED);
  }
}

export class UnauthorizedError extends DomainError {
  public constructor(message: string) {
    super(message, {
      errorCode: BaseErrorCode.UNAUTHENTICATED,
      httpStatus: 401,
    });
  }
}

function setDefaultErrorCode(
  codeOrParams: string | ErrorParams,
  errorCode: string
) {
  if (typeof codeOrParams !== "string") {
    return { errorCode, ...codeOrParams };
  }
  return codeOrParams;
}

/**
 * Base error for all validation error type: data, input, etc.
 */
export class ValidationError extends DomainError {
  public constructor(
    message: string,
    codeOrParams: string | ErrorParams = BaseErrorCode.VALIDATION
  ) {
    super(message, setDefaultErrorCode(codeOrParams, BaseErrorCode.VALIDATION));
  }
}

export class InvalidInputError extends ValidationError {
  public constructor(
    message: string,
    codeOrParams: string | ErrorParams = BaseErrorCode.INVALID_INPUT
  ) {
    super(
      message,
      setDefaultErrorCode(codeOrParams, BaseErrorCode.INVALID_INPUT)
    );
  }
}

export class NotFoundError extends ValidationError {
  public constructor(
    message: string,
    codeOrParams: string | ErrorParams = BaseErrorCode.NOT_FOUND
  ) {
    super(message, setDefaultErrorCode(codeOrParams, BaseErrorCode.NOT_FOUND));
  }
}

export class DuplicationError extends ValidationError {
  public constructor(
    message: string,
    codeOrParams: string | ErrorParams = BaseErrorCode.DUPLICATION
  ) {
    super(
      message,
      setDefaultErrorCode(codeOrParams, BaseErrorCode.DUPLICATION)
    );
  }
}
