import { ValidateOptions, Schema } from "yup";
import { DataValidator } from "./data-validator";
import { ValidationError } from "../errors/validation-error";

const defaultValidateOptions: ValidateOptions = {
  strict: false,
  abortEarly: true,
  stripUnknown: false,
  recursive: true
};

export class YupDataValidator<TInput, TOutput = TInput>
  implements DataValidator<TInput, TOutput> {
  private schema: Schema<TOutput>;
  private validateOptions: ValidateOptions;
  constructor(schema: any, validateOptions?: any) {
    this.schema = schema;
    this.validateOptions = { ...defaultValidateOptions, ...validateOptions };
  }

  async validate(input: TInput) {
    try {
      return await this.schema.validate(input, this.validateOptions);
    } catch (error) {
      throw new ValidationError(error.message, input, error.errors);
    }
  }
}
