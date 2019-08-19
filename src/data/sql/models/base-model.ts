import { Model, ModelClass } from "objection";
import { BaseSqlEntity } from "../entities/base-sql-entity";

export default class BaseModel<
  TData extends BaseSqlEntity = BaseSqlEntity
> extends Model {
  id!: number;
  createdAt!: Date;
  updatedAt?: Date;

  static get modelPaths() {
    return [__dirname];
  }

  static get useLimitInFirst() {
    return true;
  }

  static get<M extends BaseModel>(this: ModelClass<M>, id: number) {
    return this.query().findById(id);
  }

  // static async upsert(args, ...conflicts) {
  //   const columns = Object.keys(args);
  //   const values = columns.map(c => args[c]);
  //   const sql = `
  // 		INSERT INTO ?? ( ${toIdentifiers(columns)} )
  // 		VALUES ( ${toValues(values)} )
  // 		ON CONFLICT ( ${toIdentifiers(conflicts)} )
  // 		DO UPDATE SET ${toDict(args)}
  // 		RETURNING *;
  // 	`;
  //   const results = await this.raw(sql, [
  //     this.tableName,
  //     ...columns,
  //     ...values,
  //     ...conflicts,
  //     ...toMix(args)
  //   ]);
  //   return results.rows;
  // }

  // static async upsertOne(args, ...conflicts) {
  //   const rows = await this.upsert(args, conflicts);
  //   return rows.length > 0 ? rows[0] : null;
  // }

  // patch(data) {
  //   return this.$query()
  //     .patch(data)
  //     .returning("*")
  //     .first();
  // }

  validate() {
    return this;
  }

  $beforeInsert() {
    this.createdAt = new Date();

    this.validate();
  }

  $beforeUpdate() {
    this.updatedAt = new Date();

    this.validate();
  }

  toData(): TData {
    return this.toJSON() as TData;
  }
}
