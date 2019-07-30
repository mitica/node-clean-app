import { BaseEntity, EntityData, EntityType } from "../base";

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
  constructor(data: TData) {
    super(User.EntityType, data);
  }
  static get EntityType(): EntityType {
    return "user";
  }

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
    } else {
      this._data.firstName = value;
    }
  }

  get lastName() {
    return this._data.lastName;
  }
  set lastName(value: string | undefined) {
    if (value === undefined) {
      delete this._data.lastName;
    } else {
      this._data.lastName = value;
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

  static getFields() {
    return Object.keys(User.jsonSchema.properties);
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["id", "createdAt", "updatedAt", "email", "role"],
      properties: {
        id: { type: "string", maxLength: 40 },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        email: { type: "string", format: "email" },
        password: { type: "string", maxLength: 50, minLength: 6 },
        firstName: { type: "string", maxLength: 50 },
        lastName: { type: "string", maxLength: 50 },
        role: { type: "string", enum: ["user", "owner", "admin", "moderator"] }
      }
    };
  }
}
