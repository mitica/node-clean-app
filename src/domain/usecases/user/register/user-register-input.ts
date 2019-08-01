import { User } from "../../../entities/user/user";
import { IUserRepository } from "../../../repositories/user/user-repository";
import { EmailExistsError } from "../../../errors/validation-error";
import { JsonDataValidator } from "../../../validators/json-data-validator";

export type UserRegisterInput = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export class UserRegisterInputValidator
  extends JsonDataValidator<UserRegisterInput> {

  constructor(readonly userRepository: IUserRepository) {
    super(new JsonDataValidator(
      UserRegisterInputValidator.jsonSchema
    ));
  }

  async validate(input: Readonly<UserRegisterInput>) {
    await super.validate(input);

    const user = await this.userRepository.getByEmail(input.email);
    if (user) {
      throw new EmailExistsError(input.email);
    }
    return input;
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
