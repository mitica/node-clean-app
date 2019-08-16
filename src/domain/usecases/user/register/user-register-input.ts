import { User } from "../../../entities/user/user";
import { JsonDataValidator } from "../../../validators/json-data-validator";

export type UserRegisterInput = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export class UserRegisterInputValidator extends JsonDataValidator<
  UserRegisterInput
> {
  constructor() {
    super(new JsonDataValidator(UserRegisterInputValidator.jsonSchema));
  }

  static get jsonSchema() {
    const userSchema = User.jsonSchema;
    return {
      type: "object",
      required: ["email", "password"],
      properties: {
        email: userSchema.properties.email,
        password: userSchema.properties.password,
        firstName: userSchema.properties.firstName,
        lastName: userSchema.properties.lastName
      }
    };
  }
}
