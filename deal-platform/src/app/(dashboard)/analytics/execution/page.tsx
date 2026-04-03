"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deals } from "@/mock-data/deals";
import { tasks } from "@/mock-data/tasks";
import { borrowers } from "@/mock-data/borrowers";
import { formatDate } from "@/lib/utils";
import { Zap, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface DealExecutionRow {
  dealId: string;
  dealName: string;
  borrowerName: string;
  totalTasks: number;
  completeTasks: number;
  overdueTasks: number;
  progressPct: number;
  daysInExecution: number;
  executionStartDate: string;
}

export default function ExecutionAnalyticsPage() {
  const router = useRouter();
  const now = new Date();

  const executionDeals = useMemo(() => {
    return deals.filter(
      (d) => d.pipelineStage === "Execution" && !d.isArchived
    );
  }, []);

  const executionRows: DealExecutionRow[] = useMemo(() => {
    return executionDeals.map((deal) => {
      const dealTasks = tasks.filter(
        (t) => t.dealId === deal.id && t.status !== "Cancelled"
      );
      const completeTasks = dealTasks.filter(
        (t) => t.status === "Complete"
      ).length;
      const overdueTasks = dealTasks.filter((t) => {
        if (t.status === "Complete" || t.status === "Cancelled") return false;
        return t.dueDate ? new Date(t.dueDate) < now : false;
      }).length;
      const progressPct =
        dealTasks.length > 0
          ? Math.round((completeTasks / dealTasks.length) * 100)
          : 0;
      const daysInExecution = deal.executionStartDate
        ? Math.floor(
            (now.getTime() - new Date(deal.executionStartDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0;
      const borrower = borrowers.find((b) => b.id === deal.borrowerId);

      return {
        dealId: deal.id,
        dealName: deal.name,
        borrowerName: borrower?.name ?? "—",
        totalTasks: dealTasks.length,
        completeTasks,
        overdueTasks,
        progressPct,
        daysInExecution,
        executionStartDate: deal.executionStartDate ?? deal.updatedAt,
      };
    });
  }, [executionDeals, now]);

  // Top overdue tasks across all execution deals
  const allOverdueTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (t.status === "Complete" || t.status === "Cancelled") return false;
        if (!t.dueDate) return false;
        const deal = executionDeals.find((d) => d.id === t.dealId);
        if (!deal) return false;
        return new Date(t.dueDate) < now;
      })
      .map((t) => {
        const deal = deals.find((d) => d.id === t.dealId);
        const daysOverdue = Math.floor(
          (now.getTime() - new Date(t.dueDate!).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return { ...t, dealName: deal?.name ?? "—", daysOverdue };
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
      .slice(0, 10);
  }, [executionDeals, now]);

  // Aggregate metrics
  const totalTasksComplete = executionRows.reduce(
    (sum, r) => sum + r.completeTasks,
    0
  );
  const totalTasksAll = executionRows.reduce(
    (sum, r) => sum + r.totalTasks,
    0
  );
  const totalOverdue = executionRows.reduce(
    (sum, r) => sum + r.overdueTasks,
    0
  );

  const dealColumns: ColumnDef<DealExecutionRow>[] = [
    {
      key: "dealName",
      header: "Deal",
      sortable: true,
      render: (r) => <span className="font-medium">{r.dealName}</span>,
    },
    {
      key: "borrowerName",
      header: "Borrower",
      sortable: true,
    },
    {
      key: "progressPct",
      header: "Progress",
      sortable: true,
      className: "min-w-[160px]",
      render: (r) =>
        r.totalTasks === 0 ? (
          <span className="text-xs text-muted-foreground">No tasks defined</span>
        ) : (
          <ProgressBar
            percentage={r.progressPct}
            hasOverdue={r.overdueTasks > 0}
          />
        ),
    },
    {
      key: "completeTasks",
      header: "Tasks",
      render: (r) => (
        <span className="tabular-nums">
          {r.completeTasks}/{r.totalTasks}
        </span>
      ),
    },
    {
      key: "overdueTasks",
      header: "Overdue",
      sortable: true,
      render: (r) =>
        r.overdueTasks > 0 ? (
          <span className="text-red-600 font-medium tabular-nums">
            {r.overdueTasks}
          </span>
        ) : (
          <span className="text-muted-foreground">0</span>
        ),
    },
    {
      key: "daysInExecution",
      header: "Days in Execution",
      sortable: true,
      className: "text-right",
      render: (r) => (
        <span className="tabular-nums">{r.daysInExecution}</span>
      ),
    },
    {
      key: "executionStartDate",
      header: "Started",
      sortable: true,
      render: (r) => formatDate(r.executionStartDate),
    },
  ];

  type OverdueTask = (typeof allOverdueTasks)[number];

  const overdueColumns: ColumnDef<OverdueTask>[] = [
    {
      key: "name",
      header: "Task",
      render: (t) => <span className="font-medium">{t.name}</span>,
    },
    {
      key: "dealName",
      header: "Deal",
    },
    {
      key: "assigneeName",
      header: "Assignee",
    },
    {
      key: "status",
      header: "Status",
      render: (t) => <StatusBadge status={t.status} context="task" />,
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (t) => (t.dueDate ? formatDate(t.dueDate) : "—"),
    },
    {
      key: "daysOverdue",
      header: "Days Overdue",
      sortable: true,
      className: "text-right",
      render: (t) => (
        <span className="text-red-600 font-medium tabular-nums">
          {t.daysOverdue}d
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Execution Tracker"
        description="RPT-003 — Progress and overdue tasks across all deals in execution."
      />

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Deals in Execution"
          value={executionDeals.length}
          icon={Zap}
        />
        <StatCard
          label="Tasks Complete"
          value={`${totalTasksComplete}/${totalTasksAll}`}
          icon={CheckCircle}
        />
        <StatCard
          label="Overdue Tasks"
          value={totalOverdue}
          icon={AlertTriangle}
          className={totalOverdue > 0 ? "border-red-200" : ""}
        />
        <StatCard
          label="Avg Days in Execution"
          value={
            executionRows.length > 0
              ? Math.round(
                  executionRows.reduce((s, r) => s + r.daysInExecution, 0) /
                    executionRows.length
                )
              : 0
          }
          icon={Clock}
        />
      </div>

      {/* Deal execution table */}
      {executionDeals.length === 0 ? (
        <EmptyState
          title="No deals currently in execution"
          description="When deals move to the Execution stage, they will appear here with task progress."
        />
      ) : (
        <DataTable
          columns={dealColumns}
          data={executionRows}
          keyField="dealId"
          onRowClick={(r) => router.push(`/deals/${r.dealId}/execution`)}
        />
      )}

      {/* Top overdue tasks */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Top Overdue Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allOverdueTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No overdue tasks across execution deals.
            </p>
          ) : (
            <DataTable columns={overdueColumns} data={allOverdueTasks} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
