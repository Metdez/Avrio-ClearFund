"use client";

import Link from "next/link";
import { useMemo, useState, useCallback } from "react";
import { differenceInCalendarDays } from "date-fns";
import { toast } from "sonner";

import { useDeals } from "./deals-provider";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PIPELINE_STAGES, PIPELINE_STAGE_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Deal, PipelineStage } from "@/types";
import { GripVertical } from "lucide-react";

export function PipelineDashboardClient() {
  const { deals, getBorrowerById, updateDealStage } = useDeals();

  const isMobile = useIsMobile();

  // Mobile stage selector
  const [selectedMobileStage, setSelectedMobileStage] = useState<PipelineStage>("Prospect");

  // Drag-and-drop state
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);

  // Backward move confirmation
  const [pendingMove, setPendingMove] = useState<{
    dealId: string;
    dealName: string;
    fromStage: PipelineStage;
    toStage: PipelineStage;
  } | null>(null);

  const activeDeals = deals.filter(
    (deal) => !deal.isArchived && deal.pipelineStage !== "Terminated"
  );

  const stages = useMemo(
    () =>
      PIPELINE_STAGES.map((stage) => {
        const stageDeals = activeDeals.filter((deal) => deal.pipelineStage === stage);
        const totalValue = stageDeals.reduce(
          (sum, deal) => sum + (deal.estimatedDealSize ?? 0),
          0
        );
        return { stage, deals: stageDeals, totalValue };
      }),
    [activeDeals]
  );

  const isBackwardMove = useCallback(
    (fromStage: PipelineStage, toStage: PipelineStage) => {
      const fromIndex = PIPELINE_STAGES.indexOf(fromStage as typeof PIPELINE_STAGES[number]);
      const toIndex = PIPELINE_STAGES.indexOf(toStage as typeof PIPELINE_STAGES[number]);
      return toIndex < fromIndex;
    },
    []
  );

  const executeDealMove = useCallback(
    (dealId: string, toStage: PipelineStage) => {
      updateDealStage(dealId, toStage);
      toast.success(`Deal moved to ${toStage}`);
    },
    [updateDealStage]
  );

  // --- Drag handlers ---
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, deal: Deal) => {
      setDraggedDealId(deal.id);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", deal.id);
    },
    []
  );

  const handleDragEnd = useCallback(() => {
    setDraggedDealId(null);
    setDragOverStage(null);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, stage: PipelineStage) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverStage(stage);
    },
    []
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>, stage: PipelineStage) => {
      // Only clear if we're leaving the column itself, not entering a child
      if (dragOverStage === stage) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
          setDragOverStage(null);
        }
      }
    },
    [dragOverStage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, toStage: PipelineStage) => {
      e.preventDefault();
      setDragOverStage(null);

      const dealId = e.dataTransfer.getData("text/plain");
      if (!dealId) return;

      const deal = deals.find((d) => d.id === dealId);
      if (!deal || deal.pipelineStage === toStage) {
        setDraggedDealId(null);
        return;
      }

      if (isBackwardMove(deal.pipelineStage, toStage)) {
        setPendingMove({
          dealId: deal.id,
          dealName: deal.name,
          fromStage: deal.pipelineStage,
          toStage,
        });
      } else {
        executeDealMove(deal.id, toStage);
      }

      setDraggedDealId(null);
    },
    [deals, isBackwardMove, executeDealMove]
  );

  const handleConfirmBackwardMove = useCallback(() => {
    if (pendingMove) {
      executeDealMove(pendingMove.dealId, pendingMove.toStage);
      setPendingMove(null);
    }
  }, [pendingMove, executeDealMove]);

  if (activeDeals.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Deal Pipeline"
          description="Drag deals between stages to update their progress."
          actions={
            <Button nativeButton={false} render={<Link href="/deals/new" />}>Create Deal</Button>
          }
        />
        <EmptyState
          title="No deals in the pipeline. Create a deal to get started."
          description="Once deals are added, this view will show a Kanban board where you can drag deals between stages."
          actionLabel="Create Deal"
          actionHref="/deals/new"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deal Pipeline"
        description="Drag deals between stages to update their progress."
      />

      {isMobile ? (
        /* ─── Mobile: stage selector + vertical card list ─── */
        <div className="space-y-4">
          <Select
            value={selectedMobileStage}
            onValueChange={(val) => setSelectedMobileStage(val as PipelineStage)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stages.map(({ stage, deals: stageDeals, totalValue }) => (
                <SelectItem key={stage} value={stage}>
                  {stage} ({stageDeals.length}) — {formatCurrency(totalValue)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(() => {
            const stageData = stages.find((s) => s.stage === selectedMobileStage);
            if (!stageData || stageData.deals.length === 0) {
              return (
                <div className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
                  No deals in {selectedMobileStage}
                </div>
              );
            }
            return (
              <div className="space-y-3">
                {stageData.deals.map((deal) => {
                  const borrower = getBorrowerById(deal.borrowerId);
                  return (
                    <div key={deal.id} className="rounded-lg border bg-background p-3 space-y-2">
                      <Link href={`/deals/${deal.id}`} className="block space-y-1">
                        <p className="text-sm font-medium leading-tight">{deal.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {borrower?.name ?? "Unknown borrower"}
                        </p>
                        <p className="text-xs font-medium tabular-nums">
                          {deal.estimatedDealSize ? formatCurrency(deal.estimatedDealSize) : "TBD"}
                        </p>
                      </Link>
                      <Select
                        value={deal.pipelineStage}
                        onValueChange={(val) => {
                          const toStage = val as PipelineStage;
                          if (isBackwardMove(deal.pipelineStage, toStage)) {
                            setPendingMove({
                              dealId: deal.id,
                              dealName: deal.name,
                              fromStage: deal.pipelineStage,
                              toStage,
                            });
                          } else {
                            executeDealMove(deal.id, toStage);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PIPELINE_STAGES.map((stage) => (
                            <SelectItem key={stage} value={stage}>
                              Move to {stage}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      ) : (
        /* ─── Desktop: drag-and-drop Kanban ─── */
        <div className="flex gap-3 overflow-x-auto pb-4">
          {stages.map(({ stage, deals: stageDeals, totalValue }) => {
            const isOver = dragOverStage === stage;

            return (
              <div
                key={stage}
                className={`flex min-w-[240px] flex-1 flex-col rounded-xl border-2 transition-colors ${
                  isOver
                    ? "border-primary bg-primary/5"
                    : "border-transparent bg-muted/30"
                }`}
                onDragOver={(e) => handleDragOver(e, stage as PipelineStage)}
                onDragLeave={(e) => handleDragLeave(e, stage as PipelineStage)}
                onDrop={(e) => handleDrop(e, stage as PipelineStage)}
              >
                {/* Column header */}
                <div className="flex items-center justify-between gap-2 border-b px-3 py-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={stage} context="pipeline" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {stageDeals.length}
                    </span>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatCurrency(totalValue)}
                  </span>
                </div>

                {/* Deal cards */}
                <div className="flex-1 space-y-2 p-2" style={{ minHeight: "120px" }}>
                  {stageDeals.length === 0 ? (
                    <div className="flex h-full items-center justify-center rounded-lg border border-dashed px-3 py-8 text-center text-xs text-muted-foreground">
                      Drop deals here
                    </div>
                  ) : (
                    stageDeals.map((deal) => {
                      const borrower = getBorrowerById(deal.borrowerId);
                      const isDragging = draggedDealId === deal.id;

                      return (
                        <div
                          key={deal.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal)}
                          onDragEnd={handleDragEnd}
                          className={`group relative cursor-grab rounded-lg border bg-background p-3 shadow-sm transition-all active:cursor-grabbing ${
                            isDragging ? "opacity-40" : "hover:shadow-md"
                          }`}
                        >
                          <GripVertical className="absolute right-2 top-2 h-3.5 w-3.5 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
                          <Link
                            href={`/deals/${deal.id}`}
                            className="block space-y-1.5"
                            onClick={(e) => {
                              // Prevent navigation when dragging
                              if (draggedDealId) e.preventDefault();
                            }}
                          >
                            <p className="pr-4 text-sm font-medium leading-tight">
                              {deal.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {borrower?.name ?? "Unknown borrower"}
                            </p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium tabular-nums">
                                {deal.estimatedDealSize
                                  ? formatCurrency(deal.estimatedDealSize)
                                  : "TBD"}
                              </span>
                              <StatusBadge status={stage} context="pipeline" />
                            </div>
                          </Link>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Backward move confirmation dialog */}
      <ConfirmDialog
        open={pendingMove !== null}
        onOpenChange={(open) => {
          if (!open) setPendingMove(null);
        }}
        title="Move Deal Backward?"
        description={
          pendingMove
            ? `Moving "${pendingMove.dealName}" from ${pendingMove.fromStage} to ${pendingMove.toStage} is unusual. Are you sure?`
            : ""
        }
        confirmLabel="Yes, Move Backward"
        cancelLabel="Cancel"
        onConfirm={handleConfirmBackwardMove}
        variant="destructive"
      />
    </div>
  );
}
