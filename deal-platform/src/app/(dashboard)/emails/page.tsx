"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SearchFilterBar, type FilterOption } from "@/components/shared/search-filter-bar";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { AiMessagePreview } from "@/components/shared/ai-message-preview";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  communications,
  borrowers,
  capitalProviders,
  deals,
  engagementThreads,
  followUpSequences,
  tasks,
} from "@/mock-data";
import { FOLLOW_UP_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import {
  Mail,
  Link2,
  Settings,
  Check,
  X,
  Send,
  CheckCircle,
  ListChecks,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { EmailLinkDialog } from "./_components/email-link-dialog";
import { EmailThreadView } from "./_components/email-thread-view";
import type { Communication, FollowUpSequence } from "@/types";

// ──────────────────────────────────────────────
// Shared helpers
// ──────────────────────────────────────────────

function buildContactMap() {
  const map = new Map<string, { entityType: string; entityId: string; name: string }[]>();
  for (const b of borrowers) {
    for (const contact of b.contacts) {
      if (contact.email) {
        const existing = map.get(contact.email.toLowerCase()) ?? [];
        existing.push({ entityType: "Borrower", entityId: b.id, name: b.name });
        map.set(contact.email.toLowerCase(), existing);
      }
    }
  }
  for (const cp of capitalProviders) {
    if (cp.contactEmail) {
      const existing = map.get(cp.contactEmail.toLowerCase()) ?? [];
      existing.push({ entityType: "CapitalProvider", entityId: cp.id, name: cp.firmName });
      map.set(cp.contactEmail.toLowerCase(), existing);
    }
  }
  return map;
}

const contactMap = buildContactMap();

function getEmails() {
  return communications
    .filter((c) => c.type === "Email")
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function isIncoming(email: Communication): boolean {
  return !email.emailSender?.includes("avriocleanfund.com");
}

function isOutgoing(email: Communication): boolean {
  return !!email.emailSender?.includes("avriocleanfund.com");
}

/** Group emails into conversation threads by normalized subject line */
function groupIntoThreads(emails: Communication[]): Map<string, Communication[]> {
  const threads = new Map<string, Communication[]>();
  for (const email of emails) {
    const key = (email.emailSubject ?? "")
      .replace(/^(RE:|FW:|Fwd:)\s*/gi, "")
      .trim()
      .toLowerCase();
    const existing = threads.get(key) ?? [];
    existing.push(email);
    threads.set(key, existing);
  }
  return threads;
}

type LinkStatus = "linked" | "unlinked";

interface EmailWithStatus extends Communication {
  linkStatus: LinkStatus;
  suggestions: { entityType: string; entityId: string; name: string }[];
}

const LINK_STATUS_FILTER: FilterOption = {
  label: "Status",
  value: "linkStatus",
  options: [
    { label: "Unlinked", value: "unlinked" },
    { label: "Linked", value: "linked" },
  ],
};

// ──────────────────────────────────────────────
// Follow-up helpers (moved from /follow-ups)
// ──────────────────────────────────────────────

const MOCK_PENDING_DRAFTS = [
  {
    sequenceId: "fus-001",
    recipientName: "Derek Yamamoto",
    recipientEmail: "d.yamamoto@apollo.com",
    dealOrTaskName: "Apollo Global — Infrastructure Fund Evaluation",
    lastCommunicationDate: "2026-03-19T11:00:00Z",
    daysSinceLastComm: 14,
    scheduledSendTime: "2026-04-03T11:00:00Z",
    draftMessage: `Hi Derek,

I hope this message finds you well. I wanted to follow up on our previous conversation regarding the infrastructure fund evaluation. It's been about two weeks since our last exchange, and I wanted to check in on the status of your team's review.

We remain very enthusiastic about this opportunity and are happy to provide any additional materials or data your team might need to move forward with the evaluation.

Would you have availability this week for a brief call to discuss next steps?

Best regards,
Sarah Chen
Avrio Clean Fund`,
  },
  {
    sequenceId: "fus-004",
    recipientName: "Janet Williams",
    recipientEmail: "j.williams@ecotechenv.com",
    dealOrTaskName: "Task: Phase 2 Environmental Assessment — Appalachian Clean Coal",
    lastCommunicationDate: "2026-03-25T08:00:00Z",
    daysSinceLastComm: 8,
    scheduledSendTime: "2026-04-04T08:00:00Z",
    draftMessage: `Hi Janet,

I'm reaching out regarding the Phase 2 Environmental Assessment for the Appalachian Clean Coal Transition project. Our records indicate the assessment report was expected by March 28th, and I wanted to check on the progress.

Could you provide an updated timeline for delivery? We're coordinating several workstreams that depend on these results, so an ETA would be very helpful for our planning.

Thank you for your continued work on this.

Best regards,
James Rodriguez
Avrio Clean Fund`,
  },
];

function getContextName(seq: FollowUpSequence): string {
  if (seq.threadId) {
    const thread = engagementThreads.find((t) => t.id === seq.threadId);
    if (thread) {
      const deal = thread.dealId ? deals.find((d) => d.id === thread.dealId) : null;
      return deal ? deal.name : thread.title;
    }
  }
  if (seq.taskId) {
    const task = tasks.find((t) => t.id === seq.taskId);
    if (task) {
      const deal = deals.find((d) => d.id === task.dealId);
      return `${task.name}${deal ? ` — ${deal.name}` : ""}`;
    }
  }
  return "—";
}

const FOLLOW_UP_STATUS_COLORS: Record<string, string> = {
  Active: "bg-blue-100 text-blue-700",
  Paused: "bg-amber-100 text-amber-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-gray-100 text-gray-700",
};

// ──────────────────────────────────────────────
// Main page component
// ──────────────────────────────────────────────

export default function EmailsPage() {
  return (
    <Suspense>
      <EmailsPageInner />
    </Suspense>
  );
}

function EmailsPageInner() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") ?? "inbox";

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const allEmails = useMemo(() => getEmails(), []);

  // Inbox state
  const [linkedOverrides, setLinkedOverrides] = useState<Record<string, LinkStatus>>({});
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [linkDialogEmail, setLinkDialogEmail] = useState<Communication | null>(null);
  const [activeThreadKey, setActiveThreadKey] = useState<string | null>(null);

  // Follow-up state
  const [pendingDrafts, setPendingDrafts] = useState(MOCK_PENDING_DRAFTS);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [followUpView, setFollowUpView] = useState<"queue" | "sequences">("queue");
  const [fuSearch, setFuSearch] = useState("");
  const [fuFilterValues, setFuFilterValues] = useState<Record<string, string>>({});

  // ─── Email helpers ───

  const emailsWithStatus: EmailWithStatus[] = useMemo(() => {
    return allEmails.map((email) => {
      const override = linkedOverrides[email.id];
      const hasEntity = !!(email.entityType && email.entityId);
      const linkStatus: LinkStatus = override ?? (hasEntity ? "linked" : "unlinked");
      const senderLower = email.emailSender?.toLowerCase() ?? "";
      const suggestions =
        !dismissedSuggestions.has(email.id) && linkStatus === "unlinked"
          ? (contactMap.get(senderLower) ?? [])
          : [];
      return { ...email, linkStatus, suggestions };
    });
  }, [allEmails, linkedOverrides, dismissedSuggestions]);

  const threadMap = useMemo(() => groupIntoThreads(allEmails), [allEmails]);

  const inboxEmails = useMemo(
    () => emailsWithStatus.filter((e) => isIncoming(e)),
    [emailsWithStatus]
  );

  const sentEmails = useMemo(
    () => emailsWithStatus.filter((e) => isOutgoing(e)),
    [emailsWithStatus]
  );

  function getFilteredEmails(source: EmailWithStatus[]) {
    let result = source;
    if (search.length >= 2) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.emailSubject?.toLowerCase().includes(q) ||
          e.emailSender?.toLowerCase().includes(q)
      );
    }
    const statusFilter = filterValues.linkStatus;
    if (statusFilter) {
      result = result.filter((e) => e.linkStatus === statusFilter);
    }
    return result;
  }

  const filteredInbox = useMemo(
    () => getFilteredEmails(inboxEmails),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inboxEmails, search, filterValues]
  );

  const filteredSent = useMemo(
    () => getFilteredEmails(sentEmails),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sentEmails, search, filterValues]
  );

  const handleLink = useCallback((emailId: string) => {
    setLinkedOverrides((prev) => ({ ...prev, [emailId]: "linked" }));
    toast.success("Email linked successfully");
  }, []);

  const handleAcceptSuggestion = useCallback((emailId: string, name: string) => {
    setLinkedOverrides((prev) => ({ ...prev, [emailId]: "linked" }));
    toast.success(`Email linked to ${name}`);
  }, []);

  const handleDismissSuggestion = useCallback((emailId: string) => {
    setDismissedSuggestions((prev) => new Set(prev).add(emailId));
  }, []);

  const handleUnlink = useCallback((emailId: string) => {
    setLinkedOverrides((prev) => ({ ...prev, [emailId]: "unlinked" }));
    toast.success("Email unlinked");
  }, []);

  function openThread(email: Communication) {
    const key = (email.emailSubject ?? "")
      .replace(/^(RE:|FW:|Fwd:)\s*/gi, "")
      .trim()
      .toLowerCase();
    setActiveThreadKey(key);
  }

  // ─── Follow-up helpers ───

  function handleApprove(sequenceId: string, _message: string) {
    setPendingDrafts((prev) => prev.filter((d) => d.sequenceId !== sequenceId));
    toast.success("Follow-up sent successfully.");
  }

  function handleSkip(sequenceId: string) {
    setPendingDrafts((prev) => prev.filter((d) => d.sequenceId !== sequenceId));
    toast.info("Follow-up skipped. Next follow-up scheduled.");
  }

  function handleCancelSequence(sequenceId: string) {
    setCancelTarget(sequenceId);
    setCancelDialogOpen(true);
  }

  function confirmCancel() {
    if (cancelTarget) {
      setPendingDrafts((prev) => prev.filter((d) => d.sequenceId !== cancelTarget));
      toast.success("Follow-up sequence cancelled.");
    }
    setCancelDialogOpen(false);
    setCancelTarget(null);
  }

  const activeSequenceCount = followUpSequences.filter((s) => s.status === "Active").length;

  const enrichedSequences = useMemo(
    () => followUpSequences.map((seq) => ({ ...seq, contextName: getContextName(seq) })),
    []
  );

  const filteredSequences = useMemo(() => {
    let result = enrichedSequences;
    if (fuSearch.length >= 2) {
      const q = fuSearch.toLowerCase();
      result = result.filter(
        (s) =>
          s.contactName.toLowerCase().includes(q) ||
          s.contactEmail.toLowerCase().includes(q) ||
          s.contextName.toLowerCase().includes(q)
      );
    }
    if (fuFilterValues.status) {
      result = result.filter((s) => s.status === fuFilterValues.status);
    }
    if (fuFilterValues.mode) {
      result = result.filter((s) => s.mode === fuFilterValues.mode);
    }
    return result;
  }, [enrichedSequences, fuSearch, fuFilterValues]);

  // ─── Column defs ───

  const emailColumns: ColumnDef<EmailWithStatus>[] = [
    {
      key: "emailSender",
      header: "From",
      sortable: true,
      mobilePriority: 1,
      className: "min-w-0 sm:min-w-[180px]",
      render: (item) => <span className="font-medium">{item.emailSender}</span>,
    },
    {
      key: "emailSubject",
      header: "Subject",
      sortable: true,
      mobilePriority: 1,
      className: "min-w-0 sm:min-w-[250px]",
      render: (item) => (
        <div>
          <div className="font-medium">{item.emailSubject}</div>
          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {item.emailBody?.slice(0, 100)}
          </div>
        </div>
      ),
    },
    {
      key: "timestamp",
      header: "Date",
      sortable: true,
      mobilePriority: 2,
      className: "w-[120px]",
      accessor: (item) => item.timestamp,
      render: (item) => (
        <span className="text-sm text-muted-foreground">{formatDate(item.timestamp)}</span>
      ),
    },
    {
      key: "linkStatus",
      header: "Status",
      mobilePriority: 2,
      className: "w-[100px]",
      render: (item) =>
        item.linkStatus === "linked" ? (
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">
            Linked
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-0">
            Unlinked
          </Badge>
        ),
    },
    {
      key: "suggestions",
      header: "Suggested Match",
      className: "min-w-0 sm:min-w-[220px]",
      render: (item) =>
        item.suggestions.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {item.suggestions.map((s) => (
              <div
                key={`${s.entityType}-${s.entityId}`}
                className="flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-1 text-xs"
              >
                <span className="font-medium text-amber-800">{s.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAcceptSuggestion(item.id, s.name);
                  }}
                  className="ml-1 rounded p-0.5 hover:bg-amber-200 text-amber-700"
                  title="Accept"
                >
                  <Check className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismissSuggestion(item.id);
                  }}
                  className="rounded p-0.5 hover:bg-amber-200 text-amber-700"
                  title="Dismiss"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : null,
    },
    {
      key: "actions",
      header: "",
      className: "w-[80px]",
      render: (item) =>
        item.linkStatus === "unlinked" ? (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setLinkDialogEmail(item);
            }}
          >
            <Link2 className="mr-1 h-3.5 w-3.5" />
            Link
          </Button>
        ) : null,
    },
  ];

  const sequenceColumns: ColumnDef<FollowUpSequence & { contextName: string }>[] = [
    {
      key: "contactName",
      header: "Contact",
      sortable: true,
      mobilePriority: 1,
      render: (item) => (
        <div>
          <p className="font-medium">{item.contactName}</p>
          <p className="text-xs text-muted-foreground">{item.contactEmail}</p>
        </div>
      ),
    },
    {
      key: "contextName",
      header: "Deal / Task",
      sortable: true,
      render: (item) => <span className="text-sm">{item.contextName}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      mobilePriority: 1,
      render: (item) => (
        <Badge
          variant="secondary"
          className={`font-medium border-0 ${FOLLOW_UP_STATUS_COLORS[item.status] ?? ""}`}
        >
          {item.status}
        </Badge>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      mobilePriority: 2,
      render: (item) => (
        <span className="text-sm font-medium">
          {item.followUpsSent} / {item.totalFollowUps}
        </span>
      ),
    },
    {
      key: "nextScheduledAt",
      header: "Next Scheduled",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {item.nextScheduledAt ? formatDate(item.nextScheduledAt) : "—"}
        </span>
      ),
    },
    {
      key: "mode",
      header: "Mode",
      render: (item) => (
        <Badge variant="outline" className="text-xs">
          {item.mode === "AutoSend" ? "Auto" : "Approval"}
        </Badge>
      ),
    },
    {
      key: "intervalDays",
      header: "Interval",
      render: (item) => (
        <span className="text-sm text-muted-foreground">{item.intervalDays}d</span>
      ),
    },
  ];

  // ─── Thread view ───

  if (activeThreadKey !== null) {
    const threadEmails = threadMap.get(activeThreadKey) ?? [];

    return (
      <div className="space-y-6 h-[calc(100vh-8rem)]">
        <EmailThreadView
          emails={threadEmails}
          onBack={() => setActiveThreadKey(null)}
          onUnlink={handleUnlink}
        />
      </div>
    );
  }

  // ─── Tabbed view ───

  function renderEmailTable(data: EmailWithStatus[], emptyAction?: { label: string; href: string }) {
    if (data.length === 0) {
      return (
        <EmptyState
          icon={Mail}
          title="No emails found"
          description={
            search || filterValues.linkStatus
              ? "Try adjusting your search or filters."
              : "Connect your email provider to start ingesting emails."
          }
          actionLabel={emptyAction?.label}
          actionHref={emptyAction?.href}
        />
      );
    }
    return (
      <DataTable
        columns={emailColumns as unknown as ColumnDef<Record<string, unknown>>[]}
        data={data as unknown as Record<string, unknown>[]}
        onRowClick={(item) => openThread(item as unknown as Communication)}
      />
    );
  }

  const FU_STATUS_FILTER: FilterOption = {
    label: "Status",
    value: "status",
    options: FOLLOW_UP_STATUSES.map((s) => ({ label: s, value: s })),
  };

  const FU_MODE_FILTER: FilterOption = {
    label: "Mode",
    value: "mode",
    options: [
      { label: "Auto-Send", value: "AutoSend" },
      { label: "Approval Required", value: "ApprovalRequired" },
    ],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emails"
        description="Review ingested emails, draft replies, and manage automated follow-ups."
        actions={
          <Link href="/settings/integrations/email">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Email Settings
            </Button>
          </Link>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inbox" className="gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            Inbox
            {inboxEmails.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {inboxEmails.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            Sent
          </TabsTrigger>
          <TabsTrigger value="follow-ups" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Follow-Ups
            {pendingDrafts.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs bg-amber-100 text-amber-700 border-0">
                {pendingDrafts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ─── Inbox Tab ─── */}
        <TabsContent value="inbox" className="space-y-4 mt-4">
          <SearchFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by subject or sender..."
            filters={[LINK_STATUS_FILTER]}
            filterValues={filterValues}
            onFilterChange={(key, val) =>
              setFilterValues((prev) => ({ ...prev, [key]: val }))
            }
          />
          {renderEmailTable(filteredInbox, {
            label: "Connect Email",
            href: "/settings/integrations/email",
          })}
        </TabsContent>

        {/* ─── Sent Tab ─── */}
        <TabsContent value="sent" className="space-y-4 mt-4">
          <SearchFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by subject or recipient..."
            filters={[LINK_STATUS_FILTER]}
            filterValues={filterValues}
            onFilterChange={(key, val) =>
              setFilterValues((prev) => ({ ...prev, [key]: val }))
            }
          />
          {renderEmailTable(filteredSent)}
        </TabsContent>

        {/* ─── Follow-Ups Tab ─── */}
        <TabsContent value="follow-ups" className="space-y-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant={followUpView === "queue" ? "default" : "outline"}
              size="sm"
              onClick={() => setFollowUpView("queue")}
            >
              Approval Queue
              {pendingDrafts.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs bg-amber-100 text-amber-700 border-0">
                  {pendingDrafts.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={followUpView === "sequences" ? "default" : "outline"}
              size="sm"
              onClick={() => setFollowUpView("sequences")}
            >
              <ListChecks className="h-4 w-4 mr-1" />
              All Sequences
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
                {activeSequenceCount} active
              </Badge>
            </Button>
          </div>

          {followUpView === "queue" ? (
            <>
              {pendingDrafts.length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title="No pending follow-ups"
                  description="All follow-up messages have been reviewed. New drafts will appear here when sequences generate them."
                />
              ) : (
                <div className="space-y-4">
                  {pendingDrafts.map((draft) => (
                    <AiMessagePreview
                      key={draft.sequenceId}
                      recipientName={draft.recipientName}
                      recipientEmail={draft.recipientEmail}
                      dealOrTaskName={draft.dealOrTaskName}
                      lastCommunicationDate={draft.lastCommunicationDate}
                      daysSinceLastComm={draft.daysSinceLastComm}
                      scheduledSendTime={draft.scheduledSendTime}
                      draftMessage={draft.draftMessage}
                      onApprove={(msg) => handleApprove(draft.sequenceId, msg)}
                      onSkip={() => handleSkip(draft.sequenceId)}
                      onCancel={() => handleCancelSequence(draft.sequenceId)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <SearchFilterBar
                searchValue={fuSearch}
                onSearchChange={setFuSearch}
                searchPlaceholder="Search by contact or deal..."
                filters={[FU_STATUS_FILTER, FU_MODE_FILTER]}
                filterValues={fuFilterValues}
                onFilterChange={(key, val) =>
                  setFuFilterValues((prev) => ({ ...prev, [key]: val }))
                }
              />

              {filteredSequences.length === 0 ? (
                <EmptyState
                  icon={ListChecks}
                  title="No sequences found"
                  description={
                    fuSearch || Object.values(fuFilterValues).some(Boolean)
                      ? "No follow-up sequences match your filters."
                      : "No automated follow-ups have been set up yet."
                  }
                />
              ) : (
                <DataTable
                  columns={sequenceColumns as unknown as ColumnDef<Record<string, unknown>>[]}
                  data={filteredSequences as unknown as Record<string, unknown>[]}
                  keyField={"id" as keyof Record<string, unknown>}
                />
              )}
            </>
          )}

          <ConfirmDialog
            open={cancelDialogOpen}
            onOpenChange={setCancelDialogOpen}
            title="Cancel Follow-Up Sequence?"
            description="This will deactivate the entire follow-up sequence. No further follow-ups will be sent to this contact for this sequence. This action cannot be undone."
            confirmLabel="Cancel Sequence"
            onConfirm={confirmCancel}
            variant="destructive"
          />
        </TabsContent>
      </Tabs>

      {/* Link dialog */}
      <EmailLinkDialog
        email={linkDialogEmail}
        open={!!linkDialogEmail}
        onOpenChange={(open) => !open && setLinkDialogEmail(null)}
        onLink={(emailId) => {
          handleLink(emailId);
          setLinkDialogEmail(null);
        }}
      />
    </div>
  );
}
