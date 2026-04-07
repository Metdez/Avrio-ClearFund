"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building, Plus } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
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
      mobilePriority: 1,
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
      mobilePriority: 2,
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
      mobilePriority: 2,
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
