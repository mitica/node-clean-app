import { BaseError } from "./error";

export class NotFoundError extends BaseError {
  static get CODE() {
    return "E2400";
  }
  constructor(
    message: string,
    readonly value?: any,
    CODE: string = NotFoundError.CODE
  ) {
    super(CODE, message);
  }
}


export class UserLoginError extends NotFoundError {
  static get CODE() {
    return "E2401";
  }
  constructor(email: string) {
    super(
      `Login error. Not found user with email ${email}.`,
      email,
      UserLoginError.CODE
    );
  }
}
