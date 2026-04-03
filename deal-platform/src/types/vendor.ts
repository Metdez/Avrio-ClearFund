export interface VendorContact {
  name: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface VendorNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  companyName: string;
  /** @deprecated Use contacts[0] instead */
  contactPersonName?: string;
  /** @deprecated Use contacts[0] instead */
  contactEmail?: string;
  /** @deprecated Use contacts[0] instead */
  contactPhone?: string;
  contacts?: VendorContact[];
  serviceType: string;
  notes?: string;
  vendorNotes?: VendorNote[];
  isArchived: boolean;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}
