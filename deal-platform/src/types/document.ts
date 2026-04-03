export interface Document {
  id: string;
  name: string;
  fileType: string;
  fileSizeBytes: number;
  entityType?: "Borrower" | "CapitalProvider" | "Deal";
  entityId?: string;
  uploadedBy: string;
  uploadedAt: string;
  version: number;
}
