export interface IDataValidator<
  TInput,
  TOutput = TInput,
  TContext = {}
> {
  validate(data: Readonly<TInput>, context?: Readonly<TContext>): Promise<TOutput>;
}
