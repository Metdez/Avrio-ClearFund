export interface CapitalProvider {
  id: string;
  firmName: string;
  contactPersonName?: string;
  contactEmail?: string;
  contactPhone?: string;
  type: "Bank" | "Asset Manager" | "Family Office" | "Life Insurance Company" | "Other";
  relationshipType: "Prospective" | "Transactional" | "Credit Facility Partner";
  notes?: string;
  isArchived: boolean;
  archivedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}
