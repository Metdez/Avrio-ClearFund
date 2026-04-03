import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SkeletonLayout = "table" | "card" | "form";

interface LoadingSkeletonProps {
  layout: SkeletonLayout;
  rows?: number;
  columns?: number;
  className?: string;
}

function TableSkeleton({ rows = 5, columns = 4 }: { rows: number; columns: number }) {
  return (
    <div className="rounded-md border">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b bg-muted/50">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 p-4 border-b last:border-b-0">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton key={colIdx} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function CardSkeleton({ rows = 4 }: { rows: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-lg border p-6 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

function FormSkeleton({ rows = 6 }: { rows: number }) {
  return (
    <div className="space-y-6 max-w-2xl">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-28" />
    </div>
  );
}

export function LoadingSkeleton({
  layout,
  rows,
  columns = 4,
  className,
}: LoadingSkeletonProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      {layout === "table" && <TableSkeleton rows={rows ?? 5} columns={columns} />}
      {layout === "card" && <CardSkeleton rows={rows ?? 4} />}
      {layout === "form" && <FormSkeleton rows={rows ?? 6} />}
    </div>
  );
}
