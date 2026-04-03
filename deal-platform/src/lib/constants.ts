// Pipeline stages in order
export const PIPELINE_STAGES = [
  "Prospect", "Qualifying", "Structuring", "Pitched", "Committed", "Execution", "Funded", "Closed"
] as const;

export const PIPELINE_STAGE_LABELS: Record<string, string> = {
  Prospect: "Prospect",
  Qualifying: "Qualifying",
  Structuring: "Structuring",
  Pitched: "Pitched",
  Committed: "Committed",
  Execution: "Execution",
  Funded: "Funded",
  Closed: "Closed",
  Terminated: "Terminated",
};

// CP Pitch statuses
export const CP_PITCH_STATUSES = ["Pitched", "Evaluating", "Terms Negotiating", "Committed", "Declined", "Withdrawn"] as const;

// Thread types
export const THREAD_TYPES = ["Deal Evaluation", "Credit Facility Negotiation", "JV Partnership", "Other"] as const;

// Thread statuses
export const THREAD_STATUSES = ["Active", "On Hold", "Won", "Lost", "Closed"] as const;

// Task statuses
export const TASK_STATUSES = ["Not Started", "In Progress", "Blocked", "Complete", "Cancelled"] as const;

// Credit facility statuses
export const FACILITY_STATUSES = ["Negotiating", "Active", "Expired", "Terminated"] as const;

// CP types
export const CP_TYPES = ["Bank", "Asset Manager", "Family Office", "Life Insurance Company", "Other"] as const;

// CP relationship types
export const RELATIONSHIP_TYPES = ["Prospective", "Transactional", "Credit Facility Partner"] as const;

// Project types (for borrowers and deals)
export const PROJECT_TYPES = ["Hotel", "Infrastructure", "Mining", "Commercial RE", "Other"] as const;

// User roles
export const USER_ROLES = ["Admin", "Deal Team", "Read-Only"] as const;

// Follow-up sequence modes
export const FOLLOW_UP_MODES = ["AutoSend", "ApprovalRequired"] as const;

// Follow-up sequence statuses
export const FOLLOW_UP_STATUSES = ["Active", "Paused", "Completed", "Cancelled"] as const;

// Notification types
export const NOTIFICATION_TYPES = ["OverdueTask", "CPResponse", "FollowUpReminder", "DealStageChange"] as const;

// Vendor service types
export const VENDOR_SERVICE_TYPES = [
  "Appraiser", "Law Firm", "Energy Consultant", "Municipality",
  "Title Company", "Environmental Consultant", "Insurance Broker",
  "Surveyor", "Engineering Firm", "Accounting Firm"
] as const;

// Communication types
export const COMMUNICATION_TYPES = ["Email", "Note", "StatusChange", "ThreadCreated"] as const;

// Entity types for linking
export const ENTITY_TYPES = ["Borrower", "CapitalProvider", "Deal", "EngagementThread"] as const;

// Audit log action types
export const AUDIT_ACTION_TYPES = ["Create", "Update", "Archive", "Access"] as const;

// Assignee types
export const ASSIGNEE_TYPES = ["Internal", "Vendor"] as const;

// Document file types
export const DOCUMENT_FILE_TYPES = ["PDF", "DOCX", "XLSX", "PPTX", "PNG", "JPG"] as const;

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

// Status color mapping for Tailwind classes
export const PIPELINE_STAGE_COLORS: Record<string, string> = {
  Prospect: "bg-slate-100 text-slate-700",
  Qualifying: "bg-blue-100 text-blue-700",
  Structuring: "bg-indigo-100 text-indigo-700",
  Pitched: "bg-purple-100 text-purple-700",
  Committed: "bg-emerald-100 text-emerald-700",
  Execution: "bg-amber-100 text-amber-700",
  Funded: "bg-green-100 text-green-700",
  Closed: "bg-gray-100 text-gray-700",
  Terminated: "bg-red-100 text-red-700",
};

export const TASK_STATUS_COLORS: Record<string, string> = {
  "Not Started": "bg-slate-100 text-slate-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Blocked: "bg-red-100 text-red-700",
  Complete: "bg-green-100 text-green-700",
  Cancelled: "bg-gray-100 text-gray-700",
};

export const THREAD_STATUS_COLORS: Record<string, string> = {
  Active: "bg-blue-100 text-blue-700",
  "On Hold": "bg-amber-100 text-amber-700",
  Won: "bg-green-100 text-green-700",
  Lost: "bg-red-100 text-red-700",
  Closed: "bg-gray-100 text-gray-700",
};

export const CP_PITCH_STATUS_COLORS: Record<string, string> = {
  Pitched: "bg-purple-100 text-purple-700",
  Evaluating: "bg-blue-100 text-blue-700",
  "Terms Negotiating": "bg-amber-100 text-amber-700",
  Committed: "bg-green-100 text-green-700",
  Declined: "bg-red-100 text-red-700",
  Withdrawn: "bg-gray-100 text-gray-700",
};

export const FACILITY_STATUS_COLORS: Record<string, string> = {
  Negotiating: "bg-amber-100 text-amber-700",
  Active: "bg-green-100 text-green-700",
  Expired: "bg-gray-100 text-gray-700",
  Terminated: "bg-red-100 text-red-700",
};
