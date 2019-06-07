import * as yup from "yup";
import { YupDataValidator } from "../../../validators/yup-data-validator";
import { UserCreateDataSchemaFields } from "../../../repositories/user/user-create-data";

export type CreateUserInput = {
  email: string;
  firstName?: string;
  lastName?: string;
};

export class CreateUserInputValidator extends YupDataValidator<
  CreateUserInput
> {
  constructor() {
    super(schema, { stripUnknown: true });
  }
}

const schema = yup.object().shape({
  email: UserCreateDataSchemaFields.email,
  firstName: UserCreateDataSchemaFields.firstName,
  lastName: UserCreateDataSchemaFields.lastName
});
