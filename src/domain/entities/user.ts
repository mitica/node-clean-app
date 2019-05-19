import { Entity } from "./base";

export type UserRole = "user" | "owner" | "admin" | "moderator";

export interface User extends Entity {
  email: string;
  firstName?: string;
  lastName?: string;
  roles: UserRole[];
}

export type UserReadonlyKeys = "id" | "createdAt";
export type UserWritableKeys = Exclude<keyof User, UserReadonlyKeys>;

export interface UserCreate extends Partial<Entity> {
  email: string;
  firstName?: string;
  lastName?: string;
}
