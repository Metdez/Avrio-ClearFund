"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchFilterBar } from "@/components/shared/search-filter-bar";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PROJECT_TYPES } from "@/lib/constants";
import { usePagination } from "@/hooks/use-pagination";
import { deals } from "@/mock-data";
import type { Borrower } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { useBorrowerStore } from "./borrower-store";

type BorrowerRow = Borrower & Record<string, unknown>;

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        {Array.from({ length: totalPages }).map((_, index) => {
          const page = index + 1;
          return (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          );
        })}
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export function BorrowersListClient() {
  const router = useRouter();
  const { borrowers, isReady } = useBorrowerStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [projectType, setProjectType] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const filteredBorrowers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...borrowers]
      .filter((borrower) => (showArchived ? true : !borrower.isArchived))
      .filter((borrower) =>
        projectType ? borrower.projectType === projectType : true,
      )
      .filter((borrower) => {
        if (normalizedSearch.length < 2) {
          return true;
        }

        return borrower.name.toLowerCase().includes(normalizedSearch);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [borrowers, projectType, searchTerm, showArchived]);

  const pagination = usePagination(filteredBorrowers, 25);

  const columns: ColumnDef<BorrowerRow>[] = [
    {
      key: "name",
      header: "Borrower",
      sortable: true,
      accessor: (borrower) => borrower.name,
      render: (borrower) => (
        <div className={cn("space-y-1", borrower.isArchived && "text-muted-foreground")}>
          <div className="flex items-center gap-2 font-medium">
            <span>{borrower.name}</span>
            {borrower.isArchived && (
              <Badge variant="outline" className="border-amber-300 text-amber-700">
                Archived
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {borrower.contacts.length > 0
              ? borrower.contacts.map((c) => c.name).filter(Boolean).join(", ") || "No contact person"
              : "No contact person"}
          </div>
        </div>
      ),
    },
    {
      key: "projectType",
      header: "Project Type",
      sortable: true,
      accessor: (borrower) => borrower.projectType ?? "",
      render: (borrower) => (
        <span className={cn(borrower.isArchived && "text-muted-foreground")}>
          {borrower.projectType || "Not set"}
        </span>
      ),
    },
    {
      key: "location",
      header: "Location",
      accessor: (borrower) => borrower.location ?? "",
      render: (borrower) => (
        <span className={cn(borrower.isArchived && "text-muted-foreground")}>
          {borrower.location || "Not set"}
        </span>
      ),
    },
    {
      key: "activeDeals",
      header: "Deals",
      accessor: (borrower) =>
        deals.filter((deal) => deal.borrowerId === borrower.id).length,
      render: (borrower) => {
        const dealCount = deals.filter((deal) => deal.borrowerId === borrower.id).length;
        return (
          <span className={cn(borrower.isArchived && "text-muted-foreground")}>
            {dealCount}
          </span>
        );
      },
    },
    {
      key: "updatedAt",
      header: "Last Updated",
      sortable: true,
      accessor: (borrower) => borrower.updatedAt,
      render: (borrower) => (
        <span className={cn(borrower.isArchived && "text-muted-foreground")}>
          {formatDate(borrower.updatedAt)}
        </span>
      ),
    },
  ];

  if (!isReady) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Borrowers"
          description="Manage borrower relationships and deal origination."
        />
        <LoadingSkeleton layout="table" rows={6} columns={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Borrowers"
        description="Manage borrower relationships and deal origination."
        actions={
          <Link href="/borrowers/new">
            <Button>
              <Plus />
              New Borrower
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-4 rounded-xl border p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchFilterBar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search borrowers by name"
            filters={[
              {
                label: "Project Type",
                value: "projectType",
                options: PROJECT_TYPES.map((type) => ({
                  label: type,
                  value: type,
                })),
              },
            ]}
            filterValues={{ projectType }}
            onFilterChange={(key, value) => {
              if (key === "projectType") {
                setProjectType(value);
              }
            }}
          />

          <div className="flex items-center gap-3">
            <Switch
              checked={showArchived}
              onCheckedChange={setShowArchived}
              aria-label="Show archived borrowers"
            />
            <Label>Show archived</Label>
          </div>
        </div>

        {filteredBorrowers.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No results found"
            description="Try adjusting your search or filters."
            actionLabel="New Borrower"
            actionHref="/borrowers/new"
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={pagination.paginatedData as BorrowerRow[]}
              onRowClick={(borrower) => router.push(`/borrowers/${borrower.id}`)}
            />
            {pagination.totalPages > 1 && (
              <PaginationControls
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={pagination.setPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
