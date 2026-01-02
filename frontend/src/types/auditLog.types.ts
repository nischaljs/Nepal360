import type { CurrentUser } from "./auth.types";

export interface AuditLog {
  id: string;
  actorType: "ADMIN" | "USER" | "SYSTEM";
  actorId: string;
  actionType: string;
  targetType: string;
  targetId: string;
  note: string | null;
  createdAt: string;
  actor: Partial<CurrentUser>;
}
