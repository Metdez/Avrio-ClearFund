"use client";

import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/utils";
import {
  Mail,
  StickyNote,
  ArrowRightLeft,
  MessageSquarePlus,
  LucideIcon,
} from "lucide-react";

const TYPE_ICONS: Record<string, LucideIcon> = {
  Email: Mail,
  Note: StickyNote,
  StatusChange: ArrowRightLeft,
  ThreadCreated: MessageSquarePlus,
};

const TYPE_COLORS: Record<string, string> = {
  Email: "bg-blue-100 text-blue-600",
  Note: "bg-amber-100 text-amber-600",
  StatusChange: "bg-purple-100 text-purple-600",
  ThreadCreated: "bg-green-100 text-green-600",
};

export interface TimelineEntry {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  actor?: string;
}

interface TimelineProps {
  entries: TimelineEntry[];
  filterType?: string;
  className?: string;
}

export function Timeline({ entries, filterType, className }: TimelineProps) {
  const filtered = filterType
    ? entries.filter((e) => e.type === filterType)
    : entries;

  const sorted = [...filtered].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No activity yet.
      </p>
    );
  }

  return (
    <div className={cn("relative space-y-0", className)}>
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

      {sorted.map((entry) => {
        const Icon = TYPE_ICONS[entry.type] ?? StickyNote;
        const iconColor = TYPE_COLORS[entry.type] ?? "bg-gray-100 text-gray-600";

        return (
          <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
            <div
              className={cn(
                "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                iconColor
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{entry.title}</p>
                <time className="text-xs text-muted-foreground">
                  {formatRelativeDate(entry.timestamp)}
                </time>
              </div>
              {entry.actor && (
                <p className="text-xs text-muted-foreground">{entry.actor}</p>
              )}
              {entry.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {entry.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
