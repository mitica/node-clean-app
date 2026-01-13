import { DomainContext } from "./context";
import { EntityData } from "./base/entity";
import {
  JSONSchema,
  RequiredArrayJSONSchema,
  RequiredJSONSchema,
} from "./base/json-schema";
import { BaseErrorCode, ForbiddenError } from "./base/errors";
import { delay } from "./base/utils";
import { Validator, JsonValidator } from "./base/validator";
import { IDomainEventBus } from "./base";

export interface UseCaseEvents<
  TInput,
  TOutput,
  TContext extends DomainContext = DomainContext
> {
  executed: { input: TInput; output: TOutput; ctx: TContext };
  executing: { input: TInput; ctx: TContext };
}

export interface UseCase<
  TInput,
  TOutput,
  TContext extends DomainContext = DomainContext
> {
  execute(input: TInput, ctx: TContext): Promise<TOutput>;
}

export interface StaticUseCase {
  readonly jsonSchema: RequiredJSONSchema | RequiredArrayJSONSchema | undefined;
}

export interface UseCaseOptions<TInput> {
  inputValidator?: Validator<TInput>;
  retryCount?: number;
  retryDelay?: number;
}

/**
 * Base UseCase class. All UseCases should extend this one.
 */
export abstract class BaseUseCase<
  TInput,
  TOutput,
  TContext extends DomainContext = DomainContext
> implements UseCase<TInput, TOutput, TContext>
{
  protected inputValidators: Validator<TInput>[] = [];
  protected options: UseCaseOptions<TInput> = {};

  public constructor(
    protected eventBus: IDomainEventBus,
    options?: UseCaseOptions<TInput>
  ) {
    this.options = options || {};
    this.setInputValidator(options?.inputValidator);
  }

  protected noAccess(info?: string) {
    throw new ForbiddenError(
      `No access to ${this.constructor.name}.${info ? ` (${info})` : ""}`
    );
  }

  protected checkCurrentUser<TUser extends EntityData>(user?: TUser) {
    if (!user || !user.id) this.noAccess();
  }

  protected checkIsAdmin(ctx: DomainContext) {
    if (!ctx.isAuthenticated || !ctx.isAdmin) this.noAccess();
  }

  protected checkIsAuthenticated(ctx: DomainContext) {
    if (!ctx.isAuthenticated) this.noAccess();
  }

  /**
   * Uses inputValidator or creates a new one using 'jsonSchema'.
   * @param inputValidator Input data validator
   */
  private setInputValidator(inputValidator?: Validator<TInput>) {
    const schema = (this.constructor as unknown as StaticUseCase).jsonSchema;
    if (schema)
      inputValidator = new JsonValidator(
        schema,
        {},
        BaseErrorCode.INVALID_INPUT
      );

    if (inputValidator) this.inputValidators.push(inputValidator);
  }

  /**
   * Pre execute operations: validation, etc.
   */
  protected async preExecute(input: TInput, _ctx: TContext): Promise<TInput> {
    let output = input;
    for (const validator of this.inputValidators) {
      output = await validator.validate(output);
    }
    return output;
  }

  public async execute(input: TInput, ctx: TContext) {
    const validatedInput = await this.preExecute(input, ctx);

    await this.onExecuting(input, ctx);

    let retryCount = 0;

    let error: Error | undefined;
    let output: TOutput | undefined;

    do {
      try {
        output = await this.innerExecute(validatedInput, ctx);
        error = undefined;
        break;
      } catch (e) {
        error = e as never;
      }
    } while (error && (await this.onError(input, ctx, retryCount++, error)));

    if (error || output === undefined)
      throw Error(`Error executing usecase: error must be defined`);

    await this.onExecuted(input, output, ctx);

    return output;
  }

  protected abstract innerExecute(
    input: TInput,
    ctx: TContext
  ): Promise<TOutput>;

  /**
   * Fire executed event.
   * @param output Created output
   */
  protected async onExecuted(input: TInput, output: TOutput, ctx: TContext) {
    const name = this.constructor.name;
    // logger.debug(`${this.constructor.name} executed.`);
    return this.eventBus.emit("usecase:executed", { name, input, output, ctx });
  }

  /**
   * Fire executing event.
   */
  protected async onExecuting(input: TInput, ctx: TContext) {
    const name = this.constructor.name;
    return this.eventBus.emit("usecase:executing", { name, input, ctx });
  }

  protected async onError(
    _input: TInput,
    _context: TContext,
    retryCount: number,
    error: Error
  ) {
    // const name = this.constructor.name;
    if (!this.options.retryCount || retryCount >= this.options.retryCount)
      throw error;

    // logger.debug(
    //   `${this.constructor.name} retrying (${retryCount}) due to error: ${error.message}`
    // );

    await delay(this.options.retryDelay || 1000);

    return true;
  }

  /**
   * Json Schema for validating input data
   */
  public static readonly jsonSchema:
    | RequiredJSONSchema
    | RequiredArrayJSONSchema
    | JSONSchema
    | undefined = undefined;
}
