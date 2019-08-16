import { EntityData } from "../../entities/entity-data";

export interface UserCreateData extends Partial<EntityData> {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}
