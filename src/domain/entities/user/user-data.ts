import { UserRole } from "./user-role";
import { EntityData } from "../entity-data";

export interface UserData extends EntityData {
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  lastLoginAt?: Date;
}

export type UserReadonlyKeys = "id" | "createdAt";
export type UserWritableKeys = Exclude<keyof UserData, UserReadonlyKeys>;
