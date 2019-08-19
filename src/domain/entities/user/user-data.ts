import { UserRole } from "./user-role";
import { EntityData } from "../entity-data";

export interface UserData extends EntityData {
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  lastLoginAt?: Date;
  password: string;
}

export type UserReadonlyKeys = "id" | "createdAt";
export type UserWritableKeys = Exclude<keyof UserData, UserReadonlyKeys>;
