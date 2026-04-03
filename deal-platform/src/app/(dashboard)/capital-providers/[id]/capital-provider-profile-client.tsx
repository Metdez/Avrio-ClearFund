"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Archive,
  Building,
  ChevronDown,
  ChevronUp,
  Mail,
  PencilLine,
  Plus,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  borrowers,
  communications,
  dealCapitalProviders,
  deals,
} from "@/mock-data";
import type { Communication, Deal } from "@/types";
import { formatDate } from "@/lib/utils";
import { CapitalProviderEditForm } from "../capital-provider-form";
import {
  getCapitalProviderEditDefaults,
  useCapitalProviderStore,
} from "../capital-provider-store";
import { ThreadList } from "@/components/shared/thread-list";
import { FacilitiesSection } from "@/components/shared/facilities-section";
import { EntityDocuments } from "@/components/shared/entity-documents";

type DealRow = Deal & Record<string, unknown>;

function EmailRow({ comm }: { comm: Communication }) {
  const [expanded, setExpanded] = useState(false);
  const preview =
    comm.emailBody && comm.emailBody.length > 160
      ? comm.emailBody.slice(0, 160) + "…"
      : comm.emailBody ?? "";

  return (
    <div className="border-b last:border-b-0 py-3">
      <button
        type="button"
        className="flex w-full items-start gap-3 text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium">
              {comm.emailSubject ?? "(No subject)"}
            </p>
            {expanded ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{comm.emailSender}</span>
            <span>→</span>
            <span className="truncate">
              {comm.emailRecipients?.join(", ")}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDate(comm.timestamp)}
          </p>
          {!expanded && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {preview}
            </p>
          )}
          {expanded && (
            <p className="mt-2 whitespace-pre-wrap text-sm">
              {comm.emailBody}
            </p>
          )}
        </div>
      </button>
    </div>
  );
}

function NoteRow({ comm }: { comm: Communication }) {
  return (
    <div className="border-b last:border-b-0 py-3">
      <div className="flex items-start gap-3">
        <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">{comm.noteAuthor ?? "Unknown"}</span>
            <span>·</span>
            <span>{formatDate(comm.timestamp)}</span>
          </div>
          <p className="whitespace-pre-wrap text-sm">{comm.noteContent}</p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

export function CapitalProviderProfileClient({
  capitalProviderId,
}: {
  capitalProviderId: string;
}) {
  const router = useRouter();
  const {
    capitalProviders,
    currentUser,
    isReady,
    setArchived,
    updateCapitalProvider,
  } = useCapitalProviderStore();
  const [isEditing, setIsEditing] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [formVersion, setFormVersion] = useState(0);

  const capitalProvider = capitalProviders.find(
    (item) => item.id === capitalProviderId,
  );

  const linkedDeals = useMemo(() => {
    if (!capitalProvider) {
      return [];
    }

    const dealIds = dealCapitalProviders
      .filter((link) => link.capitalProviderId === capitalProvider.id)
      .map((link) => link.dealId);

    return deals
      .filter((deal) => dealIds.includes(deal.id))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [capitalProvider]);

  const activeDealCount = linkedDeals.filter(
    (deal) => !["Funded", "Closed", "Terminated"].includes(deal.pipelineStage),
  ).length;

  const cpEmails = useMemo(() => {
    if (!capitalProvider) return [];
    const contactEmail = capitalProvider.contactEmail?.toLowerCase();
    return communications
      .filter((c) => {
        if (c.type !== "Email") return false;
        // Match by explicit capitalProviderId
        if (c.capitalProviderId === capitalProvider.id) return true;
        // Match by entityType + entityId
        if (
          c.entityType === "CapitalProvider" &&
          c.entityId === capitalProvider.id
        )
          return true;
        // Match by contact email address in sender or recipients
        if (contactEmail) {
          if (c.emailSender?.toLowerCase() === contactEmail) return true;
          if (
            c.emailRecipients?.some(
              (r) => r.toLowerCase() === contactEmail,
            )
          )
            return true;
        }
        return false;
      })
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [capitalProvider]);

  const cpNotes = useMemo(() => {
    if (!capitalProvider) return [];
    return communications
      .filter((c) => {
        if (c.type !== "Note") return false;
        if (c.capitalProviderId === capitalProvider.id) return true;
        if (
          c.entityType === "CapitalProvider" &&
          c.entityId === capitalProvider.id
        )
          return true;
        return false;
      })
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [capitalProvider]);

  const dealColumns: ColumnDef<DealRow>[] = [
    {
      key: "name",
      header: "Deal",
      sortable: true,
      accessor: (deal) => deal.name,
      render: (deal) => <span className="font-medium">{deal.name}</span>,
    },
    {
      key: "borrower",
      header: "Borrower",
      render: (deal) =>
        borrowers.find((borrower) => borrower.id === deal.borrowerId)?.name ??
        "Unknown borrower",
    },
    {
      key: "pipelineStage",
      header: "Deal Status",
      render: (deal) => (
        <StatusBadge status={deal.pipelineStage} context="pipeline" />
      ),
    },
    {
      key: "cpStatus",
      header: "CP Status",
      render: (deal) => {
        const link = dealCapitalProviders.find(
          (item) =>
            item.dealId === deal.id && item.capitalProviderId === capitalProviderId,
        );

        return link ? (
          <StatusBadge status={link.status} context="cpPitch" />
        ) : (
          "Not linked"
        );
      },
    },
  ];

  if (!isReady) {
    return <LoadingSkeleton layout="form" rows={8} />;
  }

  if (!capitalProvider) {
    return (
      <EmptyState
        icon={Building}
        title="Capital provider not found"
        description="This capital provider record could not be loaded."
        actionLabel="Back to Capital Providers"
        actionHref="/capital-providers"
      />
    );
  }

  const canEdit = !capitalProvider.isArchived || currentUser.role === "Admin";
  const defaultValues = getCapitalProviderEditDefaults(capitalProvider);

  return (
    <div className="space-y-6">
      <PageHeader
        title={capitalProvider.firmName}
        description="Capital provider profile, relationships, and linked deals."
        actions={
          <>
            {canEdit && (
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing((current) => !current);
                  setFormVersion((current) => current + 1);
                }}
              >
                <PencilLine />
                {isEditing ? "Close Edit" : "Edit"}
              </Button>
            )}
            {currentUser.role === "Admin" && (
              <Button
                variant="destructive"
                onClick={() => setArchiveOpen(true)}
              >
                <Archive />
                Archive
              </Button>
            )}
          </>
        }
      />

      {capitalProvider.isArchived && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
          <AlertTriangle className="h-4 w-4" />
          <p className="text-sm font-medium">
            This capital provider has been archived.
          </p>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="threads">Threads</TabsTrigger>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="emails">
            Emails{cpEmails.length > 0 && ` (${cpEmails.length})`}
          </TabsTrigger>
          <TabsTrigger value="notes">
            Notes{cpNotes.length > 0 && ` (${cpNotes.length})`}
          </TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>
                Relationship details, contact information, and profile notes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <CapitalProviderEditForm
                  key={`${capitalProvider.id}-${formVersion}`}
                  defaultValues={defaultValues}
                  isEditing
                  submitLabel="Save Changes"
                  onCancel={() => {
                    setIsEditing(false);
                    setFormVersion((current) => current + 1);
                  }}
                  onSubmit={(values) => {
                    updateCapitalProvider(capitalProvider.id, values);
                    toast.success("Capital provider updated.");
                    setIsEditing(false);
                    setFormVersion((current) => current + 1);
                  }}
                />
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  <DetailRow label="Firm Name" value={capitalProvider.firmName} />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Relationship Type
                    </p>
                    <Badge variant="outline">
                      {capitalProvider.relationshipType}
                    </Badge>
                  </div>
                  <DetailRow
                    label="Contact Person"
                    value={capitalProvider.contactPersonName || "Not provided"}
                  />
                  <DetailRow
                    label="Contact Email"
                    value={capitalProvider.contactEmail || "Not provided"}
                  />
                  <DetailRow
                    label="Contact Phone"
                    value={capitalProvider.contactPhone || "Not provided"}
                  />
                  <DetailRow
                    label="Type"
                    value={
                      capitalProvider.type === "Life Insurance Company"
                        ? "Life Insurance"
                        : capitalProvider.type
                    }
                  />
                  <DetailRow
                    label="Created"
                    value={formatDate(capitalProvider.createdAt)}
                  />
                  <DetailRow
                    label="Updated"
                    value={formatDate(capitalProvider.updatedAt)}
                  />
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="whitespace-pre-wrap font-medium">
                      {capitalProvider.notes || "No notes added."}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals">
          <Card>
            <CardHeader>
              <CardTitle>Deals</CardTitle>
              <CardDescription>
                Deals tied to this capital provider, ordered by most recent activity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {linkedDeals.length === 0 ? (
                <EmptyState
                  icon={Plus}
                  title="No deals yet"
                  description="Create a deal to connect this capital provider to borrower activity."
                  actionLabel="Create Deal"
                  actionHref="/deals/new"
                />
              ) : (
                <DataTable
                  columns={dealColumns}
                  data={linkedDeals as DealRow[]}
                  onRowClick={(deal) => router.push(`/deals/${deal.id}`)}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threads">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Threads</CardTitle>
              <CardDescription>
                Track conversations, deal evaluations, and negotiations with this capital provider.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThreadList capitalProviderId={capitalProviderId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facilities">
          <FacilitiesSection capitalProviderId={capitalProviderId} />
        </TabsContent>

        <TabsContent value="emails">
          <Card>
            <CardHeader>
              <CardTitle>Emails</CardTitle>
              <CardDescription>
                Emails sent to or received from this capital provider, in reverse
                chronological order.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cpEmails.length === 0 ? (
                <EmptyState
                  icon={Mail}
                  title="No emails tracked"
                  description="Emails linked to this capital provider will appear here."
                />
              ) : (
                <div className="divide-y-0">
                  {cpEmails.map((email) => (
                    <EmailRow key={email.id} comm={email} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>
                Internal notes and observations about this capital provider
                relationship.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cpNotes.length === 0 ? (
                <EmptyState
                  icon={StickyNote}
                  title="No notes yet"
                  description="Add notes to track conversations, observations, and action items for this capital provider."
                />
              ) : (
                <div className="divide-y-0">
                  {cpNotes.map((note) => (
                    <NoteRow key={note.id} comm={note} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Documents linked to this capital provider.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EntityDocuments
                entityType="CapitalProvider"
                entityId={capitalProviderId}
                entityName={capitalProvider.firmName}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title={`Are you sure you want to archive ${capitalProvider.firmName}?`}
        description={
          activeDealCount > 0
            ? `This record has ${activeDealCount} active deals. Archiving will not affect those deals, but the record will be hidden from default views.`
            : "This will hide the record from default views."
        }
        confirmLabel="Archive Capital Provider"
        variant="destructive"
        onConfirm={() => {
          setArchived(capitalProvider.id, true);
          toast.success("Capital provider archived.");
          router.push("/capital-providers");
        }}
      />
    </div>
  );
}
