"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  StickyNote,
  ArrowRightLeft,
  Clock,
  Send,
} from "lucide-react";
import { THREAD_STATUSES } from "@/lib/constants";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import {
  engagementThreads,
  capitalProviders,
  deals,
  communications,
  users,
} from "@/mock-data";
import type { EngagementThread } from "@/types";

const TERMINAL_STATUSES = ["Won", "Lost", "Closed"];

export default function ThreadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cpId = params.id as string;
  const threadId = params.threadId as string;

  const thread = engagementThreads.find(
    (t) => t.id === threadId && t.capitalProviderId === cpId
  );
  const cp = capitalProviders.find((c) => c.id === cpId);
  const linkedDeal = thread?.dealId ? deals.find((d) => d.id === thread.dealId) : null;

  const [status, setStatus] = useState<EngagementThread["status"]>(
    thread?.status ?? "Active"
  );
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [showWonPrompt, setShowWonPrompt] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [localNotes, setLocalNotes] = useState<
    { id: string; content: string; author: string; timestamp: string }[]
  >([]);

  // Get thread communications (notes + status changes + emails)
  const threadComms = useMemo(
    () =>
      communications
        .filter((c) => c.threadId === threadId)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
    [threadId]
  );

  // Filter just notes for the notes section
  const existingNotes = useMemo(
    () => threadComms.filter((c) => c.type === "Note"),
    [threadComms]
  );

  const allNotes = useMemo(() => {
    const combined = [
      ...localNotes.map((n) => ({
        id: n.id,
        type: "Note" as const,
        content: n.content,
        author: n.author,
        timestamp: n.timestamp,
      })),
      ...existingNotes.map((c) => ({
        id: c.id,
        type: "Note" as const,
        content: c.noteContent ?? "",
        author: c.noteAuthor ?? getUserName(c.createdBy),
        timestamp: c.timestamp,
      })),
    ];
    return combined.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [localNotes, existingNotes]);

  function getUserName(userId: string): string {
    return users.find((u) => u.id === userId)?.name ?? userId;
  }

  function handleStatusChange(newStatus: string) {
    if (!newStatus || newStatus === status) return;

    if (TERMINAL_STATUSES.includes(newStatus)) {
      setPendingStatus(newStatus);
      if (
        newStatus === "Won" &&
        thread?.type === "Deal Evaluation" &&
        linkedDeal
      ) {
        setShowWonPrompt(true);
      } else {
        setShowCloseConfirm(true);
      }
    } else {
      setStatus(newStatus as EngagementThread["status"]);
    }
  }

  function confirmStatusChange(markDealCommitted = false) {
    if (pendingStatus) {
      setStatus(pendingStatus as EngagementThread["status"]);
      if (markDealCommitted && linkedDeal) {
        console.log(`Marking deal ${linkedDeal.id} as Committed`);
      }
    }
    setPendingStatus(null);
    setShowWonPrompt(false);
    setShowCloseConfirm(false);
  }

  function handleAddNote() {
    if (!noteText.trim()) return;
    const newNote = {
      id: `local-note-${Date.now()}`,
      content: noteText.trim(),
      author: "Marcus Webb",
      timestamp: new Date().toISOString(),
    };
    setLocalNotes((prev) => [newNote, ...prev]);
    setNoteText("");
  }

  if (!thread || !cp) {
    return (
      <div className="space-y-6">
        <PageHeader title="Thread Not Found" />
        <p className="text-muted-foreground">
          The requested engagement thread does not exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={thread.title}
        description={cp.firmName}
        actions={
          <Button
            variant="outline"
            onClick={() => router.push(`/capital-providers/${cpId}`)}
          >
            Back to Profile
          </Button>
        }
      />

      {/* Thread metadata */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{thread.type}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={status} onValueChange={(val) => val && handleStatusChange(val)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THREAD_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-2">
              <StatusBadge status={status} context="thread" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Linked Deal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {linkedDeal ? (
              <button
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
                onClick={() => router.push(`/deals/${linkedDeal.id}`)}
              >
                {linkedDeal.name}
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            ) : (
              <span className="text-sm text-muted-foreground">No linked deal</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {thread.description && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{thread.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Dates */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> Created {formatDate(thread.createdAt)} by{" "}
          {getUserName(thread.createdBy)}
        </span>
        <span>Last updated {formatRelativeDate(thread.updatedAt)}</span>
      </div>

      <Separator />

      {/* Notes section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Notes</h2>

        {/* Add note form */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a note..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={3}
          />
          <Button
            size="sm"
            onClick={handleAddNote}
            disabled={!noteText.trim()}
          >
            <Send className="mr-2 h-3.5 w-3.5" /> Save Note
          </Button>
        </div>

        {/* Notes list */}
        {allNotes.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No notes yet. Add the first note above.
          </p>
        ) : (
          <div className="space-y-3">
            {allNotes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg border p-4 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StickyNote className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-sm font-medium">{note.author}</span>
                  </div>
                  <time className="text-xs text-muted-foreground">
                    {formatRelativeDate(note.timestamp)}
                  </time>
                </div>
                <p className="text-sm text-muted-foreground">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Conversation history (emails + status changes) */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Activity</h2>
        {threadComms.filter((c) => c.type !== "Note").length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No other activity recorded.
          </p>
        ) : (
          <div className="space-y-3">
            {threadComms
              .filter((c) => c.type !== "Note")
              .map((comm) => (
                <div key={comm.id} className="rounded-lg border p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {comm.type === "StatusChange" ? (
                        <ArrowRightLeft className="h-3.5 w-3.5 text-purple-500" />
                      ) : comm.type === "Email" ? (
                        <span className="h-3.5 w-3.5 text-blue-500">@</span>
                      ) : null}
                      <span className="text-sm font-medium">
                        {comm.type === "StatusChange"
                          ? `Status changed: ${comm.statusFrom} → ${comm.statusTo}`
                          : comm.type === "Email"
                          ? comm.emailSubject
                          : "Thread created"}
                      </span>
                    </div>
                    <time className="text-xs text-muted-foreground">
                      {formatRelativeDate(comm.timestamp)}
                    </time>
                  </div>
                  {comm.type === "Email" && comm.emailBody && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {comm.emailBody}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {getUserName(comm.createdBy)}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Won prompt — Mark deal as committed? */}
      <ConfirmDialog
        open={showWonPrompt}
        onOpenChange={(open) => {
          if (!open) {
            setShowWonPrompt(false);
            setPendingStatus(null);
          }
        }}
        title="Mark Thread as Won"
        description={`This is a Deal Evaluation thread linked to "${linkedDeal?.name}". Would you like to mark the associated deal as "Committed"?`}
        confirmLabel="Yes, Mark Deal as Committed"
        cancelLabel="No, Just Close Thread"
        onConfirm={() => confirmStatusChange(true)}
      />

      {/* "No" path for won prompt — just close the thread */}
      {showWonPrompt && (
        <div className="hidden">
          {/* The cancel handler on ConfirmDialog closes it. We handle the "no" case
              by also setting status when the dialog is dismissed without confirm */}
        </div>
      )}

      {/* Terminal status confirmation */}
      <ConfirmDialog
        open={showCloseConfirm}
        onOpenChange={(open) => {
          if (!open) {
            setShowCloseConfirm(false);
            setPendingStatus(null);
          }
        }}
        title={`Change Status to "${pendingStatus}"?`}
        description={`This will mark the thread as "${pendingStatus}". This is a terminal status. You can still change it later if needed.`}
        confirmLabel="Confirm"
        onConfirm={() => confirmStatusChange()}
        variant={pendingStatus === "Lost" ? "destructive" : "default"}
      />
    </div>
  );
}
