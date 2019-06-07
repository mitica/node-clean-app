import { BaseEntity, EntityData } from "../base";

export type UserRole = "user" | "owner" | "admin" | "moderator";

export interface UserData extends EntityData {
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
}

export type UserReadonlyKeys = "id" | "createdAt";
export type UserWritableKeys = Exclude<keyof UserData, UserReadonlyKeys>;

export class User<TData extends UserData = UserData> extends BaseEntity<TData>
  implements UserData {
  get email() {
    return this._data.email;
  }
  set email(value: string) {
    this._data.email = value;
  }

  get firstName() {
    return this._data.firstName;
  }
  set firstName(value: string | undefined) {
    if (value === undefined) {
      delete this._data.firstName;
    }
  }

  get lastName() {
    return this._data.lastName;
  }
  set lastName(value: string | undefined) {
    if (value === undefined) {
      delete this._data.lastName;
    }
  }

  get fullName() {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    if (!this.firstName) {
      return this.lastName;
    }
    if (!this.lastName) {
      return this.firstName;
    }
  }

  get role() {
    return this._data.role;
  }
  set role(value: UserRole) {
    this._data.role = value;
  }
}
