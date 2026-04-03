export interface Communication {
  id: string;
  type: "Email" | "Note" | "StatusChange" | "ThreadCreated";
  emailSender?: string;
  emailRecipients?: string[];
  emailCc?: string[];
  emailSubject?: string;
  emailBody?: string;
  noteContent?: string;
  noteAuthor?: string;
  statusFrom?: string;
  statusTo?: string;
  entityType?: "Borrower" | "CapitalProvider" | "Deal" | "EngagementThread";
  entityId?: string;
  threadId?: string;
  dealId?: string;
  capitalProviderId?: string;
  borrowerId?: string;
  timestamp: string;
  createdBy: string;
}
