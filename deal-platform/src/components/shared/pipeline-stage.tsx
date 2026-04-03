"use client";

import { cn } from "@/lib/utils";
import { PIPELINE_STAGES, PIPELINE_STAGE_COLORS } from "@/lib/constants";
import type { PipelineStage as PipelineStageType } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PipelineStageProps {
  currentStage: PipelineStageType;
  onStageClick?: (stage: PipelineStageType) => void;
  className?: string;
}

export function PipelineStage({
  currentStage,
  onStageClick,
  className,
}: PipelineStageProps) {
  const currentIndex = PIPELINE_STAGES.indexOf(
    currentStage as (typeof PIPELINE_STAGES)[number]
  );

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1", className)}>
        {PIPELINE_STAGES.map((stage, index) => {
          const isActive = index <= currentIndex && currentStage !== "Terminated";
          const isCurrent = stage === currentStage;
          const colors = PIPELINE_STAGE_COLORS[stage] ?? "";

          return (
            <Tooltip key={stage}>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={
                      onStageClick
                        ? () => onStageClick(stage as PipelineStageType)
                        : undefined
                    }
                    disabled={!onStageClick}
                    className={cn(
                      "flex-1 h-8 rounded text-xs font-medium transition-colors",
                      "flex items-center justify-center",
                      "disabled:cursor-default",
                      onStageClick && "cursor-pointer hover:opacity-80",
                      isCurrent
                        ? colors
                        : isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                    )}
                  />
                }
              >
                <span className="hidden lg:inline">{stage}</span>
                <span className="lg:hidden">{index + 1}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{stage}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
