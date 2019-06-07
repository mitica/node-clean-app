import * as yup from "yup";
import { YupDataValidator } from "../../../validators/yup-data-validator";
import { UserCreateDataSchemaFields } from "../../../repositories/user/user-create-data";

export type RegisterUserData = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export class RegisterUserDataValidator extends YupDataValidator<
  RegisterUserData
> {
  constructor() {
    super(schema, { stripUnknown: true });
  }
}

const schema = yup.object().shape({
  email: UserCreateDataSchemaFields.email,
  password: UserCreateDataSchemaFields.password,
  firstName: UserCreateDataSchemaFields.firstName,
  lastName: UserCreateDataSchemaFields.lastName
});
