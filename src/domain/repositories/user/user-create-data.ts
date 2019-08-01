import { EntityData } from "../../entities/base";

export interface UserCreateData extends Partial<EntityData> {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}
