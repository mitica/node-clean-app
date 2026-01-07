import { EntityId } from "./base";
import { User } from "./entity";

export interface DomainContext {
  userId?: EntityId;
  lang?: string;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  currentUser?: User;
  ip?: string;
}
