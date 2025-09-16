import { EntityId } from "./base";

export interface DomainContext {
  userId?: EntityId;
  lang?: string;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
}
