"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building, Plus } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { SearchFilterBar } from "@/components/shared/search-filter-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePagination } from "@/hooks/use-pagination";
import { CP_TYPES } from "@/lib/constants";
import { dealCapitalProviders } from "@/mock-data";
import type { CapitalProvider } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { useCapitalProviderStore } from "./capital-provider-store";

type CapitalProviderRow = CapitalProvider & Record<string, unknown>;

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

export function CapitalProvidersListClient() {
  const router = useRouter();
  const { capitalProviders, isReady } = useCapitalProviderStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const filteredCapitalProviders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...capitalProviders]
      .filter((capitalProvider) =>
        showArchived ? true : !capitalProvider.isArchived,
      )
      .filter((capitalProvider) => (type ? capitalProvider.type === type : true))
      .filter((capitalProvider) => {
        if (normalizedSearch.length < 2) {
          return true;
        }

        return capitalProvider.firmName.toLowerCase().includes(normalizedSearch);
      })
      .sort((a, b) => a.firmName.localeCompare(b.firmName));
  }, [capitalProviders, searchTerm, showArchived, type]);

  const pagination = usePagination(filteredCapitalProviders, 25);

  const columns: ColumnDef<CapitalProviderRow>[] = [
    {
      key: "firmName",
      header: "Capital Provider",
      sortable: true,
      accessor: (capitalProvider) => capitalProvider.firmName,
      render: (capitalProvider) => (
        <div
          className={cn(
            "space-y-1",
            capitalProvider.isArchived && "text-muted-foreground",
          )}
        >
          <div className="flex items-center gap-2 font-medium">
            <span>{capitalProvider.firmName}</span>
            {capitalProvider.isArchived && (
              <Badge variant="outline" className="border-amber-300 text-amber-700">
                Archived
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {capitalProvider.contactPersonName || "No contact person"}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      accessor: (capitalProvider) => capitalProvider.type,
      render: (capitalProvider) =>
        capitalProvider.type === "Life Insurance Company"
          ? "Life Insurance"
          : capitalProvider.type,
    },
    {
      key: "relationshipType",
      header: "Relationship",
      sortable: true,
      accessor: (capitalProvider) => capitalProvider.relationshipType,
    },
    {
      key: "deals",
      header: "Deals",
      accessor: (capitalProvider) =>
        dealCapitalProviders.filter(
          (link) => link.capitalProviderId === capitalProvider.id,
        ).length,
      render: (capitalProvider) =>
        dealCapitalProviders.filter(
          (link) => link.capitalProviderId === capitalProvider.id,
        ).length,
    },
    {
      key: "updatedAt",
      header: "Last Updated",
      sortable: true,
      accessor: (capitalProvider) => capitalProvider.updatedAt,
      render: (capitalProvider) => formatDate(capitalProvider.updatedAt),
    },
  ];

  if (!isReady) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Capital Providers"
          description="Manage lender relationships, deal activity, and partnership context."
        />
        <LoadingSkeleton layout="table" rows={6} columns={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Capital Providers"
        description="Manage lender relationships, deal activity, and partnership context."
        actions={
          <Link href="/capital-providers/new">
            <Button>
              <Plus />
              New Capital Provider
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-4 rounded-xl border p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchFilterBar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search capital providers by name"
            filters={[
              {
                label: "Type",
                value: "type",
                options: CP_TYPES.map((option) => ({
                  label:
                    option === "Life Insurance Company"
                      ? "Life Insurance"
                      : option,
                  value: option,
                })),
              },
            ]}
            filterValues={{ type }}
            onFilterChange={(key, value) => {
              if (key === "type") {
                setType(value);
              }
            }}
          />

          <div className="flex items-center gap-3">
            <Switch
              checked={showArchived}
              onCheckedChange={setShowArchived}
              aria-label="Show archived capital providers"
            />
            <Label>Show archived</Label>
          </div>
        </div>

        {filteredCapitalProviders.length === 0 ? (
          <EmptyState
            icon={Building}
            title="No results found"
            description="Try adjusting your search or filters."
            actionLabel="New Capital Provider"
            actionHref="/capital-providers/new"
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={pagination.paginatedData as CapitalProviderRow[]}
              onRowClick={(capitalProvider) =>
                router.push(`/capital-providers/${capitalProvider.id}`)
              }
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
