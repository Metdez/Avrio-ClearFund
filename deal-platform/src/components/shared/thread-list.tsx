"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, MessageSquare } from "lucide-react";
import { THREAD_TYPES, THREAD_STATUSES } from "@/lib/constants";
import { formatRelativeDate } from "@/lib/utils";
import { engagementThreads, deals } from "@/mock-data";

interface ThreadListProps {
  capitalProviderId: string;
}

export function ThreadList({ capitalProviderId }: ThreadListProps) {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const cpThreads = useMemo(
    () =>
      engagementThreads.filter(
        (t) => t.capitalProviderId === capitalProviderId
      ),
    [capitalProviderId]
  );

  const filtered = useMemo(() => {
    let result = cpThreads;
    if (typeFilter !== "all") {
      result = result.filter((t) => t.type === typeFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }
    // Sort by most recent activity
    return result.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [cpThreads, typeFilter, statusFilter]);

  const hasFilters = typeFilter !== "all" || statusFilter !== "all";

  function getDealName(dealId?: string): string | null {
    if (!dealId) return null;
    return deals.find((d) => d.id === dealId)?.name ?? null;
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Engagement Threads</h2>
        <Button
          size="sm"
          onClick={() =>
            router.push(
              `/capital-providers/${capitalProviderId}/threads/new`
            )
          }
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New Thread
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={typeFilter} onValueChange={(val) => val && setTypeFilter(val)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {THREAD_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {THREAD_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTypeFilter("all");
              setStatusFilter("all");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Thread list */}
      {filtered.length === 0 ? (
        cpThreads.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No engagement threads"
            description="Create a thread to start tracking conversations with this capital provider."
            actionLabel="New Thread"
            onAction={() =>
              router.push(
                `/capital-providers/${capitalProviderId}/threads/new`
              )
            }
          />
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="No threads match your filters"
            description="Try adjusting your filters to see more results."
          />
        )
      ) : (
        <div className="space-y-2">
          {filtered.map((thread) => {
            const dealName = getDealName(thread.dealId);
            return (
              <div
                key={thread.id}
                className="flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() =>
                  router.push(
                    `/capital-providers/${capitalProviderId}/threads/${thread.id}`
                  )
                }
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium truncate">
                      {thread.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs font-normal">
                      {thread.type}
                    </Badge>
                    <StatusBadge
                      status={thread.status}
                      context="thread"
                      className="text-xs"
                    />
                    {dealName && (
                      <span className="text-xs text-muted-foreground">
                        Deal: {dealName}
                      </span>
                    )}
                  </div>
                </div>
                <time className="text-xs text-muted-foreground shrink-0 ml-4">
                  {formatRelativeDate(thread.updatedAt)}
                </time>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
