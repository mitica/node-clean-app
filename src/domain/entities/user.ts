import { IBaseEntity } from "./base";

export type UserRole = "user" | "owner" | "admin" | "moderator";

export interface IUser extends IBaseEntity {
  email: string
  firstName?: string
  lastName?: string
  roles: UserRole[]
}

export type UserReadonlyKeys = "id" | "createdAt";
export type UserWritableKeys = Exclude<keyof IUser, UserReadonlyKeys>;

export interface IUserCreate extends Partial<IBaseEntity> {
  email: string
  firstName?: string
  lastName?: string
}
