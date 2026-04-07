"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { z } from "zod";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CalendarIcon,
  ClipboardList,
  Link2,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { borrowers, users } from "@/mock-data";
import { PIPELINE_STAGE_LABELS, PIPELINE_STAGES, TASK_STATUSES } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import type { PipelineStage } from "@/types";

import {
  getDaysOverdue,
  getExecutionMetrics,
  isTaskOverdue,
  useExecutionWorkspaceStore,
  type WorkspaceTask,
} from "../_lib/execution-workspace-store";
import { ExecutionChecklist } from "./execution-checklist";

const stageOptions = [...PIPELINE_STAGES, "Terminated"] as const;

const taskFormSchema = z.object({
  name: z.string().trim().min(1, "Task name is required").max(255, "Task name must be 255 characters or fewer"),
  description: z.string().max(2000, "Description must be 2000 characters or fewer").optional().or(z.literal("")),
  assigneeType: z.enum(["Internal", "Vendor"]),
  assigneeName: z.string().trim().min(1, "Assignee is required"),
  assigneeUserId: z.string().optional().or(z.literal("")),
  vendorId: z.string().optional().or(z.literal("")),
  status: z.enum(TASK_STATUSES),
  dueDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(2000, "Notes must be 2000 characters or fewer").optional().or(z.literal("")),
  blockedReason: z.string().max(1000, "Blocked reason must be 1000 characters or fewer").optional().or(z.literal("")),
}).superRefine((value, ctx) => {
  if (value.status === "Blocked" && !value.blockedReason?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Blocked reason is required when status is Blocked",
      path: ["blockedReason"],
    });
  }
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const terminationSchema = z.object({
  stage: z.enum(stageOptions),
  terminationReason: z.string().max(2000, "Termination reason must be 2000 characters or fewer").optional().or(z.literal("")),
}).superRefine((value, ctx) => {
  if (value.stage === "Terminated" && !value.terminationReason?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Termination reason is required when a deal is terminated",
      path: ["terminationReason"],
    });
  }
});

const taskFormResolver = zodResolver(taskFormSchema as never) as Resolver<TaskFormValues>;
const terminationResolver = zodResolver(terminationSchema as never) as Resolver<z.infer<typeof terminationSchema>>;

type ExecutionWorkspaceProps = {
  dealId: string;
};

function getNotesPreview(task: WorkspaceTask) {
  const preview = task.notes?.trim() || task.blockedReason?.trim() || task.cancellationReason?.trim() || "No notes";
  return preview.length > 70 ? `${preview.slice(0, 67)}...` : preview;
}

function DueDateField({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" className="justify-start text-left font-normal" />}>
        <CalendarIcon className="h-4 w-4" />
        {value ? format(new Date(value), "MMM d, yyyy") : "Pick a due date"}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value ? new Date(value) : undefined}
          onSelect={(date) => onChange(date ? date.toISOString() : "")}
        />
      </PopoverContent>
    </Popover>
  );
}

function TaskFormDialog({
  open,
  onOpenChange,
  task,
  vendors,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: WorkspaceTask | null;
  vendors: ReturnType<typeof useExecutionWorkspaceStore>["vendors"];
  onSubmit: (values: TaskFormValues) => void;
}) {
  const form = useForm<TaskFormValues>({
    resolver: taskFormResolver,
    defaultValues: {
      name: task?.name ?? "",
      description: task?.description ?? "",
      assigneeType: task?.assigneeType ?? "Internal",
      assigneeName: task?.assigneeName ?? "",
      assigneeUserId: task?.assigneeUserId ?? "",
      vendorId: task?.vendorId ?? "",
      status: task?.status ?? "Not Started",
      dueDate: task?.dueDate ?? "",
      notes: task?.notes ?? "",
      blockedReason: task?.blockedReason ?? "",
    },
    values: {
      name: task?.name ?? "",
      description: task?.description ?? "",
      assigneeType: task?.assigneeType ?? "Internal",
      assigneeName: task?.assigneeName ?? "",
      assigneeUserId: task?.assigneeUserId ?? "",
      vendorId: task?.vendorId ?? "",
      status: task?.status ?? "Not Started",
      dueDate: task?.dueDate ?? "",
      notes: task?.notes ?? "",
      blockedReason: task?.blockedReason ?? "",
    },
  });

  const assigneeType = form.watch("assigneeType");
  const status = form.watch("status");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task ? "Edit execution task" : "Add execution task"}</DialogTitle>
          <DialogDescription>
            Capture ownership, timing, and notes so the entire deal team can track execution in one place.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => {
            onSubmit(values);
            onOpenChange(false);
            form.reset();
          })}
        >
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="task-name">Task Name</Label>
            <Input id="task-name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea id="task-description" rows={3} {...form.register("description")} />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Assignee Type</Label>
            <Controller
              control={form.control}
              name="assigneeType"
              render={({ field }) => (
                <div className="flex gap-2">
                  {["Internal", "Vendor"].map((value) => (
                    <Button
                      key={value}
                      type="button"
                      variant={field.value === value ? "default" : "outline"}
                      className="flex-1"
                      onClick={() => {
                        field.onChange(value);
                        form.setValue("assigneeName", "");
                        form.setValue("assigneeUserId", "");
                        form.setValue("vendorId", "");
                      }}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Assignee Name</Label>
            <Controller
              control={form.control}
              name={assigneeType === "Internal" ? "assigneeUserId" : "vendorId"}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (assigneeType === "Internal") {
                      const match = users.find((user) => user.id === value);
                      form.setValue("assigneeName", match?.name ?? "");
                    } else {
                      const match = vendors.find((vendor) => vendor.id === value);
                      form.setValue("assigneeName", match?.companyName ?? "");
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={assigneeType === "Internal" ? "Choose a team member" : "Choose a vendor"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(assigneeType === "Internal" ? users.filter((user) => user.isActive) : vendors).map((option) => (
                      <SelectItem
                        key={option.id}
                        value={option.id}
                      >
                        {"name" in option ? option.name : option.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.assigneeName && (
              <p className="text-sm text-destructive">{form.formState.errors.assigneeName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map((statusValue) => (
                      <SelectItem key={statusValue} value={statusValue}>
                        {statusValue}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Controller
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <DueDateField value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          {status === "Blocked" && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="task-blocked-reason">Reason Blocked</Label>
              <Textarea id="task-blocked-reason" rows={3} {...form.register("blockedReason")} />
              {form.formState.errors.blockedReason && (
                <p className="text-sm text-destructive">{form.formState.errors.blockedReason.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="task-notes">Notes</Label>
            <Textarea id="task-notes" rows={4} {...form.register("notes")} />
            {form.formState.errors.notes && (
              <p className="text-sm text-destructive">{form.formState.errors.notes.message}</p>
            )}
          </div>

          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{task ? "Save changes" : "Add task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TerminationControls({
  currentStage,
  currentReason,
  onSubmit,
  onReactivate,
}: {
  currentStage: PipelineStage;
  currentReason?: string;
  onSubmit: (stage: PipelineStage | "Terminated", terminationReason?: string) => void;
  onReactivate: (stage: PipelineStage) => void;
}) {
  const form = useForm<z.infer<typeof terminationSchema>>({
    resolver: terminationResolver,
    defaultValues: {
      stage: currentStage,
      terminationReason: currentReason ?? "",
    },
    values: {
      stage: currentStage,
      terminationReason: currentReason ?? "",
    },
  });

  const stage = form.watch("stage");

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <form
          className="grid flex-1 gap-3 lg:grid-cols-[220px_1fr_auto]"
          onSubmit={form.handleSubmit((values) => onSubmit(values.stage, values.terminationReason))}
        >
          <div className="space-y-2">
            <Label>Pipeline Stage</Label>
            <Controller
              control={form.control}
              name="stage"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(PIPELINE_STAGE_LABELS).map((stageValue) => (
                      <SelectItem key={stageValue} value={stageValue}>
                        {PIPELINE_STAGE_LABELS[stageValue]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {stage === "Terminated" && (
            <div className="space-y-2">
              <Label htmlFor="termination-reason">Termination Reason</Label>
              <Textarea id="termination-reason" rows={2} {...form.register("terminationReason")} />
              {form.formState.errors.terminationReason && (
                <p className="text-sm text-destructive">{form.formState.errors.terminationReason.message}</p>
              )}
            </div>
          )}

          <Button type="submit">Update stage</Button>
        </form>

        {currentStage === "Terminated" && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="font-medium">Terminated</p>
            <p>{currentReason || "Reason not captured."}</p>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" onClick={() => onReactivate("Execution")}>
                <RotateCcw className="h-4 w-4" />
                Reactivate to Execution
              </Button>
              <Button variant="outline" onClick={() => onReactivate("Committed")}>
                <RotateCcw className="h-4 w-4" />
                Reactivate to Committed
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ExecutionWorkspace({ dealId }: ExecutionWorkspaceProps) {
  const {
    deals,
    tasks,
    vendors,
    isReady,
    moveTask,
    toggleTaskDeleted,
    updateDealStage,
    updateTaskStatus,
    upsertTask,
    reactivateDeal,
  } = useExecutionWorkspaceStore();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WorkspaceTask | null>(null);
  const [showDeletedTasks, setShowDeletedTasks] = useState(false);
  const [sortOverdueFirst, setSortOverdueFirst] = useState(true);

  const deal = deals.find((item) => item.id === dealId);
  const borrower = borrowers.find((item) => item.id === deal?.borrowerId);

  const dealTasks = useMemo(() => {
    const filtered = tasks.filter((task) => task.dealId === dealId && (showDeletedTasks || !task.isDeleted));
    return filtered.sort((left, right) => {
      if (sortOverdueFirst) {
        const overdueDiff = Number(isTaskOverdue(right)) - Number(isTaskOverdue(left));
        if (overdueDiff !== 0) {
          return overdueDiff;
        }
      }

      return left.sortOrder - right.sortOrder;
    });
  }, [dealId, showDeletedTasks, sortOverdueFirst, tasks]);

  const metrics = useMemo(() => getExecutionMetrics(dealTasks), [dealTasks]);

  const columns: ColumnDef<WorkspaceTask>[] = [
    {
      key: "name",
      header: "Task Name",
      mobilePriority: 1,
      render: (task) => (
        <div
          className={cn(
            "space-y-1 rounded-r-lg px-3 py-2",
            isTaskOverdue(task) && "border-l-4 border-red-500 bg-red-50"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">{task.name}</span>
            {task.status === "Blocked" && <AlertTriangle className="h-4 w-4 text-red-600" />}
          </div>
          {task.description && (
            <p className="text-xs text-muted-foreground">{task.description}</p>
          )}
          {task.completedAt && (
            <p className="text-xs text-emerald-700">
              Completed {format(new Date(task.completedAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          )}
          {task.isDeleted && (
            <p className="text-xs text-muted-foreground">Soft deleted</p>
          )}
        </div>
      ),
    },
    {
      key: "assigneeName",
      header: "Assignee",
      mobilePriority: 2,
      render: (task) => (
        <div className="space-y-1">
          <p className="font-medium">{task.assigneeName || "Unassigned"}</p>
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
              task.assigneeType === "Internal"
                ? "bg-blue-100 text-blue-700"
                : "bg-amber-100 text-amber-700"
            )}
          >
            {task.assigneeType}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      mobilePriority: 1,
      render: (task) => (
        <Select
          value={task.status}
          onValueChange={(value) => {
            if (value === "Blocked" && !task.blockedReason?.trim()) {
              setEditingTask(task);
              setIsTaskDialogOpen(true);
              return;
            }

            updateTaskStatus(task.id, value as WorkspaceTask["status"]);
          }}
        >
          <SelectTrigger
            className="h-auto w-auto border-0 bg-transparent p-0 shadow-none"
            onClick={(event) => event.stopPropagation()}
          >
            <StatusBadge status={task.status} context="task" className="cursor-pointer" />
          </SelectTrigger>
          <SelectContent>
            {TASK_STATUSES.map((statusValue) => (
              <SelectItem key={statusValue} value={statusValue}>
                {statusValue}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      mobilePriority: 2,
      render: (task) => (
        <div className="space-y-1">
          <p>{task.dueDate ? formatDate(task.dueDate) : "No due date"}</p>
          {isTaskOverdue(task) && (
            <p className="text-xs font-medium text-red-700">
              {getDaysOverdue(task)} days overdue
            </p>
          )}
        </div>
      ),
    },
    {
      key: "notes",
      header: "Notes Preview",
      render: (task) => (
        <p className="max-w-xs text-sm text-muted-foreground">{getNotesPreview(task)}</p>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (task) => (
        <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
          <Button variant="ghost" size="icon-sm" onClick={() => moveTask(task.id, "up")}>
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => moveTask(task.id, "down")}>
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setEditingTask(task);
              setIsTaskDialogOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => toggleTaskDeleted(task.id, !task.isDeleted)}
          >
            {task.isDeleted ? <RotateCcw className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      ),
    },
  ];

  if (!isReady) {
    return <LoadingSkeleton layout="table" rows={8} columns={6} />;
  }

  if (!deal) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Deal not found"
        description="The execution workspace could not locate this deal."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${deal.name} Execution`}
        description={borrower ? `${borrower.name} • ${deal.location ?? "Location pending"}` : "Execution workspace"}
        actions={(
          <div className="flex items-center gap-2">
            <Link href={`/deals/${deal.id}`}>
              <Button variant="outline">
                <Link2 className="h-4 w-4" />
                Deal detail
              </Button>
            </Link>
            <Button
              onClick={() => {
                setEditingTask(null);
                setIsTaskDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>
        )}
      />

      {deal.pipelineStage === "Terminated" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold">Deal terminated</p>
              <p className="text-sm">
                {deal.terminationReason || "No reason provided."}
              </p>
            </div>
            <Button variant="outline" onClick={() => reactivateDeal(deal.id, "Execution")}>
              <RotateCcw className="h-4 w-4" />
              Reactivate
            </Button>
          </div>
        </div>
      )}

      <section className="rounded-xl border bg-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Execution progress</h2>
              {metrics.readyForFunding && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Ready for funding
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {metrics.total === 0
                ? "No tasks defined"
                : `${metrics.complete} of ${metrics.total} tasks complete${metrics.hasOverdue ? ` • ${metrics.overdue} overdue` : ""}`}
            </p>
            {deal.executionTaskMessage && (
              <p className="text-sm text-muted-foreground">{deal.executionTaskMessage}</p>
            )}
          </div>
          <div className="w-full max-w-xl space-y-2">
            <ProgressBar percentage={metrics.percentage} hasOverdue={metrics.hasOverdue} />
            <p className="text-xs text-muted-foreground">
              Green when execution is above 75% with no overdue tasks, amber when execution needs attention, red when completion is below 50%.
            </p>
          </div>
        </div>
      </section>

      <ExecutionChecklist dealId={deal.id} />

      <TerminationControls
        currentStage={deal.pipelineStage}
        currentReason={deal.terminationReason}
        onSubmit={(stage, terminationReason) => updateDealStage(deal.id, stage as PipelineStage, terminationReason)}
        onReactivate={(stage) => reactivateDeal(deal.id, stage)}
      />

      <section className="rounded-xl border bg-card p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Task checklist</h2>
            <p className="text-sm text-muted-foreground">
              Reorder tasks, update statuses inline, and keep every vendor and internal owner visible.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant={sortOverdueFirst ? "default" : "outline"} onClick={() => setSortOverdueFirst((value) => !value)}>
              <AlertTriangle className="h-4 w-4" />
              Sort by overdue first
            </Button>
            <Button variant={showDeletedTasks ? "default" : "outline"} onClick={() => setShowDeletedTasks((value) => !value)}>
              <Trash2 className="h-4 w-4" />
              {showDeletedTasks ? "Hide deleted" : "Show deleted"}
            </Button>
          </div>
        </div>

        {dealTasks.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No execution tasks defined"
            description="This deal is ready for a task list. Add tasks manually or move the deal into Execution to generate the default checklist."
            actionLabel="Add Task"
            onAction={() => {
              setEditingTask(null);
              setIsTaskDialogOpen(true);
            }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={dealTasks}
            onRowClick={(task) => {
              setEditingTask(task);
              setIsTaskDialogOpen(true);
            }}
          />
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 xl:col-span-2">
          <h2 className="text-lg font-semibold">Vendor coverage</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {vendors.length} vendors available for assignment across execution tasks.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {vendors.slice(0, 8).map((vendor) => (
              <Link key={vendor.id} href={`/vendors/${vendor.id}`} className="rounded-full border px-3 py-1 text-sm hover:bg-muted">
                {vendor.companyName}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="text-lg font-semibold">Timeline highlights</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-lg bg-muted/60 p-3">
              <p className="font-medium">Execution start</p>
              <p className="text-muted-foreground">
                {deal.executionStartDate ? formatDate(deal.executionStartDate) : "Not set"}
              </p>
            </div>
            <div className="rounded-lg bg-muted/60 p-3">
              <p className="font-medium">Most recent completed task</p>
              <p className="text-muted-foreground">
                {dealTasks
                  .filter((task) => task.completedAt)
                  .sort((left, right) => new Date(right.completedAt as string).getTime() - new Date(left.completedAt as string).getTime())[0]?.name ?? "Nothing complete yet"}
              </p>
            </div>
            <div className="rounded-lg bg-muted/60 p-3">
              <p className="font-medium">Next due task</p>
              <p className="text-muted-foreground">
                {dealTasks
                  .filter((task) => task.dueDate && task.status !== "Complete" && task.status !== "Cancelled")
                  .sort((left, right) => new Date(left.dueDate as string).getTime() - new Date(right.dueDate as string).getTime())[0]?.name ?? "No open due dates"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <TaskFormDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        task={editingTask}
        vendors={vendors}
        onSubmit={(values) => {
          upsertTask({
            id: editingTask?.id,
            dealId: deal.id,
            name: values.name,
            description: values.description || undefined,
            assigneeType: values.assigneeType,
            assigneeName: values.assigneeName,
            assigneeUserId: values.assigneeType === "Internal" ? values.assigneeUserId || undefined : undefined,
            vendorId: values.assigneeType === "Vendor" ? values.vendorId || undefined : undefined,
            status: values.status,
            dueDate: values.dueDate || undefined,
            notes: values.notes || undefined,
            blockedReason: values.status === "Blocked" ? values.blockedReason || undefined : undefined,
            completedAt: values.status === "Complete" ? editingTask?.completedAt : undefined,
            templateId: editingTask?.templateId,
            templateVersion: editingTask?.templateVersion,
          });
        }}
      />
    </div>
  );
}
