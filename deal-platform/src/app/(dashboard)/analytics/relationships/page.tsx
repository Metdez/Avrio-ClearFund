"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { SearchFilterBar, type FilterOption } from "@/components/shared/search-filter-bar";
import { ProgressBar } from "@/components/shared/progress-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { capitalProviders } from "@/mock-data/capital-providers";
import { engagementThreads } from "@/mock-data/engagement-threads";
import { creditFacilities } from "@/mock-data/credit-facilities";
import { dealCapitalProviders } from "@/mock-data/deal-capital-providers";
import { deals } from "@/mock-data/deals";
import { CP_TYPES, RELATIONSHIP_TYPES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { CapitalProvider } from "@/types";
import { Users, Building2, Landmark, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RelationshipAnalyticsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const activeCPs = useMemo(
    () => capitalProviders.filter((cp) => !cp.isArchived),
    []
  );

  const filteredCPs = useMemo(() => {
    let result = activeCPs;
    if (search.length >= 2) {
      const q = search.toLowerCase();
      result = result.filter((cp) => cp.firmName.toLowerCase().includes(q));
    }
    if (filters.type) {
      result = result.filter((cp) => cp.type === filters.type);
    }
    if (filters.relationship) {
      result = result.filter(
        (cp) => cp.relationshipType === filters.relationship
      );
    }
    return result;
  }, [activeCPs, search, filters]);

  // By type
  const byType = CP_TYPES.map((type) => ({
    type,
    count: activeCPs.filter((cp) => cp.type === type).length,
  }));

  // By relationship type
  const byRelationship = RELATIONSHIP_TYPES.map((rel) => ({
    rel,
    count: activeCPs.filter((cp) => cp.relationshipType === rel).length,
  }));

  // Active threads
  const activeThreads = engagementThreads.filter(
    (t) => t.status === "Active"
  ).length;

  // Credit facility metrics
  const activeFacilities = creditFacilities.filter(
    (f) => f.status === "Active"
  );
  const totalFacilityCapacity = activeFacilities.reduce(
    (sum, f) => sum + f.facilitySizeDollars,
    0
  );

  // Calculate utilization from funded deal sizes linked to facility CPs
  const facilityUtilization = activeFacilities.reduce((sum, f) => {
    const fundedDCPs = dealCapitalProviders.filter(
      (dcp) =>
        dcp.capitalProviderId === f.capitalProviderId &&
        dcp.status === "Committed"
    );
    const fundedValue = fundedDCPs.reduce((s, dcp) => {
      const deal = deals.find((d) => d.id === dcp.dealId);
      return s + (deal?.estimatedDealSize ?? 0);
    }, 0);
    return sum + fundedValue;
  }, 0);

  const utilizationPct =
    totalFacilityCapacity > 0
      ? Math.round((facilityUtilization / totalFacilityCapacity) * 100)
      : 0;

  // Pitch-to-commit rate
  const totalPitched = dealCapitalProviders.length;
  const totalCommitted = dealCapitalProviders.filter(
    (dcp) => dcp.status === "Committed"
  ).length;
  const commitRate =
    totalPitched > 0 ? Math.round((totalCommitted / totalPitched) * 100) : 0;

  const filterOptions: FilterOption[] = [
    {
      label: "Type",
      value: "type",
      options: CP_TYPES.map((t) => ({ label: t, value: t })),
    },
    {
      label: "Relationship",
      value: "relationship",
      options: RELATIONSHIP_TYPES.map((r) => ({ label: r, value: r })),
    },
  ];

  const columns: ColumnDef<CapitalProvider>[] = [
    {
      key: "firmName",
      header: "Firm Name",
      sortable: true,
      render: (cp) => <span className="font-medium">{cp.firmName}</span>,
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
    },
    {
      key: "relationshipType",
      header: "Relationship",
      sortable: true,
      render: (cp) => (
        <StatusBadge status={cp.relationshipType} context="pipeline" />
      ),
    },
    {
      key: "contactPersonName",
      header: "Contact",
      render: (cp) => cp.contactPersonName ?? "—",
    },
    {
      key: "threads",
      header: "Active Threads",
      accessor: (cp) =>
        engagementThreads.filter(
          (t) => t.capitalProviderId === cp.id && t.status === "Active"
        ).length,
      sortable: true,
      render: (cp) =>
        engagementThreads.filter(
          (t) => t.capitalProviderId === cp.id && t.status === "Active"
        ).length,
    },
    {
      key: "deals",
      header: "Linked Deals",
      accessor: (cp) =>
        dealCapitalProviders.filter((dcp) => dcp.capitalProviderId === cp.id)
          .length,
      sortable: true,
      render: (cp) =>
        dealCapitalProviders.filter((dcp) => dcp.capitalProviderId === cp.id)
          .length,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relationship Analytics"
        description="RPT-002 — Capital provider landscape, engagement, and deal involvement."
      />

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Capital Providers"
          value={activeCPs.length}
          icon={Users}
        />
        <StatCard
          label="Active Threads"
          value={activeThreads}
          icon={TrendingUp}
        />
        <StatCard
          label="Pitch-to-Commit Rate"
          value={`${commitRate}%`}
          icon={Landmark}
        />
        <StatCard
          label="Facility Utilization"
          value={`${utilizationPct}%`}
          icon={Building2}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* By Type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Capital Providers by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {byType.map(({ type, count }) => (
                <div
                  key={type}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{type}</span>
                  <span className="font-medium tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* By Relationship */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              By Relationship Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {byRelationship.map(({ rel, count }) => (
                <div
                  key={rel}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{rel}</span>
                  <span className="font-medium tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Facility utilization */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Credit Facility Capacity vs. Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeFacilities.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No active credit facilities.
            </p>
          ) : (
            <div className="space-y-4">
              {activeFacilities.map((f) => {
                const cp = capitalProviders.find(
                  (c) => c.id === f.capitalProviderId
                );
                const linkedDCPs = dealCapitalProviders.filter(
                  (dcp) =>
                    dcp.capitalProviderId === f.capitalProviderId &&
                    dcp.status === "Committed"
                );
                const used = linkedDCPs.reduce((s, dcp) => {
                  const deal = deals.find((d) => d.id === dcp.dealId);
                  return s + (deal?.estimatedDealSize ?? 0);
                }, 0);
                const pct =
                  f.facilitySizeDollars > 0
                    ? Math.round((used / f.facilitySizeDollars) * 100)
                    : 0;
                return (
                  <div key={f.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{f.name}</span>
                        <span className="text-muted-foreground ml-2">
                          ({cp?.firmName})
                        </span>
                      </div>
                      <span className="text-muted-foreground tabular-nums">
                        {formatCurrency(used)} /{" "}
                        {formatCurrency(f.facilitySizeDollars)}
                      </span>
                    </div>
                    <ProgressBar
                      percentage={pct}
                      hasOverdue={pct >= 80}
                    />
                  </div>
                );
              })}

              <div className="pt-2 border-t text-sm flex justify-between">
                <span className="font-medium">Total Active Capacity</span>
                <span className="tabular-nums">
                  {formatCurrency(facilityUtilization)} /{" "}
                  {formatCurrency(totalFacilityCapacity)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CP Table */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by firm name..."
        filters={filterOptions}
        filterValues={filters}
        onFilterChange={(key, val) =>
          setFilters((prev) => ({ ...prev, [key]: val }))
        }
      />

      <DataTable
        columns={columns}
        data={filteredCPs}
        onRowClick={(cp) => router.push(`/capital-providers/${cp.id}`)}
      />
    </div>
  );
}
