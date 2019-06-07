import * as yup from "yup";
import { EntityData } from "../../entities/base";
import { YupDataValidator } from "../../validators/yup-data-validator";

export interface UserCreateData extends Partial<EntityData> {
  email: string;
  firstName?: string;
  lastName?: string;
}

export class UserCreateDataValidator extends YupDataValidator<UserCreateData> {
  constructor() {
    super(schema);
  }
}

export const UserCreateDataSchemaFields = {
  // can be used for importing data or tests
  id: yup.string().matches(/^[a-z0-9]{1,40}$/),
  email: yup
    .string()
    .email()
    .required()
    .lowercase(),
  firstName: yup.string().max(100),
  lastName: yup.string().max(100),
  role: yup.string().oneOf(["user", "owner", "admin", "moderator"]).default("user"),
  createdAt: yup.date().default(() => new Date()),
  updatedAt: yup.date().default(() => new Date())
};

const schema = yup.object().shape(UserCreateDataSchemaFields);
