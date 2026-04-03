"use client";

import { useState, useMemo } from "react";
import { differenceInCalendarDays } from "date-fns";
import { useRouter } from "next/navigation";
import { DollarSign, TrendingUp, BarChart3, Zap } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { SearchFilterBar, type FilterOption } from "@/components/shared/search-filter-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deals } from "@/mock-data/deals";
import { borrowers } from "@/mock-data/borrowers";
import { PIPELINE_STAGES, PIPELINE_STAGE_COLORS, PROJECT_TYPES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { Deal } from "@/types";

/** Solid bar color per stage — slate/blue professional tones */
const STAGE_BAR_COLORS: Record<string, string> = {
  Prospect: "bg-slate-400",
  Qualifying: "bg-blue-400",
  Structuring: "bg-indigo-400",
  Pitched: "bg-purple-400",
  Committed: "bg-emerald-400",
  Execution: "bg-amber-400",
  Funded: "bg-green-500",
  Closed: "bg-gray-400",
};

export default function PipelineAnalyticsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const activeDeals = useMemo(() => {
    return deals.filter(
      (d) => !d.isArchived && d.pipelineStage !== "Terminated"
    );
  }, []);

  const filteredDeals = useMemo(() => {
    let result = activeDeals;

    if (search.length >= 2) {
      const q = search.toLowerCase();
      result = result.filter((d) => {
        const borrower = borrowers.find((b) => b.id === d.borrowerId);
        return (
          d.name.toLowerCase().includes(q) ||
          borrower?.name.toLowerCase().includes(q)
        );
      });
    }

    if (filters.stage) {
      result = result.filter((d) => d.pipelineStage === filters.stage);
    }
    if (filters.projectType) {
      result = result.filter((d) => d.projectType === filters.projectType);
    }

    return result;
  }, [activeDeals, search, filters]);

  // Aggregate metrics
  const totalValue = filteredDeals.reduce(
    (sum, d) => sum + (d.estimatedDealSize ?? 0),
    0
  );

  const avgDealSize =
    filteredDeals.length > 0
      ? Math.round(totalValue / filteredDeals.length)
      : 0;

  const dealsInExecution = filteredDeals.filter(
    (d) => d.pipelineStage === "Execution"
  ).length;

  // Stage breakdown
  const stageBreakdown = PIPELINE_STAGES.map((stage) => {
    const stageDeals = filteredDeals.filter((d) => d.pipelineStage === stage);
    return { stage, count: stageDeals.length };
  });

  const maxCount = Math.max(...stageBreakdown.map((s) => s.count), 1);

  const now = new Date();

  const filterOptions: FilterOption[] = [
    {
      label: "Stage",
      value: "stage",
      options: PIPELINE_STAGES.map((s) => ({ label: s, value: s })),
    },
    {
      label: "Project Type",
      value: "projectType",
      options: PROJECT_TYPES.map((t) => ({ label: t, value: t })),
    },
  ];

  const columns: ColumnDef<Deal>[] = [
    {
      key: "name",
      header: "Deal Name",
      sortable: true,
      render: (d) => <span className="font-medium">{d.name}</span>,
    },
    {
      key: "borrower",
      header: "Borrower",
      accessor: (d) => borrowers.find((b) => b.id === d.borrowerId)?.name ?? "",
      render: (d) => (
        <span className="text-muted-foreground">
          {borrowers.find((b) => b.id === d.borrowerId)?.name ?? "—"}
        </span>
      ),
    },
    {
      key: "pipelineStage",
      header: "Stage",
      sortable: true,
      render: (d) => (
        <StatusBadge status={d.pipelineStage} context="pipeline" />
      ),
    },
    {
      key: "estimatedDealSize",
      header: "Deal Size",
      sortable: true,
      className: "text-right",
      render: (d) => (
        <span className="tabular-nums">
          {d.estimatedDealSize ? formatCurrency(d.estimatedDealSize) : "TBD"}
        </span>
      ),
    },
    {
      key: "daysInStage",
      header: "Days in Stage",
      sortable: true,
      accessor: (d) =>
        String(
          Math.max(0, differenceInCalendarDays(now, new Date(d.updatedAt)))
        ),
      className: "text-right",
      render: (d) => {
        const days = Math.max(
          0,
          differenceInCalendarDays(now, new Date(d.updatedAt))
        );
        return (
          <span className={`tabular-nums ${days > 30 ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
            {days}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline Analytics"
        description="RPT-001 — Active deal pipeline by stage with aggregate metrics."
      />

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Deals"
          value={filteredDeals.length}
          icon={TrendingUp}
        />
        <StatCard
          label="Total Pipeline Value"
          value={formatCurrency(totalValue)}
          icon={DollarSign}
        />
        <StatCard
          label="Average Deal Size"
          value={avgDealSize > 0 ? formatCurrency(avgDealSize) : "—"}
          icon={BarChart3}
        />
        <StatCard
          label="Deals in Execution"
          value={dealsInExecution}
          icon={Zap}
        />
      </div>

      {/* Horizontal bar chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Deals by Stage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {stageBreakdown.map(({ stage, count }) => (
              <div key={stage} className="flex items-center gap-3">
                {/* Stage label — fixed width */}
                <span className="w-24 shrink-0 text-right text-sm text-muted-foreground">
                  {stage}
                </span>
                {/* Bar */}
                <div className="relative flex-1">
                  <div className="h-7 w-full rounded bg-muted/50" />
                  <div
                    className={`absolute inset-y-0 left-0 rounded transition-all ${
                      STAGE_BAR_COLORS[stage] ?? "bg-slate-400"
                    }`}
                    style={{
                      width:
                        count > 0
                          ? `${Math.max((count / maxCount) * 100, 4)}%`
                          : "0%",
                    }}
                  />
                </div>
                {/* Count */}
                <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters + Table */}
      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by deal or borrower name..."
        filters={filterOptions}
        filterValues={filters}
        onFilterChange={(key, val) =>
          setFilters((prev) => ({ ...prev, [key]: val }))
        }
      />

      {filteredDeals.length === 0 ? (
        <EmptyState
          title="No active deals"
          description="No deals match the current filters."
          actionLabel="Create Deal"
          actionHref="/deals/new"
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredDeals}
          onRowClick={(d) => router.push(`/deals/${d.id}`)}
        />
      )}
    </div>
  );
}
