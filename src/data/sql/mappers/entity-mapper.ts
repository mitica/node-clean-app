export default interface EntityMapper<TEntity, TData, TEntityCreate> {
  toEntity(input: TData): TEntity;
  fromCreate(input: TEntityCreate): Partial<TData>;
}
