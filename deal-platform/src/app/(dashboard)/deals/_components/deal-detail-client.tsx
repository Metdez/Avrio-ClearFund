"use client";

import Link from "next/link";
import { useState } from "react";
import { notFound } from "next/navigation";
import { differenceInCalendarDays } from "date-fns";
import { ArrowLeft, ArrowRight, Check, CircleOff, ClipboardList, Minus, StickyNote, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { DealFormCard, type DealFormValues } from "./deal-form-card";
import { OutreachTracker } from "./outreach-tracker";
import { useDeals } from "./deals-provider";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EntityDocuments } from "@/components/shared/entity-documents";
import { PageHeader } from "@/components/shared/page-header";
import { PipelineStage } from "@/components/shared/pipeline-stage";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PIPELINE_STAGES } from "@/lib/constants";
import { formatCurrency, formatDate, formatRelativeDate, generateId } from "@/lib/utils";
import { dealNotes as mockDealNotes, processTemplates } from "@/mock-data";
import type { DealNote, PipelineStage as PipelineStageType } from "@/types";

interface DealDetailClientProps {
  dealId: string;
}

function getDefaultValues(deal?: {
  name: string;
  borrowerId: string;
  projectType?: string;
  location?: string;
  estimatedDealSize?: number;
  traditionalFinancingPct?: number;
  paceFinancingPct?: number;
  notes?: string;
}): DealFormValues {
  return {
    name: deal?.name ?? "",
    borrowerId: deal?.borrowerId ?? "",
    capitalProviderIds: [],
    projectType: deal?.projectType ?? "",
    location: deal?.location ?? "",
    estimatedDealSize: deal?.estimatedDealSize,
    traditionalFinancingPct: deal?.traditionalFinancingPct,
    paceFinancingPct: deal?.paceFinancingPct,
    notes: deal?.notes ?? "",
  };
}

export function DealDetailClient({ dealId }: DealDetailClientProps) {
  const {
    getBorrowerById,
    getDealById,
    getDealTasks,
    updateDealStage,
  } = useDeals();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [pendingStage, setPendingStage] = useState<PipelineStageType | null>(null);
  const [terminationReason, setTerminationReason] = useState("");
  const [backwardStage, setBackwardStage] = useState<PipelineStageType | null>(null);
  const [fundedStageWarning, setFundedStageWarning] = useState(false);
  const [dealNotesState, setDealNotesState] = useState<DealNote[]>(
    () => mockDealNotes.filter((n) => n.dealId === dealId)
  );
  const [newNoteContent, setNewNoteContent] = useState("");
  const defaultTemplate = processTemplates.find((t) => t.isDefault);
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    defaultTemplate?.id ?? processTemplates[0]?.id ?? ""
  );
  const assignedTemplate = processTemplates.find((t) => t.id === selectedTemplateId);

  const deal = getDealById(dealId);

  if (!deal) {
    notFound();
  }

  const borrower = getBorrowerById(deal.borrowerId);
  const dealTasks = getDealTasks(deal.id);
  const incompleteTaskCount = dealTasks.filter((task) => task.status !== "Complete").length;

  const currentStageIndex =
    deal.pipelineStage === "Terminated"
      ? PIPELINE_STAGES.length
      : PIPELINE_STAGES.indexOf(deal.pipelineStage);
  const financingTotal =
    (deal.traditionalFinancingPct ?? 0) + (deal.paceFinancingPct ?? 0);
  const daysInStage = Math.max(
    0,
    differenceInCalendarDays(new Date(), new Date(deal.updatedAt))
  );

  const applyStageChange = (
    stage: PipelineStageType,
    options?: { reason?: string }
  ) => {
    updateDealStage(deal.id, stage, options);

    if (stage === "Execution") {
      toast.success("Deal moved to execution phase.");
    } else if (stage === "Terminated") {
      toast.warning("Deal marked as terminated.");
    } else {
      toast.success(`Deal moved to ${stage}.`);
    }
  };

  const handleStageClick = (stage: PipelineStageType) => {
    if (stage === deal.pipelineStage) {
      return;
    }

    if (stage === "Terminated") {
      setPendingStage("Terminated");
      setTerminationReason(deal.terminationReason ?? "");
      return;
    }

    if (stage === "Funded" && incompleteTaskCount > 0) {
      setPendingStage(stage);
      setFundedStageWarning(true);
      return;
    }

    const nextIndex = PIPELINE_STAGES.indexOf(stage);

    if (nextIndex < currentStageIndex) {
      setBackwardStage(stage);
      return;
    }

    if (stage === "Execution") {
      applyStageChange(stage);
      return;
    }

    applyStageChange(stage);
  };

  const handleTerminate = () => {
    if (!terminationReason.trim()) {
      return;
    }

    applyStageChange("Terminated", { reason: terminationReason });
    setPendingStage(null);
    setTerminationReason("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={deal.name}
        description="Deal hub for pipeline, capital provider, and execution visibility."
        actions={
          <>
            <Button variant="outline" nativeButton={false} render={<Link href="/deals" />}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Deals
            </Button>
            <Button
              type="button"
              variant={isEditing ? "outline" : "default"}
              onClick={() => setIsEditing((value) => !value)}
            >
              {isEditing ? "Cancel Edit" : "Edit"}
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <CardTitle>Pipeline Stage</CardTitle>
              <p className="text-sm text-muted-foreground">
                {daysInStage} day{daysInStage === 1 ? "" : "s"} in current stage
              </p>
            </div>
            <Button
              type="button"
              variant={deal.pipelineStage === "Terminated" ? "destructive" : "outline"}
              size="sm"
              onClick={() => {
                setPendingStage("Terminated");
                setTerminationReason(deal.terminationReason ?? "");
              }}
            >
              <CircleOff className="mr-2 h-4 w-4" />
              Terminated
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <PipelineStage currentStage={deal.pipelineStage} onStageClick={handleStageClick} />
          {deal.pipelineStage === "Terminated" && deal.terminationReason ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              <p className="font-medium">Termination reason</p>
              <p>{deal.terminationReason}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="outreach">Outreach</TabsTrigger>
          <TabsTrigger value="execution">Execution</TabsTrigger>
          <TabsTrigger value="process">Process</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isEditing ? (
            <DealFormCard
              mode="edit"
              dealId={deal.id}
              defaultValues={getDefaultValues(deal)}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Deal Overview</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <DetailItem label="Borrower">
                  <div className="space-y-1">
                    <Link
                      href={`/borrowers/${borrower?.id ?? ""}`}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {borrower?.name ?? "Unknown borrower"}
                    </Link>
                    {borrower?.isArchived ? (
                      <p className="text-sm text-muted-foreground">(Archived)</p>
                    ) : null}
                  </div>
                </DetailItem>
                <DetailItem label="Project Type">
                  {deal.projectType || "Not specified"}
                </DetailItem>
                <DetailItem label="Location">
                  {deal.location || "Not specified"}
                </DetailItem>
                <DetailItem label="Estimated Deal Size">
                  {deal.estimatedDealSize
                    ? formatCurrency(deal.estimatedDealSize)
                    : "TBD"}
                </DetailItem>
                <DetailItem label="Traditional Financing %">
                  {deal.traditionalFinancingPct != null
                    ? `${deal.traditionalFinancingPct}%`
                    : "Not set"}
                </DetailItem>
                <DetailItem label="PACE Financing %">
                  {deal.paceFinancingPct != null
                    ? `${deal.paceFinancingPct}%`
                    : "Not set"}
                </DetailItem>
                <DetailItem label="Created">{formatDate(deal.createdAt)}</DetailItem>
                <DetailItem label="Last Updated">{formatDate(deal.updatedAt)}</DetailItem>
                <DetailItem label="Financing Structure" className="md:col-span-2">
                  <div className="space-y-2">
                    <p>
                      Traditional: {deal.traditionalFinancingPct ?? 0}% • PACE:{" "}
                      {deal.paceFinancingPct ?? 0}%
                    </p>
                    {financingTotal !== 100 ? (
                      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                        Financing percentages do not total 100%. This may be intentional
                        for partial structures.
                      </div>
                    ) : null}
                  </div>
                </DetailItem>
                <DetailItem label="Notes" className="md:col-span-2">
                  {deal.notes || "No notes added."}
                </DetailItem>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="outreach" className="space-y-6">
          <OutreachTracker dealId={deal.id} />
        </TabsContent>

        <TabsContent value="execution">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Execution</CardTitle>
                <Button variant="outline" nativeButton={false} render={<Link href={`/deals/${deal.id}/execution`} />}>
                  Open Execution Workspace
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {deal.pipelineStage === "Execution" || dealTasks.length > 0 ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Task Progress</span>
                      <span className="font-medium">
                        {dealTasks.filter((t) => t.status === "Complete").length} / {dealTasks.length} complete
                      </span>
                    </div>
                    <ProgressBar
                      percentage={dealTasks.length > 0 ? (dealTasks.filter((t) => t.status === "Complete").length / dealTasks.length) * 100 : 0}
                      hasOverdue={dealTasks.some((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Complete" && t.status !== "Cancelled")}
                    />
                  </div>
                  {dealTasks.some((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Complete" && t.status !== "Cancelled") && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                      {dealTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Complete" && t.status !== "Cancelled").length} overdue task(s) require attention.
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                  Move the deal into Execution to activate the execution workspace.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="process" className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5" />
                    Assigned Process Template
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {assignedTemplate
                      ? `${assignedTemplate.name} (v${assignedTemplate.version})`
                      : "No template assigned"}
                    {assignedTemplate?.isDefault && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        Default
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedTemplateId}
                    onValueChange={(value) => {
                      if (value) {
                        setSelectedTemplateId(value);
                        const tmpl = processTemplates.find((t) => t.id === value);
                        toast.success(`Template changed to "${tmpl?.name ?? value}".`);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[14rem]">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {processTemplates
                        .filter((t) => !t.isArchived)
                        .map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name} (v{t.version})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {assignedTemplate?.description && (
                <p className="mb-4 text-sm text-muted-foreground">
                  {assignedTemplate.description}
                </p>
              )}
              {assignedTemplate ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[36rem] text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="w-12 py-3 pr-2 font-medium">#</th>
                        <th className="py-3 pr-4 font-medium">Task Name</th>
                        <th className="py-3 pr-4 font-medium">Default Assignee</th>
                        <th className="py-3 pr-4 font-medium">Target Day</th>
                        <th className="w-16 py-3 font-medium text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedTemplate.tasks
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((templateTask) => {
                          const matchingExecTask = dealTasks.find(
                            (t) =>
                              t.name.toLowerCase().trim() ===
                              templateTask.name.toLowerCase().trim()
                          );
                          const isComplete = matchingExecTask?.status === "Complete";
                          return (
                            <tr key={templateTask.id} className="border-b last:border-0">
                              <td className="py-3 pr-2 text-muted-foreground">
                                {templateTask.sortOrder}
                              </td>
                              <td className="py-3 pr-4">
                                <p className="font-medium">{templateTask.name}</p>
                                {templateTask.description && (
                                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                                    {templateTask.description}
                                  </p>
                                )}
                              </td>
                              <td className="py-3 pr-4 text-muted-foreground">
                                {templateTask.defaultAssigneeRole}
                              </td>
                              <td className="py-3 pr-4">
                                {templateTask.relativeDueDateOffsetDays != null
                                  ? `Day ${templateTask.relativeDueDateOffsetDays}`
                                  : "—"}
                              </td>
                              <td className="py-3 text-center">
                                {matchingExecTask ? (
                                  isComplete ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                      <Check className="h-3 w-3" />
                                      Done
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                      <Minus className="h-3 w-3" />
                                      {matchingExecTask.status}
                                    </span>
                                  )
                                ) : (
                                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                    Pending
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                  No process template is assigned to this deal.
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            variant="default"
            nativeButton={false}
            render={<Link href={`/deals/${deal.id}/execution`} />}
            className="w-full sm:w-auto"
          >
            Open Execution Workspace
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Deal Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Textarea
                  placeholder="Add a note about this deal..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    disabled={!newNoteContent.trim()}
                    onClick={() => {
                      const note: DealNote = {
                        id: generateId(),
                        dealId: deal.id,
                        authorName: "You",
                        content: newNoteContent.trim(),
                        pipelineStageAtCreation: deal.pipelineStage,
                        createdAt: new Date().toISOString(),
                      };
                      setDealNotesState((prev) => [note, ...prev]);
                      setNewNoteContent("");
                      toast.success("Note added.");
                    }}
                  >
                    <StickyNote className="mr-2 h-4 w-4" />
                    Add Note
                  </Button>
                </div>
              </div>

              {dealNotesState.length === 0 ? (
                <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                  No notes yet. Add one above to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {[...dealNotesState]
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .map((note) => (
                      <div
                        key={note.id}
                        className="rounded-lg border bg-card px-4 py-3 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="font-medium">{note.authorName}</span>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <StatusBadge
                              status={note.pipelineStageAtCreation}
                              context="pipeline"
                            />
                            <span title={formatDate(note.createdAt)}>
                              {formatRelativeDate(note.createdAt)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">
                          {note.content}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <EntityDocuments
                entityType="Deal"
                entityId={deal.id}
                entityName={deal.name}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={Boolean(backwardStage)}
        onOpenChange={(open) => {
          if (!open) {
            setBackwardStage(null);
          }
        }}
        title="Move deal backward?"
        description={`Are you sure you want to move this deal back to ${backwardStage}?`}
        confirmLabel="Move Deal"
        onConfirm={() => {
          if (backwardStage) {
            applyStageChange(backwardStage);
            setBackwardStage(null);
          }
        }}
      />

      <ConfirmDialog
        open={fundedStageWarning}
        onOpenChange={(open) => {
          if (!open) {
            setFundedStageWarning(false);
            setPendingStage(null);
          }
        }}
        title="Move deal to Funded?"
        description={`This deal has ${incompleteTaskCount} incomplete execution tasks. Are you sure you want to mark it as Funded?`}
        confirmLabel="Mark as Funded"
        onConfirm={() => {
          if (pendingStage) {
            applyStageChange(pendingStage);
          }
          setFundedStageWarning(false);
          setPendingStage(null);
        }}
      />

      <AlertDialog
        open={pendingStage === "Terminated"}
        onOpenChange={(open) => {
          if (!open) {
            setPendingStage(null);
            setTerminationReason("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terminate this deal?</AlertDialogTitle>
            <AlertDialogDescription>
              Moving a deal to Terminated requires a reason for the team record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="terminationReason">Reason</Label>
            <Textarea
              id="terminationReason"
              value={terminationReason}
              onChange={(event) => setTerminationReason(event.target.value)}
              placeholder="Explain why this deal was terminated."
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={!terminationReason.trim()}
              onClick={handleTerminate}
            >
              Terminate Deal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DetailItem({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}
