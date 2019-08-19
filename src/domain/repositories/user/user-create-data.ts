import { UserData } from "../../entities/user/user-data";
import { WithOptional } from "../../types";
import { JsonDataValidator } from "../../validators/json-data-validator";
import { User } from "../../entities/user/user";
import { EntityData } from "../../entities/entity-data";

export interface UserCreateData
  extends WithOptional<UserData, keyof EntityData | "role"> {}

export class UserCreateDataValidator extends JsonDataValidator<UserCreateData> {
  constructor() {
    super(new JsonDataValidator(UserCreateDataValidator.jsonSchema));
  }

  static get jsonSchema() {
    return User.jsonSchema;
  }
}
