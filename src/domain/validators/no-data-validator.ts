import { DataValidator } from "./data-validator";

/**
 * No data validator class.
 * May be usefull for tests.
 */
export class NoDataValidator<TInput> implements DataValidator<TInput, TInput> {
  async validate(data: Readonly<TInput>): Promise<TInput> {
    return data;
  }
}
