export interface CreditFacility {
  id: string;
  capitalProviderId: string;
  name: string;
  facilitySizeDollars: number;
  annualAllocationDollars?: number;
  spreadSplitPct?: number;
  termLength?: string;
  refinancingProvisions?: string;
  status: "Negotiating" | "Active" | "Expired" | "Terminated";
  startDate?: string;
  endDate?: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}
