export default interface EntityMapper<TSource, TEntity, TEntityCreate> {
  toEntity(input: TSource): TEntity;
  toSource(input: TEntityCreate): TSource;
}
