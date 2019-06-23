import * as Ajv from "ajv";
import { DataValidator } from "./data-validator";
import { ValidationError } from "../errors/validation-error";

const defaultValidateOptions: Ajv.Options = {};

export class JsonDataValidator<TInput>
  implements DataValidator<TInput, TInput> {
  private validateFunction: Ajv.ValidateFunction;
  private ajv: Ajv.Ajv;

  constructor(schema: any, validateOptions?: Ajv.Options) {
    const options = { ...defaultValidateOptions, ...validateOptions };
    this.ajv = new Ajv(options);
    this.validateFunction = this.ajv.compile(schema);
  }

  async validate(input: TInput) {
    if (!this.validateFunction(input)) {
      throw new ValidationError(this.ajv.errorsText(this.validateFunction.errors), input);
    }
    return input;
  }
}
