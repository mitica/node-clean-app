import { BaseEntity, EntityType } from "../base-entity";
import { UserRole } from "./user-role";
import { UserData } from "./user-data";

export class User<TData extends UserData = UserData> extends BaseEntity<TData>
  implements UserData {
  constructor(data: TData) {
    super(data, User.EntityType);
  }

  static get EntityType(): EntityType {
    return "user";
  }

  get password() {
    return this.get("password");
  }
  set password(_value: TData["password"]) {
    throw new Error(`Password cannot be set`);
  }

  get email() {
    return this.get("email");
  }
  set email(value: TData["email"]) {
    this.set("email", value);
  }

  get firstName() {
    return this.get("firstName");
  }
  set firstName(value: TData["firstName"]) {
    this.set("firstName", value);
  }

  get lastName() {
    return this.get("lastName");
  }
  set lastName(value: TData["lastName"]) {
    this.set("lastName", value);
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
    return this.get("role");
  }
  set role(value: TData["role"]) {
    this.set("role", value);
  }

  get lastLoginAt() {
    return this.get("lastLoginAt");
  }
  set lastLoginAt(value: TData["lastLoginAt"]) {
    this.set("lastLoginAt", value);
  }

  static get jsonSchema() {
    return {
      type: "object",
      required: ["email", "password", "role"],
      properties: {
        id: { type: "string", maxLength: 40 },
        createdAt: { type: "string", format: "datetime" },
        updatedAt: { type: "string", format: "datetime" },
        email: { type: "string", format: "email" },
        password: { type: "string", maxLength: 50, minLength: 6 },
        firstName: { type: "string", maxLength: 50 },
        lastName: { type: "string", maxLength: 50 },
        role: { type: "string", enum: Object.values(UserRole) },
        lastLoginAt: { type: "string", format: "datetime" }
      }
    };
  }
}
