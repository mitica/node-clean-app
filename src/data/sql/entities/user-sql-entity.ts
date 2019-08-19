import { BaseSqlEntity } from "./base-sql-entity";
import { UserData } from "../../../domain/entities/user/user-data";

export interface UserSqlEntity extends Omit<UserData, "id">, BaseSqlEntity {}
