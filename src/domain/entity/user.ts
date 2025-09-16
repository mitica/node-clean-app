import {
  BaseEntity,
  EntityCreateData,
  EntityData,
  EntityUpdateData,
  RequiredJSONSchema
} from "../base";

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER"
}

export interface UserData extends EntityData {
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  isEmailVerified: boolean;
  lastLoginAt?: string;
}

export type UserCreateData = EntityCreateData<UserData>;
export type UserUpdateData = EntityUpdateData<UserData>;

export class User extends BaseEntity<UserData> implements UserData {
  get email() {
    return this._data.email;
  }
  get passwordHash() {
    return this._data.passwordHash;
  }
  get name() {
    return this._data.name;
  }
  get role() {
    return this._data.role;
  }
  get isEmailVerified() {
    return this._data.isEmailVerified;
  }
  get lastLoginAt() {
    return this._data.lastLoginAt;
  }

  static override jsonSchema: RequiredJSONSchema = {
    type: "object",
    properties: {
      ...super.jsonSchema.properties,
      email: { type: "string", format: "email", maxLength: 255 },
      passwordHash: { type: "string", minLength: 60, maxLength: 60 },
      name: { type: "string", maxLength: 255 },
      role: { type: "string", enum: Object.values(UserRole) },
      isEmailVerified: { type: "boolean" },
      lastLoginAt: { type: "string", format: "date-time" }
    },
    required: [
      ...super.jsonSchema.required,
      "email",
      "passwordHash",
      "name",
      "role",
      "isEmailVerified"
    ],
    additionalProperties: false
  };
}
