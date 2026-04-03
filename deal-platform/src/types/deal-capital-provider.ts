export interface DealCapitalProvider {
  id: string;
  dealId: string;
  capitalProviderId: string;
  status: "Pitched" | "Evaluating" | "Terms Negotiating" | "Committed" | "Declined" | "Withdrawn";
  engagementThreadId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
