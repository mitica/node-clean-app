import BaseModel from "./base-model";
import { User } from "../../../domain/entities/user/user";
import { UserSqlEntity } from "../entities/user-sql-entity";
import { UserRole } from "../../../domain/entities/user/user-role";

export default class UserModel extends BaseModel<UserSqlEntity> implements UserSqlEntity {
  firstName?: string;
  lastName?: string;
  password!: string;
  email!: string;
  role!: UserRole;

  static get tableName() {
    return "User";
  }

  static get relationMappings() {
    return {
      // targetUsers: {
      //   relation: Model.ManyToManyRelation,
      //   modelClass: "user",
      //   join: {
      //     from: "Activity.id",
      //     through: {
      //       from: "UserActivity.activityId",
      //       to: "UserActivity.userId"
      //     },
      //     to: "User.id"
      //   }
      // }
    };
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: User.jsonSchema.required,
      properties: {
        ...User.jsonSchema.properties,
        id: { type: "integer" }
      }
    };
  }
}
