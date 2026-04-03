import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PIPELINE_STAGE_COLORS,
  TASK_STATUS_COLORS,
  THREAD_STATUS_COLORS,
  CP_PITCH_STATUS_COLORS,
  FACILITY_STATUS_COLORS,
} from "@/lib/constants";

type StatusContext =
  | "pipeline"
  | "task"
  | "thread"
  | "cpPitch"
  | "facility";

const COLOR_MAPS: Record<StatusContext, Record<string, string>> = {
  pipeline: PIPELINE_STAGE_COLORS,
  task: TASK_STATUS_COLORS,
  thread: THREAD_STATUS_COLORS,
  cpPitch: CP_PITCH_STATUS_COLORS,
  facility: FACILITY_STATUS_COLORS,
};

interface StatusBadgeProps {
  status: string;
  context: StatusContext;
  className?: string;
}

export function StatusBadge({ status, context, className }: StatusBadgeProps) {
  const colorMap = COLOR_MAPS[context];
  const colors = colorMap[status] ?? "bg-gray-100 text-gray-700";

  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-medium border-0",
        colors,
        className
      )}
    >
      {status}
    </Badge>
  );
}
