import { BaseError } from "./error";

export class ValidationError extends BaseError {
  static get CODE() {
    return "E2000";
  }
  constructor(
    message: string,
    readonly value?: any,
    readonly errors?: string[],
    CODE: string = ValidationError.CODE
  ) {
    super(CODE, message);
  }
}

export class EmailExistsError extends ValidationError {
  static get CODE() {
    return "E2001";
  }
  constructor(email: string) {
    super(
      `A user with email ${email} already exists.`,
      email,
      undefined,
      EmailExistsError.CODE
    );
  }
}
