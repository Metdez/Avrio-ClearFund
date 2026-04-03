"use client";

import { addDays } from "date-fns";
import { useEffect, useMemo, useState } from "react";

import { deals as seededDeals, processTemplates, tasks as seededTasks, vendors as seededVendors } from "@/mock-data";
import type { Deal, PipelineStage, Task, Vendor } from "@/types";
import { generateId } from "@/lib/utils";

export type WorkspaceTask = Task & {
  blockedReason?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  isDeleted?: boolean;
  deletedAt?: string;
};

export type WorkspaceDeal = Deal & {
  terminatedAt?: string;
  executionTaskMessage?: string;
};

type WorkspaceState = {
  deals: WorkspaceDeal[];
  tasks: WorkspaceTask[];
  vendors: Vendor[];
};

type TaskInput = Omit<
  WorkspaceTask,
  "id" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy" | "sortOrder"
> & {
  id?: string;
  sortOrder?: number;
};

const DEALS_STORAGE_KEY = "avrio-e005-deals";
const TASKS_STORAGE_KEY = "avrio-e005-tasks";
const VENDORS_STORAGE_KEY = "avrio-e005-vendors";
const CURRENT_USER_ID = "usr-001";
const CURRENT_USER_NAME = "Marcus Webb";

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getDefaultTemplate() {
  return processTemplates.find((template) => template.isDefault && !template.isArchived);
}

function getDealTasks(tasks: WorkspaceTask[], dealId: string, includeDeleted = true) {
  return tasks.filter((task) => task.dealId === dealId && (includeDeleted || !task.isDeleted));
}

function buildGeneratedTasks(deal: WorkspaceDeal): WorkspaceTask[] {
  const template = getDefaultTemplate();
  const executionStartDate = deal.executionStartDate;

  if (!template || template.tasks.length === 0 || !executionStartDate) {
    return [];
  }

  return template.tasks.map((templateTask) => ({
    id: generateId(),
    dealId: deal.id,
    name: templateTask.name,
    description: templateTask.description,
    assigneeType: templateTask.defaultAssigneeRole === "Deal Team" ? "Internal" : "Vendor",
    assigneeName: templateTask.defaultAssigneeRole === "Deal Team" ? CURRENT_USER_NAME : templateTask.defaultAssigneeRole,
    status: "Not Started",
    dueDate: templateTask.relativeDueDateOffsetDays != null
      ? addDays(new Date(executionStartDate), templateTask.relativeDueDateOffsetDays).toISOString()
      : undefined,
    sortOrder: templateTask.sortOrder,
    templateId: template.id,
    templateVersion: template.version,
    createdBy: CURRENT_USER_ID,
    createdAt: new Date().toISOString(),
    updatedBy: CURRENT_USER_ID,
    updatedAt: new Date().toISOString(),
  }));
}

function ensureExecutionTasks(state: WorkspaceState): WorkspaceState {
  let nextTasks = [...state.tasks];
  const nextDeals = state.deals.map((deal) => {
    const existingTasks = getDealTasks(nextTasks, deal.id, true);
    if (deal.pipelineStage !== "Execution") {
      return deal;
    }

    if (existingTasks.length > 0) {
      return {
        ...deal,
        executionTaskMessage: existingTasks.some((task) => task.templateId)
          ? "Execution tasks already exist for this deal."
          : deal.executionTaskMessage,
      };
    }

    const generatedTasks = buildGeneratedTasks(deal);
    nextTasks = [...nextTasks, ...generatedTasks];

    return {
      ...deal,
      executionTaskMessage: generatedTasks.length > 0
        ? `Generated ${generatedTasks.length} execution tasks from the default template.`
        : "No task template is configured. Add tasks manually or configure a template in Settings.",
    };
  });

  return {
    deals: nextDeals,
    tasks: normalizeTaskSortOrders(nextTasks),
    vendors: state.vendors,
  };
}

function readPersistedState(): WorkspaceState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const dealsValue = window.localStorage.getItem(DEALS_STORAGE_KEY);
    const tasksValue = window.localStorage.getItem(TASKS_STORAGE_KEY);
    const vendorsValue = window.localStorage.getItem(VENDORS_STORAGE_KEY);

    if (!dealsValue || !tasksValue || !vendorsValue) {
      return null;
    }

    return {
      deals: JSON.parse(dealsValue) as WorkspaceDeal[],
      tasks: JSON.parse(tasksValue) as WorkspaceTask[],
      vendors: JSON.parse(vendorsValue) as Vendor[],
    };
  } catch {
    return null;
  }
}

function buildSeedState(): WorkspaceState {
  return ensureExecutionTasks({
    deals: cloneValue(seededDeals) as WorkspaceDeal[],
    tasks: cloneValue(seededTasks) as WorkspaceTask[],
    vendors: cloneValue(seededVendors),
  });
}

function getInitialWorkspaceState(): WorkspaceState {
  const persisted = readPersistedState();
  return persisted ? ensureExecutionTasks(persisted) : buildSeedState();
}

function persistState(state: WorkspaceState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DEALS_STORAGE_KEY, JSON.stringify(state.deals));
  window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(state.tasks));
  window.localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(state.vendors));
}

function normalizeTaskSortOrders(tasks: WorkspaceTask[]) {
  const grouped = new Map<string, WorkspaceTask[]>();

  for (const task of tasks) {
    const list = grouped.get(task.dealId) ?? [];
    list.push(task);
    grouped.set(task.dealId, list);
  }

  return tasks.map((task) => {
    const ordered = (grouped.get(task.dealId) ?? [])
      .slice()
      .sort((left, right) => left.sortOrder - right.sortOrder);
    const nextSortOrder = ordered.findIndex((candidate) => candidate.id === task.id) + 1;

    return {
      ...task,
      sortOrder: nextSortOrder === 0 ? task.sortOrder : nextSortOrder,
    };
  });
}

export function isTaskOverdue(task: WorkspaceTask, now = new Date()) {
  if (!task.dueDate || task.status === "Complete" || task.status === "Cancelled" || task.isDeleted) {
    return false;
  }

  return new Date(task.dueDate).getTime() < now.getTime();
}

export function getDaysOverdue(task: WorkspaceTask, now = new Date()) {
  if (!isTaskOverdue(task, now)) {
    return 0;
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = now.getTime() - new Date(task.dueDate as string).getTime();
  return Math.max(1, Math.floor(diff / msPerDay));
}

export function getExecutionMetrics(tasks: WorkspaceTask[], now = new Date()) {
  const activeTasks = tasks.filter((task) => !task.isDeleted);
  const total = activeTasks.length;
  const complete = activeTasks.filter((task) => task.status === "Complete").length;
  const overdue = activeTasks.filter((task) => isTaskOverdue(task, now)).length;
  const percentage = total === 0 ? 0 : Math.round((complete / total) * 100);

  return {
    total,
    complete,
    overdue,
    percentage,
    readyForFunding: total > 0 && complete === total,
    hasOverdue: overdue > 0,
  };
}

export function useExecutionWorkspaceStore() {
  const [state, setState] = useState<WorkspaceState>(() => getInitialWorkspaceState());
  const isReady = true;

  useEffect(() => {
    persistState(state);
  }, [state]);

  const api = useMemo(() => ({
    reset() {
      const nextState = buildSeedState();
      setState(nextState);
    },
    upsertTask(input: TaskInput) {
      setState((current) => {
        const now = new Date().toISOString();
        const existing = input.id ? current.tasks.find((task) => task.id === input.id) : undefined;
        const dealTasks = getDealTasks(current.tasks, input.dealId, false);
        const nextTask: WorkspaceTask = existing
          ? {
              ...existing,
              ...input,
              completedAt: input.status === "Complete" ? existing.completedAt ?? now : undefined,
              updatedAt: now,
              updatedBy: CURRENT_USER_ID,
              isDeleted: false,
            }
          : {
              ...input,
              id: generateId(),
              sortOrder: input.sortOrder ?? dealTasks.length + 1,
              createdAt: now,
              createdBy: CURRENT_USER_ID,
              updatedAt: now,
              updatedBy: CURRENT_USER_ID,
            };

        const nextTasks = existing
          ? current.tasks.map((task) => (task.id === nextTask.id ? nextTask : task))
          : [...current.tasks, nextTask];

        return {
          ...current,
          tasks: normalizeTaskSortOrders(nextTasks),
        };
      });
    },
    updateTaskStatus(taskId: string, status: WorkspaceTask["status"], options?: { blockedReason?: string }) {
      setState((current) => {
        const now = new Date().toISOString();
        return {
          ...current,
          tasks: current.tasks.map((task) => {
            if (task.id !== taskId) {
              return task;
            }

            return {
              ...task,
              status,
              blockedReason:
                status === "Blocked"
                  ? options?.blockedReason ?? task.blockedReason
                  : task.blockedReason,
              completedAt:
                status === "Complete"
                  ? task.completedAt ?? now
                  : status === "In Progress" || status === "Not Started" || status === "Blocked" || status === "Cancelled"
                    ? undefined
                    : task.completedAt,
              updatedAt: now,
              updatedBy: CURRENT_USER_ID,
            };
          }),
        };
      });
    },
    toggleTaskDeleted(taskId: string, deleted: boolean) {
      setState((current) => ({
        ...current,
        tasks: current.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                isDeleted: deleted,
                deletedAt: deleted ? new Date().toISOString() : undefined,
                updatedAt: new Date().toISOString(),
                updatedBy: CURRENT_USER_ID,
              }
            : task
        ),
      }));
    },
    moveTask(taskId: string, direction: "up" | "down") {
      setState((current) => {
        const task = current.tasks.find((candidate) => candidate.id === taskId);
        if (!task) {
          return current;
        }

        const siblings = getDealTasks(current.tasks, task.dealId, false)
          .slice()
          .sort((left, right) => left.sortOrder - right.sortOrder);
        const index = siblings.findIndex((candidate) => candidate.id === taskId);
        const targetIndex = direction === "up" ? index - 1 : index + 1;

        if (index < 0 || targetIndex < 0 || targetIndex >= siblings.length) {
          return current;
        }

        const reordered = siblings.slice();
        const [moved] = reordered.splice(index, 1);
        reordered.splice(targetIndex, 0, moved);

        const sortOrderMap = new Map(
          reordered.map((candidate, orderedIndex) => [candidate.id, orderedIndex + 1])
        );

        return {
          ...current,
          tasks: current.tasks.map((candidate) =>
            candidate.dealId === task.dealId && !candidate.isDeleted
              ? {
                  ...candidate,
                  sortOrder: sortOrderMap.get(candidate.id) ?? candidate.sortOrder,
                  updatedAt: new Date().toISOString(),
                  updatedBy: CURRENT_USER_ID,
                }
              : candidate
          ),
        };
      });
    },
    updateDealStage(dealId: string, stage: PipelineStage, terminationReason?: string) {
      setState((current) => {
        const nextDeals = current.deals.map((deal) => {
          if (deal.id !== dealId) {
            return deal;
          }

          const nextDeal: WorkspaceDeal = {
            ...deal,
            pipelineStage: stage,
            updatedAt: new Date().toISOString(),
            updatedBy: CURRENT_USER_ID,
            executionStartDate:
              stage === "Execution" && !deal.executionStartDate
                ? new Date().toISOString()
                : deal.executionStartDate,
            terminationReason: stage === "Terminated" ? terminationReason : undefined,
            terminatedAt: stage === "Terminated" ? new Date().toISOString() : undefined,
          };

          return nextDeal;
        });

        const nextState = ensureExecutionTasks({
          deals: nextDeals,
          tasks:
            stage === "Terminated"
              ? current.tasks.map((task) =>
                  task.dealId === dealId && !task.isDeleted
                    ? {
                        ...task,
                        status: "Cancelled",
                        cancelledAt: new Date().toISOString(),
                        cancellationReason: terminationReason,
                        notes: [task.notes, `Cancelled due to deal termination: ${terminationReason}`]
                          .filter(Boolean)
                          .join(" "),
                        updatedAt: new Date().toISOString(),
                        updatedBy: CURRENT_USER_ID,
                      }
                    : task
                )
              : current.tasks,
          vendors: current.vendors,
        });

        if (stage === "Execution") {
          nextState.deals = nextState.deals.map((deal) =>
            deal.id === dealId
              ? {
                  ...deal,
                  executionTaskMessage:
                    getDealTasks(nextState.tasks, dealId, false).length > 0
                      ? "Execution tasks already exist for this deal."
                      : deal.executionTaskMessage,
                }
              : deal
          );
        }

        return nextState;
      });
    },
    reactivateDeal(dealId: string, stage: PipelineStage) {
      setState((current) =>
        ensureExecutionTasks({
          deals: current.deals.map((deal) =>
            deal.id === dealId
              ? {
                  ...deal,
                  pipelineStage: stage,
                  terminationReason: undefined,
                  terminatedAt: undefined,
                  updatedAt: new Date().toISOString(),
                  updatedBy: CURRENT_USER_ID,
                  executionStartDate:
                    stage === "Execution" && !deal.executionStartDate
                      ? new Date().toISOString()
                      : deal.executionStartDate,
                }
              : deal
          ),
          tasks: current.tasks,
          vendors: current.vendors,
        })
      );
    },
    upsertVendor(vendor: Partial<Vendor> & Pick<Vendor, "companyName" | "serviceType">) {
      setState((current) => {
        const now = new Date().toISOString();
        const existing = vendor.id ? current.vendors.find((item) => item.id === vendor.id) : undefined;
        const nextVendor: Vendor = existing
          ? {
              ...existing,
              ...vendor,
              updatedAt: now,
              updatedBy: CURRENT_USER_ID,
            }
          : {
              id: generateId(),
              companyName: vendor.companyName,
              contactPersonName: vendor.contactPersonName,
              contactEmail: vendor.contactEmail,
              contactPhone: vendor.contactPhone,
              serviceType: vendor.serviceType,
              notes: vendor.notes,
              isArchived: false,
              createdAt: now,
              createdBy: CURRENT_USER_ID,
              updatedAt: now,
              updatedBy: CURRENT_USER_ID,
            };

        const nextVendors = existing
          ? current.vendors.map((item) => (item.id === nextVendor.id ? nextVendor : item))
          : [...current.vendors, nextVendor];

        return {
          ...current,
          vendors: nextVendors.sort((left, right) => left.companyName.localeCompare(right.companyName)),
        };
      });
    },
  }), []);

  return {
    isReady,
    deals: state.deals,
    tasks: state.tasks,
    vendors: state.vendors,
    currentUserId: CURRENT_USER_ID,
    ...api,
  };
}
