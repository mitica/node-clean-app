import { UserData } from "../../../domain/entities/user/user-data";
import { MemoryEntity } from "./memory-entity";

export interface MemoryUser extends UserData, MemoryEntity {}
