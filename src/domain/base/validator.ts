import Ajv, { Options as AjvOptions, ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { JSONSchema } from "./json-schema";
import { BaseErrorCode, ValidationError } from "./errors";

export interface Validator<
  TInput,
  TOutput = TInput,
  TContext = Record<string, unknown>
> {
  validate(
    data: Readonly<TInput>,
    context?: Readonly<TContext>
  ): Promise<TOutput>;
}

export class JsonValidator<TInput> implements Validator<TInput, TInput> {
  protected static defaultValidateOptions: AjvOptions = {
    allowUnionTypes: true,
  };
  private _validateFunction: ValidateFunction;
  private _ajv: Ajv;
  private defaultErrorCode: string;

  public constructor(
    public schema: JSONSchema,
    validateOptions: AjvOptions = {},
    defaultErrorCode: string = BaseErrorCode.VALIDATION
  ) {
    const options = {
      ...JsonValidator.defaultValidateOptions,
      ...validateOptions,
    };
    this._ajv = new Ajv(options);
    addFormats(this._ajv);
    this._validateFunction = this._ajv.compile(schema);
    this.defaultErrorCode = defaultErrorCode;
  }

  public async validate(input: TInput) {
    if (!this._validateFunction(this.toJson(input))) {
      throw new ValidationError(
        this._ajv.errorsText(this._validateFunction.errors) ||
          "Validation error",
        {
          data: { errors: this._validateFunction.errors, input },
          errorCode: this.defaultErrorCode,
        }
      );
    }
    return input;
  }

  protected toJson(input: TInput) {
    return input;
    // return JSON.parse(JSON.stringify(input));
  }
}
