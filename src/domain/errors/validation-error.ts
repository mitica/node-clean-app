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
