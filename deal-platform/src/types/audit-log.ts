export interface AuditLog {
  id: string;
  userId: string;
  actionType: "Create" | "Update" | "Archive" | "Access";
  entityType: string;
  entityId: string;
  timestamp: string;
  ipAddress: string;
  changedFields?: Record<string, { from: unknown; to: unknown }>;
}
