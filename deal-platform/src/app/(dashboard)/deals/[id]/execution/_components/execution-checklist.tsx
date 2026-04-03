"use client";

import { useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import {
  AlertTriangle,
  CalendarIcon,
  CheckCircle2,
  Circle,
  Clock,
  ListChecks,
  Plus,
} from "lucide-react";

import { ProgressBar } from "@/components/shared/progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { processTemplates, users } from "@/mock-data";
import { cn, formatDate } from "@/lib/utils";

import {
  getDaysOverdue,
  isTaskOverdue,
  useExecutionWorkspaceStore,
  type WorkspaceTask,
} from "../_lib/execution-workspace-store";

type ChecklistItem = {
  id: string;
  description: string;
  assigneeName: string;
  dueDate?: string;
  isComplete: boolean;
  isOverdue: boolean;
  daysOverdue: number;
  sourceTask: WorkspaceTask;
};

function buildChecklistItems(tasks: WorkspaceTask[]): ChecklistItem[] {
  return tasks
    .filter((t) => !t.isDeleted && t.status !== "Cancelled")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((task) => ({
      id: task.id,
      description: task.name,
      assigneeName: task.assigneeName || "Unassigned",
      dueDate: task.dueDate,
      isComplete: task.status === "Complete",
      isOverdue: isTaskOverdue(task),
      daysOverdue: getDaysOverdue(task),
      sourceTask: task,
    }));
}

type InlineNewItem = {
  description: string;
  assigneeUserId: string;
  dueDate: string;
};

const emptyNewItem: InlineNewItem = {
  description: "",
  assigneeUserId: "",
  dueDate: "",
};

type ExecutionChecklistProps = {
  dealId: string;
};

export function ExecutionChecklist({ dealId }: ExecutionChecklistProps) {
  const { tasks, upsertTask, updateTaskStatus } =
    useExecutionWorkspaceStore();

  const [showAddRow, setShowAddRow] = useState(false);
  const [newItem, setNewItem] = useState<InlineNewItem>(emptyNewItem);
  const [templateConfirmOpen, setTemplateConfirmOpen] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(
    null
  );

  const dealTasks = useMemo(
    () => tasks.filter((t) => t.dealId === dealId),
    [tasks, dealId]
  );

  const items = useMemo(() => buildChecklistItems(dealTasks), [dealTasks]);

  const completeCount = items.filter((i) => i.isComplete).length;
  const totalCount = items.length;
  const percentage = totalCount === 0 ? 0 : Math.round((completeCount / totalCount) * 100);
  const overdueCount = items.filter((i) => i.isOverdue).length;

  const activeUsers = users.filter((u) => u.isActive);

  const availableTemplates = processTemplates.filter((t) => !t.isArchived);

  function handleToggleComplete(item: ChecklistItem) {
    const nextStatus = item.isComplete ? "Not Started" : "Complete";
    updateTaskStatus(item.id, nextStatus);
  }

  function handleAddItem() {
    if (!newItem.description.trim()) return;

    const assignee = users.find((u) => u.id === newItem.assigneeUserId);

    upsertTask({
      dealId,
      name: newItem.description.trim(),
      assigneeType: "Internal",
      assigneeName: assignee?.name ?? "Unassigned",
      assigneeUserId: newItem.assigneeUserId || undefined,
      status: "Not Started",
      dueDate: newItem.dueDate || undefined,
    });

    setNewItem(emptyNewItem);
    setShowAddRow(false);
  }

  function handleTemplateSelect(templateId: string) {
    if (templateId === "__none") return;

    const existingActive = dealTasks.filter(
      (t) => !t.isDeleted && t.status !== "Cancelled"
    );
    if (existingActive.length > 0) {
      setPendingTemplateId(templateId);
      setTemplateConfirmOpen(true);
    } else {
      applyTemplate(templateId);
    }
  }

  function applyTemplate(templateId: string) {
    const template = processTemplates.find((t) => t.id === templateId);
    if (!template) return;

    const now = new Date();
    const maxSort = dealTasks.reduce(
      (max, t) => Math.max(max, t.sortOrder),
      0
    );

    for (const templateTask of template.tasks) {
      upsertTask({
        dealId,
        name: templateTask.name,
        description: templateTask.description,
        assigneeType:
          templateTask.defaultAssigneeRole === "Deal Team"
            ? "Internal"
            : "Vendor",
        assigneeName: templateTask.defaultAssigneeRole,
        status: "Not Started",
        dueDate:
          templateTask.relativeDueDateOffsetDays != null
            ? addDays(now, templateTask.relativeDueDateOffsetDays).toISOString()
            : undefined,
        sortOrder: maxSort + templateTask.sortOrder,
        templateId: template.id,
        templateVersion: template.version,
      });
    }

    setTemplateConfirmOpen(false);
    setPendingTemplateId(null);
  }

  function getStatusIndicator(item: ChecklistItem) {
    if (item.isComplete) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
          <CheckCircle2 className="h-3 w-3" />
          Complete
        </span>
      );
    }
    if (item.isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
          <AlertTriangle className="h-3 w-3" />
          {item.daysOverdue}d overdue
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
        <Clock className="h-3 w-3" />
        On track
      </span>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Execution Checklist</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Quick-reference view &mdash;{" "}
              {totalCount === 0
                ? "no items yet"
                : `${completeCount} of ${totalCount} items complete`}
              {overdueCount > 0 && (
                <span className="ml-1 text-red-600 font-medium">
                  &bull; {overdueCount} overdue
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select onValueChange={(value: string | null) => { if (value) handleTemplateSelect(value); }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Load template..." />
              </SelectTrigger>
              <SelectContent>
                {availableTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} (v{t.version})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowAddRow(true);
                setNewItem(emptyNewItem);
              }}
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>

        {totalCount > 0 && (
          <div className="mt-3">
            <ProgressBar percentage={percentage} hasOverdue={overdueCount > 0} />
          </div>
        )}
      </CardHeader>

      <CardContent>
        {totalCount === 0 && !showAddRow ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <ListChecks className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              No checklist items yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add items manually or load a process template to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 px-2 py-3 transition-colors",
                  item.isComplete && "opacity-60",
                  item.isOverdue &&
                    !item.isComplete &&
                    "bg-red-50 rounded-lg"
                )}
              >
                <Checkbox
                  checked={item.isComplete}
                  onCheckedChange={() => handleToggleComplete(item)}
                  className="shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      item.isComplete && "line-through text-muted-foreground"
                    )}
                  >
                    {item.description}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{item.assigneeName}</span>
                    {item.dueDate && (
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {formatDate(item.dueDate)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0">{getStatusIndicator(item)}</div>
              </div>
            ))}

            {showAddRow && (
              <div className="flex flex-col gap-3 px-2 py-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                  <Input
                    placeholder="Checklist item description..."
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newItem.description.trim()) {
                        handleAddItem();
                      }
                      if (e.key === "Escape") {
                        setShowAddRow(false);
                      }
                    }}
                  />
                </div>
                <div className="ml-7 flex flex-wrap items-center gap-2">
                  <Select
                    value={newItem.assigneeUserId}
                    onValueChange={(value) =>
                      setNewItem((prev) => ({
                        ...prev,
                        assigneeUserId: value ?? "",
                      }))
                    }
                  >
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                      <SelectValue placeholder="Assign to..." />
                    </SelectTrigger>
                    <SelectContent>
                      {activeUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs font-normal"
                        />
                      }
                    >
                      <CalendarIcon className="h-3 w-3" />
                      {newItem.dueDate
                        ? format(new Date(newItem.dueDate), "MMM d, yyyy")
                        : "Due date"}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          newItem.dueDate
                            ? new Date(newItem.dueDate)
                            : undefined
                        }
                        onSelect={(date) =>
                          setNewItem((prev) => ({
                            ...prev,
                            dueDate: date ? date.toISOString() : "",
                          }))
                        }
                      />
                    </PopoverContent>
                  </Popover>

                  <div className="flex gap-1 ml-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => setShowAddRow(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 text-xs"
                      disabled={!newItem.description.trim()}
                      onClick={handleAddItem}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <Dialog open={templateConfirmOpen} onOpenChange={setTemplateConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add template tasks?</DialogTitle>
            <DialogDescription>
              This will add template tasks to your existing checklist. Your
              current items will not be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTemplateConfirmOpen(false);
                setPendingTemplateId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (pendingTemplateId) applyTemplate(pendingTemplateId);
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
