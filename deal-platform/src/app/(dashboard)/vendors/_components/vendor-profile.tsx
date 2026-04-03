"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Building2, Mail, MessageSquare, Pencil, Phone, Plus, User } from "lucide-react";

import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate, generateId } from "@/lib/utils";
import { borrowers } from "@/mock-data";
import type { VendorNote } from "@/types";

import { useExecutionWorkspaceStore } from "@/app/(dashboard)/deals/[id]/execution/_lib/execution-workspace-store";
import { VendorFormDialog, type VendorFormValues } from "./vendor-form-dialog";

type VendorProfileProps = {
  vendorId: string;
  customServiceTypes?: string[];
  onAddCustomServiceType?: (type: string) => void;
};

type DealHistoryRow = {
  id: string;
  dealId: string;
  dealName: string;
  borrowerName: string;
  dealSize?: number;
  stage: string;
  createdAt: string;
};

export function VendorProfile({ vendorId, customServiceTypes, onAddCustomServiceType }: VendorProfileProps) {
  const { vendors, deals, tasks, isReady, upsertVendor } = useExecutionWorkspaceStore();
  const [isEditing, setIsEditing] = useState(false);
  const [localNotes, setLocalNotes] = useState<VendorNote[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const vendor = vendors.find((item) => item.id === vendorId);

  const contacts = vendor?.contacts?.length
    ? vendor.contacts
    : vendor?.contactPersonName
      ? [{ name: vendor.contactPersonName, email: vendor.contactEmail, phone: vendor.contactPhone }]
      : [];

  // Merge mock vendorNotes with locally added notes
  const allNotes = useMemo(() => {
    const base = vendor?.vendorNotes ?? [];
    return [...base, ...localNotes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [vendor?.vendorNotes, localNotes]);

  // Deal history: find all unique deals where this vendor has tasks
  const dealHistory = useMemo<DealHistoryRow[]>(() => {
    if (!vendor) return [];

    const vendorDealIds = new Set(
      tasks
        .filter((t) => !t.isDeleted && t.vendorId === vendor.id)
        .map((t) => t.dealId)
    );

    const rows: DealHistoryRow[] = [];
    for (const dealId of vendorDealIds) {
      const deal = deals.find((d) => d.id === dealId);
      if (!deal) continue;
      const borrower = borrowers.find((b) => b.id === deal.borrowerId);
      rows.push({
        id: dealId,
        dealId,
        dealName: deal.name,
        borrowerName: borrower?.name ?? "Unknown",
        dealSize: deal.estimatedDealSize,
        stage: deal.pipelineStage as string,
        createdAt: deal.createdAt,
      });
    }
    return rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [deals, tasks, vendor]);

  const dealHistoryColumns: ColumnDef<DealHistoryRow>[] = [
    {
      key: "dealName",
      header: "Deal Name",
      sortable: true,
      accessor: (row) => row.dealName,
      render: (row) => (
        <Link className="font-medium hover:underline" href={`/deals/${row.dealId}`}>
          {row.dealName}
        </Link>
      ),
    },
    {
      key: "borrowerName",
      header: "Borrower",
      sortable: true,
      accessor: (row) => row.borrowerName,
    },
    {
      key: "dealSize",
      header: "Deal Size",
      sortable: true,
      accessor: (row) => row.dealSize ?? 0,
      render: (row) => row.dealSize ? formatCurrency(row.dealSize) : "—",
    },
    {
      key: "stage",
      header: "Stage",
      render: (row) => <StatusBadge status={row.stage} context="pipeline" />,
    },
    {
      key: "createdAt",
      header: "Date",
      sortable: true,
      accessor: (row) => row.createdAt,
      render: (row) => formatDate(row.createdAt),
    },
  ];

  const handleSubmit = (values: VendorFormValues) => {
    if (!vendor) return;
    upsertVendor({
      id: vendor.id,
      companyName: values.companyName,
      serviceType: values.serviceType,
      contactPersonName: values.contacts[0]?.name || undefined,
      contactEmail: values.contacts[0]?.email || undefined,
      contactPhone: values.contacts[0]?.phone || undefined,
      contacts: values.contacts.map((c) => ({
        name: c.name,
        email: c.email || undefined,
        phone: c.phone || undefined,
        role: c.role || undefined,
      })),
      notes: values.notes || undefined,
    });
  };

  const handleAddNote = () => {
    const trimmed = newNoteText.trim();
    if (!trimmed) return;
    setLocalNotes((prev) => [
      ...prev,
      {
        id: generateId(),
        author: "You",
        content: trimmed,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewNoteText("");
  };

  if (!isReady) {
    return <LoadingSkeleton layout="card" rows={4} />;
  }

  if (!vendor) {
    return (
      <EmptyState
        icon={Building2}
        title="Vendor not found"
        description="This vendor record could not be located in the prototype workspace."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={vendor.companyName}
        description={`${vendor.serviceType} vendor profile`}
        actions={(
          <div className="flex items-center gap-2">
            <Link href="/vendors">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Back to vendors
              </Button>
            </Link>
            <Button onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4" />
              Edit vendor
            </Button>
          </div>
        )}
      />

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="deal-history">
            Deal History
            {dealHistory.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
                {dealHistory.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="notes">
            Notes
            {allNotes.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
                {allNotes.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ---- DETAILS TAB ---- */}
        <TabsContent value="details" className="space-y-4 pt-4">
          <div className="grid gap-4 xl:grid-cols-3">
            {/* Vendor info card */}
            <div className="rounded-xl border bg-card p-5 xl:col-span-2">
              <h2 className="text-lg font-semibold">Vendor details</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Company Name</dt>
                  <dd className="mt-1 font-medium">{vendor.companyName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Service Type</dt>
                  <dd className="mt-1 font-medium">{vendor.serviceType}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Last updated</dt>
                  <dd className="mt-1 font-medium">{formatDate(vendor.updatedAt)}</dd>
                </div>
              </dl>
              {vendor.notes && (
                <div className="mt-5 rounded-lg bg-muted/60 p-4">
                  <p className="text-sm font-medium">General Notes</p>
                  <p className="mt-2 text-sm text-muted-foreground">{vendor.notes}</p>
                </div>
              )}
            </div>

            {/* Summary card */}
            <div className="rounded-xl border bg-card p-5">
              <h2 className="text-lg font-semibold">Summary</h2>
              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="text-sm text-muted-foreground">Contacts</dt>
                  <dd className="mt-1 text-2xl font-bold">{contacts.length}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Deals involved</dt>
                  <dd className="mt-1 text-2xl font-bold">{dealHistory.length}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Notes</dt>
                  <dd className="mt-1 text-2xl font-bold">{allNotes.length}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Contacts section */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="text-lg font-semibold">Contacts</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {contacts.length === 0 ? "No contacts recorded." : `${contacts.length} contact${contacts.length !== 1 ? "s" : ""} on file.`}
            </p>
            {contacts.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {contacts.map((contact, idx) => (
                  <div
                    key={`${contact.name}-${idx}`}
                    className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-sm"
                  >
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{contact.name}</span>
                    {contact.role && (
                      <span className="text-muted-foreground">({contact.role})</span>
                    )}
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="text-muted-foreground hover:text-foreground" title={contact.email}>
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {contact.phone && (
                      <a href={`tel:${contact.phone}`} className="text-muted-foreground hover:text-foreground" title={contact.phone}>
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ---- DEAL HISTORY TAB ---- */}
        <TabsContent value="deal-history" className="pt-4">
          <div className="rounded-xl border bg-card p-5">
            <h2 className="text-lg font-semibold">Deal History</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              All deals where this vendor has been assigned execution tasks.
            </p>
            <div className="mt-4">
              {dealHistory.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No deal history yet"
                  description="This vendor has not been linked to any execution tasks."
                />
              ) : (
                <DataTable columns={dealHistoryColumns} data={dealHistory} />
              )}
            </div>
          </div>
        </TabsContent>

        {/* ---- NOTES TAB ---- */}
        <TabsContent value="notes" className="pt-4">
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="text-lg font-semibold">Notes</h2>

            {/* Add note form */}
            <div className="space-y-2">
              <Textarea
                placeholder="Add a note about this vendor..."
                rows={3}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  disabled={!newNoteText.trim()}
                  onClick={handleAddNote}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Note
                </Button>
              </div>
            </div>

            {/* Notes list */}
            {allNotes.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No notes yet"
                description="Add a note to keep track of important information about this vendor."
              />
            ) : (
              <div className="space-y-3">
                {allNotes.map((note) => (
                  <div key={note.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{note.author}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <VendorFormDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        vendor={vendor}
        onSubmit={handleSubmit}
        customServiceTypes={customServiceTypes}
        onAddCustomServiceType={onAddCustomServiceType}
      />
    </div>
  );
}
