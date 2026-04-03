export interface FollowUpSequence {
  id: string;
  threadId?: string;
  taskId?: string;
  contactName: string;
  contactEmail: string;
  totalFollowUps: number;
  intervalDays: number;
  mode: "AutoSend" | "ApprovalRequired";
  status: "Active" | "Paused" | "Completed" | "Cancelled";
  followUpsSent: number;
  lastSentAt?: string;
  nextScheduledAt?: string;
  createdBy: string;
  createdAt: string;
}
