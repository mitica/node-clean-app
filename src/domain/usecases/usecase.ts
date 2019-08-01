import { IEventEmitter, BaseEventEmitter } from "../event-emitter";
import { IDataValidator } from "../validators/data-validator";

export interface IUseCaseEvents<
  TInput extends any = any,
  TOutput extends any = any
> {
  preExecute: { input: Readonly<TInput> };
  postExecute: { output: Readonly<TOutput>; input: Readonly<TInput> };
}

export interface IUseCase<
  TInput = any,
  TOutput = any,
  TEvents extends IUseCaseEvents<TInput, TOutput> = IUseCaseEvents<
    TInput,
    TOutput
  >,
  TContext = any
> extends IEventEmitter<TEvents> {
  execute(
    input: Readonly<TInput>,
    context: Readonly<TContext>
  ): Promise<TOutput>;
}

/**
 * Base use case. All use cases should extends BaseUseCase.
 * All business logic should be defined in use cases.
 */
export abstract class BaseUseCase<
  TInput,
  TOutput,
  TEvents extends IUseCaseEvents<TInput, TOutput> = IUseCaseEvents<
    TInput,
    TOutput
  >,
  TContext = any
> extends BaseEventEmitter<TEvents>
  implements IUseCase<TInput, TOutput, TEvents, TContext> {
  constructor(
    private inputValidator?: IDataValidator<TInput, TInput, TContext>
  ) {
    super();
  }

  public async execute(
    input: Readonly<TInput>,
    context: Readonly<TContext>
  ): Promise<TOutput> {
    await this.emit("preExecute", { input });

    const validatedInput = await this.validateInput(input, context);

    const output = await this.innerExecute(validatedInput, context);

    await this.emit("postExecute", { output, input });

    return output;
  }

  /**
   * Validate input.
   * @param input Input data
   * @param context Context
   */
  protected async validateInput(
    input: Readonly<TInput>,
    context: Readonly<TContext>
  ) {
    if (this.inputValidator) {
      return this.inputValidator.validate(input, context);
    }
    return input;
  }

  /**
   * Every use case should implement this method.
   * @param input Input data
   * @param context Context
   */
  protected abstract innerExecute(
    input: Readonly<TInput>,
    context: Readonly<TContext>
  ): Promise<TOutput>;
}
