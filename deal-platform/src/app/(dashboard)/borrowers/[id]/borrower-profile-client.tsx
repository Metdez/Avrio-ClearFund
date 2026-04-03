"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Archive,
  Building2,
  ChevronDown,
  ChevronUp,
  Mail,
  PencilLine,
  Plus,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { EntityDocuments } from "@/components/shared/entity-documents";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  capitalProviders,
  communications,
  dealCapitalProviders,
  deals,
} from "@/mock-data";
import type { Communication, Deal } from "@/types";
import { formatDate } from "@/lib/utils";
import { BorrowerForm } from "../borrower-form";
import {
  getBorrowerFormDefaults,
  useBorrowerStore,
} from "../borrower-store";

type DealRow = Deal & Record<string, unknown>;

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

function EmailEntry({ comm }: { comm: Communication }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <CollapsibleTrigger
        render={<button type="button" />}
        className="flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
      >
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium">
                {comm.emailSubject}
              </p>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDate(comm.timestamp)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              From: {comm.emailSender}
            </p>
            {!expanded && comm.emailBody && (
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                {comm.emailBody}
              </p>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-7 rounded-b-lg border border-t-0 bg-muted/20 px-3 py-2">
          {comm.emailRecipients && (
            <p className="text-xs text-muted-foreground">
              To: {comm.emailRecipients.join(", ")}
            </p>
          )}
          {comm.emailCc && comm.emailCc.length > 0 && (
            <p className="text-xs text-muted-foreground">
              CC: {comm.emailCc.join(", ")}
            </p>
          )}
          <p className="mt-2 whitespace-pre-wrap text-sm">{comm.emailBody}</p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function BorrowerProfileClient({ borrowerId }: { borrowerId: string }) {
  const router = useRouter();
  const { borrowers, currentUser, isReady, setArchived, updateBorrower } =
    useBorrowerStore();
  const [isEditing, setIsEditing] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [formVersion, setFormVersion] = useState(0);

  const borrower = borrowers.find((item) => item.id === borrowerId);

  const borrowerDeals = useMemo(() => {
    if (!borrower) {
      return [];
    }

    return deals
      .filter((deal) => deal.borrowerId === borrower.id)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [borrower]);

  const borrowerEmails = useMemo(() => {
    return communications
      .filter(
        (comm) =>
          comm.type === "Email" &&
          comm.entityType === "Borrower" &&
          comm.entityId === borrowerId,
      )
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [borrowerId]);

  const activeDealCount = borrowerDeals.filter(
    (deal) => !["Funded", "Closed", "Terminated"].includes(deal.pipelineStage),
  ).length;

  const dealColumns: ColumnDef<DealRow>[] = [
    {
      key: "name",
      header: "Deal",
      sortable: true,
      accessor: (deal) => deal.name,
      render: (deal) => <span className="font-medium">{deal.name}</span>,
    },
    {
      key: "pipelineStage",
      header: "Status",
      render: (deal) => (
        <StatusBadge status={deal.pipelineStage} context="pipeline" />
      ),
    },
    {
      key: "capitalProviders",
      header: "Capital Providers",
      render: (deal) => {
        const providerNames = dealCapitalProviders
          .filter((link) => link.dealId === deal.id)
          .map((link) =>
            capitalProviders.find(
              (capitalProvider) => capitalProvider.id === link.capitalProviderId,
            )?.firmName,
          )
          .filter(Boolean)
          .join(", ");

        return providerNames || "No capital providers linked";
      },
    },
    {
      key: "updatedAt",
      header: "Updated",
      sortable: true,
      accessor: (deal) => deal.updatedAt,
      render: (deal) => formatDate(deal.updatedAt),
    },
  ];

  if (!isReady) {
    return <LoadingSkeleton layout="form" rows={8} />;
  }

  if (!borrower) {
    return (
      <EmptyState
        icon={Building2}
        title="Borrower not found"
        description="This borrower record could not be loaded."
        actionLabel="Back to Borrowers"
        actionHref="/borrowers"
      />
    );
  }

  const canEdit = !borrower.isArchived || currentUser.role === "Admin";
  const defaultValues = getBorrowerFormDefaults(borrower);

  return (
    <div className="space-y-6">
      <PageHeader
        title={borrower.name}
        description="Borrower profile, notes, and linked deals."
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

      {borrower.isArchived && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
          <AlertTriangle className="h-4 w-4" />
          <p className="text-sm font-medium">This borrower has been archived.</p>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="emails">
            Emails
            {borrowerEmails.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
                {borrowerEmails.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>
                Core borrower information and relationship context.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <BorrowerForm
                  key={`${borrower.id}-${formVersion}`}
                  defaultValues={defaultValues}
                  isEditing
                  submitLabel="Save Changes"
                  onCancel={() => {
                    setIsEditing(false);
                    setFormVersion((current) => current + 1);
                  }}
                  onSubmit={(values) => {
                    updateBorrower(borrower.id, values);
                    toast.success("Borrower updated.");
                    setIsEditing(false);
                    setFormVersion((current) => current + 1);
                  }}
                />
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <DetailRow label="Company Name" value={borrower.name} />
                    <DetailRow
                      label="Project Type"
                      value={borrower.projectType || "Not provided"}
                    />
                    <DetailRow
                      label="Location"
                      value={borrower.location || "Not provided"}
                    />
                    <DetailRow
                      label="Created"
                      value={formatDate(borrower.createdAt)}
                    />
                    <DetailRow
                      label="Updated"
                      value={formatDate(borrower.updatedAt)}
                    />
                  </div>

                  {/* Contacts as pills */}
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Contacts</p>
                    {borrower.contacts.length === 0 ? (
                      <p className="text-sm font-medium text-muted-foreground">
                        No contacts added.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {borrower.contacts.map((contact, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1.5"
                          >
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {contact.name}
                            </span>
                            {contact.role && (
                              <Badge
                                variant="secondary"
                                className="h-5 px-1.5 text-[10px]"
                              >
                                {contact.role}
                              </Badge>
                            )}
                            {contact.email && (
                              <span className="text-xs text-muted-foreground">
                                {contact.email}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="whitespace-pre-wrap font-medium">
                      {borrower.notes || "No notes added."}
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
                Linked deals for this borrower, ordered by most recent activity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {borrowerDeals.length === 0 ? (
                <EmptyState
                  icon={Plus}
                  title="No deals yet"
                  description="Create a deal to connect this borrower to capital providers."
                  actionLabel="Create Deal"
                  actionHref="/deals/new"
                />
              ) : (
                <DataTable
                  columns={dealColumns}
                  data={borrowerDeals as DealRow[]}
                  onRowClick={(deal) => router.push(`/deals/${deal.id}`)}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails">
          <Card>
            <CardHeader>
              <CardTitle>Emails</CardTitle>
              <CardDescription>
                Emails associated with this borrower.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {borrowerEmails.length === 0 ? (
                <EmptyState
                  icon={Mail}
                  title="No emails yet"
                  description="Emails linked to this borrower will appear here."
                />
              ) : (
                <div className="space-y-2">
                  {borrowerEmails.map((comm) => (
                    <EmailEntry key={comm.id} comm={comm} />
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
                Documents linked to this borrower.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EntityDocuments
                entityType="Borrower"
                entityId={borrowerId}
                entityName={borrower.name}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title={`Are you sure you want to archive ${borrower.name}?`}
        description={
          activeDealCount > 0
            ? `This record has ${activeDealCount} active deals. Archiving will not affect those deals, but the record will be hidden from default views.`
            : `This will hide the record from default views.`
        }
        confirmLabel="Archive Borrower"
        variant="destructive"
        onConfirm={() => {
          setArchived(borrower.id, true);
          toast.success("Borrower archived.");
          router.push("/borrowers");
        }}
      />
    </div>
  );
}
