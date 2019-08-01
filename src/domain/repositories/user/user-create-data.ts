import { IEntityData } from "../../entities/base";

export interface IUserCreateData extends Partial<IEntityData> {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}
