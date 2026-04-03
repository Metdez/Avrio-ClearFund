import { cn } from "@/lib/utils";

interface ProgressBarProps {
  percentage: number;
  hasOverdue?: boolean;
  showLabel?: boolean;
  className?: string;
}

function getBarColor(percentage: number, hasOverdue: boolean): string {
  if (percentage < 50) return "bg-red-500";
  if (percentage <= 75 || hasOverdue) return "bg-amber-500";
  return "bg-green-500";
}

export function ProgressBar({
  percentage,
  hasOverdue = false,
  showLabel = true,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percentage));
  const color = getBarColor(clamped, hasOverdue);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium tabular-nums w-10 text-right">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
