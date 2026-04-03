export interface Task {
  id: string;
  dealId: string;
  name: string;
  description?: string;
  assigneeType: "Internal" | "Vendor";
  assigneeName: string;
  assigneeUserId?: string;
  vendorId?: string;
  status: "Not Started" | "In Progress" | "Blocked" | "Complete" | "Cancelled";
  dueDate?: string;
  completedAt?: string;
  notes?: string;
  sortOrder: number;
  templateId?: string;
  templateVersion?: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}
