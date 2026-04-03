export interface BorrowerContact {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface Borrower {
  id: string;
  name: string;
  contacts: BorrowerContact[];
  projectType?: string;
  location?: string;
  notes?: string;
  isArchived: boolean;
  archivedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}
