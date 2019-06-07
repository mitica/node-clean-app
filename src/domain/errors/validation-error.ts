import { BaseError } from "./error";

export class ValidationError extends BaseError {
  constructor(
    message: string,
    readonly value?: any,
    readonly errors?: string[],
    CODE: string = "E2000"
  ) {
    super(CODE, message);
  }
}

export class EmailExistsError extends ValidationError {
  constructor(email: string) {
    super(
      `A user with email ${email} already exists.`,
      email,
      undefined,
      "E2001"
    );
  }
}
