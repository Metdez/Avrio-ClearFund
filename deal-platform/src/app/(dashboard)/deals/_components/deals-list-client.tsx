"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { useDeals } from "./deals-provider";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { SearchFilterBar } from "@/components/shared/search-filter-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DealRow {
  id: string;
  name: string;
  borrowerName: string;
  pipelineStage: string;
  estimatedDealSize?: number;
  updatedAt: string;
  isArchived: boolean;
}

const PAGE_SIZE = 8;

export function DealsListClient() {
  const router = useRouter();
  const { activeBorrowers, archiveDeal, currentUser, deals, getBorrowerById } =
    useDeals();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [borrowerFilter, setBorrowerFilter] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [archiveDealId, setArchiveDealId] = useState<string | null>(null);

  const rows = useMemo<DealRow[]>(
    () =>
      deals.map((deal) => ({
        id: deal.id,
        name: deal.name,
        borrowerName: getBorrowerById(deal.borrowerId)?.name ?? "Unknown borrower",
        pipelineStage: deal.pipelineStage,
        estimatedDealSize: deal.estimatedDealSize,
        updatedAt: deal.updatedAt,
        isArchived: deal.isArchived,
      })),
    [deals, getBorrowerById]
  );

  const filteredRows = rows.filter((row) => {
    if (!includeArchived && (row.isArchived || row.pipelineStage === "Terminated")) {
      return false;
    }

    if (
      search &&
      !row.name.toLowerCase().includes(search.toLowerCase()) &&
      !row.borrowerName.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    if (stageFilter && row.pipelineStage !== stageFilter) {
      return false;
    }

    if (borrowerFilter && row.borrowerName !== borrowerFilter) {
      return false;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const columns: ColumnDef<DealRow>[] = [
    {
      key: "name",
      header: "Deal Name",
      sortable: true,
      mobilePriority: 1,
      accessor: (row) => row.name,
      render: (row) => (
        <div className="space-y-1">
          <div className="font-medium">{row.name}</div>
          {row.isArchived ? (
            <span className="text-xs text-muted-foreground">Archived</span>
          ) : null}
        </div>
      ),
    },
    {
      key: "borrowerName",
      header: "Borrower",
      sortable: true,
      accessor: (row) => row.borrowerName,
    },
    {
      key: "pipelineStage",
      header: "Stage",
      sortable: true,
      mobilePriority: 1,
      accessor: (row) => row.pipelineStage,
      render: (row) => (
        <StatusBadge status={row.pipelineStage} context="pipeline" />
      ),
    },
    {
      key: "estimatedDealSize",
      header: "Estimated Size",
      sortable: true,
      mobilePriority: 2,
      accessor: (row) => row.estimatedDealSize ?? 0,
      render: (row) =>
        row.estimatedDealSize ? formatCurrency(row.estimatedDealSize) : "TBD",
    },
    {
      key: "updatedAt",
      header: "Last Updated",
      sortable: true,
      accessor: (row) => row.updatedAt,
      render: (row) => formatDate(row.updatedAt),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) =>
        currentUser.role === "Admin" && !row.isArchived ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              setArchiveDealId(row.id);
            }}
          >
            Archive
          </Button>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deals"
        description="Track every deal from origination through funding and close."
        actions={
          <Button nativeButton={false} render={<Link href="/deals/new" />}>
            <Plus className="mr-2 h-4 w-4" />
            New Deal
          </Button>
        }
      />

      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
        <SearchFilterBar
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="Search by deal name or borrower"
          filters={[
            {
              label: "Stage",
              value: "stage",
              options: Array.from(new Set(rows.map((row) => row.pipelineStage))).map(
                (stage) => ({ label: stage, value: stage })
              ),
            },
            {
              label: "Borrower",
              value: "borrower",
              options: activeBorrowers.map((borrower) => ({
                label: borrower.name,
                value: borrower.name,
              })),
            },
          ]}
          filterValues={{ stage: stageFilter, borrower: borrowerFilter }}
          onFilterChange={(key, value) => {
            setPage(1);
            if (key === "stage") {
              setStageFilter(value);
            }
            if (key === "borrower") {
              setBorrowerFilter(value);
            }
          }}
        />

        <div className="flex items-center gap-3">
          <Switch
            checked={includeArchived}
            onCheckedChange={setIncludeArchived}
            aria-label="Include archived and terminated deals"
          />
          <Label>Include archived/terminated</Label>
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <EmptyState
          title="No deals found"
          description="Try adjusting your search or filters, or create a new deal to get started."
          actionLabel="Create Deal"
          actionHref="/deals/new"
        />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={paginatedRows}
            onRowClick={(row) => router.push(`/deals/${row.id}`)}
          />

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
            summary={`Showing ${(currentPage - 1) * PAGE_SIZE + 1}-${Math.min(currentPage * PAGE_SIZE, filteredRows.length)} of ${filteredRows.length} deals`}
          />
        </>
      )}

      <ConfirmDialog
        open={Boolean(archiveDealId)}
        onOpenChange={(open) => {
          if (!open) {
            setArchiveDealId(null);
          }
        }}
        title="Archive this deal?"
        description="Archived deals stay visible when the archive toggle is enabled."
        confirmLabel="Archive Deal"
        onConfirm={() => {
          if (archiveDealId) {
            archiveDeal(archiveDealId);
            setArchiveDealId(null);
          }
        }}
      />
    </div>
  );
}
