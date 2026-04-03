export type PipelineStage =
  | "Prospect"
  | "Qualifying"
  | "Structuring"
  | "Pitched"
  | "Committed"
  | "Execution"
  | "Funded"
  | "Closed"
  | "Terminated";

export interface Deal {
  id: string;
  name: string;
  borrowerId: string;
  projectType?: string;
  location?: string;
  estimatedDealSize?: number;
  traditionalFinancingPct?: number;
  paceFinancingPct?: number;
  pipelineStage: PipelineStage;
  notes?: string;
  terminationReason?: string;
  executionStartDate?: string;
  isArchived: boolean;
  archivedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export interface DealNote {
  id: string;
  dealId: string;
  authorName: string;
  content: string;
  pipelineStageAtCreation: PipelineStage;
  createdAt: string;
}
