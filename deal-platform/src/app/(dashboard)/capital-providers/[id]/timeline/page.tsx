"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  StickyNote,
  ArrowRightLeft,
  MessageSquarePlus,
  Clock,
  MessageSquare,
} from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import {
  capitalProviders,
  engagementThreads,
  communications,
  users,
} from "@/mock-data";
import type { Communication } from "@/types";

const TYPE_ICONS: Record<string, typeof Mail> = {
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

const PAGE_SIZE = 25;

export default function UnifiedTimelinePage() {
  const params = useParams();
  const router = useRouter();
  const cpId = params.id as string;

  const cp = capitalProviders.find((c) => c.id === cpId);
  const cpThreads = engagementThreads.filter(
    (t) => t.capitalProviderId === cpId
  );
  const threadIds = new Set(cpThreads.map((t) => t.id));

  // Get all communications for this CP's threads + direct CP communications
  const allEvents = useMemo(() => {
    return communications
      .filter(
        (c) =>
          (c.threadId && threadIds.has(c.threadId)) ||
          (c.entityType === "CapitalProvider" && c.entityId === cpId)
      )
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }, [cpId, threadIds]);

  const [filterThread, setFilterThread] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    if (filterThread === "all") return allEvents;
    return allEvents.filter((c) => c.threadId === filterThread);
  }, [allEvents, filterThread]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function getUserName(userId: string): string {
    return users.find((u) => u.id === userId)?.name ?? userId;
  }

  function getThreadTitle(threadId: string): string {
    return cpThreads.find((t) => t.id === threadId)?.title ?? "Unknown Thread";
  }

  function getEventTitle(comm: Communication): string {
    switch (comm.type) {
      case "Email":
        return comm.emailSubject ?? "Email";
      case "Note":
        return comm.noteContent?.slice(0, 80) ?? "Note";
      case "StatusChange":
        return `Status: ${comm.statusFrom} → ${comm.statusTo}`;
      case "ThreadCreated":
        return `Thread created: ${comm.threadId ? getThreadTitle(comm.threadId) : ""}`;
      default:
        return comm.type;
    }
  }

  function getEventDescription(comm: Communication): string | undefined {
    switch (comm.type) {
      case "Email":
        return comm.emailBody?.slice(0, 150);
      case "Note":
        return comm.noteContent && comm.noteContent.length > 80
          ? comm.noteContent
          : undefined;
      default:
        return undefined;
    }
  }

  function handleEventClick(comm: Communication) {
    if (comm.threadId) {
      router.push(`/capital-providers/${cpId}/threads/${comm.threadId}`);
    }
  }

  if (!cp) {
    return (
      <div className="space-y-6">
        <PageHeader title="Capital Provider Not Found" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Unified Timeline"
        description={`All activity across threads for ${cp.firmName}`}
        actions={
          <Button
            variant="outline"
            onClick={() => router.push(`/capital-providers/${cpId}`)}
          >
            Back to Profile
          </Button>
        }
      />

      {/* Thread filter */}
      <div className="flex items-center gap-3">
        <Select value={filterThread} onValueChange={(val) => val && setFilterThread(val)}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Filter by thread" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Threads</SelectItem>
            {cpThreads.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {filterThread !== "all" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilterThread("all")}
          >
            Clear filter
          </Button>
        )}
        <span className="text-sm text-muted-foreground ml-auto">
          {filtered.length} event{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No activity yet"
          description="Create a thread to get started."
          actionLabel="New Thread"
          actionHref={`/capital-providers/${cpId}/threads/new`}
        />
      ) : (
        <div className="relative space-y-0">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

          {visible.map((event) => {
            const Icon = TYPE_ICONS[event.type] ?? StickyNote;
            const iconColor =
              TYPE_COLORS[event.type] ?? "bg-gray-100 text-gray-600";
            const thread = event.threadId
              ? cpThreads.find((t) => t.id === event.threadId)
              : null;

            return (
              <div
                key={event.id}
                className="relative flex gap-4 pb-6 last:pb-0 cursor-pointer group"
                onClick={() => handleEventClick(event)}
              >
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconColor}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 pt-1 group-hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium line-clamp-1">
                      {getEventTitle(event)}
                    </p>
                    <time className="text-xs text-muted-foreground shrink-0">
                      {formatRelativeDate(event.timestamp)}
                    </time>
                  </div>

                  {/* Thread tag */}
                  {thread && (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className="text-xs font-normal"
                      >
                        {thread.title}
                      </Badge>
                      <StatusBadge
                        status={thread.status}
                        context="thread"
                        className="text-xs"
                      />
                    </div>
                  )}

                  {getEventDescription(event) && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {getEventDescription(event)}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground mt-0.5">
                    {getUserName(event.createdBy)}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              >
                Load more ({filtered.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
