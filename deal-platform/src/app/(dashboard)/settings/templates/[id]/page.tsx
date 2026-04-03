"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Save,
  History,
  AlertTriangle,
} from "lucide-react";
import { processTemplates } from "@/mock-data";
import { formatDate, generateId } from "@/lib/utils";
import type { TemplateTaskDefinition } from "@/types";

const ASSIGNEE_ROLES = [
  "Deal Team",
  "Law Firm",
  "Appraiser",
  "Environmental Consultant",
  "Energy Consultant",
  "Title Company",
  "Surveyor",
  "Engineering Firm",
  "Municipality",
  "Capital Raising",
];

// Mock version history
const mockVersionHistory = [
  {
    version: 3,
    date: "2026-01-15T10:00:00Z",
    createdBy: "Marcus Webb",
    changes: "Added 'Lien Priority Confirmation' task, updated due date offsets for survey and appraisal",
  },
  {
    version: 2,
    date: "2025-09-20T14:00:00Z",
    createdBy: "Marcus Webb",
    changes: "Split 'Legal & Title' task into separate 'Title Search & Insurance' and 'Legal Opinion Letter' tasks",
  },
  {
    version: 1,
    date: "2025-06-01T09:00:00Z",
    createdBy: "Marcus Webb",
    changes: "Initial template creation with 10 tasks",
  },
];

// Mock deals in execution for "Apply Template" demo
const mockDealsInExecution = [
  { id: "deal-003", name: "Summit Hotel Renovation — Denver", existingTasks: 12 },
  { id: "deal-007", name: "Metro Center Mixed-Use — Portland", existingTasks: 0 },
  { id: "deal-009", name: "Cascade Industrial Park — Tacoma", existingTasks: 8 },
];

export default function TemplateBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;
  const isNew = templateId === "new";

  const existingTemplate = isNew ? null : processTemplates.find((t) => t.id === templateId);

  const [name, setName] = useState(existingTemplate?.name ?? "");
  const [description, setDescription] = useState(existingTemplate?.description ?? "");
  const [tasks, setTasks] = useState<TemplateTaskDefinition[]>(
    existingTemplate?.tasks ?? []
  );
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function addTask() {
    const newTask: TemplateTaskDefinition = {
      id: generateId(),
      name: "",
      description: "",
      defaultAssigneeRole: "Deal Team",
      relativeDueDateOffsetDays: undefined,
      sortOrder: tasks.length + 1,
    };
    setTasks((prev) => [...prev, newTask]);
    setSaved(false);
  }

  function removeTask(taskId: string) {
    setTasks((prev) =>
      prev
        .filter((t) => t.id !== taskId)
        .map((t, idx) => ({ ...t, sortOrder: idx + 1 }))
    );
    setSaved(false);
  }

  function moveTask(index: number, direction: "up" | "down") {
    const newTasks = [...tasks];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newTasks.length) return;
    [newTasks[index], newTasks[swapIdx]] = [newTasks[swapIdx], newTasks[index]];
    setTasks(newTasks.map((t, idx) => ({ ...t, sortOrder: idx + 1 })));
    setSaved(false);
  }

  function updateTask(taskId: string, field: keyof TemplateTaskDefinition, value: string | number | undefined) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, [field]: value } : t))
    );
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
  }

  const selectedDealData = mockDealsInExecution.find((d) => d.id === selectedDeal);

  return (
    <div className="space-y-6">
      <PageHeader
        title={isNew ? "Create Template" : name || "Edit Template"}
        description={
          isNew
            ? "Define a reusable task checklist for deal execution"
            : existingTemplate
            ? `Version ${existingTemplate.version} \u2022 ${existingTemplate.tasks.length} tasks`
            : ""
        }
        actions={
          <div className="flex items-center gap-2">
            {!isNew && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                >
                  <History className="mr-2 h-4 w-4" />
                  Version History
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setApplyDialogOpen(true)}
                >
                  Apply to Deal
                </Button>
              </>
            )}
            <Button onClick={handleSave} size="sm">
              <Save className="mr-2 h-4 w-4" />
              {isNew ? "Create Template" : "Save (New Version)"}
            </Button>
          </div>
        }
      />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/settings/templates")}
        className="mb-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Templates
      </Button>

      {saved && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-md p-3">
          {isNew
            ? "Template created as v1"
            : `Saved as v${(existingTemplate?.version ?? 0) + 1}`}
        </div>
      )}

      {/* Template metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Template Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => { setName(e.target.value); setSaved(false); }}
              placeholder="e.g., Standard PACE Execution"
              maxLength={255}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setSaved(false); }}
              placeholder="Describe when this template should be used..."
              maxLength={2000}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Task list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Tasks ({tasks.length})</CardTitle>
            <CardDescription>
              Define the ordered checklist of tasks that will be generated when this template is applied
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addTask}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md border-dashed">
              <AlertTriangle className="h-8 w-8 text-amber-400 mb-2" />
              <p className="text-sm font-medium mb-1">No tasks defined</p>
              <p className="text-xs text-muted-foreground mb-3">
                This template will not generate any tasks when applied.
              </p>
              <Button variant="outline" size="sm" onClick={addTask}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Task
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="rounded-lg border p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-0 font-mono text-xs">
                        #{task.sortOrder}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveTask(index, "up")}
                        disabled={index === 0}
                        className="h-7 w-7 p-0"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveTask(index, "down")}
                        disabled={index === tasks.length - 1}
                        className="h-7 w-7 p-0"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTask(task.id)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Task Name</Label>
                      <Input
                        value={task.name}
                        onChange={(e) => updateTask(task.id, "name", e.target.value)}
                        placeholder="Task name"
                        maxLength={255}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Default Assignee Role</Label>
                      <Select
                        value={task.defaultAssigneeRole}
                        onValueChange={(val) => val && updateTask(task.id, "defaultAssigneeRole", val)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ASSIGNEE_ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={task.description ?? ""}
                        onChange={(e) => updateTask(task.id, "description", e.target.value)}
                        placeholder="Brief description"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Due Date Offset (days from execution start)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={task.relativeDueDateOffsetDays ?? ""}
                        onChange={(e) =>
                          updateTask(
                            task.id,
                            "relativeDueDateOffsetDays",
                            e.target.value ? parseInt(e.target.value) : undefined
                          )
                        }
                        placeholder="e.g., 7"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Version History */}
      {showVersionHistory && !isNew && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Version History</CardTitle>
            <CardDescription>
              Each save creates a new version. Old deals retain their original template version.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Version</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Changes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockVersionHistory.map((v) => (
                    <TableRow key={v.version}>
                      <TableCell>
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0">
                          v{v.version}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(v.date)}</TableCell>
                      <TableCell className="text-sm">{v.createdBy}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {v.changes}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Apply Template Dialog */}
      <AlertDialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply Template to Deal</AlertDialogTitle>
            <AlertDialogDescription>
              Select a deal in execution to generate tasks from this template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-3">
            <Label>Select Deal</Label>
            <Select
              value={selectedDeal ?? undefined}
              onValueChange={(val) => setSelectedDeal(val || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a deal..." />
              </SelectTrigger>
              <SelectContent>
                {mockDealsInExecution.map((deal) => (
                  <SelectItem key={deal.id} value={deal.id}>
                    {deal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDealData && selectedDealData.existingTasks > 0 && (
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-md p-3">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                This deal already has {selectedDealData.existingTasks} tasks. Applying a template will add {tasks.length} more tasks. Existing tasks will not be affected.
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedDeal(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!selectedDeal}
              onClick={() => {
                setSelectedDeal(null);
                setApplyDialogOpen(false);
              }}
            >
              Apply Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
