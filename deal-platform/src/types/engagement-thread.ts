export interface EngagementThread {
  id: string;
  capitalProviderId: string;
  dealId?: string;
  type: "Deal Evaluation" | "Credit Facility Negotiation" | "JV Partnership" | "Other";
  title: string;
  description?: string;
  status: "Active" | "On Hold" | "Won" | "Lost" | "Closed";
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}
