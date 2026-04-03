export interface TemplateTaskDefinition {
  id: string;
  name: string;
  description?: string;
  defaultAssigneeRole: string;
  relativeDueDateOffsetDays?: number;
  sortOrder: number;
}

export interface ProcessTemplate {
  id: string;
  name: string;
  description?: string;
  version: number;
  isDefault: boolean;
  isArchived: boolean;
  tasks: TemplateTaskDefinition[];
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}
