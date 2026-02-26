import api from "./api";
import type { AuditLog } from "@/types/auditLog.types";

export interface GetAuditLogsFilter {
  actorId?: string;
  actionType?: string;
  targetType?: string;
}

export const getAuditLogs = async (filter?: GetAuditLogsFilter): Promise<AuditLog[]> => {
  const { data } = await api.get("/admin/audit-logs", { params: filter });
  return data.data;
};

export const getAuditLogsForTarget = async (targetType: string, targetId: string): Promise<AuditLog[]> => {
  const { data } = await api.get(`/admin/audit-logs/${targetType}/${targetId}`);
  return data.data;
};
