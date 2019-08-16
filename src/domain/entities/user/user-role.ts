export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN"
}

export type UserRoleType = keyof typeof UserRole;
