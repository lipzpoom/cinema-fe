import { apiClient } from "./api-client";

export class AuditLogService {
  static async getAllAuditLogs() {
    return apiClient.get("/auditlogs");
  }
}
